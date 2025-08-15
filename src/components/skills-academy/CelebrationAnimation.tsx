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
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
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
      
      {/* Central celebration with player rank and trophy */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-yellow-400 rounded-full animate-ping" />
            <div className="absolute inset-0 w-32 h-32 border-2 border-orange-500 rounded-full animate-pulse" />
            
            {/* Central Trophy with Player Rank overlay */}
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative">
              <Trophy className="w-16 h-16 text-white animate-bounce" />
              
              {/* Player Rank Achievement overlay */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <img 
                    src="https://powlax.com/wp-content/uploads/2024/10/Flow-Bro.png"
                    alt="Flow Bro Rank"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              
              {/* Sparkle effects with badge images */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full border border-yellow-300 animate-spin">
                <img 
                  src="https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png"
                  alt="Badge"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full border border-orange-300 animate-pulse">
                <img 
                  src="https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png"
                  alt="Badge"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute top-1/2 -left-10 w-6 h-6 rounded-full border border-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }}>
                <img 
                  src="https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png"
                  alt="Badge"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute top-1/2 -right-10 w-6 h-6 rounded-full border border-orange-400 animate-bounce" style={{ animationDelay: '1s' }}>
                <img 
                  src="https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png"
                  alt="Badge"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
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
      
      {/* Floating real badge images */}
      <div className="absolute inset-0">
        {[
          'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
          'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png',
          'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
          'https://powlax.com/wp-content/uploads/2024/10/Mid2-Transition-Titan.png',
          'https://powlax.com/wp-content/uploads/2024/10/A4-Goalies-Nightmare.png',
          'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png',
          'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png',
          'https://powlax.com/wp-content/uploads/2024/10/SS1-Ball-Mover.png'
        ].map((badgeUrl, i) => (
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
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg opacity-80 hover:opacity-100 transition-opacity">
              <img 
                src={badgeUrl}
                alt={`Badge ${i + 1}`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CelebrationAnimation