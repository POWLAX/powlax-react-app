'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import animations to prevent SSR issues
const BadgeUnlockCSS = dynamic(() => import('../../components/animations/BadgeUnlockCSS'), { ssr: false })
const BadgeCollectionSpring = dynamic(() => import('../../components/animations/BadgeCollectionSpring'), { ssr: false })
const PointExplosionDemo = dynamic(() => import('../../components/animations/PointExplosionCanvas').then(mod => ({ default: mod.PointExplosionDemo })), { ssr: false })
const SkillTreeDemo = dynamic(() => import('../../components/animations/SkillTreeSVG').then(mod => ({ default: mod.SkillTreeDemo })), { ssr: false })
const ComboSystemDemo = dynamic(() => import('../../components/animations/ComboSystemFire').then(mod => ({ default: mod.ComboSystemDemo })), { ssr: false })
const PowerUpWebGLDemo = dynamic(() => import('../../components/animations/PowerUpWebGL').then(mod => ({ default: mod.PowerUpWebGLDemo })), { ssr: false })
const TeamChallengeDemo = dynamic(() => import('../../components/animations/TeamChallengeRacing').then(mod => ({ default: mod.TeamChallengeDemo })), { ssr: false })

interface AnimationDemo {
  id: string
  name: string
  description: string
  component: React.ComponentType
  color: string
  icon: string
}

