'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus, Target } from 'lucide-react'
import DrillLibrary from '@/components/practice-planner/DrillLibrary'
import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import SavePracticeModal from '@/components/practice-planner/modals/SavePracticeModal'
import LoadPracticeModal from '@/components/practice-planner/modals/LoadPracticeModal'
import StrategyViewer from '@/components/practice-planner/strategy-integration/StrategyViewer'
import StrategyPickerModal from '@/components/practice-planner/strategy-integration/StrategyPickerModal'
import { usePracticePlans } from '@/hooks/usePracticePlans'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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
  const [selectedStrategies, setSelectedStrategies] = useState<any[]>([])
  const [showStrategyPicker, setShowStrategyPicker] = useState(false)

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
          {/* Strategy Selection Button */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Strategy Focus</h2>
                <p className="text-sm text-gray-600">
                  Add strategies to reference during practice with diagrams and videos
                </p>
              </div>
              <Button
                onClick={() => setShowStrategyPicker(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Select Strategies
              </Button>
            </div>
          </div>

          {/* Strategy Viewer */}
          <StrategyViewer
            selectedStrategies={selectedStrategies}
            onRemoveStrategy={(id) => setSelectedStrategies(selectedStrategies.filter(s => s.id !== id))}
          />

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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Practice Schedule</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="inline h-4 w-4 mr-1 text-blue-600" />
                  Date
                </label>
                <input
                  type="date"
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Clock className="inline h-4 w-4 mr-1 text-blue-600" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
                  Field Location
                </label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g., Turf Field 1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              {/* Duration and End Time Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">min</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Ends at:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {calculateEndTime(startTime, duration + (addSetupTime ? setupDuration : 0))}
                  </span>
                </div>
              </div>
              
              {/* Setup Time Row */}
              <div className="flex items-center gap-3">
                <label htmlFor="setupTime" className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="setupTime"
                    checked={addSetupTime}
                    onChange={(e) => setAddSetupTime(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Add Setup Time</span>
                </label>
                {addSetupTime && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={setupDuration}
                      onChange={(e) => setSetupDuration(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">min</span>
                  </div>
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
          <DrillLibrary 
            onAddDrill={handleAddDrill}
            selectedStrategies={[]}
          />
        </div>
      </div>

      {/* Mobile Drill Library Modal */}
      {showDrillLibrary && (
        <div className="fixed inset-0 bg-black/60 z-[100] md:hidden animate-in fade-in duration-200">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b shadow-sm rounded-t-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="px-4 pb-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Drill Library</h3>
                <button
                  onClick={() => setShowDrillLibrary(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close drill library"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-4rem)]">
              <DrillLibrary 
                onAddDrill={(drill) => {
                  handleAddDrill(drill)
                  setShowDrillLibrary(false)
                }}
                selectedStrategies={[]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Add Drills Button */}
      <button
        onClick={() => setShowDrillLibrary(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full p-4 shadow-xl transition-all md:hidden z-90"
        aria-label="Add drills"
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

      {/* Strategy Picker Modal */}
      <StrategyPickerModal
        isOpen={showStrategyPicker}
        onClose={() => setShowStrategyPicker(false)}
        selectedStrategies={selectedStrategies}
        onStrategiesChange={setSelectedStrategies}
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