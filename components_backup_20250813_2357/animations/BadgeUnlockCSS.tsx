import React, { useState } from 'react'
import './BadgeUnlockCSS.css'

interface BadgeUnlockCSSProps {
  badgeName: string
  badgeImage: string
  category: 'attack' | 'defense' | 'midfield' | 'wallball'
  onComplete?: () => void
}

export default function BadgeUnlockCSS({ 
  badgeName, 
  badgeImage, 
  category,
  onComplete 
}: BadgeUnlockCSSProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  // Color themes per category
  const categoryColors = {
    attack: '#FF4444',
    defense: '#4444FF',
    midfield: '#44FF44',
    wallball: '#FF8844'
  }

  const handleAnimationEnd = () => {
    setIsAnimating(false)
    onComplete?.()
  }

  return (
    <div className="badge-unlock-container">
      {/* Background burst effect */}
      <div 
        className="burst-container"
        style={{ '--burst-color': categoryColors[category] } as React.CSSProperties}
      >
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="burst-particle" 
            style={{
              '--rotation': `${i * 30}deg`,
              '--delay': `${i * 0.05}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Main badge */}
      <div 
        className={`badge-wrapper ${isAnimating ? 'animating' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="badge-glow" />
        <img 
          src={badgeImage} 
          alt={badgeName}
          className="badge-image"
        />
        
        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="sparkle"
            style={{
              '--sparkle-delay': `${0.5 + i * 0.1}s`,
              '--sparkle-x': `${Math.cos(i * Math.PI / 4) * 60}px`,
              '--sparkle-y': `${Math.sin(i * Math.PI / 4) * 60}px`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Text reveal */}
      <div className="badge-info">
        <h2 className="badge-title">{badgeName}</h2>
        <p className="badge-category">{category.toUpperCase()} BADGE UNLOCKED!</p>
      </div>

      {/* Confetti rain */}
      <div className="confetti-container">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="confetti"
            style={{
              '--confetti-delay': `${Math.random() * 2}s`,
              '--confetti-duration': `${2 + Math.random() * 2}s`,
              '--confetti-x': `${Math.random() * 100}%`,
              '--confetti-color': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 4]
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}