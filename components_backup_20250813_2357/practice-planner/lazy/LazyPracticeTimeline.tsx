import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const PracticeTimelineWithParallel = dynamic(() => import('../PracticeTimelineWithParallel'), {
  loading: () => (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

type Drill = {
  id: string
  name?: string
  duration: number
  [key: string]: unknown
}

interface TimeSlot {
  id: string
  drills: Drill[]
  duration: number
}

interface LazyPracticeTimelineProps {
  drills: TimeSlot[]
  setDrills: (drills: TimeSlot[]) => void
  startTime: string
  setupTime: number
}

export default function LazyPracticeTimeline({ drills, setDrills, startTime, setupTime }: LazyPracticeTimelineProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <PracticeTimelineWithParallel 
        drills={drills}
        setDrills={setDrills}
        startTime={startTime}
        setupTime={setupTime}
      />
    </Suspense>
  )
}