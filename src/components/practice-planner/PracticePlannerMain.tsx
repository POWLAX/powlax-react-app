'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Clock, MapPin, Save, Printer, RefreshCw, FolderOpen, Plus, Target, Share2 } from 'lucide-react'
import DrillLibraryTabbed from '@/components/practice-planner/DrillLibraryTabbed'
import StrategyCard from '@/components/practice-planner/StrategyCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
import PracticeDurationBar from '@/components/practice-planner/PracticeDurationBar'
import SavePracticeModal from '@/components/practice-planner/modals/SavePracticeModal'
import LoadPracticeModal from '@/components/practice-planner/modals/LoadPracticeModal'
import StrategiesListModal from '@/components/practice-planner/modals/StrategiesListModal'
import PrintablePracticePlan from '@/components/practice-planner/PrintablePracticePlan'
import PracticeTemplateSelector from '@/components/practice-planner/PracticeTemplateSelector'
import ActiveStrategiesSection from '@/components/practice-planner/ActiveStrategiesSection'
import StudyDrillModal from '@/components/practice-planner/modals/StudyDrillModal'
import StudyStrategyModal from '@/components/practice-planner/modals/StudyStrategyModal'
import { usePracticePlans, type TimeSlot as PracticePlanTimeSlot } from '@/hooks/usePracticePlans'
import { useDrills } from '@/hooks/useDrills'
import { usePrint } from '@/hooks/usePrint'
import { useStrategies } from '@/hooks/useStrategies'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'

interface PracticePlannerMainProps {
  teamId?: string
  teamName?: string
}

