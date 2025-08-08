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
  timeSlots: TimeSlot[]
  practiceNotes?: string
  coachName?: string
  teamName?: string
}

export default function PrintablePracticePlan({
  practiceDate,
  startTime,
  duration,
  field,
  setupTime = 0,
  timeSlots,
  practiceNotes,
  coachName,
  teamName
}: PrintablePracticePlanProps) {
  const calculateTimeSlot = (index: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    let totalMinutes = hours * 60 + minutes + (setupTime || 0)
    
    // Add up durations of previous slots
    for (let i = 0; i < index; i++) {
      totalMinutes += timeSlots[i]?.duration || 0
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
      {/* POWLAX Header with Branding */}
      <div className="practice-header mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-1">POWLAX</div>
            <div className="text-lg text-orange-600 font-semibold">Practice Plan</div>
            <div className="text-sm text-gray-500 mt-1">Professional Lacrosse Training Platform</div>
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

      {/* Setup Time */}
      {setupTime > 0 && (
        <div className="timeline-item bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="timeline-time text-blue-800 font-bold text-lg mb-2">
            🏗️ {startTime} - Setup ({setupTime} min)
          </div>
          <div className="timeline-drill ml-6">
            <div className="drill-description text-gray-700">
              • Field setup and equipment preparation
              • Pre-practice organization and safety check
              • Player arrival and warm-up preparation
            </div>
          </div>
        </div>
      )}

      {/* Practice Timeline */}
      <div className="practice-timeline space-y-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2">
          🏃 Practice Activities
        </h3>
        {timeSlots.map((slot, index) => (
          <div key={slot.id} className="timeline-item border border-gray-300 rounded-lg overflow-hidden">
            <div className="timeline-time bg-blue-600 text-white p-3 font-bold text-lg">
              ⏰ {calculateTimeSlot(index)} ({slot.duration} minutes)
            </div>
            <div className="p-4 space-y-3">
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
                    <div className="drill-notes mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <strong className="text-yellow-800">💡 Coach Notes:</strong>
                      <div className="mt-1 text-yellow-700">{drill.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Practice Notes */}
      {practiceNotes && (
        <div className="practice-notes mt-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="notes-title text-xl font-bold text-orange-800 mb-4 flex items-center">
            📋 Practice Notes & Objectives
          </div>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{practiceNotes}</div>
        </div>
      )}

      {/* Equipment List */}
      {getAllEquipment().length > 0 && (
        <div className="equipment-list mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="equipment-title text-xl font-bold text-green-800 mb-4 flex items-center">
            🛠️ Equipment Checklist
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

      {/* Safety Reminder */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800 font-bold mb-2">⚠️ Safety Reminders:</div>
        <div className="text-red-700 text-sm space-y-1">
          <div>• Ensure all players have proper protective equipment</div>
          <div>• Check field conditions and remove any hazards</div>
          <div>• Have first aid kit and emergency contacts available</div>
          <div>• Maintain hydration breaks every 15-20 minutes</div>
        </div>
      </div>

      {/* Signature Lines */}
      <div className="mt-16 pt-8 border-t-2 border-blue-600">
        <div className="text-center text-blue-800 font-bold mb-6 text-lg">
          Practice Completion & Sign-off
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="border-b-2 border-gray-400 mb-2 h-8"></div>
            <div className="text-center font-semibold text-gray-700">Coach Signature</div>
            <div className="text-center text-sm text-gray-500 mt-1">Practice Leader</div>
          </div>
          <div>
            <div className="border-b-2 border-gray-400 mb-2 h-8"></div>
            <div className="text-center font-semibold text-gray-700">Assistant Coach</div>
            <div className="text-center text-sm text-gray-500 mt-1">If Applicable</div>
          </div>
          <div>
            <div className="border-b-2 border-gray-400 mb-2 h-8"></div>
            <div className="text-center font-semibold text-gray-700">Date Completed</div>
            <div className="text-center text-sm text-gray-500 mt-1">MM/DD/YYYY</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t pt-6">
        <div className="text-blue-600 font-bold text-lg mb-2">POWLAX</div>
        <div className="text-gray-600 text-sm">Professional Online Workouts for Lacrosse</div>
        <div className="text-gray-500 text-xs mt-2">
          Generated on {format(new Date(), 'MMMM do, yyyy')} • powlax.com
        </div>
      </div>
    </div>
  )
}