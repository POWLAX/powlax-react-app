'use client'

import { useState, memo, useEffect } from 'react'
import { 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  Video, 
  Beaker, 
  Link, 
  Image as ImageIcon,
  XCircle,
  Plus,
  User,
  Star,
  Play
} from 'lucide-react'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

interface DrillCardProps {
  drill: {
    id: string
    name: string
    duration: number
    notes?: string
    videoUrl?: string
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
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [showLacrosseLabModal, setShowLacrosseLabModal] = useState(false)
  const [showStudyModal, setShowStudyModal] = useState(false)
  
  const isMobile = useIsMobile()

  const handleDurationChange = (newDuration: number) => {
    onUpdate({ ...drill, duration: newDuration })
  }

  const handleNotesUpdate = () => {
    onUpdate({ ...drill, notes: tempNotes })
    setEditingNotes(false)
  }

  const formatHashtags = () => {
    const tags = [
      ...(drill.strategies || []).map(s => `#${s}`),
      ...(drill.concepts || []).map(c => `#${c}`),
      ...(drill.skills || []).map(s => `#${s}`)
    ]
    return tags.join(' ')
  }

  // Mobile layout - compact card with time controls on top
  if (isMobile && !isParallel) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
        {/* Mobile Header with Time Controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`p-1 rounded ${canMoveUp ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="text-2xl font-bold text-blue-600">{startTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={drill.duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-1 text-center border border-gray-300 rounded text-sm font-medium"
            />
            <span className="text-sm text-gray-600">min</span>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`p-1 rounded ${canMoveDown ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300'}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Drill Name and Study Button */}
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-[#003366] flex-1">{drill.name}</h4>
          <span className="text-gray-400">•</span>
          <button 
            onClick={() => setShowStudyModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Study Drill
          </button>
        </div>
        
        {/* Coaching Notes */}
        {drill.notes && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-2">
            <p className="text-sm text-blue-800">{drill.notes}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setEditingNotes(!editingNotes)}
            className="p-1.5 rounded bg-gray-100 hover:bg-gray-200"
          >
            <Edit3 className="h-4 w-4 text-gray-600" />
          </button>
          {drill.videoUrl && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="p-1.5 rounded bg-red-100 hover:bg-red-200"
            >
              <Video className="h-4 w-4 text-red-600" />
            </button>
          )}
          {hasLabUrls(drill) && (
            <button
              onClick={() => setShowLacrosseLabModal(true)}
              className="p-1.5 rounded bg-blue-100 hover:bg-blue-200"
            >
              <Beaker className="h-4 w-4 text-blue-600" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded bg-gray-100 hover:bg-red-100 ml-auto"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* Modals */}
        <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} drill={drill} />
        <LacrosseLabModal isOpen={showLacrosseLabModal} onClose={() => setShowLacrosseLabModal(false)} drill={drill} />
      </div>
    )
  }
  
  // Desktop layout (original)
  return (
    <div className={`bg-white rounded-lg field-border shadow-lg relative ${isParallel ? 'ml-4 border-l-4 border-l-blue-300' : ''}`}>
      <div className="flex">
        {/* Time Column - Only show for main drills, not parallel */}
        {!isParallel && (
          <div className="flex flex-col items-center justify-center px-4 py-3 field-time rounded-l-lg border-r">
            <div className="text-2xl font-bold text-blue-600">{startTime}</div>
            <div className="flex items-center mt-1">
              <input
                type="number"
                value={drill.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-2 text-center field-border rounded font-semibold text-gray-900 bg-white touch-target-sm"
              />
              <span className="ml-1 text-sm field-text-secondary font-semibold">min</span>
            </div>
            <div className="flex flex-col mt-2 space-y-1">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`touch-target-sm rounded-lg field-button ${canMoveUp ? '' : 'opacity-50 cursor-not-allowed'}`}
                title="Move drill up"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`touch-target-sm rounded-lg field-button ${canMoveDown ? '' : 'opacity-50 cursor-not-allowed'}`}
                title="Move drill down"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Column */}
        <div className={`flex-1 p-4 ${isParallel ? 'bg-white' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`field-drill-name ${isParallel ? 'text-base' : 'text-lg'}`}>
                  {drill.name}
                </h3>
                <span className="text-gray-400">•</span>
                <button 
                  onClick={() => setShowStudyModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Study Drill
                </button>
                {drill.source === 'user' && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-green-600" />
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                      Custom
                    </span>
                  </div>
                )}
                {drill.source === 'powlax' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    POWLAX
                  </span>
                )}
                {isParallel && (
                  <span className="text-sm field-text bg-white px-3 py-2 rounded-lg field-border font-semibold">
                    {drill.duration}min
                  </span>
                )}
              </div>
            </div>
{!isParallel && onAddParallel && (
              <button
                onClick={onAddParallel}
                className="touch-target text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold shadow-md"
                title="Add parallel drill"
              >
                <Plus className="h-4 w-4 mr-2" />
                Parallel
              </button>
            )}
            
            {/* Trash Icon - Positioned Absolute */}
            <button
              onClick={onRemove}
              className="absolute top-4 right-4 touch-target p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              title="Remove Drill"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Notes Section */}
          {editingNotes ? (
            <div className="mb-3">
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="w-full p-3 field-border rounded-lg resize-none field-text bg-white touch-target"
                rows={3}
                placeholder="Add notes for this drill..."
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleNotesUpdate}
                  className="touch-target text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempNotes(drill.notes || '')
                    setEditingNotes(false)
                  }}
                  className="touch-target text-sm field-button rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              {drill.notes ? (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">{drill.notes}</p>
                </div>
              ) : (
                <p className="text-sm field-text-secondary italic font-medium">Click edit to add coaching notes</p>
              )}
            </div>
          )}

          {/* Icon Row - Enhanced for touch targets */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 mb-3">
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className="touch-target flex items-center justify-center field-button rounded-xl transition-all duration-200"
              title="Edit Notes"
            >
              <img 
                src="https://powlax.com/wp-content/uploads/2025/06/Pencil-1.svg" 
                alt="Edit Notes" 
                className="h-6 w-6"
              />
            </button>

            <button
              onClick={() => setShowVideoModal(true)}
              className={`touch-target flex items-center justify-center rounded-xl transition-all duration-200 ${
                drill.videoUrl 
                  ? 'bg-red-100 hover:bg-red-200 active:bg-red-300 border-2 border-red-300 shadow-md' 
                  : 'bg-gray-50 opacity-40 cursor-not-allowed border-2 border-gray-200'
              }`}
              title={drill.videoUrl ? "View Video" : "No video available"}
              disabled={!drill.videoUrl}
            >
              <img 
                src="https://powlax.com/wp-content/uploads/2025/06/Video-1.svg" 
                alt="View Video" 
                className="h-6 w-6"
              />
            </button>

            {hasLabUrls(drill) && (
              <button
                onClick={() => setShowLacrosseLabModal(true)}
                className="touch-target flex items-center justify-center bg-blue-100 hover:bg-blue-200 active:bg-blue-300 border-2 border-blue-300 rounded-xl shadow-md transition-all duration-200"
                title="Lacrosse Lab Diagrams"
              >
                <img 
                  src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                  alt="Lacrosse Lab" 
                  className="h-6 w-6"
                />
              </button>
            )}

            <button
              onClick={() => setShowLinksModal(true)}
              className="touch-target flex items-center justify-center bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700 border-2 border-green-300 rounded-xl shadow-md transition-all duration-200"
              title="External Links"
            >
              <Link className="h-6 w-6" />
            </button>

            {onStudyDrill && (
              <button
                onClick={() => onStudyDrill(drill)}
                className="touch-target flex items-center justify-center bg-[#003366] hover:bg-[#003366]/90 active:bg-[#003366]/80 text-white border-2 border-[#003366] rounded-xl shadow-md transition-all duration-200"
                title="Study Drill"
              >
                <Star className="h-6 w-6" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        drill={drill}
      />

      <LinksModal
        isOpen={showLinksModal}
        onClose={() => setShowLinksModal(false)}
        drill={drill}
      />

      <StrategiesModal
        isOpen={showStrategiesModal}
        onClose={() => setShowStrategiesModal(false)}
        drill={drill}
      />

      <LacrosseLabModal
        isOpen={showLacrosseLabModal}
        onClose={() => setShowLacrosseLabModal(false)}
        drill={drill}
      />
    </div>
  )
})

export default DrillCard