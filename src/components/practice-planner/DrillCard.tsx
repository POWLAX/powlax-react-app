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
  Plus
} from 'lucide-react'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal from './modals/LacrosseLabModal'

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
    <div className={`bg-white rounded-lg border shadow-sm ${isParallel ? 'ml-4 border-l-4 border-l-blue-300' : ''}`}>
      <div className="flex">
        {/* Time Column - Only show for main drills, not parallel */}
        {!isParallel && (
          <div className="flex flex-col items-center justify-center px-4 py-3 bg-gray-50 rounded-l-lg border-r">
            <div className="text-lg font-semibold">{startTime}</div>
            <div className="flex items-center mt-1">
              <input
                type="number"
                value={drill.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-center border rounded"
              />
              <span className="ml-1 text-sm text-gray-600">min</span>
            </div>
            <div className="flex flex-col mt-2 space-y-1">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`p-1 rounded ${canMoveUp ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`p-1 rounded ${canMoveDown ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Column */}
        <div className={`flex-1 p-4 ${isParallel ? 'bg-blue-50' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-gray-900 ${isParallel ? 'text-base' : 'text-lg'}`}>
                  {drill.name}
                </h3>
                {isParallel && (
                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                    {drill.duration}min
                  </span>
                )}
              </div>
            </div>
            {!isParallel && onAddParallel && (
              <button
                onClick={onAddParallel}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
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
                className="w-full p-2 border rounded resize-none"
                rows={3}
                placeholder="Add notes for this drill..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleNotesUpdate}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempNotes(drill.notes || '')
                    setEditingNotes(false)
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              {drill.notes ? (
                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{drill.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Click edit to add notes</p>
              )}
            </div>
          )}

          {/* Icon Row */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 mb-3">
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl shadow-sm transition-colors"
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
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl shadow-sm transition-colors ${
                drill.videoUrl 
                  ? 'bg-red-100 hover:bg-red-200 active:bg-red-300' 
                  : 'bg-gray-50 opacity-40 cursor-not-allowed'
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

            <button
              onClick={() => setShowLacrosseLabModal(true)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-xl shadow-sm transition-colors"
              title="Lacrosse Lab Diagrams"
            >
              <img 
                src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                alt="Lacrosse Lab" 
                className="h-6 w-6"
              />
            </button>

            <button
              onClick={() => setShowLinksModal(true)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700 rounded-xl shadow-sm transition-colors"
              title="External Links"
            >
              <Link className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowStrategiesModal(true)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-700 rounded-xl shadow-sm transition-colors"
              title="Strategies & Concepts"
            >
              <span className="text-sm font-bold">X/O</span>
            </button>

            <button
              onClick={onRemove}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 rounded-xl shadow-sm transition-colors col-span-3 sm:col-span-1 sm:ml-auto"
              title="Remove Drill"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Hashtags */}
          {formatHashtags() && (
            <div className="text-sm text-blue-600">
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