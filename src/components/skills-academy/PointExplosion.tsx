'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface PointParticle {
  id: string
  type: string
  value: number
  icon_url?: string
  display_name: string
  x: number
  y: number
}

interface PointExplosionProps {
  isVisible: boolean
  originElement?: HTMLElement | null
  points: Record<string, number>
  pointTypes: Array<{
    name: string
    display_name: string
    icon_url?: string
  }>
  onAnimationComplete?: () => void
  duration?: number
}

export default function PointExplosion({
  isVisible,
  originElement,
  points,
  pointTypes,
  onAnimationComplete,
  duration = 1500
}: PointExplosionProps) {
  const [particles, setParticles] = useState<PointParticle[]>([])
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (isVisible && originElement) {
      const rect = originElement.getBoundingClientRect()
      setOriginRect(rect)

      // Create particles for each point type that has value > 0
      const newParticles: PointParticle[] = []
      
      Object.entries(points).forEach(([pointKey, value]) => {
        if (value > 0) {
          const pointType = pointTypes.find(type => type.name === pointKey)
          if (pointType) {
            // Create 1-3 particles per point type for visual variety
            const particleCount = Math.min(3, Math.max(1, Math.floor(value / 15)))
            
            for (let i = 0; i < particleCount; i++) {
              newParticles.push({
                id: `${pointKey}-${i}`,
                type: pointKey,
                value: Math.floor(value / particleCount),
                icon_url: pointType.icon_url,
                display_name: pointType.display_name,
                x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60, // Slightly more spread
                y: rect.top + rect.height / 2 + (Math.random() - 0.5) * 30
              })
            }
          } else {
            // Fallback if point type not found - use generic particle
            newParticles.push({
              id: `${pointKey}-fallback`,
              type: pointKey,
              value: value,
              display_name: pointKey.replace('_', ' ').toUpperCase(),
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            })
          }
        }
      })

      setParticles(newParticles)

      // Clean up after animation
      const timeout = setTimeout(() => {
        setParticles([])
        onAnimationComplete?.()
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [isVisible, originElement, points, pointTypes, duration, onAnimationComplete])

  if (!isVisible || particles.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle, index) => (
          <motion.div
            key={particle.id}
            className="absolute flex items-center bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 rounded-full shadow-2xl border-4 border-white px-5 py-3"
            style={{
              boxShadow: '0 12px 35px rgba(255, 165, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.9), 0 0 15px rgba(255, 255, 0, 0.6)',
              filter: 'drop-shadow(0 6px 15px rgba(255, 140, 0, 0.8))',
              background: 'linear-gradient(45deg, #FFD700, #FF8C00, #FF6B35, #FF4500)'
            }}
            initial={{
              x: particle.x - 50, // Center the particle
              y: particle.y - 20,
              scale: 0,
              opacity: 0,
              rotate: 0
            }}
            animate={{
              x: [
                particle.x - 50,
                particle.x - 50 + (Math.random() - 0.5) * 120, // More dramatic movement
                window.innerWidth / 2 - 50 // End at center where point counter is
              ],
              y: [
                particle.y - 20,
                particle.y - 140 - Math.random() * 80, // Even higher arc for more drama
                Math.max(140, window.innerHeight * 0.20) // End at point counter area (below header, above drill nav)
              ],
              scale: [0, 1.5, 1.3, 1.0, 0.7], // Much larger scale for more vibrant effect
              opacity: [0, 1, 1, 0.8, 0],
              rotate: [0, 360, 720] // More rotation for extra vibrant effect
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.175, 0.885, 0.32, 1.4], // Extra bouncy, vibrant easing
              delay: index * 0.08, // Faster stagger for more impact
              times: [0, 0.15, 0.4, 0.7, 0.9, 1] // More keyframes for smoother animation
            }}
          >
            <div className="flex items-center space-x-2">
              {particle.icon_url && (
                <div className="relative w-10 h-10"> {/* Much larger icons for visibility */}
                  <Image
                    src={particle.icon_url}
                    alt={particle.display_name}
                    fill
                    className="object-contain drop-shadow-lg"
                    onError={() => {
                      // Fallback to emoji if image fails
                      console.warn(`Failed to load point icon: ${particle.icon_url}`)
                    }}
                  />
                </div>
              )}
              <span className="text-xl font-black text-white drop-shadow-lg"> {/* Even larger, bolder text */}
                +{particle.value}
              </span>
            </div>
            
            {/* Enhanced sparkle effects for extra vibrancy */}
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: 3,
                delay: index * 0.08
              }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-300 rounded-full"
              animate={{
                scale: [0, 0.8, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
                delay: index * 0.08 + 0.2
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}