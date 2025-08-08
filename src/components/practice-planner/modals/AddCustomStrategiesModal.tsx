'use client'

import { useState } from 'react'
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

interface AddCustomStrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  onStrategyCreated?: () => void
}

export default function AddCustomStrategiesModal({ 
  isOpen, 
  onClose, 
  onStrategyCreated 
}: AddCustomStrategiesModalProps) {
  const { createUserStrategy, loading: creating } = useUserStrategies()
  
  // Form state
  const [strategyName, setStrategyName] = useState('')
  const [description, setDescription] = useState('')
  const [gamePhase, setGamePhase] = useState('')
  const [teamShare, setTeamShare] = useState(false)
  const [clubShare, setClubShare] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
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
      const strategyData = {
        strategy_name: strategyName.trim(),
        description: description.trim(),
        lesson_category: gamePhase,
        strategy_categories: gamePhase, // Store game phase in both fields for consistency
        team_share: teamShare,
        club_share: clubShare,
        is_public: isPublic
      }

      await createUserStrategy(strategyData)

      // Reset form
      setStrategyName('')
      setDescription('')
      setGamePhase('')
      setTeamShare(false)
      setClubShare(false)
      setIsPublic(false)
      
      // Close modal and trigger refresh
      onClose()
      
      if (onStrategyCreated) {
        onStrategyCreated()
      }
      
      toast.success('Custom strategy created successfully!')
    } catch (error) {
      console.error('Error creating custom strategy:', error)
      toast.error('Failed to create custom strategy')
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setStrategyName('')
    setDescription('')
    setGamePhase('')
    setTeamShare(false)
    setClubShare(false)
    setIsPublic(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-powlax-blue">Add Custom Strategy</DialogTitle>
          <DialogDescription>
            Create a custom strategy for your team and practice plans
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
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
                You can change sharing settings later
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={creating}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSubmit()} 
            disabled={creating || !strategyName.trim() || !description.trim() || !gamePhase}
            className="bg-powlax-blue hover:bg-powlax-blue/90 text-white"
          >
            {creating ? 'Creating...' : 'Create Strategy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}