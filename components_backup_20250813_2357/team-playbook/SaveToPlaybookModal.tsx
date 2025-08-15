'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Plus, AlertCircle } from 'lucide-react'
import { Strategy } from '@/hooks/useStrategies'
import { useUserTeams, useTeamPlaybook } from '@/hooks/useTeamPlaybook'

interface SaveToPlaybookModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy | null
  onSuccess?: () => void
}

export default function SaveToPlaybookModal({ 
  isOpen, 
  onClose, 
  strategy, 
  onSuccess 
}: SaveToPlaybookModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [customName, setCustomName] = useState('')
  const [teamNotes, setTeamNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { teams, loading: teamsLoading } = useUserTeams()
  const { saveToPlaybook } = useTeamPlaybook()

  const handleSave = async () => {
    if (!strategy || !selectedTeamId) return

    try {
      setSaving(true)
      setError(null)

      const success = await saveToPlaybook({
        team_id: selectedTeamId,
        strategy_id: strategy.id.toString(),
        strategy_source: strategy.source,
        custom_name: customName || undefined,
        team_notes: teamNotes || undefined
      })

      if (success) {
        // Reset form
        setSelectedTeamId('')
        setCustomName('')
        setTeamNotes('')
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setSelectedTeamId('')
      setCustomName('')
      setTeamNotes('')
      setError(null)
      onClose()
    }
  }

  if (!strategy) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Save to Team Playbook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Strategy Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">
                {strategy.strategy_name}
              </h4>
              <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
                {strategy.strategy_categories || 'Strategy'}
              </Badge>
            </div>
            {strategy.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {strategy.description}
              </p>
            )}
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team-select" className="text-sm font-medium">
              Select Team *
            </Label>
            <Select 
              value={selectedTeamId} 
              onValueChange={setSelectedTeamId}
              disabled={teamsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  teamsLoading ? "Loading teams..." : "Choose a team"
                } />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
                {teams.length === 0 && !teamsLoading && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No teams found. Create a team first.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Name */}
          <div className="space-y-2">
            <Label htmlFor="custom-name" className="text-sm font-medium">
              Custom Name (Optional)
            </Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., 'Quick Strike Play'"
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Override the default strategy name for your team
            </p>
          </div>

          {/* Team Notes */}
          <div className="space-y-2">
            <Label htmlFor="team-notes" className="text-sm font-medium">
              Team Notes (Optional)
            </Label>
            <Textarea
              id="team-notes"
              value={teamNotes}
              onChange={(e) => setTeamNotes(e.target.value)}
              placeholder="Add notes specific to your team's execution..."
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Notes will be visible to all team members
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedTeamId || saving}
              className="flex-1 bg-powlax-blue hover:bg-powlax-blue/90"
            >
              {saving ? (
                <>
                  <Plus className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Playbook
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}