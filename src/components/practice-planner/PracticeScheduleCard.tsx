'use client'

import { Calendar, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

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
  setSetupDuration
}: PracticeScheduleCardProps) {
  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, minutes: number): string => {
    if (!start) return ''
    
    const [hours, mins] = start.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  const endTime = calculateEndTime(startTime, duration + (addSetupTime ? setupDuration : 0))

  return (
    <Card className="bg-blue-50 border-blue-200 p-4 rounded-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Practice Schedule</h2>
      
      {/* Mobile: Stack vertically, Desktop: Flex layout */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 md:space-x-4">
        
        {/* Practice Date */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <Input
            type="date"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            className="bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Start Time */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Duration Badge */}
        <div className="flex items-center space-x-2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {duration} min
          </span>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="15"
            max="180"
            step="15"
            className="w-20 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* End Time (Calculated) */}
        {endTime && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 font-medium">
              Ends: {endTime}
            </span>
          </div>
        )}
      </div>

      {/* Field Location */}
      <div className="flex items-center space-x-2 mt-4">
        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <Input
          type="text"
          placeholder="Field location (e.g., Main Field, Turf A)"
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Setup Time */}
      <div className="flex items-center space-x-4 mt-4 p-3 bg-white rounded-md border border-blue-200">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="setup-time"
            checked={addSetupTime}
            onCheckedChange={(checked) => setAddSetupTime(checked as boolean)}
            className="border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <label htmlFor="setup-time" className="text-sm font-medium text-gray-700">
            Add setup time
          </label>
        </div>
        
        {addSetupTime && (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={setupDuration}
              onChange={(e) => setSetupDuration(Number(e.target.value))}
              min="5"
              max="30"
              step="5"
              className="w-20 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">minutes</span>
          </div>
        )}
      </div>
    </Card>
  )
}