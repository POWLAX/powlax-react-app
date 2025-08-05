'use client'

import DrillCard from './DrillCard'

interface Drill {
  id: string
  name: string
  duration: number
  notes?: string
  videoUrl?: string
  labUrl?: string
  imageUrls?: string[]
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
}

interface PracticeTimelineProps {
  drills: Drill[]
  setDrills: (drills: Drill[]) => void
  startTime: string
  setupTime: number
}

export default function PracticeTimeline({ 
  drills, 
  setDrills, 
  startTime,
  setupTime 
}: PracticeTimelineProps) {
  const calculateTime = (baseTime: string, minutesToAdd: number): string => {
    const [hours, minutes] = baseTime.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    date.setMinutes(date.getMinutes() + minutesToAdd)
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getSetupTime = () => {
    if (!setupTime) return null
    const setupStartTime = calculateTime(startTime, -setupTime)
    
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-yellow-800">Setup Time</h4>
            <p className="text-sm text-yellow-600">Arrive by {setupStartTime}</p>
          </div>
          <div className="text-lg font-semibold text-yellow-800">
            {setupTime} min
          </div>
        </div>
      </div>
    )
  }

  const handleUpdateDrill = (index: number, updatedDrill: Drill) => {
    const newDrills = [...drills]
    newDrills[index] = updatedDrill
    setDrills(newDrills)
  }

  const handleRemoveDrill = (index: number) => {
    const newDrills = drills.filter((_, i) => i !== index)
    setDrills(newDrills)
  }

  const handleMoveDrill = (index: number, direction: 'up' | 'down') => {
    const newDrills = [...drills]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < drills.length) {
      [newDrills[index], newDrills[newIndex]] = 
      [newDrills[newIndex], newDrills[index]]
      setDrills(newDrills)
    }
  }

  const getDrillStartTime = (drillIndex: number): string => {
    let accumulatedTime = 0
    for (let i = 0; i < drillIndex; i++) {
      accumulatedTime += drills[i].duration
    }
    return calculateTime(startTime, accumulatedTime)
  }

  if (drills.length === 0) {
    return (
      <div className="text-center py-12">
        {getSetupTime()}
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Ready to Build Your Practice!
        </h3>
        <p className="text-gray-500 mb-4">
          Click the + in the Drill Library 👉
        </p>
      </div>
    )
  }

  return (
    <div>
      {getSetupTime()}
      
      <div className="space-y-4">
        {drills.map((drill, index) => (
          <DrillCard
            key={drill.id}
            drill={drill}
            startTime={getDrillStartTime(index)}
            index={index}
            onUpdate={(updatedDrill) => handleUpdateDrill(index, updatedDrill)}
            onRemove={() => handleRemoveDrill(index)}
            onMoveUp={() => handleMoveDrill(index, 'up')}
            onMoveDown={() => handleMoveDrill(index, 'down')}
            onAddParallel={() => {/* TODO: Implement parallel drills */}}
            canMoveUp={index > 0}
            canMoveDown={index < drills.length - 1}
            isParallel={false}
          />
        ))}
      </div>
    </div>
  )
}