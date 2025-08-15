'use client'

import React, { useState, useEffect } from 'react'
import { PointExplosionDemo } from './PointExplosionCanvas'

// Simple animation demos that don't require complex dependencies
const SimpleAnimations = {
  PointExplosion: PointExplosionDemo,
  
  // CSS-only badge animation
  BadgeUnlock: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '150px',
            height: '150px',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            animation: 'badgePulse 2s ease-in-out infinite'
          }}
        >
          🏆
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Badge Unlocked!</h2>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>CSS Animation Demo</p>
      </div>
      
      <style jsx>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
        }
      `}</style>
    </div>
  ),

  // Simple particle animation
  ParticleDemo: () => {
    const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])

    const createParticle = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newParticle = { id: Date.now(), x, y }
      setParticles(prev => [...prev, newParticle])
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id))
      }, 2000)
    }

    return (
      <div 
        onClick={createParticle}
        style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          textAlign: 'center'
        }}
      >
        Click anywhere to create particles!
        
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: '20px',
              height: '20px',
              background: '#FFD700',
              borderRadius: '50%',
              animation: 'particleFloat 2s ease-out forwards',
              pointerEvents: 'none'
            }}
          />
        ))}
        
        <style jsx>{`
          @keyframes particleFloat {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    )
  }
}

interface AnimationDemo {
  id: string
  name: string
  description: string
  component: React.ComponentType
}

const animationDemos: AnimationDemo[] = [
  {
    id: 'badge-unlock',
    name: 'Badge Unlock Animation',
    description: 'CSS-only badge unlock with pulse effect',
    component: SimpleAnimations.BadgeUnlock
  },
  {
    id: 'particle-demo',
    name: 'Click Particle Effect',
    description: 'Simple particle animation on click',
    component: SimpleAnimations.ParticleDemo
  },
  {
    id: 'point-explosion',
    name: 'Point Explosion Canvas',
    description: 'Canvas-based particle explosion system',
    component: SimpleAnimations.PointExplosion
  }
]

export default function SimpleAnimationShowcase() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading animations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!selectedDemo ? (
        <>
          {/* Header */}
          <div className="text-center py-16 px-4">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              POWLAX Animations
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Interactive animation demonstrations for the POWLAX platform
            </p>
          </div>

          {/* Animation Grid */}
          <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {animationDemos.map((demo) => (
                <div
                  key={demo.id}
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-gray-700"
                  onClick={() => setSelectedDemo(demo.id)}
                >
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">
                    {demo.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {demo.description}
                  </p>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center">
                    <span>View Demo</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-700">
            <p className="text-gray-400">
              Built with React, Canvas, and CSS animations
            </p>
          </div>
        </>
      ) : (
        // Full-screen demo view
        <div className="relative">
          <button
            className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all"
            onClick={() => setSelectedDemo(null)}
          >
            ← Back to Showcase
          </button>
          
          {(() => {
            const demo = animationDemos.find(d => d.id === selectedDemo)
            const DemoComponent = demo?.component
            return DemoComponent ? <DemoComponent /> : null
          })()}
        </div>
      )}
    </div>
  )
}
