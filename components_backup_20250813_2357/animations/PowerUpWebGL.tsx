import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Plane, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Custom shader material for power-up effects
const PowerUpMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1.0,
    uPowerType: 0, // 0: speed, 1: accuracy, 2: strength, 3: focus
    uActive: false,
    uResolution: new THREE.Vector2(1, 1)
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform float uIntensity;
    uniform int uPowerType;
    uniform bool uActive;
    uniform vec2 uResolution;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    // Power-up specific colors and effects
    vec3 getPowerColor(int powerType) {
      if (powerType == 0) return vec3(0.0, 0.8, 1.0); // Speed - cyan
      if (powerType == 1) return vec3(1.0, 0.8, 0.0); // Accuracy - gold
      if (powerType == 2) return vec3(1.0, 0.2, 0.2); // Strength - red
      return vec3(0.6, 0.0, 1.0); // Focus - purple
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      st.x *= uResolution.x / uResolution.y;
      
      vec3 color = getPowerColor(uPowerType);
      float alpha = 0.0;
      
      if (uActive) {
        // Different effects for each power type
        if (uPowerType == 0) {
          // Speed: Fast-moving streaks
          float streak = sin(st.x * 20.0 + uTime * 10.0) * 0.5 + 0.5;
          streak *= sin(st.y * 5.0 + uTime * 8.0) * 0.5 + 0.5;
          alpha = streak * uIntensity * 0.3;
          
        } else if (uPowerType == 1) {
          // Accuracy: Pulsing crosshair pattern
          float crosshair = 0.0;
          crosshair += smoothstep(0.48, 0.52, st.x) * smoothstep(0.0, 1.0, st.y);
          crosshair += smoothstep(0.48, 0.52, st.y) * smoothstep(0.0, 1.0, st.x);
          
          float pulse = sin(uTime * 4.0) * 0.5 + 0.5;
          alpha = crosshair * pulse * uIntensity * 0.4;
          
        } else if (uPowerType == 2) {
          // Strength: Radial explosion pattern
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(st, center);
          float explosion = sin(dist * 15.0 - uTime * 6.0) * 0.5 + 0.5;
          explosion *= smoothstep(0.8, 0.0, dist);
          alpha = explosion * uIntensity * 0.5;
          
        } else {
          // Focus: Swirling energy
          float angle = atan(st.y - 0.5, st.x - 0.5);
          float radius = distance(st, vec2(0.5, 0.5));
          float spiral = sin(angle * 3.0 + radius * 20.0 - uTime * 5.0) * 0.5 + 0.5;
          spiral *= smoothstep(0.6, 0.0, radius);
          alpha = spiral * uIntensity * 0.4;
        }
        
        // Add some noise for texture
        float n = noise(st * 10.0 + uTime * 2.0);
        alpha += n * 0.1 * uIntensity;
        
        // Edge glow effect
        float edge = 1.0 - length(st - 0.5) * 2.0;
        edge = smoothstep(0.0, 1.0, edge);
        alpha += edge * 0.2 * uIntensity;
      }
      
      gl_FragColor = vec4(color, alpha);
    }
  `
)

interface PowerUpSceneProps {
  powerType: 'speed' | 'accuracy' | 'strength' | 'focus'
  isActive: boolean
  intensity: number
}

function PowerUpScene({ powerType, isActive, intensity }: PowerUpSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<any>(null)
  const { size } = useThree()

  const powerTypeMap = {
    speed: 0,
    accuracy: 1,
    strength: 2,
    focus: 3
  }

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime
      materialRef.current.uIntensity = intensity
      materialRef.current.uPowerType = powerTypeMap[powerType]
      materialRef.current.uActive = isActive
      materialRef.current.uResolution.set(size.width, size.height)
    }
  })

  return (
    <Plane ref={meshRef} args={[2, 2]} position={[0, 0, -0.5]}>
      <powerUpMaterial
        ref={materialRef}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </Plane>
  )
}

// Particle system for 3D effects
function PowerUpParticles({ powerType, isActive }: { powerType: string, isActive: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = 50

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return positions
  }, [])

  const colors = useMemo(() => {
    const colorMap = {
      speed: new THREE.Color(0x00ccff),
      accuracy: new THREE.Color(0xffcc00),
      strength: new THREE.Color(0xff3333),
      focus: new THREE.Color(0x9900ff)
    }
    return colorMap[powerType as keyof typeof colorMap] || new THREE.Color(0xffffff)
  }, [powerType])

  useFrame((state) => {
    if (!meshRef.current || !isActive) return

    const time = state.clock.elapsedTime
    const matrix = new THREE.Matrix4()

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3] + Math.sin(time + i) * 0.5
      const y = positions[i * 3 + 1] + Math.cos(time + i * 0.7) * 0.5
      const z = positions[i * 3 + 2] + Math.sin(time * 2 + i * 0.3) * 0.3

      const scale = 0.1 + Math.sin(time * 3 + i) * 0.05

      matrix.setPosition(x, y, z)
      matrix.scale(new THREE.Vector3(scale, scale, scale))
      meshRef.current.setMatrixAt(i, matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={isActive}>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshBasicMaterial color={colors} transparent opacity={0.6} />
    </instancedMesh>
  )
}

interface PowerUpWebGLProps {
  powerType: 'speed' | 'accuracy' | 'strength' | 'focus'
  isActive: boolean
  duration?: number
  onComplete?: () => void
}

export default function PowerUpWebGL({ 
  powerType, 
  isActive, 
  duration = 10000, 
  onComplete 
}: PowerUpWebGLProps) {
  const [intensity, setIntensity] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)

  // Power-up descriptions
  const powerDescriptions = {
    speed: {
      name: 'Speed Boost',
      description: 'Lightning fast reflexes and movement',
      icon: '⚡',
      color: '#00ccff'
    },
    accuracy: {
      name: 'Perfect Aim',
      description: 'Enhanced precision and targeting',
      icon: '🎯',
      color: '#ffcc00'
    },
    strength: {
      name: 'Power Surge',
      description: 'Increased shot power and force',
      icon: '💪',
      color: '#ff3333'
    },
    focus: {
      name: 'Mental Focus',
      description: 'Enhanced concentration and awareness',
      icon: '🧠',
      color: '#9900ff'
    }
  }

  const currentPower = powerDescriptions[powerType]

  // Animate intensity and manage duration
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration)
      
      // Fade in
      setIntensity(1)
      
      // Countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            setIntensity(0)
            onComplete?.()
            return 0
          }
          return prev - 100
        })
      }, 100)

      return () => clearInterval(timer)
    } else {
      setIntensity(0)
    }
  }, [isActive, duration, onComplete])

  if (!isActive) return null

  return (
    <div className="power-up-webgl-container">
      {/* WebGL Canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9995
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 1] }}
          style={{ background: 'transparent' }}
        >
          <PowerUpScene
            powerType={powerType}
            isActive={isActive}
            intensity={intensity}
          />
          <PowerUpParticles powerType={powerType} isActive={isActive} />
        </Canvas>
      </div>

      {/* Power-up UI */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {/* Power-up icon */}
        <div
          style={{
            fontSize: '120px',
            marginBottom: '20px',
            filter: `drop-shadow(0 0 20px ${currentPower.color})`,
            animation: 'powerPulse 1s ease-in-out infinite alternate'
          }}
        >
          {currentPower.icon}
        </div>

        {/* Power-up name */}
        <h2
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: currentPower.color,
            margin: '0 0 10px 0',
            textShadow: `2px 2px 4px rgba(0,0,0,0.8), 0 0 20px ${currentPower.color}`,
            animation: 'powerGlow 2s ease-in-out infinite'
          }}
        >
          {currentPower.name}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '18px',
            color: 'white',
            margin: '0 0 30px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            opacity: 0.9
          }}
        >
          {currentPower.description}
        </p>

        {/* Timer bar */}
        <div
          style={{
            width: '300px',
            height: '12px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: `2px solid ${currentPower.color}`,
            boxShadow: `0 0 15px ${currentPower.color}50`
          }}
        >
          <div
            style={{
              width: `${(timeLeft / duration) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${currentPower.color}, ${currentPower.color}cc)`,
              borderRadius: '4px',
              transition: 'width 0.1s linear',
              boxShadow: `0 0 10px ${currentPower.color}`
            }}
          />
        </div>

        {/* Time remaining */}
        <div
          style={{
            fontSize: '14px',
            color: 'white',
            marginTop: '10px',
            opacity: 0.8
          }}
        >
          {Math.ceil(timeLeft / 1000)}s remaining
        </div>
      </div>

      {/* Screen border glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9994,
          border: `4px solid ${currentPower.color}`,
          borderRadius: '20px',
          margin: '10px',
          boxShadow: `inset 0 0 50px ${currentPower.color}30, 0 0 50px ${currentPower.color}50`,
          animation: 'borderPulse 2s ease-in-out infinite'
        }}
      />

      <style jsx>{`
        @keyframes powerPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        @keyframes powerGlow {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.2) saturate(1.3); }
        }

        @keyframes borderPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .power-up-webgl-container h2 {
            font-size: 32px !important;
          }
          
          .power-up-webgl-container div[style*="fontSize: '120px'"] {
            font-size: 80px !important;
          }
          
          .power-up-webgl-container div[style*="width: '300px'"] {
            width: 250px !important;
          }
        }
      `}</style>
    </div>
  )
}

// Demo component
export function PowerUpWebGLDemo() {
  const [activePower, setActivePower] = useState<{
    type: 'speed' | 'accuracy' | 'strength' | 'focus'
    active: boolean
  }>({ type: 'speed', active: false })

  const powerTypes = ['speed', 'accuracy', 'strength', 'focus'] as const

  const activatePower = (type: typeof powerTypes[number]) => {
    setActivePower({ type, active: true })
  }

  const deactivatePower = () => {
    setActivePower(prev => ({ ...prev, active: false }))
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px', zIndex: 10000 }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Power-Up WebGL Demo
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>
          Click buttons to activate different power-up effects!
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px', 
        marginBottom: '30px',
        zIndex: 10000
      }}>
        {powerTypes.map((type) => (
          <button
            key={type}
            onClick={() => activatePower(type)}
            disabled={activePower.active}
            style={{
              padding: '20px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: activePower.active && activePower.type === type 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '15px',
              color: 'white',
              cursor: activePower.active ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'capitalize',
              opacity: activePower.active ? 0.6 : 1
            }}
          >
            {type} Power-Up
          </button>
        ))}
      </div>

      <div style={{ 
        fontSize: '16px', 
        opacity: 0.6,
        textAlign: 'center',
        zIndex: 10000
      }}>
        <p>Each power-up has unique WebGL shader effects and 3D particles</p>
        <p>Duration: 10 seconds • Effects: Screen overlay, particles, UI glow</p>
      </div>

      <PowerUpWebGL
        powerType={activePower.type}
        isActive={activePower.active}
        duration={10000}
        onComplete={deactivatePower}
      />
    </div>
  )
}