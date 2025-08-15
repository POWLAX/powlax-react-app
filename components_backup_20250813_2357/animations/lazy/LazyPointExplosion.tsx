import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const PointExplosionCanvas = dynamic(() => import('../PointExplosionCanvas'), {
  loading: () => null, // No loading UI for explosion effect
  ssr: false
})

interface LazyPointExplosionProps {
  points: number
  pointType: 'academy' | 'attack' | 'defense' | 'rebound' | 'midfield'
  triggerExplosion: boolean
  x: number
  y: number
  onComplete?: () => void
}

export default function LazyPointExplosion({ 
  points, 
  pointType, 
  triggerExplosion, 
  x, 
  y, 
  onComplete 
}: LazyPointExplosionProps) {
  return (
    <Suspense fallback={null}>
      <PointExplosionCanvas 
        points={points}
        pointType={pointType}
        triggerExplosion={triggerExplosion}
        x={x}
        y={y}
        onComplete={onComplete}
      />
    </Suspense>
  )
}