import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSpring, animated, useTransition } from '@react-spring/web'

interface ComboSystemFireProps {
  comboCount: number
  multiplier: number
  comboType: string
  onComboEnd?: () => void
  maxComboTime?: number
}

interface FireParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  opacity: number
}

export default function ComboSystemFire({
  comboCount,
  multiplier,
  comboType,
  onComboEnd,
  maxComboTime = 5000
}: ComboSystemFireProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(maxComboTime)
  const [fireParticles, setFireParticles] = useState<FireParticle[]>([])
  const [shakeIntensity, setShakeIntensity] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout>()
  const animationFrameRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particleIdRef = useRef(0)

  // Combo level thresholds
  const getComboLevel = (count: number) => {
    if (count >= 50) return 'legendary'
    if (count >= 25) return 'epic'
    if (count >= 15) return 'super'
    if (count >= 10) return 'great'
    if (count >= 5) return 'good'
    return 'start'
  }

  const comboLevel = getComboLevel(comboCount)

  // Color schemes for different combo levels
  const comboColors = {
    start: ['#FF6B35', '#F7931E'],
    good: ['#FF4757', '#FF6B35'],
    great: ['#FF3742', '#FF6B35', '#FFD700'],
    super: ['#FF1744', '#FF6B35', '#FFD700', '#00D4FF'],
    epic: ['#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'],
    legendary: ['#FFD700', '#FFA000', '#FF6D00', '#DD2C00', '#FFFFFF']
  }

  // Fire intensity based on combo level
  const getFireIntensity = () => {
    switch (comboLevel) {
      case 'legendary': return 8
      case 'epic': return 6
      case 'super': return 5
      case 'great': return 4
      case 'good': return 3
      default: return 2
    }
  }

  // Screen shake effect
  const shakeSpring = useSpring({
    transform: `translate(${Math.sin(Date.now() * 0.1) * shakeIntensity}px, ${Math.cos(Date.now() * 0.05) * shakeIntensity}px)`,
    config: { tension: 1000, friction: 50 }
  })

  // Main combo display spring
  const comboSpring = useSpring({
    scale: isActive ? (1 + Math.min(comboCount * 0.02, 0.5)) : 0,
    glow: isActive ? 1 : 0,
    fire: comboLevel === 'legendary' ? 1 : 0,
    config: { tension: 200, friction: 20 }
  })

  // Timer bar spring
  const timerSpring = useSpring({
    width: isActive ? `${(timeLeft / maxComboTime) * 100}%` : '0%',
    backgroundColor: timeLeft < 1000 ? '#FF1744' : '#4CAF50',
    config: { tension: 100, friction: 30 }
  })

  // Multiplier popup transitions
  const multiplierTransitions = useTransition(multiplier > 1 ? [multiplier] : [], {
    from: { opacity: 0, transform: 'scale(0.5) translateY(0px)' },
    enter: { opacity: 1, transform: 'scale(1.5) translateY(-50px)' },
    leave: { opacity: 0, transform: 'scale(0.8) translateY(-100px)' },
    config: { tension: 300, friction: 20 }
  })

  // Create fire particle
  const createFireParticle = useCallback((baseX: number, baseY: number): FireParticle => {
    const angle = (Math.random() - 0.5) * Math.PI * 0.5 // Upward bias
    const speed = Math.random() * 3 + 1
    const colors = comboColors[comboLevel]
    
    return {
      id: particleIdRef.current++,
      x: baseX + (Math.random() - 0.5) * 50,
      y: baseY,
      vx: Math.sin(angle) * speed,
      vy: -Math.abs(Math.cos(angle)) * speed - Math.random() * 2,
      life: Math.random() * 60 + 30,
      maxLife: Math.random() * 60 + 30,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1
    }
  }, [comboLevel])

  // Animate fire particles
  const animateFireParticles = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Add new particles if combo is active
    if (isActive && fireParticles.length < getFireIntensity() * 10) {
      const centerX = canvas.width / 2
      const centerY = canvas.height - 20
      
      for (let i = 0; i < getFireIntensity(); i++) {
        setFireParticles(prev => [...prev, createFireParticle(centerX, centerY)])
      }
    }

    // Update and draw particles
    setFireParticles(prev => prev.map(particle => {
      // Update physics
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // Gravity
      particle.vx *= 0.99 // Air resistance
      particle.life -= 1
      particle.opacity = particle.life / particle.maxLife

      // Draw particle
      if (particle.life > 0) {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.opacity, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      return particle
    }).filter(p => p.life > 0))

    animationFrameRef.current = requestAnimationFrame(animateFireParticles)
  }, [isActive, fireParticles, createFireParticle, getFireIntensity])

  // Start combo timer
  useEffect(() => {
    if (comboCount > 0) {
      setIsActive(true)
      setTimeLeft(maxComboTime)
      
      // Set shake intensity based on combo level
      const intensity = Math.min(comboCount * 0.1, 5)
      setShakeIntensity(intensity)

      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            setIsActive(false)
            setShakeIntensity(0)
            onComboEnd?.()
            return 0
          }
          return prev - 100
        })
      }, 100)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [comboCount, maxComboTime, onComboEnd])

  // Start fire animation
  useEffect(() => {
    if (isActive) {
      animateFireParticles()
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, animateFireParticles])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  if (!isActive) return null

  return (
    <animated.div 
      style={shakeSpring}
      className="combo-system-container"
    >
      {/* Fire particles canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9997
        }}
      />

      {/* Main combo display */}
      <animated.div
        className="combo-display"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          transform: comboSpring.scale.to(s => `scale(${s})`),
          filter: comboSpring.glow.to(g => `drop-shadow(0 0 ${g * 20}px ${comboColors[comboLevel][0]})`),
        }}
      >
        {/* Combo counter */}
        <div 
          className="combo-count"
          style={{
            fontSize: `${Math.min(48 + comboCount * 2, 120)}px`,
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${comboColors[comboLevel].join(', ')})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            animation: comboLevel === 'legendary' ? 'rainbow 1s linear infinite' : 'none'
          }}
        >
          {comboCount}
        </div>

        {/* Combo type */}
        <div
          className="combo-type"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: comboColors[comboLevel][0],
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '10px'
          }}
        >
          {comboType} {comboLevel.toUpperCase()}
        </div>

        {/* Timer bar */}
        <div
          style={{
            width: '200px',
            height: '8px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          <animated.div
            style={{
              height: '100%',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease',
              ...timerSpring
            }}
          />
        </div>

        {/* Legendary effects */}
        {comboLevel === 'legendary' && (
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              right: '-20px',
              bottom: '-20px',
              background: 'conic-gradient(from 0deg, #FFD700, #FF6D00, #E91E63, #9C27B0, #3F51B5, #00BCD4, #FFD700)',
              borderRadius: '50%',
              animation: 'spin 3s linear infinite',
              opacity: 0.3,
              zIndex: -1
            }}
          />
        )}
      </animated.div>

      {/* Multiplier popups */}
      {multiplierTransitions((style, item) => (
        <animated.div
          style={{
            position: 'fixed',
            top: '200px',
            right: '50px',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            zIndex: 9998,
            pointerEvents: 'none',
            ...style
          }}
        >
          {item}× MULTIPLIER!
        </animated.div>
      ))}

      {/* Screen edge glow */}
      {comboLevel !== 'start' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9996,
            background: `radial-gradient(ellipse at center, transparent 60%, ${comboColors[comboLevel][0]}20 100%)`,
            animation: comboLevel === 'legendary' ? 'pulseGlow 0.5s ease-in-out infinite alternate' : 'none'
          }}
        />
      )}

      <style jsx>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulseGlow {
          0% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }

        .combo-display {
          user-select: none;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .combo-display {
            top: 10px !important;
            right: 10px !important;
            scale: 0.8;
          }
          
          .combo-count {
            font-size: ${Math.min(32 + comboCount, 80)}px !important;
          }
        }
      `}</style>
    </animated.div>
  )
}

// Demo component
export function ComboSystemDemo() {
  const [combo, setCombo] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [comboType, setComboType] = useState('DRILL')

  const addCombo = () => {
    setCombo(prev => prev + 1)
    
    // Update multiplier based on combo count
    const newMultiplier = Math.floor((combo + 1) / 5) + 1
    if (newMultiplier > multiplier) {
      setMultiplier(newMultiplier)
    }
  }

  const resetCombo = () => {
    setCombo(0)
    setMultiplier(1)
  }

  const comboTypes = ['DRILL', 'SHOT', 'CATCH', 'DODGE', 'SAVE']

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Combo System Demo
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>
          Click buttons to build combos and see fire effects!
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button
          onClick={addCombo}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
            transition: 'transform 0.2s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Add Combo (+1)
        </button>

        <button
          onClick={() => {
            setComboType(comboTypes[Math.floor(Math.random() * comboTypes.length)])
            addCombo()
          }}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #4CAF50, #45A049)',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
            transition: 'transform 0.2s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Random Combo
        </button>

        <button
          onClick={resetCombo}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF1744, #D50000)',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 23, 68, 0.4)',
            transition: 'transform 0.2s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Reset Combo
        </button>
      </div>

      <div style={{ 
        fontSize: '16px', 
        opacity: 0.6,
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <p>Current Combo: {combo} • Multiplier: {multiplier}×</p>
        <p>Combo levels: Start → Good (5) → Great (10) → Super (15) → Epic (25) → Legendary (50)</p>
      </div>

      <ComboSystemFire
        comboCount={combo}
        multiplier={multiplier}
        comboType={comboType}
        onComboEnd={resetCombo}
        maxComboTime={8000}
      />
    </div>
  )
}