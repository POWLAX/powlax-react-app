'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus } from 'lucide-react'
import LazyDrillLibrary from '@/components/practice-planner/lazy/LazyDrillLibrary'
import LazyPracticeTimeline from '@/components/practice-planner/lazy/LazyPracticeTimeline'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import { toast } from 'sonner'

export default function PracticePlannerDemoPage() {
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('15:30')
  const [duration, setDuration] = useState(90)
  const [field, setField] = useState('Main Field')
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
      id: `${drill.id}-${Date.now()}`,
    }
    
    // Add as a new time slot
    const newSlot = {
      id: `slot-${Date.now()}`,
      drills: [newDrill],
      duration: newDrill.duration
    }
    
    setTimeSlots([...timeSlots, newSlot])
    toast.success(`Added "${drill.name}" to practice plan`)
  }

  const handleSave = () => {
    toast.success('Practice plan saved! (Demo mode - not persisted)')
  }

  const handleLoad = () => {
    // Load a sample practice plan
    const sampleSlots = [
      {
        id: 'slot-1',
        drills: [{
          id: 'drill-1',
          name: 'Dynamic Warm-Up',
          duration: 10,
          category: 'admin',
          strategies: ['Warm-Up'],
          notes: 'Focus on proper stretching and gradual intensity increase'
        }],
        duration: 10
      },
      {
        id: 'slot-2',
        drills: [{
          id: 'drill-2',
          name: '3 Man Passing',
          duration: 15,
          category: 'skill',
          strategies: ['Passing', 'Catching'],
          notes: 'Emphasize quick hands and communication'
        }],
        duration: 15
      },
      {
        id: 'slot-3',
        drills: [{
          id: 'drill-3',
          name: '1v1 Ground Balls',
          duration: 20,
          category: '1v1',
          strategies: ['Ground Ball', 'Competition'],
          notes: 'Box out and protect stick'
        }],
        duration: 20
      },
      {
        id: 'slot-4',
        drills: [{
          id: 'drill-4',
          name: '6v6 Scrimmage',
          duration: 30,
          category: 'concept',
          strategies: ['Team Play', 'Offense', 'Defense'],
          notes: 'Focus on transition and communication'
        }],
        duration: 30
      }
    ]
    
    setTimeSlots(sampleSlots)
    setPracticeNotes('Sample practice plan loaded - focuses on fundamentals and team play')
    toast.success('Loaded sample practice plan')
  }

  const handleReset = () => {
    setTimeSlots([])
    setPracticeNotes('')
    setPracticeDate(new Date().toISOString().split('T')[0])
    setStartTime('15:30')
    setDuration(90)
    setField('Main Field')
    setAddSetupTime(false)
    toast.info('Practice plan reset')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">POWLAX Practice Planner</h1>
              <p className="text-sm text-gray-600">Demo Mode - No authentication required</p>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleLoad}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Load Sample Practice"
              >
                <FolderOpen className="h-5 w-5" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Save Practice Plan"
              >
                <Save className="h-5 w-5" />
              </button>
              <button 
                onClick={() => toast.info('Print feature coming soon!')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Print"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button 
                onClick={handleReset}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Reset"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 p-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* Practice Info */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Practice Info and Goals</h2>
            <textarea
              placeholder="Add your practice goals and notes here..."
              className="w-full p-2 border rounded resize-none h-20"
              value={practiceNotes}
              onChange={(e) => setPracticeNotes(e.target.value)}
            />
          </div>

          {/* Practice Schedule */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Practice Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date:
                </label>
                <input
                  type="date"
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start:
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Field:
                </label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Duration:</span>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-1 border rounded-md mr-2"
                />
                <span className="text-sm text-gray-600">min</span>
                
                <span className="text-sm font-medium text-gray-700 ml-6">End:</span>
                <span className="text-sm text-gray-600 ml-2">
                  {calculateEndTime(startTime, duration + (addSetupTime ? setupDuration : 0))}
                </span>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="setupTime"
                  checked={addSetupTime}
                  onChange={(e) => setAddSetupTime(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="setupTime" className="text-sm font-medium text-gray-700">
                  Add Setup Time
                </label>
                {addSetupTime && (
                  <>
                    <input
                      type="number"
                      value={setupDuration}
                      onChange={(e) => setSetupDuration(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded-md ml-2 mr-1"
                    />
                    <span className="text-sm text-gray-600">min</span>
                  </>
                )}
              </div>
            </div>

            {/* Duration Progress Bar */}
            <PracticeDurationBar 
              totalDuration={duration}
              usedDuration={totalDrillTime}
            />
          </div>

          {/* Practice Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Practice Timeline</h2>
              {timeSlots.length === 0 && (
                <button
                  onClick={handleLoad}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Load Sample Practice
                </button>
              )}
            </div>
            
            <LazyPracticeTimeline
              drills={timeSlots}
              setDrills={setTimeSlots}
              startTime={startTime}
              setupTime={addSetupTime ? setupDuration : 0}
            />
            
            {timeSlots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No drills added yet</p>
                <p className="text-sm">Add drills from the library or load a sample practice to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Drill Library Sidebar - Desktop/Tablet */}
        <div className="hidden lg:block w-80 xl:w-96">
          <div className="bg-white rounded-lg shadow-sm border h-full overflow-hidden">
            <LazyDrillLibrary onAddDrill={handleAddDrill} />
          </div>
        </div>
      </div>

      {/* Mobile Drill Library Modal */}
      {showDrillLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
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
            <LazyDrillLibrary onAddDrill={(drill) => {
              handleAddDrill(drill)
              setShowDrillLibrary(false)
            }} />
          </div>
        </div>
      )}

      {/* Mobile Add Drills Button */}
      <button
        onClick={() => setShowDrillLibrary(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg lg:hidden"
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