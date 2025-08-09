'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus, Target, Loader2 } from 'lucide-react'
import DrillLibraryTabbed from '@/components/practice-planner/DrillLibraryTabbed'
import StrategyCard from '@/components/practice-planner/StrategyCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import SavePracticeModal from '@/components/practice-planner/modals/SavePracticeModal'
import LoadPracticeModal from '@/components/practice-planner/modals/LoadPracticeModal'
import AddCustomStrategiesModal from '@/components/practice-planner/modals/AddCustomStrategiesModal'
import StrategiesListModal from '@/components/practice-planner/modals/StrategiesListModal'
import PrintablePracticePlan from '@/components/practice-planner/PrintablePracticePlan'
import PracticeTemplateSelector from '@/components/practice-planner/PracticeTemplateSelector'
import PracticeScheduleCard from '@/components/practice-planner/PracticeScheduleCard'
import ActiveStrategiesSection from '@/components/practice-planner/ActiveStrategiesSection'
import StudyDrillModal from '@/components/practice-planner/modals/StudyDrillModal'
import StudyStrategyModal from '@/components/practice-planner/modals/StudyStrategyModal'
import { usePracticePlans, type TimeSlot as PracticePlanTimeSlot } from '@/hooks/usePracticePlans'
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
  const [setupNotes, setSetupNotes] = useState<string[]>([])
  const [practiceNotes, setPracticeNotes] = useState('')
  const [timeSlots, setTimeSlots] = useState<PracticePlanTimeSlot[]>([])
  const [showDrillLibrary, setShowDrillLibrary] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showAddStrategiesModal, setShowAddStrategiesModal] = useState(false)
  const [showStrategiesListModal, setShowStrategiesListModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStrategies, setSelectedStrategies] = useState<any[]>([])
  const [showStudyDrillModal, setShowStudyDrillModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState(null)
  const [showStudyStrategyModal, setShowStudyStrategyModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate total drill time from all time slots
  const totalDrillTime = timeSlots.reduce((acc, slot) => acc + slot.duration, 0)

  // Auto-save functionality
  useEffect(() => {
    if (typeof window === 'undefined') return // Skip during SSR
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set new timer for auto-save with optimized debouncing
    autoSaveTimerRef.current = setTimeout(() => {
      const practiceData = {
        practiceDate,
        startTime,
        duration,
        field,
        addSetupTime,
        setupDuration,
        setupNotes,
        practiceNotes,
        timeSlots,
        selectedStrategies
      }
      
      // Save to localStorage using try-catch for better error handling
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(`practice-plan-${teamId}`, JSON.stringify(practiceData))
        } catch (e) {
          // Silently handle quota exceeded errors
          console.warn('Auto-save failed:', e)
        }
      }
    }, 3000) // Save after 3 seconds of inactivity

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [practiceDate, startTime, duration, field, addSetupTime, setupDuration, setupNotes, practiceNotes, timeSlots, selectedStrategies, teamId])

  // Load saved practice on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return // Skip during SSR
    
    const savedData = localStorage.getItem(`practice-plan-${teamId}`)
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setPracticeDate(data.practiceDate || new Date().toISOString().split('T')[0])
        setStartTime(data.startTime || '07:00')
        setDuration(data.duration || 90)
        setField(data.field || 'Turf')
        setAddSetupTime(data.addSetupTime || false)
        setSetupDuration(data.setupDuration || 15)
        setSetupNotes(data.setupNotes || [])
        setPracticeNotes(data.practiceNotes || '')
        setTimeSlots(data.timeSlots || [])
        setSelectedStrategies(data.selectedStrategies || [])
        toast.success('Previous practice session restored')
      } catch (error) {
        // Silently fail if there's an error loading saved data
      }
    }
  }, [teamId])

  const handleAddDrill = (
    drill: {
      id: string
      duration: number
      [key: string]: unknown
    }
  ) => {
    const newDrill = {
      ...drill,
      id: `${drill.id}-${Date.now()}`, // Create unique ID
    }
    
    // Add as a new time slot
    const newSlot: PracticePlanTimeSlot = {
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

  const handleSelectStrategy = (strategy: any) => {
    // Toggle strategy selection
    const exists = selectedStrategies.find(s => s.id === strategy.id)
    if (exists) {
      setSelectedStrategies(selectedStrategies.filter(s => s.id !== strategy.id))
    } else {
      setSelectedStrategies([...selectedStrategies, strategy])
    }
  }

  const handleRemoveStrategy = (strategyId: string) => {
    setSelectedStrategies(selectedStrategies.filter(s => s.id !== strategyId))
  }

  // Group strategies by game phase
  const strategiesByPhase = selectedStrategies.reduce((acc, strategy) => {
    const phase = strategy.strategy_categories || 'General'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(strategy)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-[#003366]">POWLAX PRACTICE PLANNER</h1>
          <p className="text-sm text-gray-600 mt-1">Finally: A practice planner built by a lacrosse coach who actually gets it.</p>
          <div className="flex gap-2 mt-3 flex-wrap">
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
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">POWLAX Practice Planner</h1>
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
          {/* Active Strategies Section */}
          {selectedStrategies.length > 0 && (
            <ActiveStrategiesSection
              strategies={selectedStrategies}
              onRemoveStrategy={handleRemoveStrategy}
              onAddStrategy={() => setShowStrategiesListModal(true)}
            />
          )}

          {/* Practice Schedule Card */}
          <div className="mb-4">
            <PracticeScheduleCard
              practiceDate={practiceDate}
              setPracticeDate={setPracticeDate}
              startTime={startTime}
              setStartTime={setStartTime}
              duration={duration}
              setDuration={setDuration}
              field={field}
              setField={setField}
              addSetupTime={addSetupTime}
              setAddSetupTime={setAddSetupTime}
              setupDuration={setupDuration}
              setSetupDuration={setSetupDuration}
            />
            
            {/* Duration Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
              <PracticeDurationBar 
                totalDuration={duration}
                usedDuration={totalDrillTime}
              />
              
              {/* Practice Info and Goals Accordion */}
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="practice-info">
                  <AccordionTrigger>Practice Info and Goals</AccordionTrigger>
                  <AccordionContent>
                    <textarea
                      placeholder="Add your practice goals and notes here..."
                      className="w-full p-3 border rounded-md resize-none h-24"
                      value={practiceNotes}
                      onChange={(e) => setPracticeNotes(e.target.value)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>


          {/* Practice Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <PracticeTimelineWithParallel
              drills={timeSlots}
              setDrills={setTimeSlots}
              startTime={startTime}
              setupTime={addSetupTime ? setupDuration : 0}
              setupNotes={setupNotes}
              onSetupNotesChange={setSetupNotes}
              onStudyDrill={(drill) => {
                setSelectedDrill(drill)
                setShowStudyDrillModal(true)
              }}
            />
          </div>
        </div>

        {/* Drill Library Sidebar - Desktop/Tablet */}
        <div className="hidden md:block w-80 lg:w-96 border-l bg-white overflow-y-auto">
          <DrillLibraryTabbed 
            onAddDrill={handleAddDrill}
            onSelectStrategy={handleSelectStrategy}
            selectedStrategies={selectedStrategies.map(s => s.id)}
            isMobile={false}
          />
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
            <DrillLibraryTabbed 
              onAddDrill={handleAddDrill}
              onSelectStrategy={handleSelectStrategy}
              selectedStrategies={selectedStrategies.map(s => s.id)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Mobile Add to Plan Button */}
      <button
        onClick={() => setShowDrillLibrary(true)}
        className="fixed bottom-16 left-4 right-4 bg-blue-600 text-white rounded-lg py-3 shadow-lg md:hidden z-40"
      >
        <Plus className="h-5 w-5 inline mr-2" />
        Add to Plan
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

      {/* Study Modals */}
      {selectedDrill && (
        <StudyDrillModal
          isOpen={showStudyDrillModal}
          onClose={() => setShowStudyDrillModal(false)}
          drill={selectedDrill}
        />
      )}

      {selectedStrategy && (
        <StudyStrategyModal
          isOpen={showStudyStrategyModal}
          onClose={() => setShowStudyStrategyModal(false)}
          strategy={selectedStrategy}
        />
      )}

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