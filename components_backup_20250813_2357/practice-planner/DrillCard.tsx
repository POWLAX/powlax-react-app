'use client'

import { useState, memo } from 'react'
import { 
  Play,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Monitor,
  Circle,
  Image
} from 'lucide-react'

interface DrillCardProps {
  drill: {
    id: string
    title: string
    duration_minutes: number
    notes?: string
    videoUrl?: string
    video_url?: string
    labUrl?: string
    lab_urls?: string[] | string
    lacrosse_lab_urls?: string[]
    drill_lab_url_1?: string
    drill_lab_url_2?: string
    drill_lab_url_3?: string
    drill_lab_url_4?: string
    drill_lab_url_5?: string
    imageUrls?: string[]
    strategies?: string[]
    concepts?: string[]
    skills?: string[]
    custom_url?: string
    coach_instructions?: string
    source?: string
  }
  startTime: string
  index: number
  onUpdate: (drill: any) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddParallel?: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  isParallel?: boolean
  parallelLane?: number
  onStudyDrill?: (drill: any) => void
}

const DrillCard = memo(function DrillCard({
  drill,
  startTime,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddParallel,
  canMoveUp,
  canMoveDown,
  isParallel = false,
  onStudyDrill
}: DrillCardProps) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState(drill.notes || '')
  const [editingDuration, setEditingDuration] = useState(false)
  const [tempDuration, setTempDuration] = useState((drill.duration_minutes || 0).toString())

  // Helper function to check if drill has lab URLs
  const hasLabUrls = (drill: any) => {
    return drill.drill_lab_url_1 || drill.drill_lab_url_2 || drill.drill_lab_url_3 || 
           drill.drill_lab_url_4 || drill.drill_lab_url_5 || drill.labUrl || 
           (drill.lab_urls && Array.isArray(drill.lab_urls) && drill.lab_urls.length > 0) ||
           (drill.lacrosse_lab_urls && Array.isArray(drill.lacrosse_lab_urls) && drill.lacrosse_lab_urls.length > 0)
  }

  const handleDurationChange = (newDuration: number) => {
    if (newDuration > 0 && newDuration <= 999) {
      onUpdate({ ...drill, duration_minutes: newDuration })
    }
  }

  const handleDurationSave = () => {
    const duration = parseInt(tempDuration)
    if (duration > 0 && duration <= 999) {
      handleDurationChange(duration)
    } else {
      setTempDuration((drill.duration_minutes || 0).toString())
    }
    setEditingDuration(false)
  }

  const handleNotesUpdate = () => {
    onUpdate({ ...drill, notes: tempNotes })
    setEditingNotes(false)
  }

  const handleStudyClick = () => {
    if (onStudyDrill) {
      onStudyDrill(drill)
    }
  }

  // For parallel drills (nested inside gray container) - no header
  if (isParallel) {
    return (
      <div className="relative bg-white rounded-lg border border-gray-200">
        {/* Individual drill trash icon */}
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-1 hover:bg-red-50 rounded transition-colors z-10"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
        </button>
        
        <div className="p-4">
          {/* Drill name and Study button */}
          <div className="flex items-center gap-2 mb-3 pr-8">
            <h4 className="font-medium text-gray-900">{drill.title}</h4>
            
            {/* Content indicators */}
            <div className="flex items-center gap-1">
              {(drill.videoUrl || drill.video_url) && <Monitor className="h-3 w-3 text-gray-400" />}
              {hasLabUrls(drill) && <Circle className="h-3 w-3 text-gray-400" />}
              {drill.imageUrls && Array.isArray(drill.imageUrls) && drill.imageUrls.length > 0 && (
                <Image className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            <span className="text-gray-400">•</span>
            <button 
              onClick={handleStudyClick}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Play className="h-3 w-3" fill="white" />
              Study
            </button>
          </div>

          {/* Coaching notes */}
          {editingNotes ? (
            <div>
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                rows={2}
                placeholder="Add coaching notes..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleNotesUpdate}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempNotes(drill.notes || '')
                    setEditingNotes(false)
                  }}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {drill.notes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="w-full text-left bg-blue-50 border-l-4 border-blue-400 p-2 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-blue-900">
                    <span className="font-semibold">Coaching Focus:</span> {drill.notes}
                  </p>
                </button>
              ) : (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="w-full text-left p-2 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
                >
                  <p className="text-xs text-gray-500 italic">+ Add Notes</p>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main drill card layout with dark blue header
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Dark Blue Header with Navigation */}
      <div className="bg-blue-900 text-white px-4 py-2 flex items-center justify-between">
        {/* Up Button - Left Aligned */}
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className={`p-1 rounded border border-white/50 hover:bg-blue-800 hover:border-white transition-colors ${!canMoveUp ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        {/* Time and Duration - Center Aligned */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">{startTime}</span>
          <div className="flex items-center gap-1">
            {editingDuration ? (
              <>
                <input
                  type="number"
                  value={tempDuration}
                  onChange={(e) => setTempDuration(e.target.value)}
                  onBlur={handleDurationSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDurationSave()
                    if (e.key === 'Escape') {
                      setTempDuration((drill.duration_minutes || 0).toString())
                      setEditingDuration(false)
                    }
                  }}
                  className="w-12 px-1 py-0.5 text-center text-black rounded text-sm"
                  autoFocus
                  min="1"
                  max="999"
                />
                <span className="text-sm">min</span>
              </>
            ) : (
              <button
                onClick={() => setEditingDuration(true)}
                className="px-2 py-0.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm font-semibold"
              >
                {drill.duration_minutes || 0}m
              </button>
            )}
          </div>
        </div>

        {/* Down Button - Right Aligned */}
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className={`p-1 rounded border border-white/50 hover:bg-blue-800 hover:border-white transition-colors ${!canMoveDown ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content Area - Reduced padding for mobile */}
      <div className="p-3">
        {/* Title Row with Study Button - Smaller text */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {drill.title}
            </h3>
            
            {/* Content indicators */}
            <div className="flex items-center gap-1">
              {(drill.videoUrl || drill.video_url) && <Monitor className="h-3 w-3 text-gray-400" />}
              {hasLabUrls(drill) && <Circle className="h-3 w-3 text-gray-400" />}
              {drill.imageUrls && Array.isArray(drill.imageUrls) && drill.imageUrls.length > 0 && (
                <Image className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            <span className="text-gray-400 text-xs">•</span>
            <button 
              onClick={handleStudyClick}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Play className="h-3 w-3" fill="white" />
              Study
            </button>
          </div>
          {/* Trash button in top right */}
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 rounded transition-colors ml-2"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
          </button>
        </div>

        {/* Coaching Notes Section */}
        {editingNotes ? (
          <div>
            <textarea
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none text-xs"
              rows={2}
              placeholder="Add coaching notes..."
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleNotesUpdate}
                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTempNotes(drill.notes || '')
                  setEditingNotes(false)
                }}
                className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {drill.notes ? (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full text-left bg-blue-50 border-l-4 border-blue-400 p-2 rounded hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Coaching Focus:</span> {drill.notes}
                </p>
              </button>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="w-full text-left p-2 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
              >
                <p className="text-xs text-gray-500 italic">Click to add coaching notes</p>
              </button>
            )}
          </div>
        )}
        
        {/* Add Parallel Button - Thinner design */}
        {onAddParallel && (
          <button
            onClick={onAddParallel}
            className="w-full mt-2 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            + Add Parallel Activity
          </button>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Re-render if any of these change:
  return (
    prevProps.drill.id === nextProps.drill.id &&
    prevProps.drill.duration_minutes === nextProps.drill.duration_minutes &&
    prevProps.drill.notes === nextProps.drill.notes &&
    prevProps.startTime === nextProps.startTime &&
    prevProps.index === nextProps.index &&
    prevProps.canMoveUp === nextProps.canMoveUp &&
    prevProps.canMoveDown === nextProps.canMoveDown &&
    prevProps.isParallel === nextProps.isParallel
  )
})

export default DrillCard