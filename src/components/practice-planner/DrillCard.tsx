'use client'

import { useState, memo } from 'react'
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
  Star
} from 'lucide-react'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'

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
  isParallel = false
}: DrillCardProps) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState(drill.notes || '')
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [showLacrosseLabModal, setShowLacrosseLabModal] = useState(false)

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

  return (
    <div className={`bg-white rounded-lg field-border shadow-lg ${isParallel ? 'ml-4 border-l-4 border-l-blue-300' : ''}`}>
      <div className="flex">
        {/* Time Column - Only show for main drills, not parallel */}
        {!isParallel && (
          <div className="flex flex-col items-center justify-center px-4 py-3 field-time rounded-l-lg border-r">
            <div className="text-lg font-bold">{startTime}</div>
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
        <div className={`flex-1 p-4 ${isParallel ? 'bg-blue-50' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`field-drill-name ${isParallel ? 'text-base' : 'text-lg'}`}>
                  {drill.name}
                </h3>
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
                <p className="text-sm field-notes p-3 rounded-lg">{drill.notes}</p>
              ) : (
                <p className="text-sm field-text-secondary italic font-medium">Click edit to add notes</p>
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


            <button
              onClick={onRemove}
              className="touch-target flex items-center justify-center bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 border-2 border-red-300 rounded-xl shadow-md transition-all duration-200 col-span-3 sm:col-span-1 sm:ml-auto"
              title="Remove Drill"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>

          {/* Hashtags */}
          {formatHashtags() && (
            <div className="text-sm text-blue-700 font-semibold">
              {formatHashtags()}
            </div>
          )}
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