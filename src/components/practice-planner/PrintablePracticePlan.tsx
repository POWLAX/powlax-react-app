'use client'

import { format } from 'date-fns'

interface Drill {
  id: string
  name: string
  description?: string
  duration: number
  equipment?: string[]
  notes?: string
  category?: string
}

interface TimeSlot {
  id: string
  drills: Drill[]
  duration: number
  startTime?: string
}

interface PrintablePracticePlanProps {
  practiceDate: string
  startTime: string
  duration: number
  field: string
  setupTime?: number
  setupNotes?: string[]
  timeSlots: TimeSlot[]
  practiceNotes?: string
  coachName?: string
  teamName?: string
  selectedStrategies?: any[]
}

export default function PrintablePracticePlan({
  practiceDate,
  startTime,
  duration,
  field,
  setupTime = 0,
  setupNotes = [],
  timeSlots,
  practiceNotes,
  coachName,
  teamName,
  selectedStrategies = []
}: PrintablePracticePlanProps) {
  const calculateTimeSlot = (index: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    let totalMinutes = hours * 60 + minutes
    
    // For setup time calculation (index -1)
    if (index === -1) {
      totalMinutes -= (setupTime || 0)
    } else {
      // Add up durations of previous slots
      for (let i = 0; i < index; i++) {
        totalMinutes += timeSlots[i]?.duration || 0
      }
    }
    
    const slotHours = Math.floor(totalMinutes / 60)
    const slotMinutes = totalMinutes % 60
    
    return `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`
  }

  const calculateEndTime = (): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const getAllEquipment = (): string[] => {
    const equipment = new Set<string>()
    timeSlots.forEach(slot => {
      slot.drills.forEach(drill => {
        drill.equipment?.forEach(item => equipment.add(item))
      })
    })
    return Array.from(equipment).sort()
  }

  return (
    <div className="printable-practice-plan min-h-screen bg-white p-8 max-w-4xl mx-auto">
      {/* POWLAX Header with New Branding */}
      <div className="practice-header mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#003366] mb-1">POWLAX Practice Plan</div>
            <div className="text-lg text-[#FF6600] font-semibold mt-2">Stop Guessing. Train Smarter. Win Together.</div>
          </div>
        </div>
        
        {/* Practice Information Grid */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Date:</span>
              <span className="text-gray-900">{format(new Date(practiceDate), 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Time:</span>
              <span className="text-gray-900">{startTime} - {calculateEndTime()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Duration:</span>
              <span className="text-gray-900">{duration} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Field:</span>
              <span className="text-gray-900">{field}</span>
            </div>
            {teamName && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Team:</span>
                <span className="text-gray-900">{teamName}</span>
              </div>
            )}
            {coachName && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Coach:</span>
                <span className="text-gray-900">{coachName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Setup Time with Notes */}
      {setupTime > 0 && (
        <div className="timeline-item bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="timeline-time text-yellow-800 font-bold text-lg mb-2">
            Setup Time ({setupTime} min) - Arrive by {calculateTimeSlot(-1)}
          </div>
          {setupNotes && setupNotes.length > 0 ? (
            <ul className="ml-6 space-y-1 text-gray-700">
              {setupNotes.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          ) : (
            <div className="ml-6 text-gray-700">
              • Field setup and equipment preparation
              • Pre-practice organization
            </div>
          )}
        </div>
      )}

      {/* Practice Timeline */}
      <div className="practice-timeline space-y-4">
        <h3 className="text-xl font-bold text-[#003366] mb-4 border-b-2 border-[#FF6600] pb-2">
          Practice Activities
        </h3>
        {timeSlots.map((slot, index) => (
          <div key={slot.id} className="timeline-item bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="timeline-time bg-[#003366] text-white p-3 font-bold text-lg">
              {calculateTimeSlot(index)} ({slot.duration} minutes)
            </div>
            <div className="p-4 space-y-3 bg-white">
              {slot.drills.map((drill, drillIndex) => (
                <div key={drill.id} className="timeline-drill border-l-4 border-orange-500 pl-4">
                  <div className="drill-name text-lg font-bold text-gray-900 mb-2">
                    {drill.name}
                    {drill.category && (
                      <span className="drill-meta text-sm text-blue-600 ml-2 px-2 py-1 bg-blue-100 rounded-full">
                        {drill.category}
                      </span>
                    )}
                  </div>
                  {drill.description && (
                    <div className="drill-description text-gray-700 mb-2 leading-relaxed">
                      📝 {drill.description}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {drill.equipment && drill.equipment.length > 0 && (
                      <div className="drill-meta text-green-700 bg-green-50 px-2 py-1 rounded">
                        <strong>🛠️ Equipment:</strong> {drill.equipment.join(', ')}
                      </div>
                    )}
                    <div className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <strong>⏱️ Duration:</strong> {drill.duration} min
                    </div>
                  </div>
                  {drill.notes && (
                    <div className="drill-notes mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                      <div className="text-gray-700">{drill.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Strategies */}
      {selectedStrategies && selectedStrategies.length > 0 && (
        <div className="strategies-section mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xl font-bold text-[#003366] mb-4">
            Reference Strategies
          </div>
          <div className="space-y-2">
            {/* Group strategies by game phase */}
            {Object.entries(
              selectedStrategies.reduce((acc, strategy) => {
                const phase = strategy.strategy_categories || 'General'
                if (!acc[phase]) acc[phase] = []
                acc[phase].push(strategy)
                return acc
              }, {} as Record<string, any[]>)
            ).map(([phase, strategies]) => (
              <div key={phase}>
                <div className="font-semibold text-gray-700 mb-1">{phase}</div>
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="ml-4 p-2 bg-white border border-gray-200 rounded">
                    <div className="font-medium text-[#003366]">{strategy.strategy_name}</div>
                    {strategy.description && (
                      <div className="text-sm text-gray-600 mt-1">{strategy.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Notes */}
      {practiceNotes && (
        <div className="practice-notes mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="notes-title text-xl font-bold text-[#003366] mb-4">
            Practice Notes & Objectives
          </div>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{practiceNotes}</div>
        </div>
      )}

      {/* Equipment List - Keep but simplify */}
      {getAllEquipment().length > 0 && (
        <div className="equipment-list mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="equipment-title text-xl font-bold text-[#003366] mb-4">
            Equipment Checklist
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {getAllEquipment().map((item, index) => (
              <div key={index} className="flex items-center">
                <input type="checkbox" className="mr-2 h-4 w-4" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with branding - No safety reminders or signatures */}
      <div className="mt-16 pt-8 border-t-2 border-[#003366]">
        <div className="text-center text-gray-500 text-sm">
          <div className="font-semibold text-[#003366]">POWLAX Practice Planner</div>
          <div className="mt-1">Generated on {format(new Date(), 'MMMM dd, yyyy')}</div>
        </div>
      </div>
    </div>
  )
}