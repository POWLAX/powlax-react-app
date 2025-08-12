'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUserDrills } from '@/hooks/useUserDrills'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'

interface AddCustomDrillModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (drill: any) => void
  onDrillCreated?: () => void
}

export default function AddCustomDrillModal({ isOpen, onClose, onAdd, onDrillCreated }: AddCustomDrillModalProps) {
  const { createUserDrill, loading: creating } = useUserDrills()
  const { user } = useAuth()
  
  // Form state - essential fields only
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [category, setCategory] = useState('custom')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [drillLabUrl1, setDrillLabUrl1] = useState('')
  const [drillLabUrl2, setDrillLabUrl2] = useState('')
  const [drillLabUrl3, setDrillLabUrl3] = useState('')
  const [drillLabUrl4, setDrillLabUrl4] = useState('')
  const [drillLabUrl5, setDrillLabUrl5] = useState('')
  const [equipment, setEquipment] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a drill title')
      return
    }

    if (!user) {
      toast.error('You must be logged in to create custom drills')
      return
    }

    try {
      // Create drill data using ONLY existing table columns
      // Available columns: id, user_id, title, content, created_at, updated_at, game_states, is_public, team_share, club_share
      
      // Combine all the form data into the content field since individual fields don't exist
      let fullContent = content.trim() || `Custom drill: ${title.trim()}`
      
      // Add additional details to content field
      if (durationMinutes !== 10) {
        fullContent += `\n\nDuration: ${durationMinutes} minutes`
      }
      
      if (category !== 'custom') {
        fullContent += `\nCategory: ${category}`
      }
      
      if (videoUrl.trim()) {
        fullContent += `\nVideo URL: ${videoUrl.trim()}`
      }
      
      const labUrls = [drillLabUrl1, drillLabUrl2, drillLabUrl3, drillLabUrl4, drillLabUrl5]
        .filter(url => url.trim())
        .map(url => url.trim())
      
      if (labUrls.length > 0) {
        fullContent += `\nLacrosse Lab URLs:\n${labUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}`
      }
      
      if (equipment.trim()) {
        fullContent += `\nEquipment: ${equipment.trim()}`
      }
      
      const drillData = {
        user_id: user?.id || null, // Safe access with fallback
        title: title.trim(),
        content: fullContent,
        duration_minutes: durationMinutes,
        category: category,
        video_url: videoUrl || null,
        drill_lab_url_1: drillLabUrl1 || null,
        drill_lab_url_2: drillLabUrl2 || null,
        drill_lab_url_3: drillLabUrl3 || null,
        drill_lab_url_4: drillLabUrl4 || null,
        drill_lab_url_5: drillLabUrl5 || null,
        equipment: equipment || '',
        tags: '',
        game_states: [], // Empty array - field exists
        is_public: false, // Default to private
        team_share: [], // Empty array - field exists
        club_share: [] // Empty array - field exists
      }

      if (!user?.id) {
        throw new Error('You must be logged in to create custom drills')
      }

      const createdDrill = await createUserDrill(drillData)

      // Also add to practice planner immediately
      const practiceReadyDrill = {
        id: `user-${createdDrill.id}`,
        title: title.trim(),
        name: title.trim(), // Legacy compatibility
        duration_minutes: durationMinutes,
        duration: durationMinutes, // Legacy compatibility
        category: 'Custom Drills',
        content: fullContent,
        notes: fullContent, // Use combined content as notes for legacy compatibility
        coach_instructions: '', // Empty - not stored separately
        video_url: videoUrl.trim() || undefined,
        isCustom: true,
        source: 'user' as const,
        user_id: createdDrill.user_id
      }

      onAdd(practiceReadyDrill)
      
      // Also refresh main drill list if callback provided
      if (onDrillCreated) {
        onDrillCreated()
      }
      
      // Reset form
      resetForm()
      onClose()
      
      toast.success('Custom drill created and added to practice!')
    } catch (error) {
      console.error('Error creating custom drill:', error)
      toast.error('Failed to create custom drill: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const resetForm = () => {
    setTitle('')
    setDurationMinutes(10)
    setCategory('custom')
    setContent('')
    setVideoUrl('')
    setDrillLabUrl1('')
    setDrillLabUrl2('')
    setDrillLabUrl3('')
    setDrillLabUrl4('')
    setDrillLabUrl5('')
    setEquipment('')
  }

  const handleClose = () => {
    // Reset form when closing
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#003366] font-semibold">Add Custom Drill</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a custom drill with essential details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
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
        </form>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={creating} 
            className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            disabled={creating} 
            className="bg-[#003366] hover:bg-[#003366]/90 text-white"
          >
            {creating ? 'Creating...' : 'Add Drill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}