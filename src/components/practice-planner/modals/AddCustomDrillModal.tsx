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

// Drill categories - matching practice planner expectations
const DRILL_CATEGORIES = [
  'Offensive Skills',
  'Defensive Skills', 
  'Transition',
  'Conditioning',
  'Goalie Skills',
  'Team Strategy',
  'Individual Skills',
  'Custom'
]

// Game phases/states for drills
const GAME_PHASES = [
  'Pre-Game Warm-Up',
  'Offensive Transition',
  'Settled Offense',
  'Defensive Transition',
  'Settled Defense',
  'Special Situations',
  'Conditioning',
  'Skills Development'
]

interface AddCustomDrillModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd?: (drill: any) => void
  onDrillCreated?: () => void
}

export default function AddCustomDrillModal({ 
  isOpen, 
  onClose, 
  onAdd,
  onDrillCreated 
}: AddCustomDrillModalProps) {
  const { createUserDrill, loading: creating } = useUserDrills()
  const { user } = useAuth()
  
  // Form state - all essential fields for drills
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [category, setCategory] = useState('Custom')
  const [equipment, setEquipment] = useState('')
  const [tags, setTags] = useState('')
  const [gamePhase, setGamePhase] = useState('')
  
  // Video and media fields
  const [videoUrl, setVideoUrl] = useState('')
  const [drillLabUrl1, setDrillLabUrl1] = useState('')
  const [drillLabUrl2, setDrillLabUrl2] = useState('')
  const [drillLabUrl3, setDrillLabUrl3] = useState('')
  const [drillLabUrl4, setDrillLabUrl4] = useState('')
  const [drillLabUrl5, setDrillLabUrl5] = useState('')
  
  // Age appropriateness
  const [doItAges, setDoItAges] = useState('')
  const [coachItAges, setCoachItAges] = useState('')
  const [ownItAges, setOwnItAges] = useState('')
  
  // Sharing options
  const [isPublic, setIsPublic] = useState(false)
  const [teamShare, setTeamShare] = useState(false)
  const [clubShare, setClubShare] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a drill title')
      return
    }

    if (durationMinutes < 1 || durationMinutes > 120) {
      toast.error('Duration must be between 1 and 120 minutes')
      return
    }

    if (!user) {
      toast.error('You must be logged in to create custom drills')
      return
    }

    try {
      // Build lacrosse lab links array
      const labUrls = [
        drillLabUrl1,
        drillLabUrl2,
        drillLabUrl3,
        drillLabUrl4,
        drillLabUrl5
      ].filter(url => url.trim() !== '')

      // Build game states array
      const gameStates = gamePhase ? [gamePhase] : []

      // Create drill data - send ALL fields to match fixed useUserDrills hook
      const drillData = {
        user_id: user.id,
        title: title.trim(),
        content: content.trim() || `Custom drill: ${title.trim()}`,
        duration_minutes: durationMinutes,
        duration: durationMinutes, // Legacy compatibility
        category: category,
        equipment: equipment.trim() || '',
        tags: tags.trim() || '',
        game_phase: gamePhase || '',
        game_states: gameStates,
        
        // Video and media
        video_url: videoUrl.trim() || null,
        drill_lab_url_1: labUrls[0] || null,
        drill_lab_url_2: labUrls[1] || null,
        drill_lab_url_3: labUrls[2] || null,
        drill_lab_url_4: labUrls[3] || null,
        drill_lab_url_5: labUrls[4] || null,
        
        // Age appropriateness
        do_it_ages: doItAges.trim() || null,
        coach_it_ages: coachItAges.trim() || null,
        own_it_ages: ownItAges.trim() || null,
        
        // Sharing - send arrays as expected by fixed hook
        is_public: isPublic,
        team_share: teamShare ? [] : [], // Empty arrays for now - can enhance later with actual team IDs
        club_share: clubShare ? [] : [],
        
        // Additional fields for compatibility
        drill_types: tags.trim() || '',
        drill_emphasis: gamePhase || '',
        notes: content.trim() || '',
        status: 'active'
      }

      const createdDrill = await createUserDrill(drillData)

      // Also add to practice planner immediately if onAdd is provided
      if (onAdd) {
        const practiceReadyDrill = {
          id: `user-${createdDrill.id}`,
          name: title.trim(),
          title: title.trim(),
          duration: durationMinutes,
          duration_minutes: durationMinutes,
          content: content.trim(),
          category: category,
          equipment: equipment.trim(),
          tags: tags.trim(),
          video_url: videoUrl.trim() || undefined,
          drill_lab_url_1: labUrls[0] || undefined,
          drill_lab_url_2: labUrls[1] || undefined,
          drill_lab_url_3: labUrls[2] || undefined,
          drill_lab_url_4: labUrls[3] || undefined,
          drill_lab_url_5: labUrls[4] || undefined,
          game_states: gameStates,
          source: 'user' as const,
          strategies: gamePhase ? [gamePhase] : [],
          concepts: gameStates,
          skills: tags ? tags.split(',').map(t => t.trim()) : [],
          notes: content.trim()
        }
        onAdd(practiceReadyDrill)
      }

      // Call the created callback if provided
      if (onDrillCreated) {
        onDrillCreated()
      }

      toast.success('Custom drill created successfully!')
      
      // Reset form
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating drill:', error)
      toast.error('Failed to create custom drill. Please try again.')
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setDurationMinutes(10)
    setCategory('Custom')
    setEquipment('')
    setTags('')
    setGamePhase('')
    setVideoUrl('')
    setDrillLabUrl1('')
    setDrillLabUrl2('')
    setDrillLabUrl3('')
    setDrillLabUrl4('')
    setDrillLabUrl5('')
    setDoItAges('')
    setCoachItAges('')
    setOwnItAges('')
    setIsPublic(false)
    setTeamShare(false)
    setClubShare(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#003366]">Add Custom Drill</DialogTitle>
          <DialogDescription>
            Create a custom drill with complete details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drill Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drill Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3v2 Transition Drill"
              required
            />
          </div>

          {/* Description/Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the drill setup, objectives, and execution..."
              rows={3}
            />
          </div>

          {/* Duration and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DRILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipment and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cones, Balls, Goals"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., shooting, passing, transition"
              />
            </div>
          </div>

          {/* Game Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Phase
            </label>
            <select
              value={gamePhase}
              onChange={(e) => setGamePhase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a game phase...</option>
              {GAME_PHASES.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </div>

          {/* Media & Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Media & Resources</h3>
            
            {/* Video URL */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://vimeo.com/..."
              />
            </div>

            {/* Lacrosse Lab URLs */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Lacrosse Lab URLs (up to 5)
              </label>
              <input
                type="url"
                value={drillLabUrl1}
                onChange={(e) => setDrillLabUrl1(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #1"
              />
              <input
                type="url"
                value={drillLabUrl2}
                onChange={(e) => setDrillLabUrl2(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #2"
              />
              <input
                type="url"
                value={drillLabUrl3}
                onChange={(e) => setDrillLabUrl3(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #3"
              />
              <input
                type="url"
                value={drillLabUrl4}
                onChange={(e) => setDrillLabUrl4(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #4"
              />
              <input
                type="url"
                value={drillLabUrl5}
                onChange={(e) => setDrillLabUrl5(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #5"
              />
            </div>
          </div>

          {/* Age Groups */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Age Appropriateness</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Do It Ages
                </label>
                <input
                  type="text"
                  value={doItAges}
                  onChange={(e) => setDoItAges(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8-10"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Coach It Ages
                </label>
                <input
                  type="text"
                  value={coachItAges}
                  onChange={(e) => setCoachItAges(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="11-14"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Own It Ages
                </label>
                <input
                  type="text"
                  value={ownItAges}
                  onChange={(e) => setOwnItAges(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15+"
                />
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Sharing Options</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Make this drill public</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={teamShare}
                  onChange={(e) => setTeamShare(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Share with my teams</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clubShare}
                  onChange={(e) => setClubShare(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Share with my clubs</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#003366] hover:bg-[#002244] text-white"
              disabled={creating}
            >
              {creating ? 'Adding Drill...' : 'Add Drill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}