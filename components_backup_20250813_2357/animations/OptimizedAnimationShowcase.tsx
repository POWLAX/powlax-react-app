'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'
import BadgeUnlockCSS from './BadgeUnlockCSS'
import { PointExplosionDemo } from './PointExplosionCanvas'

// Lazy load heavy components to prevent initial loading issues
const BadgeCollectionSpring = lazy(() => import('./BadgeCollectionSpring'))
const SkillTreeDemo = lazy(() => import('./SkillTreeSVG').then(mod => ({ default: mod.SkillTreeDemo })))
const ComboSystemDemo = lazy(() => import('./ComboSystemFire').then(mod => ({ default: mod.ComboSystemDemo })))
const PowerUpWebGLDemo = lazy(() => import('./PowerUpWebGL').then(mod => ({ default: mod.PowerUpWebGLDemo })))
const TeamChallengeDemo = lazy(() => import('./TeamChallengeRacing').then(mod => ({ default: mod.TeamChallengeDemo })))

interface AnimationDemo {
  id: string
  name: string
  description: string
  technique: string
  performance: 'Excellent' | 'Good' | 'Moderate'
  mobileOptimized: boolean
  component: React.ComponentType
  isHeavy?: boolean
  previewGif?: string
}

const animationDemos: AnimationDemo[] = [
  {
    id: 'badge-unlock-css',
    name: 'Badge Unlock (CSS)',
    description: 'Pure CSS keyframe animations with burst effects, sparkles, and confetti. Lightweight and GPU-accelerated.',
    technique: 'CSS Keyframes',
    performance: 'Excellent',
    mobileOptimized: true,
    component: () => (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <BadgeUnlockCSS
          badgeName="Animation Master"
          badgeImage="https://via.placeholder.com/200x200/FFD700/FFFFFF?text=🏆"
          category="attack"
        />
      </div>
    )
  },
  {
    id: 'badge-collection-spring',
    name: 'Badge Collection (React Spring)',
    description: 'Physics-based badge collection with drag & drop, elastic effects, and gesture support.',
    technique: 'React Spring + Gestures',
    performance: 'Good',
    mobileOptimized: true,
    isHeavy: true,
    component: () => {
      const mockBadges = [
        { id: '1', name: 'Quick Stick', image: 'https://via.placeholder.com/80x80/FF4444/FFFFFF?text=⚡', category: 'attack' as const, tier: 'gold' as const, earned: true, progress: 100 },
        { id: '2', name: 'Wall Warrior', image: 'https://via.placeholder.com/80x80/FF8844/FFFFFF?text=🏰', category: 'wallball' as const, tier: 'silver' as const, earned: true, progress: 100 },
        { id: '3', name: 'Defender', image: 'https://via.placeholder.com/80x80/4444FF/FFFFFF?text=🛡️', category: 'defense' as const, tier: 'bronze' as const, earned: false, progress: 65 },
        { id: '4', name: 'Midfielder', image: 'https://via.placeholder.com/80x80/44FF44/FFFFFF?text=🏃', category: 'midfield' as const, tier: 'platinum' as const, earned: false, progress: 30 }
      ]
      
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>}>
          <BadgeCollectionSpring
            badges={mockBadges}
            onCollect={(badge) => console.log('Collected:', badge)}
            onBadgeSelect={(badge) => console.log('Selected:', badge)}
          />
        </Suspense>
      )
    }
  },
  {
    id: 'point-explosion-canvas',
    name: 'Point Explosions (Canvas)',
    description: 'Dynamic particle systems with different shapes, physics, and point type theming.',
    technique: 'HTML5 Canvas + Particles',
    performance: 'Moderate',
    mobileOptimized: true,
    component: PointExplosionDemo
  },
  {
    id: 'skill-tree-svg',
    name: 'Skill Tree (SVG)',
    description: 'Interactive skill progression with animated paths, node states, and hover effects.',
    technique: 'SVG + React Spring',
    performance: 'Good',
    mobileOptimized: true,
    isHeavy: true,
    component: () => (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>}>
        <SkillTreeDemo />
      </Suspense>
    )
  },
  {
    id: 'combo-system-fire',
    name: 'Combo System (Fire Effects)',
    description: 'Canvas fire particles with screen shake, dynamic colors, and combo level scaling.',
    technique: 'Canvas Particles + CSS',
    performance: 'Moderate',
    mobileOptimized: true,
    isHeavy: true,
    component: () => (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>}>
        <ComboSystemDemo />
      </Suspense>
    )
  },
  {
    id: 'power-up-webgl',
    name: 'Power-Up Effects (WebGL)',
    description: 'Custom shaders with 3D particles for immersive power-up experiences.',
    technique: 'Three.js + Custom Shaders',
    performance: 'Moderate',
    mobileOptimized: false,
    isHeavy: true,
    component: () => (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div><p className="mt-4">Loading 3D effects...</p></div>}>
        <PowerUpWebGLDemo />
      </Suspense>
    )
  },
  {
    id: 'team-challenge-racing',
    name: 'Team Challenge Racing',
    description: 'Multi-team progress visualization with racing mechanics and milestone celebrations.',
    technique: 'React Spring + CSS',
    performance: 'Good',
    mobileOptimized: true,
    isHeavy: true,
    component: () => (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div></div>}>
        <TeamChallengeDemo />
      </Suspense>
    )
  }
]

