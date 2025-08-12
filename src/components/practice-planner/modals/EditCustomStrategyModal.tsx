'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserStrategies } from '@/hooks/useUserStrategies'
import { GAME_PHASES } from '@/hooks/useStrategies'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/SupabaseAuthContext'

interface Strategy {
  id: string | number
  user_id?: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  vimeo_link?: string
  lacrosse_lab_links?: any[]
  target_audience?: string
  see_it_ages?: string
  coach_it_ages?: string
  own_it_ages?: string
  lesson_category?: string
  team_share?: number[]
  club_share?: number[]
  is_public?: boolean
  source: 'powlax' | 'user'
}

interface EditCustomStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy | null
  onStrategyUpdated?: () => void
  onSuccess?: () => void  // Added to match AddCustomDrillModal pattern
}

export default function EditCustomStrategyModal({ 
  isOpen, 
  onClose, 
  strategy,
  onStrategyUpdated,
  onSuccess 
}: EditCustomStrategyModalProps) {
  const { updateUserStrategy, loading: updating } = useUserStrategies()
  const { user } = useAuth()
  
  // Form state
  const [strategyName, setStrategyName] = useState('')
  const [description, setDescription] = useState('')
  const [gamePhase, setGamePhase] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [lacrosseLab1, setLacrosseLab1] = useState('')
  const [lacrosseLab2, setLacrosseLab2] = useState('')
  const [lacrosseLab3, setLacrosseLab3] = useState('')
  const [lacrosseLab4, setLacrosseLab4] = useState('')
  const [lacrosseLab5, setLacrosseLab5] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [seeItAges, setSeeItAges] = useState('')
  const [coachItAges, setCoachItAges] = useState('')
  const [ownItAges, setOwnItAges] = useState('')
  const [teamShare, setTeamShare] = useState(false)
  const [clubShare, setClubShare] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  // Store the actual arrays separately to preserve IDs
  const [teamShareIds, setTeamShareIds] = useState<number[]>([])
  const [clubShareIds, setClubShareIds] = useState<number[]>([])

  // Populate form when strategy changes
  useEffect(() => {
    if (strategy && isOpen) {
      setStrategyName(strategy.strategy_name || '')
      setDescription(strategy.description || '')
      setGamePhase(strategy.lesson_category || strategy.strategy_categories || '')
      setVideoUrl(strategy.vimeo_link || '')
      
      // Parse lacrosse lab links
      const lacrosseLabLinks = strategy.lacrosse_lab_links || []
      setLacrosseLab1(lacrosseLabLinks[0] || '')
      setLacrosseLab2(lacrosseLabLinks[1] || '')
      setLacrosseLab3(lacrosseLabLinks[2] || '')
      setLacrosseLab4(lacrosseLabLinks[3] || '')
      setLacrosseLab5(lacrosseLabLinks[4] || '')
      
      setTargetAudience(strategy.target_audience || '')
      setSeeItAges(strategy.see_it_ages || '')
      setCoachItAges(strategy.coach_it_ages || '')
      setOwnItAges(strategy.own_it_ages || '')
      
      // Handle team/club share arrays
      const teamIds = Array.isArray(strategy.team_share) ? strategy.team_share : []
      const clubIds = Array.isArray(strategy.club_share) ? strategy.club_share : []
      setTeamShareIds(teamIds)
      setClubShareIds(clubIds)
      setTeamShare(teamIds.length > 0)
      setClubShare(clubIds.length > 0)
      setIsPublic(strategy.is_public || false)
    }
  }, [strategy, isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to edit strategies')
      return
    }

    if (!strategy) {
      toast.error('No strategy selected for editing')
      return
    }

    // Check ownership
    if (strategy.source !== 'user' || strategy.user_id !== user.id) {
      toast.error('You can only edit your own custom strategies')
      return
    }
    
    if (!strategyName.trim()) {
      toast.error('Please enter a strategy name')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (!gamePhase) {
      toast.error('Please select a game phase')
      return
    }

    try {
      // Build lacrosse lab links array
      const lacrosseLabLinks = [
        lacrosseLab1,
        lacrosseLab2,
        lacrosseLab3,
        lacrosseLab4,
        lacrosseLab5
      ].filter(link => link.trim() !== '')

      const strategyData = {
        strategy_name: strategyName.trim(),
        description: description.trim(),
        lesson_category: gamePhase,
        strategy_categories: gamePhase, // Store game phase in both fields for consistency
        vimeo_link: videoUrl.trim() || null,
        lacrosse_lab_links: lacrosseLabLinks.length > 0 ? lacrosseLabLinks : null,
        target_audience: targetAudience.trim() || null,
        see_it_ages: seeItAges.trim() || null,
        coach_it_ages: coachItAges.trim() || null,
        own_it_ages: ownItAges.trim() || null,
        has_pdf: false, // Keep existing or default to false
        team_share: teamShare ? teamShareIds : [],  // Use preserved IDs or empty array
        club_share: clubShare ? clubShareIds : [],  // Use preserved IDs or empty array
        is_public: isPublic
      }

      // Extract strategy ID (remove 'user-' prefix if it exists)
      const strategyId = strategy.id.toString().replace('user-', '')
      await updateUserStrategy(strategyId, strategyData)

      // Call success callbacks
      if (onStrategyUpdated) {
        onStrategyUpdated()
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      toast.success('Strategy updated successfully!')
      
      // Close modal if no callback closes it
      if (!onSuccess) {
        onClose()
      }
    } catch (error) {
      console.error('Error updating strategy:', error)
      toast.error('Failed to update strategy')
    }
  }

  const resetForm = () => {
    setStrategyName('')
    setDescription('')
    setGamePhase('')
    setVideoUrl('')
    setLacrosseLab1('')
    setLacrosseLab2('')
    setLacrosseLab3('')
    setLacrosseLab4('')
    setLacrosseLab5('')
    setTargetAudience('')
    setSeeItAges('')
    setCoachItAges('')
    setOwnItAges('')
    setTeamShare(false)
    setClubShare(false)
    setIsPublic(false)
    setTeamShareIds([])
    setClubShareIds([])
  }

  const handleClose = () => {
    // Don't reset form when closing edit modal - keep values in case user reopens
    onClose()
  }

  // Don't show modal if no strategy or not a user strategy
  if (!strategy || strategy.source !== 'user' || strategy.user_id !== user?.id) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white">
          <DialogTitle className="text-[#003366]">Edit Custom Strategy</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your custom strategy details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 bg-white" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Strategy Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategy Name *
              </label>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                placeholder="e.g., Triangle Offense, Man-Down Clear"
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300 resize-none"
                placeholder="Describe the strategy, key points, execution details, and when to use it..."
                required
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {/* Game Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Phase *
              </label>
              <select
                value={gamePhase}
                onChange={(e) => setGamePhase(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                required
              >
                <option value="">Select a game phase...</option>
                {GAME_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                placeholder="https://vimeo.com/123456789 or https://youtube.com/..."
              />
              <div className="text-xs text-gray-500 mt-1">
                Optional: Add a video URL to demonstrate this strategy
              </div>
            </div>

            {/* Lacrosse Lab Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lacrosse Lab Links
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={lacrosseLab1}
                  onChange={(e) => setLacrosseLab1(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="Lacrosse Lab Link #1"
                />
                <input
                  type="url"
                  value={lacrosseLab2}
                  onChange={(e) => setLacrosseLab2(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="Lacrosse Lab Link #2"
                />
                <input
                  type="url"
                  value={lacrosseLab3}
                  onChange={(e) => setLacrosseLab3(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="Lacrosse Lab Link #3"
                />
                <input
                  type="url"
                  value={lacrosseLab4}
                  onChange={(e) => setLacrosseLab4(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="Lacrosse Lab Link #4"
                />
                <input
                  type="url"
                  value={lacrosseLab5}
                  onChange={(e) => setLacrosseLab5(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="Lacrosse Lab Link #5"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Optional: Add up to 5 Lacrosse Lab links for this strategy
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                placeholder="e.g., Beginner, Intermediate, Advanced, High School, Youth"
                maxLength={100}
              />
            </div>

            {/* Age Progressions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  See It Ages
                </label>
                <input
                  type="text"
                  value={seeItAges}
                  onChange={(e) => setSeeItAges(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="e.g., 8-10, 10-12"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coach It Ages
                </label>
                <input
                  type="text"
                  value={coachItAges}
                  onChange={(e) => setCoachItAges(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="e.g., 10-12, 12-14"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Own It Ages
                </label>
                <input
                  type="text"
                  value={ownItAges}
                  onChange={(e) => setOwnItAges(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-powlax-blue border-gray-300"
                  placeholder="e.g., 12-14, 14+"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Sharing Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sharing Settings
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={teamShare}
                    onChange={(e) => setTeamShare(e.target.checked)}
                    className="rounded border-gray-300 text-powlax-blue focus:ring-powlax-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Share with my teams</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clubShare}
                    onChange={(e) => setClubShare(e.target.checked)}
                    className="rounded border-gray-300 text-powlax-blue focus:ring-powlax-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Share with my clubs</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-powlax-blue focus:ring-powlax-blue"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make public (visible to all POWLAX users)</span>
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                You can change sharing settings anytime
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={updating}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            disabled={updating || !strategyName.trim() || !description.trim() || !gamePhase}
            className="bg-powlax-blue hover:bg-powlax-blue/90 text-white"
          >
            {updating ? 'Updating...' : 'Update Strategy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}