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
            className="absolute flex items-center bg-white rounded-full shadow-lg border-2 border-powlax-blue px-3 py-1"
            initial={{
              x: particle.x - 40, // Center the particle
              y: particle.y - 15,
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: [
                particle.x - 40,
                particle.x - 40 + (Math.random() - 0.5) * 80, // Reduced random movement for mobile
                Math.min(window.innerWidth / 2 - 40, window.innerWidth - 80) // End near center, mobile safe
              ],
              y: [
                particle.y - 15,
                particle.y - 80 - Math.random() * 40, // Reduced arc for mobile
                Math.max(60, window.innerHeight * 0.1) // End near header, mobile safe
              ],
              scale: [0, 1.1, 0.9],
              opacity: [0, 1, 0.9, 0]
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth explosion
              delay: index * 0.08, // Slightly faster stagger for mobile
              times: [0, 0.3, 0.7, 1] // More controlled timing
            }}
          >
            <div className="flex items-center space-x-2">
              {particle.icon_url && (
                <div className="relative w-4 h-4">
                  <Image
                    src={particle.icon_url}
                    alt={particle.display_name}
                    fill
                    className="object-contain"
                    onError={() => {
                      // Fallback to emoji if image fails
                      console.warn(`Failed to load point icon: ${particle.icon_url}`)
                    }}
                  />
                </div>
              )}
              <span className="text-sm font-bold text-powlax-blue">
                +{particle.value}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}