export default function OptimizedAnimationShowcase() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'mobile' | 'performance'>('all')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading animations...</p>
        </div>
      </div>
    )
  }

  const filteredDemos = animationDemos.filter(demo => {
    if (filter === 'mobile') return demo.mobileOptimized
    if (filter === 'performance') return demo.performance === 'Excellent'
    return true
  })

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return '#4CAF50'
      case 'Good': return '#FF9800' 
      case 'Moderate': return '#FF5722'
      default: return '#666'
    }
  }

  return (
    <div className="animation-showcase">
      {!selectedDemo ? (
        <>
          {/* Header */}
          <div className="showcase-header">
            <h1>POWLAX Animation Showcase</h1>
            <p>Interactive demonstrations of gamification animations for the POWLAX Skills Academy</p>
            
            {/* Filter buttons */}
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All Animations ({animationDemos.length})
              </button>
              <button
                className={filter === 'mobile' ? 'active' : ''}
                onClick={() => setFilter('mobile')}
              >
                Mobile Optimized ({animationDemos.filter(d => d.mobileOptimized).length})
              </button>
              <button
                className={filter === 'performance' ? 'active' : ''}
                onClick={() => setFilter('performance')}
              >
                High Performance ({animationDemos.filter(d => d.performance === 'Excellent').length})
              </button>
            </div>
          </div>

          {/* Animation grid */}
          <div className="animation-grid">
            {filteredDemos.map((demo) => (
              <div
                key={demo.id}
                className="animation-card"
                onClick={() => setSelectedDemo(demo.id)}
              >
                <div className="card-header">
                  <h3>{demo.name}</h3>
                  <div className="technique-badge">
                    {demo.technique}
                  </div>
                </div>
                
                <div className="card-description">
                  {demo.description}
                </div>
                
                <div className="card-footer">
                  <div className="performance-indicator">
                    <span 
                      className="performance-dot"
                      style={{ backgroundColor: getPerformanceColor(demo.performance) }}
                    />
                    <span>Performance: {demo.performance}</span>
                  </div>
                  
                  <div className="mobile-indicator">
                    {demo.mobileOptimized ? (
                      <span className="mobile-yes">📱 Mobile Ready</span>
                    ) : (
                      <span className="mobile-no">🖥️ Desktop Only</span>
                    )}
                  </div>
                </div>
                
                {demo.isHeavy && (
                  <div className="heavy-indicator">
                    ⚡ Dynamic Loading
                  </div>
                )}
                
                <div className="card-overlay">
                  <div className="play-button">▶ View Demo</div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical details */}
          <div className="technical-details">
            <h2>Technical Implementation Overview</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <h4>CSS Keyframes</h4>
                <p>GPU-accelerated, lightweight, perfect for mobile devices</p>
                <div className="tech-examples">BadgeUnlock, UI transitions</div>
              </div>
              
              <div className="tech-item">
                <h4>React Spring</h4>
                <p>Physics-based animations with gesture support and interruption</p>
                <div className="tech-examples">BadgeCollection, SkillTree, TeamRacing</div>
              </div>
              
              <div className="tech-item">
                <h4>HTML5 Canvas</h4>
                <p>Custom particle systems and dynamic visual effects</p>
                <div className="tech-examples">PointExplosions, ComboFire</div>
              </div>
              
              <div className="tech-item">
                <h4>WebGL/Three.js</h4>
                <p>Advanced 3D effects and custom shaders for premium experiences</p>
                <div className="tech-examples">PowerUpEffects, 3D particles</div>
              </div>
              
              <div className="tech-item">
                <h4>SVG Animations</h4>
                <p>Scalable vector graphics with path morphing and interactions</p>
                <div className="tech-examples">SkillTree paths, Icon transitions</div>
              </div>
              
              <div className="tech-item">
                <h4>Optimized Loading</h4>
                <p>Lazy loading and dynamic imports for better performance</p>
                <div className="tech-examples">Progressive enhancement, Code splitting</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Full-screen demo view
        <div className="demo-view">
          <div className="demo-header">
            <button
              className="back-button"
              onClick={() => setSelectedDemo(null)}
            >
              ← Back to Showcase
            </button>
            <h2>{animationDemos.find(d => d.id === selectedDemo)?.name}</h2>
          </div>
          
          <div className="demo-container">
            {(() => {
              const demo = animationDemos.find(d => d.id === selectedDemo)
              const DemoComponent = demo?.component
              return DemoComponent ? <DemoComponent /> : null
            })()}
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-showcase {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: white;
          padding: 40px 20px;
        }

        .showcase-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .showcase-header h1 {
          font-size: 48px;
          margin: 0 0 20px 0;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .showcase-header p {
          font-size: 18px;
          opacity: 0.8;
          margin-bottom: 30px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .filter-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filter-buttons button {
          padding: 12px 24px;
          border: 2px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .filter-buttons button.active,
        .filter-buttons button:hover {
          background: rgba(255,255,255,0.2);
          border-color: #FFD700;
          color: #FFD700;
        }

        .animation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .animation-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .animation-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.15);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }

        .technique-badge {
          background: linear-gradient(45deg, #4ECDC4, #44A08D);
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-description {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .performance-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .performance-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .mobile-yes {
          color: #4CAF50;
        }

        .mobile-no {
          color: #FF9800;
        }

        .heavy-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 193, 7, 0.2);
          color: #FFC107;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .animation-card:hover .card-overlay {
          opacity: 1;
        }

        .play-button {
          background: linear-gradient(45deg, #FF6B35, #F7931E);
          padding: 15px 30px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          transform: scale(0.9);
          transition: transform 0.2s ease;
        }

        .card-overlay:hover .play-button {
          transform: scale(1);
        }

        .technical-details {
          max-width: 1200px;
          margin: 80px auto 0;
          text-align: center;
        }

        .technical-details h2 {
          font-size: 36px;
          margin-bottom: 40px;
          color: #FFD700;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }

        .tech-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 25px;
          text-align: left;
        }

        .tech-item h4 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #4ECDC4;
        }

        .tech-item p {
          margin: 0 0 15px 0;
          font-size: 14px;
          opacity: 0.8;
          line-height: 1.4;
        }

        .tech-examples {
          font-size: 12px;
          font-style: italic;
          color: #FFD700;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 10px;
        }

        .demo-view {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          z-index: 10000;
        }

        .demo-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          padding: 0 20px;
          z-index: 10001;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .back-button {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 20px;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.2);
        }

        .demo-header h2 {
          margin: 0;
          font-size: 20px;
          color: white;
        }

        .demo-container {
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: auto;
        }

        @media (max-width: 768px) {
          .showcase-header h1 {
            font-size: 32px;
          }
          
          .animation-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .tech-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}
