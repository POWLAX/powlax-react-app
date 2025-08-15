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
import { useUserStrategies } from '@/hooks/useUserStrategies'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'
import { GAME_PHASES } from '@/hooks/useStrategies'

interface AddCustomStrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd?: (strategy: any) => void
  onStrategyCreated?: () => void
  editStrategy?: any // If provided, we're in edit mode
  onStrategyUpdated?: () => void
}

export default function AddCustomStrategiesModal({ 
  isOpen, 
  onClose, 
  onAdd,
  onStrategyCreated,
  editStrategy,
  onStrategyUpdated 
}: AddCustomStrategiesModalProps) {
  const { createUserStrategy, updateUserStrategy, loading: creating } = useUserStrategies()
  const { user } = useAuth()
  const isEditMode = !!editStrategy
  
  // Form state - essential fields matching the drill modal pattern
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

  // Pre-populate fields when editing
  useEffect(() => {
    if (editStrategy) {
      setStrategyName(editStrategy.strategy_name || editStrategy.name || '')
      setDescription(editStrategy.description || '')
      setGamePhase(editStrategy.game_phase || '')
      setVideoUrl(editStrategy.video_url || '')
      setLacrosseLab1(editStrategy.drill_lab_url_1 || '')
      setLacrosseLab2(editStrategy.drill_lab_url_2 || '')
      setLacrosseLab3(editStrategy.drill_lab_url_3 || '')
      setLacrosseLab4(editStrategy.drill_lab_url_4 || '')
      setLacrosseLab5(editStrategy.drill_lab_url_5 || '')
      setTargetAudience(editStrategy.target_audience || '')
      setSeeItAges(editStrategy.see_it_ages || '')
      setCoachItAges(editStrategy.coach_it_ages || '')
      setOwnItAges(editStrategy.own_it_ages || '')
    }
  }, [editStrategy])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!strategyName.trim()) {
      toast.error('Please enter a strategy name')
      return
    }

    if (!gamePhase) {
      toast.error('Please select a game phase')
      return
    }

    if (!user) {
      toast.error('You must be logged in to create custom strategies')
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

      // Create strategy data following the same pattern as Custom Drill fix
      // Store essential fields and put detailed info in structured format for content field
      const strategyData = {
        user_id: user.id,
        strategy_name: strategyName.trim(),
        description: description.trim() || `Custom strategy: ${strategyName.trim()}`,
        lesson_category: gamePhase,
        vimeo_link: videoUrl.trim() || null,
        lacrosse_lab_links: lacrosseLabLinks.length > 0 ? lacrosseLabLinks : null,
        target_audience: targetAudience.trim() || null,
        see_it_ages: seeItAges.trim() || null,
        coach_it_ages: coachItAges.trim() || null,
        own_it_ages: ownItAges.trim() || null,
        is_public: false, // Default to private
        team_share: [],
        club_share: []
      }

      let resultStrategy
      
      if (isEditMode && editStrategy?.id) {
        // Update existing strategy
        resultStrategy = await updateUserStrategy(editStrategy.id, strategyData)
        
        // Call update callback
        if (onStrategyUpdated) {
          onStrategyUpdated()
        }
        
        toast.success('Strategy updated successfully!')
      } else {
        // Create new strategy
        resultStrategy = await createUserStrategy(strategyData)
        
        // Also add to practice planner immediately if onAdd is provided (only for new strategies)
        if (onAdd && resultStrategy) {
          const practiceReadyStrategy = {
            id: `user-${resultStrategy.id}`,
            strategy_name: strategyName.trim(),
            description: description.trim(),
            lesson_category: gamePhase,
            strategy_categories: gamePhase,
            vimeo_link: videoUrl.trim() || undefined,
            lacrosse_lab_links: lacrosseLabLinks.length > 0 ? lacrosseLabLinks : undefined,
            target_audience: targetAudience || undefined,
            see_it_ages: seeItAges || undefined,
            coach_it_ages: coachItAges || undefined,
            own_it_ages: ownItAges || undefined,
            source: 'user' as const
          }
          onAdd(practiceReadyStrategy)
        }

        // Call the created callback if provided
        if (onStrategyCreated) {
          onStrategyCreated()
        }

        toast.success('Custom strategy created successfully!')
      }
      
      // Reset form
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating strategy:', error)
      toast.error('Failed to create custom strategy. Please try again.')
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#003366]">
            {isEditMode ? 'Edit Strategy' : 'Add Custom Strategy'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the strategy details' : 'Create a custom strategy with essential details'}
          </DialogDescription>
        </DialogHeader>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2-3-1 Motion Offense"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the strategy..."
              rows={3}
            />
          </div>

          {/* Game Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Phase *
            </label>
            <select
              value={gamePhase}
              onChange={(e) => setGamePhase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={lacrosseLab1}
                onChange={(e) => setLacrosseLab1(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #1"
              />
              <input
                type="url"
                value={lacrosseLab2}
                onChange={(e) => setLacrosseLab2(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #2"
              />
              <input
                type="url"
                value={lacrosseLab3}
                onChange={(e) => setLacrosseLab3(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #3"
              />
              <input
                type="url"
                value={lacrosseLab4}
                onChange={(e) => setLacrosseLab4(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lacrosse Lab URL #4"
              />
              <input
                type="url"
                value={lacrosseLab5}
                onChange={(e) => setLacrosseLab5(e.target.value)}
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
                  value={seeItAges}
                  onChange={(e) => setSeeItAges(e.target.value)}
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

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Attackmen, Midfielders"
            />
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
              {creating ? (isEditMode ? 'Updating...' : 'Adding Strategy...') : (isEditMode ? 'Update Strategy' : 'Add Strategy')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}