'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus, Timer, Users, Target, Loader2 } from 'lucide-react'
import LazyDrillLibrary from '@/components/practice-planner/lazy/LazyDrillLibrary'
import LazyPracticeTimeline from '@/components/practice-planner/lazy/LazyPracticeTimeline'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import SavePracticeModal from '@/components/practice-planner/modals/SavePracticeModal'
import LoadPracticeModal from '@/components/practice-planner/modals/LoadPracticeModal'
import AddCustomStrategiesModal from '@/components/practice-planner/modals/AddCustomStrategiesModal'
import StrategiesListModal from '@/components/practice-planner/modals/StrategiesListModal'
import PrintablePracticePlan from '@/components/practice-planner/PrintablePracticePlan'
import PracticeTemplateSelector from '@/components/practice-planner/PracticeTemplateSelector'
import { usePracticePlans } from '@/hooks/usePracticePlans'
import { useDrills } from '@/hooks/useDrills'
import { usePrint } from '@/hooks/usePrint'
import { useStrategies } from '@/hooks/useStrategies'
import { toast } from 'sonner'

export default function PracticePlansPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { savePracticePlan, plans, loading: plansLoading } = usePracticePlans(teamId)
  const { drills: supabaseDrills, refreshDrills } = useDrills()
  const { isPrinting, printContent } = usePrint()
  const { refreshStrategies } = useStrategies()
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
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showAddStrategiesModal, setShowAddStrategiesModal] = useState(false)
  const [showStrategiesListModal, setShowStrategiesListModal] = useState(false)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
    
    // Close mobile drill library after adding drill
    if (showDrillLibrary) {
      setShowDrillLibrary(false)
    }
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

  const handlePrint = () => {
    if (timeSlots.length === 0) {
      toast.error('Add some drills to your practice plan first!')
      return
    }
    
    // Check if we're on mobile - directly print without preview
    if (window.innerWidth < 768) {
      printContent('printable-plan')
    } else {
      setShowPrintPreview(true)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshDrills()
      // Get updated drill count after refresh
      setTimeout(() => {
        const drillCount = supabaseDrills?.length || 0
        toast.success(`Drill library refreshed! ${drillCount} drills loaded.`)
        setIsRefreshing(false)
      }, 500) // Small delay to ensure state update
    } catch (error) {
      console.error('Error refreshing drills:', error)
      toast.error('Failed to refresh drill library')
      setIsRefreshing(false)
    }
  }

  const handleLoadTemplate = (template: any) => {
    // Clear existing practice
    setTimeSlots([])
    setPracticeNotes('')
    
    // Set practice info from template
    setDuration(template.duration)
    setPracticeNotes(template.description + '\n\n' + template.coachingTips.join('\n'))
    
    // Load template time slots
    if (template.timeSlots) {
      setTimeSlots(template.timeSlots)
    }
    
    toast.success(`Loaded template: ${template.name}`)
    setShowTemplateSelector(false)
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
              onClick={() => setShowTemplateSelector(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Use Practice Template"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowLoadModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Open Practice Plan"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowStrategiesListModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="View Strategies"
            >
              <Target className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowAddStrategiesModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Add Custom Strategy"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowSaveModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Save Practice Plan"
            >
              <Save className="h-5 w-5" />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Print Practice Plan"
              disabled={isPrinting || timeSlots.length === 0}
            >
              <Printer className={`h-5 w-5 ${isPrinting ? 'animate-pulse' : ''}`} />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isRefreshing ? 'Refreshing...' : 'Refresh Drill Library'}
            >
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
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

          {/* Field Mode Quick Actions */}
          {timeSlots.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Timer className="h-5 w-5 mr-2" />
                Field Mode
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setPracticeStarted(!practiceStarted)}
                  className={`px-4 py-2 rounded font-medium ${
                    practiceStarted 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {practiceStarted ? 'End Practice' : 'Start Practice'}
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                >
                  Quick Print
                </button>
                <span className="px-3 py-2 bg-white rounded text-sm font-medium border">
                  {timeSlots.length} Activities • {totalDrillTime}min
                </span>
              </div>
            </div>
          )}

          {/* Practice Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <LazyPracticeTimeline
              drills={timeSlots}
              setDrills={setTimeSlots}
              startTime={startTime}
              setupTime={addSetupTime ? setupDuration : 0}
            />
          </div>
        </div>

        {/* Drill Library Sidebar - Desktop/Tablet */}
        <div className="hidden md:block w-80 lg:w-96 border-l bg-white overflow-y-auto">
          <LazyDrillLibrary onAddDrill={handleAddDrill} />
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
            <LazyDrillLibrary onAddDrill={handleAddDrill} />
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

      {/* Template Selector Modal */}
      <PracticeTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Add Custom Strategies Modal */}
      <AddCustomStrategiesModal
        isOpen={showAddStrategiesModal}
        onClose={() => setShowAddStrategiesModal(false)}
        onStrategyCreated={refreshStrategies}
      />

      {/* Strategies List Modal */}
      <StrategiesListModal
        isOpen={showStrategiesListModal}
        onClose={() => setShowStrategiesListModal(false)}
      />

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Print Practice Plan</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => printContent('printable-plan')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isPrinting}
                >
                  {isPrinting ? 'Printing...' : 'Print'}
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div id="printable-plan">
                <PrintablePracticePlan
                  practiceDate={practiceDate}
                  startTime={startTime}
                  duration={duration + (addSetupTime ? setupDuration : 0)}
                  field={field}
                  setupTime={addSetupTime ? setupDuration : 0}
                  timeSlots={timeSlots}
                  practiceNotes={practiceNotes}
                  coachName="Coach"
                  teamName={`Team ${teamId}`}
                />
              </div>
              
              {/* Print Instructions for Mobile */}
              <div className="md:hidden p-4 bg-blue-50 border-t border-blue-200 text-sm text-blue-800">
                <p className="font-semibold mb-2">📱 Mobile Printing Tips:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Use &quot;Print&quot; button above for best results</li>
                  <li>• Select &quot;Save to Files&quot; or &quot;More&quot; &gt; &quot;Print&quot; in your browser</li>
                  <li>• Choose &quot;Letter&quot; size for optimal formatting</li>
                  <li>• Enable &quot;Print backgrounds&quot; for full design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
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