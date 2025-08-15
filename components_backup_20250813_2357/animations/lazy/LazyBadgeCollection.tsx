import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const BadgeCollectionSpring = dynamic(() => import('../BadgeCollectionSpring'), {
  loading: () => (
    <div className="p-8 space-y-6">
      <div className="flex justify-center">
        <div className="animate-pulse h-32 w-32 bg-gray-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
})

interface Badge {
  id: string
  name: string
  image: string
  category: 'attack' | 'defense' | 'midfield' | 'wallball' | 'lacrosse_iq' | 'solid_start'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned: boolean
  progress: number
}

interface LazyBadgeCollectionProps {
  badges: Badge[]
  onCollect: (badge: Badge) => void
  onBadgeSelect: (badge: Badge) => void
}

export default function LazyBadgeCollection({ badges, onCollect, onBadgeSelect }: LazyBadgeCollectionProps) {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-6">
        <div className="flex justify-center">
          <div className="animate-pulse h-32 w-32 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <BadgeCollectionSpring 
        badges={badges}
        onCollect={onCollect}
        onBadgeSelect={onBadgeSelect}
      />
    </Suspense>
  )
}