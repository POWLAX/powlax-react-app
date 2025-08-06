'use client'

import DrillCard from './DrillCard'
import ParallelDrillPicker from './ParallelDrillPicker'
import { useState } from 'react'

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

interface TimeSlot {
  id: string
  drills: Drill[]
  duration: number // Max duration of all parallel drills
}

interface PracticeTimelineProps {
  drills: TimeSlot[]
  setDrills: (drills: TimeSlot[]) => void
  startTime: string
  setupTime: number
}

export default function PracticeTimelineWithParallel({ 
  drills: timeSlots, 
  setDrills: setTimeSlots, 
  startTime,
  setupTime 
}: PracticeTimelineProps) {
  const [showParallelPicker, setShowParallelPicker] = useState<number | null>(null)

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

  const handleUpdateDrill = (slotIndex: number, drillIndex: number, updatedDrill: Drill) => {
    const newTimeSlots = [...timeSlots]
    newTimeSlots[slotIndex].drills[drillIndex] = updatedDrill
    // Update slot duration to max of all parallel drills
    newTimeSlots[slotIndex].duration = Math.max(
      ...newTimeSlots[slotIndex].drills.map(d => d.duration)
    )
    setTimeSlots(newTimeSlots)
  }

  const handleRemoveDrill = (slotIndex: number, drillIndex: number) => {
    const newTimeSlots = [...timeSlots]
    if (newTimeSlots[slotIndex].drills.length === 1) {
      // Remove entire slot if it's the last drill
      newTimeSlots.splice(slotIndex, 1)
    } else {
      // Remove just the drill
      newTimeSlots[slotIndex].drills.splice(drillIndex, 1)
      // Update slot duration
      newTimeSlots[slotIndex].duration = Math.max(
        ...newTimeSlots[slotIndex].drills.map(d => d.duration)
      )
    }
    setTimeSlots(newTimeSlots)
  }

  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const newTimeSlots = [...timeSlots]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < timeSlots.length) {
      [newTimeSlots[index], newTimeSlots[newIndex]] = 
      [newTimeSlots[newIndex], newTimeSlots[index]]
      setTimeSlots(newTimeSlots)
    }
  }

  const handleAddParallelDrill = (slotIndex: number, drill: Drill) => {
    const newTimeSlots = [...timeSlots]
    newTimeSlots[slotIndex].drills.push(drill)
    // Update slot duration to max of all parallel drills
    newTimeSlots[slotIndex].duration = Math.max(
      ...newTimeSlots[slotIndex].drills.map(d => d.duration)
    )
    setTimeSlots(newTimeSlots)
    setShowParallelPicker(null)
  }

  const getSlotStartTime = (slotIndex: number): string => {
    let accumulatedTime = 0
    for (let i = 0; i < slotIndex; i++) {
      accumulatedTime += timeSlots[i].duration
    }
    return calculateTime(startTime, accumulatedTime)
  }

  if (timeSlots.length === 0) {
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
        {timeSlots.map((slot, slotIndex) => (
          <div key={slot.id} className="relative">
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Time indicator for the slot */}
              <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px] pt-3">
                <div className="text-xs sm:text-sm font-semibold text-blue-600 text-center">
                  {getSlotStartTime(slotIndex)}
                </div>
                <div className="hidden sm:block w-px h-full bg-blue-200 mt-2" />
              </div>
              
              {/* Drills in this time slot */}
              <div className="flex-1 space-y-2">
                {slot.drills.map((drill, drillIndex) => (
                  <div key={drill.id} className={drillIndex > 0 ? 'sm:ml-4 border-l-2 border-blue-200 pl-2 sm:pl-3' : ''}>
                    <DrillCard
                      drill={drill}
                      startTime={getSlotStartTime(slotIndex)}
                      index={slotIndex}
                      onUpdate={(updatedDrill) => handleUpdateDrill(slotIndex, drillIndex, updatedDrill)}
                      onRemove={() => handleRemoveDrill(slotIndex, drillIndex)}
                      onMoveUp={() => handleMoveSlot(slotIndex, 'up')}
                      onMoveDown={() => handleMoveSlot(slotIndex, 'down')}
                      onAddParallel={
                        drillIndex === 0 && slot.drills.length < 4
                          ? () => setShowParallelPicker(slotIndex)
                          : undefined
                      }
                      canMoveUp={slotIndex > 0}
                      canMoveDown={slotIndex < timeSlots.length - 1}
                      isParallel={drillIndex > 0}
                    />
                  </div>
                ))}
                
                {/* Show count indicator for parallel drills */}
                {slot.drills.length > 1 && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 max-w-fit">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(slot.drills.length, 3))].map((_, i) => (
                        <div key={i} className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-blue-700 font-medium">
                      {slot.drills.length} parallel activities
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Parallel Drill Picker Modal */}
      {showParallelPicker !== null && (
        <ParallelDrillPicker
          isOpen={true}
          onClose={() => setShowParallelPicker(null)}
          onSelect={(drill) => handleAddParallelDrill(showParallelPicker, drill)}
          existingDrills={timeSlots[showParallelPicker].drills}
        />
      )}
    </div>
  )
}