export default function PracticePlannerMain({ teamId, teamName }: PracticePlannerMainProps) {
  const { user } = useAuth()
  
  // Pass teamId to hook, or undefined for standalone
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
  const [showStrategiesListModal, setShowStrategiesListModal] = useState(false)
  const [selectedStrategies, setSelectedStrategies] = useState<any[]>([])
  const [showStudyDrillModal, setShowStudyDrillModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<any>(null)
  const [showStudyStrategyModal, setShowStudyStrategyModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)
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
          const storageKey = teamId ? `practice-plan-${teamId}` : 'practice-plan-standalone'
          localStorage.setItem(storageKey, JSON.stringify(practiceData))
        } catch (e) {
          // Silently handle quota exceeded errors
          console.warn('Auto-save failed:', e)
        }
      }
    }, 5000) // 5 second debounce for performance

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [practiceDate, startTime, duration, field, addSetupTime, setupDuration, setupNotes, practiceNotes, timeSlots, selectedStrategies, teamId])

  // Load saved data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const storageKey = teamId ? `practice-plan-${teamId}` : 'practice-plan-standalone'
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
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
      }
    } catch (e) {
      console.warn('Failed to load auto-saved data:', e)
    }
  }, [teamId])

  // Handle save practice with database persistence
  const handleSavePractice = async (name: string) => {
    const practiceData = {
      title: name,
      team_id: teamId || null,
      practice_date: practiceDate,
      start_time: startTime,
      duration_minutes: duration,
      field_location: field,
      notes: practiceNotes,
      drill_sequence: {
        timeSlots,
        practiceInfo: {
          startTime,
          setupTime: addSetupTime ? setupDuration : undefined,
          field
        }
      }
    }

    const result = await savePracticePlan(practiceData)
    if (result.error) {
      toast.error('Failed to save practice plan: ' + result.error)
    } else {
      toast.success('Practice plan saved successfully!')
      setShowSaveModal(false)
    }
  }

  // Handle drill study modal
  const handleStudyDrill = (drill: any) => {
    setSelectedDrill(drill)
    setShowStudyDrillModal(true)
  }

  // Handle strategy study modal
  const handleStudyStrategy = (strategy: any) => {
    setSelectedStrategy(strategy)
    setShowStudyStrategyModal(true)
  }

  // Handle print
  const handlePrint = () => {
    printContent('print-content')
  }

  // Handle restart (clear all data)
  const handleRestart = () => {
    setTimeSlots([])
    setSelectedStrategies([])
    setPracticeNotes('')
    setSetupNotes([])
    toast.success('Practice plan cleared')
  }

  // Handle share to team
  const handleShareToTeam = () => {
    if (!teamId) {
      toast.error(
        <div>
          <p className="font-semibold">No team to share to!</p>
          <p className="text-sm">Consider getting a Team HQ to collaborate with your team.</p>
        </div>,
        { duration: 5000 }
      )
      return
    }
    
    // If team exists, share functionality
    toast.success(`Practice plan shared with ${teamName || 'your team'}!`)
    // Add actual sharing logic here when implemented
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Practice Planner {teamName && <span className="text-blue-600">- {teamName}</span>}
        </h1>
        <p className="text-gray-600 mt-2">
          {user ? `Welcome, ${user.display_name || user.email}!` : ''} 
          Build your perfect practice plan with drills and strategies.
        </p>
      </div>

      {/* Practice Info Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              value={practiceDate}
              onChange={(e) => setPracticeDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 mr-1" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 mr-1" />
              Duration (min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
              min="30"
              max="180"
              step="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              Field
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Turf">Turf</option>
              <option value="Grass">Grass</option>
              <option value="Box">Box</option>
              <option value="Wall">Wall</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Templates
        </button>
        <button
          onClick={() => setShowLoadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          Load
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          title="Clear Practice Timeline"
        >
          <RefreshCw className="h-4 w-4" />
          Restart
        </button>

        <button
          onClick={handleShareToTeam}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share to Team
        </button>
      </div>

      {/* Duration Bar */}
      <PracticeDurationBar
        totalTime={duration}
        usedTime={totalDrillTime + (addSetupTime ? setupDuration : 0)}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Drill Library */}
        <div className="lg:col-span-1">
          <DrillLibraryTabbed
            onSelectDrill={(drill) => {
              const newSlot: PracticePlanTimeSlot = {
                id: `slot-${Date.now()}`,
                drills: [drill],
                duration: drill.duration || 10
              }
              setTimeSlots([...timeSlots, newSlot])
              toast.success(`Added "${drill.title || drill.name}" to practice`)
            }}
            onStudyDrill={handleStudyDrill}
            selectedStrategies={selectedStrategies}
            user={user}
          />
        </div>

        {/* Right Column - Practice Timeline */}
        <div className="lg:col-span-2">
          <PracticeTimelineWithParallel
            timeSlots={timeSlots}
            setTimeSlots={setTimeSlots}
            startTime={startTime}
            onStudyDrill={handleStudyDrill}
          />

          {/* Active Strategies */}
          {selectedStrategies.length > 0 && (
            <ActiveStrategiesSection
              strategies={selectedStrategies}
              onRemoveStrategy={(id) => {
                setSelectedStrategies(selectedStrategies.filter(s => s.id !== id))
              }}
              onStudyStrategy={handleStudyStrategy}
            />
          )}

          {/* Practice Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practice Notes
            </label>
            <textarea
              value={practiceNotes}
              onChange={(e) => setPracticeNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes for this practice..."
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSaveModal && (
        <SavePracticeModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSavePractice}
        />
      )}
      {showLoadModal && (
        <LoadPracticeModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onLoad={(plan) => {
            // Load the practice plan data
            if (plan.drill_sequence) {
              setTimeSlots(plan.drill_sequence.timeSlots || [])
              if (plan.drill_sequence.practiceInfo) {
                setStartTime(plan.drill_sequence.practiceInfo.startTime || '07:00')
                setField(plan.drill_sequence.practiceInfo.field || 'Turf')
              }
            }
            setPracticeDate(plan.practice_date || new Date().toISOString().split('T')[0])
            setDuration(plan.duration_minutes || 90)
            setPracticeNotes(plan.notes || '')
            setShowLoadModal(false)
            toast.success('Practice plan loaded!')
          }}
        />
      )}
      {showTemplateSelector && (
        <PracticeTemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={(template) => {
            // Apply template
            setTimeSlots(template.timeSlots || [])
            setDuration(template.duration || 90)
            setPracticeNotes(template.notes || '')
            setShowTemplateSelector(false)
            toast.success(`Applied "${template.name}" template`)
          }}
        />
      )}
      {showStrategiesListModal && (
        <StrategiesListModal
          isOpen={showStrategiesListModal}
          onClose={() => setShowStrategiesListModal(false)}
          selectedStrategies={selectedStrategies}
          onSelectStrategy={(strategy) => {
            if (!selectedStrategies.find(s => s.id === strategy.id)) {
              setSelectedStrategies([...selectedStrategies, strategy])
            }
          }}
          onRemoveStrategy={(id) => {
            setSelectedStrategies(selectedStrategies.filter(s => s.id !== id))
          }}
          onStudyStrategy={handleStudyStrategy}
        />
      )}
      {showStudyDrillModal && selectedDrill && (
        <StudyDrillModal
          isOpen={showStudyDrillModal}
          onClose={() => {
            setShowStudyDrillModal(false)
            setSelectedDrill(null)
          }}
          drill={selectedDrill}
        />
      )}
      {showStudyStrategyModal && selectedStrategy && (
        <StudyStrategyModal
          isOpen={showStudyStrategyModal}
          onClose={() => {
            setShowStudyStrategyModal(false)
            setSelectedStrategy(null)
          }}
          strategy={selectedStrategy}
        />
      )}

      {/* Print Content (hidden) */}
      <div id="print-content" className="hidden">
        <PrintablePracticePlan
          practiceDate={practiceDate}
          startTime={startTime}
          duration={duration}
          field={field}
          timeSlots={timeSlots}
          strategies={selectedStrategies}
          notes={practiceNotes}
        />
      </div>
    </div>
  )
}