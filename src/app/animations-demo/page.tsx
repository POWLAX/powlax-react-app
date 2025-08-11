'use client'

import React, { useState } from 'react'
import { useGamification } from '@/hooks/useGamification'
import { Flame, Trophy, Star, Coins, Zap, Play, Sparkles, X } from 'lucide-react'
import BadgeUnlockCSS from '@/components/animations/BadgeUnlockCSS'

// Simple Badge Display Component
function SimpleBadgeDisplay({ badge, onClick }: { badge: any, onClick: () => void }) {
      return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        border: '2px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
        <div style={{ 
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: badge.earned ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        marginBottom: '15px',
          position: 'relative'
        }}>
        {badge.icon && badge.icon.startsWith('https://') ? (
          <img 
            src={badge.icon} 
            alt={badge.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Trophy className="w-8 h-8" style={{ color: badge.earned ? '#FFD700' : '#888' }} />
        )}
        {badge.earned && (
          <Sparkles 
            className="w-4 h-4 absolute -top-1 -right-1" 
            style={{ color: '#FFD700' }} 
            />
          )}
        </div>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: badge.earned ? '#FFD700' : '#CCC',
        textAlign: 'center',
        margin: '0 0 8px 0'
      }}>
        {badge.name}
      </h3>
      <p style={{
        fontSize: '12px',
        color: '#888',
        textAlign: 'center',
        margin: '0 0 10px 0'
      }}>
        {badge.category}
      </p>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(badge.progress / (badge.required || 5)) * 100}%`,
          height: '100%',
          background: badge.earned ? '#4CAF50' : '#FF9800',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <span style={{
        fontSize: '11px',
        color: '#888',
        marginTop: '5px'
      }}>
        {badge.progress}/{badge.required || 5}
      </span>
    </div>
  )
}

// Simple Animation Demo Component
function SimpleAnimationDemo({ title, description, color, icon, onClick }: {
  title: string
  description: string
  color: string
  icon: string
  onClick: () => void
}) {
    return (
    <div
      onClick={onClick}
          style={{
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `2px solid ${color}40`,
        borderRadius: '20px',
        padding: '30px',
            cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}30`
        e.currentTarget.style.borderColor = color
          }}
          onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = `${color}40`
      }}
    >
      {/* Icon */}
      <div style={{
        fontSize: '48px',
        textAlign: 'center',
        marginBottom: '20px',
        filter: `drop-shadow(0 0 10px ${color})`
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 15px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: color
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        margin: '0 0 25px 0',
        fontSize: '16px',
        lineHeight: 1.5,
        opacity: 0.9,
        textAlign: 'center'
      }}>
        {description}
      </p>

      {/* Launch button */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: color,
            color: 'white',
          padding: '12px 24px',
            borderRadius: '25px',
            fontWeight: 'bold',
          fontSize: '16px',
          transition: 'transform 0.2s ease'
        }}>
          <Play className="w-5 h-5" />
          Launch Demo
        </div>
      </div>
    </div>
  )
}

