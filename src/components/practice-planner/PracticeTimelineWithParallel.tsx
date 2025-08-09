'use client'

import DrillCard from './DrillCard'
import ParallelDrillPicker from './ParallelDrillPicker'
import SetupTimeModal from './modals/SetupTimeModal'
import { useState } from 'react'
import { Edit, Clock } from 'lucide-react'

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
  setupNotes?: string[]
  onSetupNotesChange?: (notes: string[]) => void
}

export default function PracticeTimelineWithParallel({ 
  drills: timeSlots, 
  setDrills: setTimeSlots, 
  startTime,
  setupTime,
  setupNotes = [],
  onSetupNotesChange
}: PracticeTimelineProps) {
  const [showParallelPicker, setShowParallelPicker] = useState<number | null>(null)
  const [showSetupModal, setShowSetupModal] = useState(false)

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
            <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Setup Time
            </h4>
            <p className="text-sm text-yellow-600">Arrive by {setupStartTime}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-yellow-800">
              {setupTime} min
            </span>
            <button
              onClick={() => setShowSetupModal(true)}
              className="p-1 hover:bg-yellow-100 rounded transition-colors"
              title="Edit setup notes"
            >
              <Edit className="h-4 w-4 text-yellow-700" />
            </button>
          </div>
        </div>
        {setupNotes && setupNotes.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-yellow-700">
            {setupNotes.map((note, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const handleSetupNotesSave = (notes: string[]) => {
    if (onSetupNotesChange) {
      onSetupNotesChange(notes)
    }
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
      
      {/* Setup Time Modal */}
      <SetupTimeModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSave={handleSetupNotesSave}
        defaultNotes={setupNotes}
        setupTime={setupTime}
      />
      
      <div className="space-y-4">
        {timeSlots.map((slot, slotIndex) => (
          <div 
            key={slot.id} 
            className="relative"
          >
            <div className="flex items-start gap-2">
              {/* Time indicator for the slot */}
              <div className="text-lg font-semibold text-gray-700 mt-4 min-w-[80px]">
                {getSlotStartTime(slotIndex)}
              </div>
              
              {/* Drills in this time slot */}
              <div className="flex-1">
                {slot.drills.length === 1 ? (
                  // Single drill - normal layout
                  <DrillCard
                    drill={slot.drills[0]}
                    startTime={getSlotStartTime(slotIndex)}
                    index={slotIndex}
                    onUpdate={(updatedDrill) => handleUpdateDrill(slotIndex, 0, updatedDrill)}
                    onRemove={() => handleRemoveDrill(slotIndex, 0)}
                    onMoveUp={() => handleMoveSlot(slotIndex, 'up')}
                    onMoveDown={() => handleMoveSlot(slotIndex, 'down')}
                    onAddParallel={
                      slot.drills.length < 4
                        ? () => setShowParallelPicker(slotIndex)
                        : undefined
                    }
                    canMoveUp={slotIndex > 0}
                    canMoveDown={slotIndex < timeSlots.length - 1}
                    isParallel={false}
                  />
                ) : (
                  // Multiple drills - parallel layout with visual lanes
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        PARALLEL
                      </div>
                      <span className="text-sm font-medium text-blue-800">
                        {slot.drills.length} activities running simultaneously
                      </span>
                    </div>
                    
                    <div className={`grid gap-3 ${
                      slot.drills.length === 2 ? 'md:grid-cols-2' : 
                      slot.drills.length === 3 ? 'md:grid-cols-3' : 
                      'md:grid-cols-2 lg:grid-cols-4'
                    }`}>
                      {slot.drills.map((drill, drillIndex) => (
                        <div 
                          key={drill.id}
                          className="relative"
                        >
                          {/* Lane indicator */}
                          <div className="absolute -top-2 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            Lane {drillIndex + 1}
                          </div>
                          
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
                            isParallel={true}
                            parallelLane={drillIndex + 1}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Add more parallel drill button */}
                    {slot.drills.length < 4 && (
                      <button
                        onClick={() => setShowParallelPicker(slotIndex)}
                        className="mt-3 w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Another Parallel Activity
                      </button>
                    )}
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