import React, { useState, useRef } from 'react'
import { useSpring, animated, useSprings } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

interface Badge {
  id: string
  name: string
  image: string
  category: 'attack' | 'defense' | 'midfield' | 'wallball' | 'lacrosse_iq' | 'solid_start'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned: boolean
  progress: number
}

interface BadgeCollectionSpringProps {
  badges: Badge[]
  onCollect: (badge: Badge) => void
  onBadgeSelect: (badge: Badge) => void
}

export default function BadgeCollectionSpring({ 
  badges, 
  onCollect, 
  onBadgeSelect 
}: BadgeCollectionSpringProps) {
  const [draggedBadge, setDraggedBadge] = useState<string | null>(null)
  const [collectionZone, setCollectionZone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Category colors with tier variations
  const getCategoryColor = (category: string, tier: string) => {
    const baseColors = {
      attack: '#FF4444',
      defense: '#4444FF', 
      midfield: '#44FF44',
      wallball: '#FF8844',
      lacrosse_iq: '#8844FF',
      solid_start: '#44FFFF'
    }
    
    const tierMultipliers = {
      bronze: 0.7,
      silver: 0.85,
      gold: 1.0,
      platinum: 1.2
    }
    
    const base = baseColors[category as keyof typeof baseColors] || '#666'
    const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1
    
    return base.replace(/(\w\w)/g, (match) => {
      const value = Math.min(255, Math.floor(parseInt(match, 16) * multiplier))
      return value.toString(16).padStart(2, '0')
    })
  }

  // Collection zone animation
  const collectionSpring = useSpring({
    scale: collectionZone ? 1.1 : 1,
    glow: collectionZone ? 1 : 0,
    config: { tension: 300, friction: 20 }
  })

  // Badge springs for individual badges
  const [badgeSprings, badgeApi] = useSprings(badges.length, (index) => ({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: badges[index].earned ? 1 : 0.4,
    glow: 0,
    config: { tension: 200, friction: 25 }
  }))

  // Drag gesture handler
  const bind = useDrag(({ args: [index], active, movement: [mx, my], velocity, direction }) => {
    const badge = badges[index]
    if (!badge.earned) return

    setDraggedBadge(active ? badge.id : null)

    // Check if dragged into collection zone
    const isInZone = mx > 200 && my < -100
    setCollectionZone(active && isInZone)

    badgeApi.start(i => {
      if (i !== index) return {}
      
      if (active) {
        return {
          x: mx,
          y: my,
          scale: 1.2,
          rotate: mx / 10,
          glow: 1,
          immediate: true
        }
      } else {
        // Release logic
        if (isInZone) {
          // Animate to collection and trigger collect
          setTimeout(() => onCollect(badge), 500)
          return {
            x: 300,
            y: -150,
            scale: 0,
            rotate: 360,
            opacity: 0
          }
        } else {
          // Snap back with elastic effect
          return {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            glow: 0
          }
        }
      }
    })
  })

  // Floating animation for unearned badges
  const floatSpring = useSpring({
    from: { y: 0 },
    to: async (next) => {
      while (true) {
        await next({ y: -5 })
        await next({ y: 5 })
      }
    },
    config: { duration: 2000 }
  })

  return (
    <div ref={containerRef} className="badge-collection-container">
      {/* Collection Zone */}
      <animated.div 
        className="collection-zone"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px dashed #FFD700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: collectionSpring.glow.to(g => `rgba(255, 215, 0, ${g * 0.2})`),
          transform: collectionSpring.scale.to(s => `scale(${s})`),
          boxShadow: collectionSpring.glow.to(g => `0 0 ${g * 30}px rgba(255, 215, 0, ${g * 0.5})`),
          zIndex: 1000
        }}
      >
        <span style={{ color: '#FFD700', fontWeight: 'bold', textAlign: 'center' }}>
          DROP HERE TO COLLECT
        </span>
      </animated.div>

      {/* Badge Grid */}
      <div className="badge-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '20px',
        padding: '20px',
        paddingTop: '160px'
      }}>
        {badges.map((badge, index) => (
          <animated.div
            key={badge.id}
            {...bind(index)}
            className="badge-item"
            style={{
              ...badgeSprings[index],
              touchAction: 'none',
              cursor: badge.earned ? 'grab' : 'default',
              position: 'relative',
              zIndex: draggedBadge === badge.id ? 1000 : 1,
              transform: badgeSprings[index].x.to((x, y, scale, rotate) => 
                `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`
              )
            }}
            onClick={() => !draggedBadge && onBadgeSelect(badge)}
          >
            {/* Badge Glow Effect */}
            <animated.div
              className="badge-glow-spring"
              style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${getCategoryColor(badge.category, badge.tier)}40 0%, transparent 70%)`,
                opacity: badgeSprings[index].glow,
                pointerEvents: 'none'
              }}
            />
            
            {/* Badge Image Container */}
            <div 
              className="badge-image-container"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${getCategoryColor(badge.category, badge.tier)}`,
                background: badge.earned ? 'white' : '#f0f0f0',
                position: 'relative'
              }}
            >
              <img 
                src={badge.image} 
                alt={badge.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: badge.earned ? 'none' : 'grayscale(100%) brightness(0.5)'
                }}
              />
              
              {/* Progress Ring for Unearned Badges */}
              {!badge.earned && (
                <svg 
                  className="progress-ring"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'rotate(-90deg)'
                  }}
                >
                  <circle
                    cx="50%"
                    cy="50%"
                    r="35"
                    fill="none"
                    stroke={getCategoryColor(badge.category, badge.tier)}
                    strokeWidth="4"
                    strokeDasharray={`${badge.progress * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            {/* Badge Info */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: badge.earned ? '#333' : '#999'
              }}>
                {badge.name}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: getCategoryColor(badge.category, badge.tier),
                textTransform: 'uppercase'
              }}>
                {badge.tier} {badge.category}
              </div>
              {!badge.earned && (
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {Math.round(badge.progress)}% Complete
                </div>
              )}
            </div>

            {/* Floating Animation for Unearned */}
            {!badge.earned && (
              <animated.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  transform: floatSpring.y.to(y => `translateY(${y}px)`)
                }}
              />
            )}

            {/* Tier Indicator */}
            <div
              className="tier-indicator"
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getTierColor(badge.tier),
                border: '2px solid white',
                fontSize: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
              }}
            >
              {getTierSymbol(badge.tier)}
            </div>
          </animated.div>
        ))}
      </div>

      <style jsx>{`
        .badge-collection-container {
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
          position: relative;
        }
        
        .badge-item:active {
          cursor: grabbing !important;
        }
        
        @media (max-width: 768px) {
          .badge-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)) !important;
            gap: 15px !important;
            padding: 15px !important;
            padding-top: 140px !important;
          }
          
          .collection-zone {
            width: 100px !important;
            height: 100px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}

function getTierColor(tier: string): string {
  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0', 
    gold: '#FFD700',
    platinum: '#E5E4E2'
  }
  return tierColors[tier as keyof typeof tierColors] || '#666'
}

function getTierSymbol(tier: string): string {
  const tierSymbols = {
    bronze: 'B',
    silver: 'S',
    gold: 'G', 
    platinum: 'P'
  }
  return tierSymbols[tier as keyof typeof tierSymbols] || '?'
}