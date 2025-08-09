'use client'

import { Calendar, Clock, MapPin } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface PracticeScheduleCardProps {
  practiceDate: string
  setPracticeDate: (date: string) => void
  startTime: string
  setStartTime: (time: string) => void
  duration: number
  setDuration: (duration: number) => void
  field: string
  setField: (field: string) => void
  addSetupTime: boolean
  setAddSetupTime: (add: boolean) => void
  setupDuration: number
  setSetupDuration: (duration: number) => void
  practiceNotes: string
  setPracticeNotes: (notes: string) => void
}

export default function PracticeScheduleCard({
  practiceDate,
  setPracticeDate,
  startTime,
  setStartTime,
  duration,
  setDuration,
  field,
  setField,
  addSetupTime,
  setAddSetupTime,
  setupDuration,
  setSetupDuration,
  practiceNotes,
  setPracticeNotes
}: PracticeScheduleCardProps) {
  
  // Calculate end time
  const calculateEndTime = (start: string, durationMin: number): string => {
    const [hours, minutes] = start.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    date.setMinutes(date.getMinutes() + durationMin)
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Practice Schedule</h2>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <input
            type="date"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Start Time */}
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min="0"
            className="w-16 px-2 py-1.5 text-sm text-center font-medium border border-gray-300 rounded hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">min</span>
        </div>

        {/* End Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{calculateEndTime(startTime, duration)}</span>
        </div>

        {/* Field */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="Field location"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Setup Time */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-700">Setup Time</span>
            <input
              type="checkbox"
              checked={addSetupTime}
              onChange={(e) => setAddSetupTime(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          {addSetupTime && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={setupDuration}
                onChange={(e) => setSetupDuration(parseInt(e.target.value) || 0)}
                min="0"
                className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">min</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Practice Notes and Goals Accordion - New row with border */}
      <div className="mt-4 border border-gray-200 rounded-lg p-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="practice-info" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-sm font-medium text-gray-700">Practice Notes and Goals</span>
            </AccordionTrigger>
            <AccordionContent>
              <textarea
                placeholder="Add your practice goals and notes here..."
                className="w-full p-3 border border-gray-200 rounded-md resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={practiceNotes}
                onChange={(e) => setPracticeNotes(e.target.value)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}