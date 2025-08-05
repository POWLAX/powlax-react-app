import React, { useRef, useEffect, useState, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'circle' | 'star' | 'diamond' | 'triangle'
  rotation: number
  rotationSpeed: number
}

interface PointExplosionCanvasProps {
  points: number
  pointType: 'academy' | 'attack' | 'defense' | 'rebound' | 'midfield'
  triggerExplosion: boolean
  x: number
  y: number
  onComplete?: () => void
}

export default function PointExplosionCanvas({
  points,
  pointType,
  triggerExplosion,
  x,
  y,
  onComplete
}: PointExplosionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const [isExploding, setIsExploding] = useState(false)

  // Point type configurations
  const pointConfigs = {
    academy: { 
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
      particleCount: 30,
      baseSize: 4
    },
    attack: { 
      colors: ['#FF4444', '#FF6666', '#FF8888', '#FFAAAA'],
      particleCount: 25,
      baseSize: 5
    },
    defense: { 
      colors: ['#4444FF', '#6666FF', '#8888FF', '#AAAAFF'],
      particleCount: 25,
      baseSize: 5
    },
    rebound: { 
      colors: ['#44FF44', '#66FF66', '#88FF88', '#AAFFAA'],
      particleCount: 20,
      baseSize: 3
    },
    midfield: { 
      colors: ['#FF8844', '#FFAA66', '#FFCC88', '#FFDDAA'],
      particleCount: 22,
      baseSize: 4
    }
  }

  const createParticle = useCallback((centerX: number, centerY: number, config: typeof pointConfigs.academy): Particle => {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 8 + 4
    const life = Math.random() * 60 + 40
    
    return {
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 3, // Slight upward bias
      life: life,
      maxLife: life,
      size: config.baseSize + Math.random() * 3,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      type: (['circle', 'star', 'diamond', 'triangle'] as const)[Math.floor(Math.random() * 4)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3
    }
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life / particle.maxLife
    const size = particle.size * (0.5 + alpha * 0.5)
    
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)

    switch (particle.type) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, size, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'star':
        ctx.beginPath()
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5
          const radius = i % 2 === 0 ? size : size * 0.5
          const px = Math.cos(angle) * radius
          const py = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        break

      case 'diamond':
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size, 0)
        ctx.lineTo(0, size)
        ctx.lineTo(-size, 0)
        ctx.closePath()
        ctx.fill()
        break

      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size * 0.866, size * 0.5)
        ctx.lineTo(-size * 0.866, size * 0.5)
        ctx.closePath()
        ctx.fill()
        break
    }

    ctx.restore()
  }, [])

  const updateParticle = useCallback((particle: Particle) => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.3 // Gravity
    particle.vx *= 0.99 // Air resistance
    particle.life -= 1
    particle.rotation += particle.rotationSpeed
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      updateParticle(particle)
      
      if (particle.life > 0) {
        drawParticle(ctx, particle)
        return true
      }
      return false
    })

    // Continue animation if particles exist
    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate)
    } else if (isExploding) {
      setIsExploding(false)
      onComplete?.()
    }
  }, [isExploding, onComplete, updateParticle, drawParticle])

  const startExplosion = useCallback(() => {
    const config = pointConfigs[pointType]
    const canvas = canvasRef.current
    if (!canvas) return

    // Calculate particle count based on points (more points = more particles)
    const particleMultiplier = Math.min(3, Math.max(0.5, points / 50))
    const totalParticles = Math.floor(config.particleCount * particleMultiplier)

    // Create particles
    particlesRef.current = []
    for (let i = 0; i < totalParticles; i++) {
      particlesRef.current.push(createParticle(x, y, config))
    }

    // Add some special large particles for big point values
    if (points >= 100) {
      for (let i = 0; i < 5; i++) {
        const bigParticle = createParticle(x, y, config)
        bigParticle.size *= 2
        bigParticle.vx *= 0.7
        bigParticle.vy *= 0.7
        bigParticle.maxLife *= 1.5
        bigParticle.life = bigParticle.maxLife
        particlesRef.current.push(bigParticle)
      }
    }

    setIsExploding(true)
    animate()
  }, [x, y, points, pointType, createParticle, animate])

  // Trigger explosion when prop changes
  useEffect(() => {
    if (triggerExplosion) {
      startExplosion()
    }
  }, [triggerExplosion, startExplosion])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
      
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
      
      {/* Point Text Display */}
      {isExploding && (
        <div
          style={{
            position: 'fixed',
            left: x - 50,
            top: y - 30,
            width: '100px',
            textAlign: 'center',
            fontSize: Math.min(48, 24 + Math.log(points) * 4),
            fontWeight: 'bold',
            color: pointConfigs[pointType].colors[0],
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'pointTextFloat 2s ease-out forwards'
          }}
        >
          +{points}
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            marginTop: '5px',
            opacity: 0.8
          }}>
            {pointType} Points
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pointTextFloat {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-80px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

// Demo component for testing
export function PointExplosionDemo() {
  const [explosions, setExplosions] = useState<Array<{
    id: number
    points: number
    type: 'academy' | 'attack' | 'defense' | 'rebound' | 'midfield'
    x: number
    y: number
    trigger: boolean
  }>>([])

  const addExplosion = (event: React.MouseEvent) => {
    const points = Math.floor(Math.random() * 200) + 10
    const types = ['academy', 'attack', 'defense', 'rebound', 'midfield'] as const
    const type = types[Math.floor(Math.random() * types.length)]

    const newExplosion = {
      id: Date.now(),
      points,
      type,
      x: event.clientX,
      y: event.clientY,
      trigger: true
    }

    setExplosions(prev => [...prev, newExplosion])

    // Clean up explosion after completion
    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== newExplosion.id))
    }, 3000)
  }

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        textAlign: 'center'
      }}
      onClick={addExplosion}
    >
      Click anywhere to create point explosions!
      <br />
      <span style={{ fontSize: '16px', opacity: 0.8 }}>
        Different point types and amounts create unique effects
      </span>

      {explosions.map(explosion => (
        <PointExplosionCanvas
          key={explosion.id}
          points={explosion.points}
          pointType={explosion.type}
          triggerExplosion={explosion.trigger}
          x={explosion.x}
          y={explosion.y}
          onComplete={() => console.log(`Explosion ${explosion.id} completed`)}
        />
      ))}
    </div>
  )
}