export default function AnimationDemoPage() {
  const [selectedBadge, setSelectedBadge] = useState<any>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [badgeUnlockData, setBadgeUnlockData] = useState<any>(null)
  const { pointTypes, badges, ranks, currentRank, totalPoints, loading: gamificationLoading } = useGamification()

  // Show loading state
  if (gamificationLoading) {
    return (
          <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: 'white',
            fontSize: '24px'
          }}>
        <Zap className="w-8 h-8 mr-4 animate-spin" />
        Loading POWLAX Animations...
      </div>
    )
  }

  const handleAnimationDemo = (demoType: string) => {
    if (demoType === 'Badge Unlock') {
      // Get a random badge for the demo
      const availableBadges = badges.filter(badge => badge.icon && badge.icon.startsWith('https://'))
      const randomBadge = availableBadges[Math.floor(Math.random() * availableBadges.length)]
      
      if (randomBadge) {
        setBadgeUnlockData({
          badgeName: randomBadge.name,
          badgeImage: randomBadge.icon,
          category: randomBadge.category.toLowerCase().includes('attack') ? 'attack' :
                   randomBadge.category.toLowerCase().includes('defense') ? 'defense' :
                   randomBadge.category.toLowerCase().includes('midfield') ? 'midfield' : 'wallball'
        })
        setCurrentAnimation('badge-unlock')
      }
    } else if (demoType === 'Badge Collection') {
      setCurrentAnimation('badge-collection')
    } else if (demoType === 'Point Explosions') {
      // Simple point explosion effect
      setCurrentAnimation('point-explosion')
      // Auto-close after 3 seconds
      setTimeout(() => setCurrentAnimation(null), 3000)
    } else if (demoType === 'Skill Tree') {
      setCurrentAnimation('skill-tree')
    } else if (demoType === 'Rank Progression') {
      setCurrentAnimation('rank-progression')
    }
  }

  const closeAnimation = () => {
    setCurrentAnimation(null)
    setBadgeUnlockData(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '40px 20px',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{
          fontSize: '54px',
          margin: '0 0 20px 0',
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          🎮 POWLAX Animation Demos
        </h1>
        
        <p style={{
          fontSize: '20px',
          opacity: 0.8,
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.5
        }}>
          Explore gamification animations powered by your real badge and points data!
        </p>

        {/* Animation Stats */}
        <div style={{
          display: 'inline-flex',
          gap: '20px',
          background: 'rgba(255,255,255,0.1)',
          padding: '15px 30px',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>5</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Demo Types</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>Real Data</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Integration</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>Mobile</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Optimized</div>
          </div>
        </div>

        {/* Real Gamification Stats */}
        {!gamificationLoading && (
          <div style={{
            display: 'flex',
            gap: '15px',
            marginTop: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Total Points */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,215,0,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255,215,0,0.3)'
            }}>
              <Coins className="w-5 h-5" style={{ color: '#FFD700' }} />
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{totalPoints.toLocaleString()}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Total Points</span>
            </div>

            {/* Current Rank */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(147,51,234,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(147,51,234,0.3)'
            }}>
              <span style={{ fontSize: '16px' }}>{currentRank.icon}</span>
              <span style={{ color: '#9333EA', fontWeight: 'bold' }}>{currentRank.name}</span>
            </div>

            {/* Badges Earned */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(34,197,94,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(34,197,94,0.3)'
            }}>
              <Trophy className="w-5 h-5" style={{ color: '#22C55E' }} />
              <span style={{ color: '#22C55E', fontWeight: 'bold' }}>{badges.filter(b => b.earned).length}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>/ {badges.length} Badges</span>
            </div>

            {/* Point Types */}
            {pointTypes.slice(0, 3).map((pointType, index) => (
              <div key={pointType.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: `${pointType.color}20`,
                padding: '6px 12px',
                borderRadius: '16px',
                border: `1px solid ${pointType.color}30`
              }}>
                <span style={{ fontSize: '14px' }}>{pointType.symbol}</span>
                <span style={{ color: pointType.color, fontWeight: 'bold', fontSize: '14px' }}>
                  {pointType.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animation Demos Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto 60px'
      }}>
        <SimpleAnimationDemo
          title="Badge Unlock"
          description="CSS keyframe animations with burst effects and confetti"
          color="#FF6B35"
          icon="🏆"
          onClick={() => handleAnimationDemo('Badge Unlock')}
        />
        
        <SimpleAnimationDemo
          title="Badge Collection"
          description="Interactive badge gallery with your real achievements"
          color="#4ECDC4"
          icon="🎒"
          onClick={() => handleAnimationDemo('Badge Collection')}
        />
        
        <SimpleAnimationDemo
          title="Point Explosions"
          description="Particle effects for point rewards and achievements"
          color="#45B7D1"
          icon="💥"
          onClick={() => handleAnimationDemo('Point Explosions')}
        />
        
        <SimpleAnimationDemo
          title="Skill Tree"
          description="Interactive progression system visualization"
          color="#96CEB4"
          icon="🌳"
          onClick={() => handleAnimationDemo('Skill Tree')}
        />
        
        <SimpleAnimationDemo
          title="Rank Progression"
          description="Smooth rank-up animations with celebration effects"
          color="#A29BFE"
          icon="⭐"
          onClick={() => handleAnimationDemo('Rank Progression')}
        />
      </div>

      {/* Your Real Badges Section */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '40px',
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: '32px',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#FFD700'
        }}>
          🏆 Your POWLAX Badges
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {badges.slice(0, 8).map((badge) => (
            <SimpleBadgeDisplay
              key={badge.id}
              badge={badge}
              onClick={() => setSelectedBadge(badge)}
            />
          ))}
        </div>
        
        {badges.length > 8 && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ opacity: 0.8 }}>
              Showing 8 of {badges.length} badges. More coming soon!
            </p>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '400px',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: selectedBadge.earned ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              position: 'relative'
            }}>
              {selectedBadge.icon && selectedBadge.icon.startsWith('https://') ? (
                <img 
                  src={selectedBadge.icon} 
                  alt={selectedBadge.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Trophy className="w-12 h-12" style={{ color: selectedBadge.earned ? '#FFD700' : '#888' }} />
              )}
            </div>

            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: selectedBadge.earned ? '#FFD700' : '#CCC',
              marginBottom: '10px'
            }}>
              {selectedBadge.name}
            </h3>

            <p style={{
              fontSize: '16px',
              color: '#888',
              marginBottom: '20px'
            }}>
              {selectedBadge.category} Badge
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                Progress: {selectedBadge.progress}/{selectedBadge.required || 5}
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(selectedBadge.progress / (selectedBadge.required || 5)) * 100}%`,
                  height: '100%',
                  background: selectedBadge.earned ? '#4CAF50' : '#FF9800',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                padding: '12px 24px',
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
      </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '30px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#FFD700' }}>
          🎯 Built for POWLAX Skills Academy
        </h3>
        <p style={{ opacity: 0.8, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          These animation demos showcase the gamification system powered by your real badge and points data. 
          Each animation is optimized for mobile devices and designed to enhance player engagement.
        </p>
      </div>

      {/* Animation Overlays */}
      {currentAnimation === 'badge-unlock' && badgeUnlockData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999
        }}>
          <BadgeUnlockCSS
            badgeName={badgeUnlockData.badgeName}
            badgeImage={badgeUnlockData.badgeImage}
            category={badgeUnlockData.category}
            onComplete={() => {}} // Don't auto-close
          />
          
          {/* Click anywhere to close */}
          <div 
            onClick={closeAnimation}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.9)',
              color: '#333',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              animation: 'pulsePrompt 2s ease-in-out infinite',
              zIndex: 10000
            }}
          >
            🖱️ Click to Continue
          </div>
        </div>
      )}

      {currentAnimation === 'badge-collection' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <button
            onClick={closeAnimation}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>
            🎒 Your Badge Collection
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            maxWidth: '800px',
            padding: '20px'
          }}>
            {badges.slice(0, 12).map((badge, index) => (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '15px',
                  background: badge.earned ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '15px',
                  border: badge.earned ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  animation: `fadeInScale 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: badge.earned ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  {badge.icon && badge.icon.startsWith('https://') ? (
                    <img 
                      src={badge.icon} 
                      alt={badge.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Trophy className="w-6 h-6" style={{ color: badge.earned ? '#FFD700' : '#888' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  color: badge.earned ? '#FFD700' : '#CCC',
                  fontWeight: badge.earned ? 'bold' : 'normal'
                }}>
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentAnimation === 'point-explosion' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Lax Credit explosion animation */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Multiple Lax Credit bursts */}
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#06B6D4',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                  animation: `pointExplode 3s ease-out ${index * 0.15}s both`,
                  '--angle': `${index * 45}deg`,
                  '--distance': `${120 + Math.random() * 80}px`
                } as React.CSSProperties}
              >
                                 <img 
                   src="https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png" 
                   alt="Lax Credit"
                   style={{ 
                     width: '20px', 
                     height: '20px',
                     objectFit: 'contain'
                   }}
                 />
                <span>+{Math.floor(Math.random() * 150) + 100}</span>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>Lax Credits</span>
              </div>
            ))}
            
            {/* Center explosion effect */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                fontSize: '64px',
                animation: 'pulseCenter 2s ease-in-out infinite'
              }}>
                <img 
                  src="https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png" 
                  alt="Lax Credit"
                  style={{ 
                    width: '64px', 
                    height: '64px',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{
                background: 'linear-gradient(45deg, #06B6D4, #0891B2)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                animation: 'fadeInUp 0.5s ease-out 0.5s both'
              }}>
                LAX CREDITS EARNED!
              </div>
            </div>
            
            {/* Sparkle effects around center */}
            {[...Array(12)].map((_, index) => (
              <div
                key={`sparkle-${index}`}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: '#FFD700',
                  borderRadius: '50%',
                  animation: `sparkleFloat 2s ease-out ${0.8 + index * 0.1}s both`,
                  '--sparkle-angle': `${index * 30}deg`,
                  '--sparkle-distance': `${60 + Math.random() * 40}px`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      {currentAnimation === 'skill-tree' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          overflow: 'hidden'
        }}>
          <button
            onClick={closeAnimation}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>🌳 Skill Tree Progression</h2>
          
          {/* Simple skill tree visualization */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px'
          }}>
            {['Fundamentals', 'Attack', 'Defense', 'Midfield', 'Advanced'].map((skill, index) => (
              <div
                key={skill}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  animation: `slideInLeft 0.6s ease-out ${index * 0.2}s both`
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: index <= 2 ? 'linear-gradient(45deg, #4CAF50, #45A049)' : 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {index <= 2 ? '✓' : '🔒'}
                </div>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: index <= 2 ? '#4CAF50' : '#888'
                }}>
                  {skill}
                </span>
                <div style={{
                  width: '100px',
                  height: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: index <= 2 ? '100%' : `${Math.min(100, (index + 1) * 20)}%`,
                    height: '100%',
                    background: index <= 2 ? '#4CAF50' : '#FF9800',
                    borderRadius: '4px',
                    transition: 'width 1s ease-out'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

            {currentAnimation === 'rank-progression' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <button
            onClick={closeAnimation}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          {(() => {
            // Get a high-tier player rank - Flow Bro or Lax Beast
            const displayRank = ranks.find(rank => 
              rank.name === 'Flow Bro' || rank.name === 'Lax Beast' || rank.name === 'Lax Ninja'
            ) || ranks.find(rank => rank.icon && rank.icon.startsWith('https://')) || ranks[ranks.length - 1]
            
            return (
              <div style={{
                textAlign: 'center',
                animation: 'rankUp 3s ease-in-out'
              }}>
                {/* Use actual player rank image */}
                <div style={{
                  marginBottom: '30px',
                  animation: 'bounce 2s ease-in-out infinite',
                  position: 'relative'
                }}>
                  {displayRank && displayRank.icon && displayRank.icon.startsWith('https://') ? (
                    <div style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
                      border: '4px solid #667eea',
                      padding: '10px'
                    }}>
                      <img 
                        src={displayRank.icon}
                        alt={displayRank.name}
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          filter: 'brightness(1.1) contrast(1.1)'
                        }}
                      />
                      
                      {/* Glow effect */}
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '-20px',
                        right: '-20px',
                        bottom: '-20px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
                        animation: 'pulseGlow 2s ease-in-out infinite'
                      }} />
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '120px',
                      filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.8))'
                    }}>
                      🏆
                    </div>
                  )}
                </div>
            
            <h2 style={{
              fontSize: '48px',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RANK UP!
            </h2>
            
            <p style={{
              fontSize: '24px',
              opacity: 0.9,
              marginBottom: '30px'
            }}>
              You are now a <strong style={{ color: '#667eea' }}>{displayRank?.name || currentRank.name}</strong>!
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-8 h-8"
                  style={{
                    color: '#FFD700',
                    animation: `starTwinkle 0.5s ease-in-out ${i * 0.1}s both`
                  }}
                />
              ))}
            </div>
            
            {/* Additional rank info */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '15px 25px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,215,0,0.3)'
            }}>
              <p style={{
                fontSize: '18px',
                margin: '0',
                opacity: 0.9
              }}>
                🏆 {totalPoints.toLocaleString()} Total Points • {badges.filter(b => b.earned).length} Badges Earned
              </p>
            </div>
          </div>
        )
      })()}
      </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pointExplode {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes pulseCenter {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes rankUp {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes starTwinkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        @keyframes pulsePrompt {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translateX(-50%) scale(1.05);
            opacity: 1;
          }
        }
        
        @keyframes sparkleFloat {
          0% {
            transform: rotate(var(--sparkle-angle)) translateX(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--sparkle-angle)) translateX(var(--sparkle-distance)) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}