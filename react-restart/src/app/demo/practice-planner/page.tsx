'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus } from 'lucide-react'
import DrillLibrary from '@/components/practice-planner/DrillLibrary'
import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'

export default function PracticePlannerDemoPage() {
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('07:00')
  const [duration, setDuration] = useState(90) // Default 90 minutes for youth
  const [field, setField] = useState('Turf')
  const [addSetupTime, setAddSetupTime] = useState(false)
  const [setupDuration, setSetupDuration] = useState(15)
  const [practiceNotes, setPracticeNotes] = useState('')
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [showDrillLibrary, setShowDrillLibrary] = useState(false)

  // Calculate total drill time from all time slots
  const totalDrillTime = timeSlots.reduce((acc, slot) => acc + slot.duration, 0)

  const handleAddDrill = (drill: any) => {
    const newDrill = {
      ...drill,
      id: `${drill.id}-${Date.now()}`, // Create unique ID
    }
    
    // Add as a new time slot
    const newSlot = {
      id: `slot-${Date.now()}`,
      drills: [newDrill],
      duration: newDrill.duration
    }
    
    setTimeSlots([...timeSlots, newSlot])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Demo Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="text-sm text-blue-700 font-medium">
            🏈 DEMO MODE - Practice Planner | No authentication required
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">POWLAX Practice Planner</h1>
            <p className="text-sm text-gray-600">Finally: A practice planner built by a lacrosse coach who actually gets it.</p>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <FolderOpen className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <Save className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <Printer className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col space-y-4 p-4 overflow-y-auto">
          {/* Practice Info Header */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Practice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Practice Date
                </label>
                <input
                  type="date"
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={60}>60 minutes</option>
                  <option value={75}>75 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={105}>105 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Field Type
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Turf">Turf</option>
                  <option value="Grass">Grass</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Gymnasium">Gymnasium</option>
                </select>
              </div>

              {/* Setup Time */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={addSetupTime}
                    onChange={(e) => setAddSetupTime(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Setup Time</span>
                </label>
                {addSetupTime && (
                  <select
                    value={setupDuration}
                    onChange={(e) => setSetupDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Practice Duration Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <PracticeDurationBar
              totalDuration={duration}
              usedDuration={totalDrillTime}
            />
          </div>

          {/* Practice Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <PracticeTimelineWithParallel
              drills={timeSlots}
              setDrills={setTimeSlots}
              startTime={startTime}
              setupTime={addSetupTime ? setupDuration : 0}
            />
          </div>
        </div>

        {/* Drill Library Sidebar - Desktop/Tablet */}
        <div className="hidden md:block w-80 lg:w-96 border-l bg-white overflow-y-auto">
          <DrillLibrary onAddDrill={handleAddDrill} />
        </div>
      </div>

      {/* Mobile Drill Library Modal */}
      {showDrillLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Drill Library</h3>
              <button
                onClick={() => setShowDrillLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <DrillLibrary onAddDrill={(drill) => {
              handleAddDrill(drill)
              setShowDrillLibrary(false)
            }} />
          </div>
        </div>
      )}

      {/* Mobile Add Drills Button */}
      <button
        onClick={() => setShowDrillLibrary(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

function calculateEndTime(startTime: string, totalMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate.getTime() + totalMinutes * 60000)
  
  return endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}