const animations: AnimationDemo[] = [
  {
    id: 'badge-unlock',
    name: 'Badge Unlock',
    description: 'CSS keyframe animations with burst effects and confetti',
    component: function BadgeUnlockDemo() {
      const [showBadge, setShowBadge] = useState(false)
      
      return (
        <div style={{ 
          width: '100vw', 
          height: '100vh', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => {
              setShowBadge(false)
              setTimeout(() => setShowBadge(true), 100)
            }}
            style={{
              padding: '20px 40px',
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
              transition: 'transform 0.2s ease',
              zIndex: 1000
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🏆 Unlock Badge!
          </button>
          
          {showBadge && (
            <BadgeUnlockCSS
              badgeName="Animation Master"
              badgeImage="https://via.placeholder.com/200x200/FFD700/FFFFFF?text=🏆"
              category="attack"
            />
          )}
        </div>
      )
    },
    color: '#FF6B35',
    icon: '🏆'
  },
  {
    id: 'badge-collection',
    name: 'Badge Collection',
    description: 'Drag & drop badge collection with physics',
    component: () => {
      const mockBadges = [
        { id: '1', name: 'Quick Stick', image: 'https://via.placeholder.com/80x80/FF4444/FFFFFF?text=⚡', category: 'attack' as const, tier: 'gold' as const, earned: true, progress: 100 },
        { id: '2', name: 'Wall Warrior', image: 'https://via.placeholder.com/80x80/FF8844/FFFFFF?text=🏰', category: 'wallball' as const, tier: 'silver' as const, earned: true, progress: 100 },
        { id: '3', name: 'Defender', image: 'https://via.placeholder.com/80x80/4444FF/FFFFFF?text=🛡️', category: 'defense' as const, tier: 'bronze' as const, earned: false, progress: 65 },
        { id: '4', name: 'Midfielder', image: 'https://via.placeholder.com/80x80/44FF44/FFFFFF?text=🏃', category: 'midfield' as const, tier: 'platinum' as const, earned: false, progress: 30 },
        { id: '5', name: 'Shooter', image: 'https://via.placeholder.com/80x80/FF1744/FFFFFF?text=🎯', category: 'attack' as const, tier: 'silver' as const, earned: true, progress: 100 },
        { id: '6', name: 'Captain', image: 'https://via.placeholder.com/80x80/9C27B0/FFFFFF?text=👑', category: 'fundamentals' as const, tier: 'platinum' as const, earned: false, progress: 80 }
      ]
      
      return (
        <BadgeCollectionSpring
          badges={mockBadges}
          onCollect={(badge) => alert(`Collected ${badge.name}!`)}
          onBadgeSelect={(badge) => console.log('Selected:', badge)}
        />
      )
    },
    color: '#4ECDC4',
    icon: '🎒'
  },
  {
    id: 'point-explosions',
    name: 'Point Explosions',
    description: 'Canvas particle effects for point rewards',
    component: PointExplosionDemo,
    color: '#45B7D1',
    icon: '💥'
  },
  {
    id: 'skill-tree',
    name: 'Skill Tree',
    description: 'Interactive SVG skill progression system',
    component: SkillTreeDemo,
    color: '#96CEB4',
    icon: '🌳'
  },
  {
    id: 'combo-system',
    name: 'Combo System',
    description: 'Fire effects with screen shake and combos',
    component: ComboSystemDemo,
    color: '#FFEAA7',
    icon: '🔥'
  },
  {
    id: 'power-ups',
    name: 'Power-Up Effects',
    description: 'WebGL shaders with 3D particle systems',
    component: PowerUpWebGLDemo,
    color: '#A29BFE',
    icon: '⚡'
  },
  {
    id: 'team-racing',
    name: 'Team Challenge Racing',
    description: 'Multi-team progress racing visualization',
    component: TeamChallengeDemo,
    color: '#FD79A8',
    icon: '🏁'
  }
]

export default function AnimationDemoPage() {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null)

  if (currentDemo) {
    const demo = animations.find(a => a.id === currentDemo)
    const DemoComponent = demo?.component

    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {/* Back button */}
        <button
          onClick={() => setCurrentDemo(null)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 10000,
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.borderColor = '#FFD700'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
        >
          ← Back to Menu
        </button>

        {/* Demo title */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${demo?.color || '#FFD700'}`
          }}
        >
          {demo?.icon} {demo?.name}
        </div>

        {/* Demo component */}
        <Suspense fallback={
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
            Loading animation...
          </div>
        }>
          {DemoComponent && <DemoComponent />}
        </Suspense>
      </div>
    )
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
          Click any animation below to see it in action! Each demo showcases different techniques optimized for mobile lacrosse training.
        </p>

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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>7</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Animations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>5</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Techniques</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>100%</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Mobile Ready</div>
          </div>
        </div>
      </div>

      {/* Animation grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {animations.map((animation) => (
          <div
            key={animation.id}
            onClick={() => setCurrentDemo(animation.id)}
            style={{
              background: `linear-gradient(135deg, ${animation.color}20, ${animation.color}10)`,
              border: `2px solid ${animation.color}40`,
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
              e.currentTarget.style.boxShadow = `0 20px 40px ${animation.color}30`
              e.currentTarget.style.borderColor = animation.color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = `${animation.color}40`
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '20px',
              filter: `drop-shadow(0 0 10px ${animation.color})`
            }}>
              {animation.icon}
            </div>

            {/* Title */}
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: animation.color
            }}>
              {animation.name}
            </h3>

            {/* Description */}
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              lineHeight: 1.5,
              opacity: 0.9,
              textAlign: 'center'
            }}>
              {animation.description}
            </p>

            {/* Launch button */}
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: animation.color,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'transform 0.2s ease'
              }}>
                ▶ Launch Demo
              </div>
            </div>

            {/* Hover overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${animation.color}10, transparent)`,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            }} />
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{
        textAlign: 'center',
        marginTop: '80px',
        padding: '30px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '800px',
        margin: '80px auto 0'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#FFD700' }}>
          🎯 Built for POWLAX Skills Academy
        </h3>
        <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
          These animations showcase different techniques from lightweight CSS keyframes to advanced WebGL shaders. 
          Each is optimized for mobile devices and designed to enhance the gamification experience for lacrosse players.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <span>🎨 CSS Keyframes</span>
          <span>🌊 React Spring</span>
          <span>🎪 Canvas Particles</span>
          <span>🔺 SVG Animations</span>
          <span>✨ WebGL Shaders</span>
        </div>
      </div>
    </div>
  )
}