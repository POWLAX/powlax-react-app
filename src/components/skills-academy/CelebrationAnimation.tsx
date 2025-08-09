'use client'

import { useEffect, useState } from 'react'
import { Trophy, Award, Star, Zap } from 'lucide-react'

interface CelebrationAnimationProps {
  points: number
  isVisible: boolean
  onAnimationEnd?: () => void
}

export function CelebrationAnimation({ points, isVisible, onAnimationEnd }: CelebrationAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPointsBurst, setShowPointsBurst] = useState(false)
  
  useEffect(() => {
    if (isVisible) {
      // Trigger confetti immediately
      setShowConfetti(true)
      
      // Trigger points burst after small delay
      setTimeout(() => setShowPointsBurst(true), 300)
      
      // Clean up after animation
      const cleanup = setTimeout(() => {
        setShowConfetti(false)
        setShowPointsBurst(false)
        onAnimationEnd?.()
      }, 3000)
      
      return () => clearTimeout(cleanup)
    }
  }, [isVisible, onAnimationEnd])
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Background celebration glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-green-500/20 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                backgroundColor: ['#FFD700', '#FF6600', '#4CAF50', '#2196F3', '#9C27B0'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Central trophy with pulse animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-yellow-400 rounded-full animate-ping" />
            <div className="absolute inset-0 w-32 h-32 border-2 border-orange-500 rounded-full animate-pulse" />
            
            {/* Trophy icon */}
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative">
              <Trophy className="w-16 h-16 text-white animate-bounce" />
              
              {/* Sparkle effects */}
              <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-spin" />
              <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-300 animate-pulse" />
              <Award className="absolute top-1/2 -left-8 w-5 h-5 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <Award className="absolute top-1/2 -right-8 w-5 h-5 text-orange-400 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Points burst animation */}
      {showPointsBurst && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <div className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 transition-all duration-1000 ${
              showPointsBurst ? 'scale-110 opacity-100' : 'scale-0 opacity-0'
            }`}>
              +{points}
            </div>
            <div className="text-2xl font-semibold text-yellow-600 mt-2">
              POINTS!
            </div>
          </div>
        </div>
      )}
      
      {/* Floating achievement badges */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${10 + (i * 10)}%`,
              top: `${20 + Math.sin(i) * 30}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center opacity-80">
              <Star className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CelebrationAnimation