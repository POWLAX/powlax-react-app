'use client'

import Link from 'next/link'

export default function DemoLauncher() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: 'white',
      textAlign: 'center'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{
          fontSize: '72px',
          margin: '0 0 20px 0',
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚀 POWLAX
        </h1>
        
        <h2 style={{
          fontSize: '32px',
          margin: '0 0 30px 0',
          color: '#4ECDC4',
          fontWeight: 'normal'
        }}>
          Animation Demo Launcher
        </h2>
        
        <p style={{
          fontSize: '20px',
          opacity: 0.8,
          maxWidth: '600px',
          lineHeight: 1.6,
          margin: '0 auto'
        }}>
          Experience the complete gamification animation system built for the POWLAX Skills Academy. 
          7 unique animations showcasing different techniques from CSS to WebGL.
        </p>
      </div>

      {/* Main launch button */}
      <Link 
        href="/animations-demo"
        style={{
          textDecoration: 'none',
          display: 'block',
          marginBottom: '40px'
        }}
      >
        <div style={{
          background: 'linear-gradient(45deg, #FF6B35, #F7931E, #FFD700)',
          padding: '25px 50px',
          borderRadius: '50px',
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)',
          border: '3px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.4)'
        }}
        >
          🎮 Launch All Animations
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shine 2s infinite'
          }} />
        </div>
      </Link>

      {/* Feature highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '800px',
        width: '100%',
        marginBottom: '40px'
      }}>
        {[
          { icon: '🏆', title: 'Badge System', desc: 'CSS keyframe animations' },
          { icon: '🎯', title: 'Point Explosions', desc: 'Canvas particle effects' },
          { icon: '🌳', title: 'Skill Trees', desc: 'Interactive SVG paths' },
          { icon: '🔥', title: 'Combo System', desc: 'Fire effects & screen shake' },
          { icon: '⚡', title: 'Power-ups', desc: 'WebGL shaders & 3D' },
          { icon: '🏁', title: 'Team Racing', desc: 'Multi-team progress' }
        ].map((feature) => (
          <div key={feature.title} style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '15px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{feature.icon}</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>{feature.title}</h4>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'flex',
        gap: '40px',
        background: 'rgba(0,0,0,0.3)',
        padding: '20px 40px',
        borderRadius: '25px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        marginBottom: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>7</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Animation Types</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>5</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Tech Approaches</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>100%</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Mobile Ready</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>58</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Badge Types</div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '25px',
        maxWidth: '600px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#FFD700', fontSize: '20px' }}>
          🎯 How to Use
        </h3>
        <ul style={{ 
          textAlign: 'left', 
          margin: 0, 
          padding: '0 0 0 20px',
          lineHeight: 1.6,
          opacity: 0.9
        }}>
          <li>Click the launch button above to see all 7 animations</li>
          <li>Each animation card can be clicked to see a full demo</li>
          <li>Use the back button to return to the menu</li>
          <li>All animations are optimized for mobile devices</li>
          <li>Try different interactions like clicking, dragging, and hovering</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}