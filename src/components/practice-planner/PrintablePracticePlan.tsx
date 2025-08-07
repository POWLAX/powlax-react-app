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
    <div className="printable-practice-plan min-h-screen bg-white p-8">
      {/* Practice Header */}
      <div className="practice-header">
        <div className="practice-title">
          POWLAX Practice Plan
        </div>
        <div className="practice-info grid grid-cols-2 gap-4">
          <div>
            <strong>Date:</strong> {format(new Date(practiceDate), 'EEEE, MMMM do, yyyy')}
          </div>
          <div>
            <strong>Time:</strong> {startTime} - {calculateEndTime()}
          </div>
          <div>
            <strong>Duration:</strong> {duration} minutes
          </div>
          <div>
            <strong>Field:</strong> {field}
          </div>
          {teamName && (
            <div>
              <strong>Team:</strong> {teamName}
            </div>
          )}
          {coachName && (
            <div>
              <strong>Coach:</strong> {coachName}
            </div>
          )}
        </div>
      </div>

      {/* Setup Time */}
      {setupTime > 0 && (
        <div className="timeline-item">
          <div className="timeline-time">
            {startTime} - Setup ({setupTime} min)
          </div>
          <div className="timeline-drill">
            <div className="drill-description">
              Field setup, equipment preparation, and pre-practice organization
            </div>
          </div>
        </div>
      )}

      {/* Practice Timeline */}
      <div className="practice-timeline">
        {timeSlots.map((slot, index) => (
          <div key={slot.id} className="timeline-item">
            <div className="timeline-time">
              {calculateTimeSlot(index)} - {slot.duration} minutes
            </div>
            {slot.drills.map((drill, drillIndex) => (
              <div key={drill.id} className="timeline-drill">
                <div className="drill-name">
                  {drill.name}
                  {drill.category && (
                    <span className="drill-meta"> ({drill.category})</span>
                  )}
                </div>
                {drill.description && (
                  <div className="drill-description">
                    {drill.description}
                  </div>
                )}
                {drill.equipment && drill.equipment.length > 0 && (
                  <div className="drill-meta">
                    <strong>Equipment:</strong> {drill.equipment.join(', ')}
                  </div>
                )}
                {drill.notes && (
                  <div className="drill-notes">
                    <strong>Notes:</strong> {drill.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Practice Notes */}
      {practiceNotes && (
        <div className="practice-notes">
          <div className="notes-title">Practice Notes:</div>
          <div>{practiceNotes}</div>
        </div>
      )}

      {/* Equipment List */}
      {getAllEquipment().length > 0 && (
        <div className="equipment-list">
          <div className="equipment-title">Equipment Needed:</div>
          <ul>
            {getAllEquipment().map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature Lines */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-b border-gray-400 mb-2 h-6"></div>
            <div className="text-center text-sm">Coach Signature</div>
          </div>
          <div>
            <div className="border-b border-gray-400 mb-2 h-6"></div>
            <div className="text-center text-sm">Date</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        Generated by POWLAX Practice Planner - powlax.com
      </div>
    </div>
  )
}