'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus } from 'lucide-react'
import DrillLibrary from '@/components/practice-planner/DrillLibrary'
import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import SavePracticeModal from '@/components/practice-planner/modals/SavePracticeModal'
import LoadPracticeModal from '@/components/practice-planner/modals/LoadPracticeModal'
import { usePracticePlans } from '@/hooks/usePracticePlans'
import { toast } from 'sonner'

export default function PracticePlansPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { savePracticePlan, plans, loading: plansLoading } = usePracticePlans(teamId)
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('07:00')
  const [duration, setDuration] = useState(90) // Default 90 minutes for youth
  const [field, setField] = useState('Turf')
  const [addSetupTime, setAddSetupTime] = useState(false)
  const [setupDuration, setSetupDuration] = useState(15)
  const [practiceNotes, setPracticeNotes] = useState('')
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [showDrillLibrary, setShowDrillLibrary] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)

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

  const handleSavePracticePlan = async (title: string, notes?: string) => {
    const drillSequence = {
      timeSlots,
      practiceInfo: {
        startTime,
        setupTime: addSetupTime ? setupDuration : undefined,
        field
      }
    }

    const { data, error } = await savePracticePlan({
      title,
      team_id: teamId,
      practice_date: practiceDate,
      duration_minutes: duration,
      drill_sequence: drillSequence,
      notes: notes || practiceNotes || undefined
    })

    if (error) {
      toast.error(`Failed to save practice plan: ${error}`)
      throw new Error(error)
    } else {
      toast.success('Practice plan saved successfully!')
      setShowSaveModal(false)
    }
  }

  const handleLoadPracticePlan = (plan: any) => {
    // Load the practice plan data
    setPracticeDate(plan.practice_date)
    setDuration(plan.duration_minutes)
    setPracticeNotes(plan.notes || '')
    
    // Load drill sequence
    if (plan.drill_sequence) {
      setTimeSlots(plan.drill_sequence.timeSlots || [])
      
      // Load practice info
      if (plan.drill_sequence.practiceInfo) {
        const info = plan.drill_sequence.practiceInfo
        setStartTime(info.startTime || '07:00')
        setField(info.field || 'Turf')
        
        if (info.setupTime) {
          setAddSetupTime(true)
          setSetupDuration(info.setupTime)
        }
      }
    }
    
    toast.success(`Loaded practice plan: ${plan.title}`)
    setShowLoadModal(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">POWLAX Practice Planner</h1>
            <p className="text-sm text-gray-600">Finally: A practice planner built by a lacrosse coach who actually gets it.</p>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowLoadModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Open Practice Plan"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowSaveModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Save Practice Plan"
            >
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
        <div className="flex-1 overflow-y-auto p-4">
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

      {/* Save Practice Modal */}
      <SavePracticeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePracticePlan}
        defaultNotes={practiceNotes}
      />

      {/* Load Practice Modal */}
      <LoadPracticeModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={handleLoadPracticePlan}
        plans={plans}
        loading={plansLoading}
      />
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