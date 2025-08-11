'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserDrills } from '@/hooks/useUserDrills'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'

interface Drill {
  id: string
  title: string
  duration_minutes: number
  category: string
  content?: string
  notes?: string
  coach_instructions?: string
  video_url?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  equipment?: string[]
  tags?: string
  game_states?: string[]
  source?: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
  team_share?: number[]
  club_share?: number[]
}

interface EditCustomDrillModalProps {
  isOpen: boolean
  onClose: () => void
  drill: Drill | null
  onDrillUpdated?: () => void
}

export default function EditCustomDrillModal({ isOpen, onClose, drill, onDrillUpdated }: EditCustomDrillModalProps) {
  const { updateUserDrill, loading: updating } = useUserDrills()
  const { user } = useAuth()
  
  // Form state - matching ALL powlax_drills columns
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [category, setCategory] = useState('custom')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState('')
  const [coachInstructions, setCoachInstructions] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [drillLabUrl1, setDrillLabUrl1] = useState('')
  const [drillLabUrl2, setDrillLabUrl2] = useState('')
  const [drillLabUrl3, setDrillLabUrl3] = useState('')
  const [drillLabUrl4, setDrillLabUrl4] = useState('')
  const [drillLabUrl5, setDrillLabUrl5] = useState('')
  const [equipment, setEquipment] = useState('')
  const [tags, setTags] = useState('')
  const [gameStates, setGameStates] = useState('')
  
  // Sharing options
  const [shareWithTeam, setShareWithTeam] = useState(false)
  const [shareWithClub, setShareWithClub] = useState(false)
  const [makePublic, setMakePublic] = useState(false)

  // Pre-populate form when drill changes
  useEffect(() => {
    if (drill) {
      setTitle(drill.title || '')
      setDurationMinutes(drill.duration_minutes || 10)
      setCategory(drill.category === 'Custom Drills' ? 'custom' : drill.category || 'custom')
      setContent(drill.content || '')
      setNotes(drill.notes || '')
      setCoachInstructions(drill.coach_instructions || '')
      setVideoUrl(drill.video_url || '')
      setDrillLabUrl1(drill.drill_lab_url_1 || '')
      setDrillLabUrl2(drill.drill_lab_url_2 || '')
      setDrillLabUrl3(drill.drill_lab_url_3 || '')
      setDrillLabUrl4(drill.drill_lab_url_4 || '')
      setDrillLabUrl5(drill.drill_lab_url_5 || '')
      setEquipment(Array.isArray(drill.equipment) ? drill.equipment.join(', ') : '')
      setTags(drill.tags || '')
      setGameStates(Array.isArray(drill.game_states) ? drill.game_states.join(', ') : '')
      setShareWithTeam(Boolean(drill.team_share?.length))
      setShareWithClub(Boolean(drill.club_share?.length))
      setMakePublic(drill.is_public || false)
    } else {
      resetForm()
    }
  }, [drill])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a drill title')
      return
    }

    if (!user || !drill) {
      toast.error('Cannot update drill - missing user or drill data')
      return
    }

    // Only allow editing own drills
    if (drill.user_id !== user.id) {
      toast.error('You can only edit your own custom drills')
      return
    }

    try {
      // Extract drill ID (remove 'user-' prefix if present)
      const drillId = drill.id.startsWith('user-') ? drill.id.substring(5) : drill.id

      // Update drill in database with ALL powlax_drills columns
      const updateData = {
        title: title.trim(),
        duration_minutes: durationMinutes,
        category: category,
        content: content.trim() || `Custom drill: ${title.trim()}`,
        notes: notes.trim(),
        coach_instructions: coachInstructions.trim(),
        video_url: videoUrl.trim() || null,
        drill_lab_url_1: drillLabUrl1.trim() || null,
        drill_lab_url_2: drillLabUrl2.trim() || null,
        drill_lab_url_3: drillLabUrl3.trim() || null,
        drill_lab_url_4: drillLabUrl4.trim() || null,
        drill_lab_url_5: drillLabUrl5.trim() || null,
        equipment: equipment.trim() ? equipment.split(',').map(e => e.trim()).filter(Boolean) : [],
        tags: tags.trim(),
        game_states: gameStates.trim() ? gameStates.split(',').map(gs => gs.trim()).filter(Boolean) : [],
        is_public: makePublic,
        team_share: shareWithTeam ? [] : undefined, // TODO: Add team selection
        club_share: shareWithClub ? [] : undefined, // TODO: Add club selection
        drill_category: category,
        drill_duration: `${durationMinutes} minutes`,
        drill_notes: notes.trim(),
        drill_video_url: videoUrl.trim() || null
      }

      await updateUserDrill(drillId, updateData)
      
      // Also refresh main drill list if callback provided
      if (onDrillUpdated) {
        onDrillUpdated()
      }
      
      onClose()
      
      toast.success('Custom drill updated successfully!')
    } catch (error) {
      console.error('Error updating custom drill:', error)
      toast.error('Failed to update custom drill: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const resetForm = () => {
    setTitle('')
    setDurationMinutes(10)
    setCategory('custom')
    setContent('')
    setNotes('')
    setCoachInstructions('')
    setVideoUrl('')
    setDrillLabUrl1('')
    setDrillLabUrl2('')
    setDrillLabUrl3('')
    setDrillLabUrl4('')
    setDrillLabUrl5('')
    setEquipment('')
    setTags('')
    setGameStates('')
    setShareWithTeam(false)
    setShareWithClub(false)
    setMakePublic(false)
  }

  const handleClose = () => {
    onClose()
  }

  // Don't show modal for non-user drills
  if (!drill || drill.source !== 'user' || (user && drill.user_id !== user.id)) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#003366] font-semibold">Edit Custom Drill</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your custom drill details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            {/* Drill Title */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Drill Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                placeholder="e.g., 3v2 Ground Ball to Clear"
                required
              />
            </div>

            {/* Duration and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#003366] mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 10)}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#003366] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                >
                  <option value="custom">Custom</option>
                  <option value="skill">Skill Development</option>
                  <option value="concept">Concept Drills</option>
                  <option value="admin">Admin</option>
                  <option value="1v1">1v1 Drills</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content and Instructions */}
          <div className="space-y-4">
            {/* Content/Description */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Drill Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none bg-white text-[#003366]"
                placeholder="Detailed description of how to run this drill..."
              />
            </div>

            {/* Coach Instructions */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Coach Instructions
              </label>
              <textarea
                value={coachInstructions}
                onChange={(e) => setCoachInstructions(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none bg-white text-[#003366]"
                placeholder="Special coaching points and tips..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none bg-white text-[#003366]"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#003366]">Media & Resources</h4>
            
            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                placeholder="https://vimeo.com/..."
              />
            </div>

            {/* Lacrosse Lab URLs */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Lacrosse Lab URLs (up to 5)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={drillLabUrl1}
                  onChange={(e) => setDrillLabUrl1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  placeholder="Lacrosse Lab URL #1"
                />
                <input
                  type="url"
                  value={drillLabUrl2}
                  onChange={(e) => setDrillLabUrl2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  placeholder="Lacrosse Lab URL #2"
                />
                <input
                  type="url"
                  value={drillLabUrl3}
                  onChange={(e) => setDrillLabUrl3(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  placeholder="Lacrosse Lab URL #3"
                />
                <input
                  type="url"
                  value={drillLabUrl4}
                  onChange={(e) => setDrillLabUrl4(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  placeholder="Lacrosse Lab URL #4"
                />
                <input
                  type="url"
                  value={drillLabUrl5}
                  onChange={(e) => setDrillLabUrl5(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                  placeholder="Lacrosse Lab URL #5"
                />
              </div>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#003366]">Additional Properties</h4>
            
            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Equipment Needed
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                placeholder="cones, balls, goals (comma-separated)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                placeholder="ground ball, 1v1, shooting (comma-separated)"
              />
            </div>

            {/* Game States */}
            <div>
              <label className="block text-sm font-medium text-[#003366] mb-1">
                Game States
              </label>
              <input
                type="text"
                value={gameStates}
                onChange={(e) => setGameStates(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
                placeholder="offense, transition, settled (comma-separated)"
              />
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#003366]">Sharing Options</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shareWithTeam"
                  checked={shareWithTeam}
                  onCheckedChange={(checked) => setShareWithTeam(checked === true)}
                />
                <label htmlFor="shareWithTeam" className="text-sm text-[#003366]">
                  Share with my teams
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shareWithClub"
                  checked={shareWithClub}
                  onCheckedChange={(checked) => setShareWithClub(checked === true)}
                />
                <label htmlFor="shareWithClub" className="text-sm text-[#003366]">
                  Share with my club
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="makePublic"
                  checked={makePublic}
                  onCheckedChange={(checked) => setMakePublic(checked === true)}
                />
                <label htmlFor="makePublic" className="text-sm text-[#003366]">
                  Make publicly available
                </label>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={updating} 
            className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            disabled={updating} 
            className="bg-[#003366] hover:bg-[#003366]/90 text-white"
          >
            {updating ? 'Updating...' : 'Update Drill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}