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
import { toast } from 'sonner'

interface AddCustomDrillModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (drill: any) => void
  onDrillCreated?: () => void
}

export default function AddCustomDrillModal({ isOpen, onClose, onAdd, onDrillCreated }: AddCustomDrillModalProps) {
  const { createUserDrill, loading: creating } = useUserDrills()
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(10)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Please enter a drill name')
      return
    }

    try {
      // Create drill in database first
      const drillData = {
        title: name.trim(),
        drill_category: 'custom',
        drill_duration: `${duration} minutes`,
        drill_notes: notes,
        content: `Custom drill: ${notes}`
      }

      const createdDrill = await createUserDrill(drillData)

      // Also add to practice planner immediately
      const practiceReadyDrill = {
        id: `user-${createdDrill.id}`,
        name: name.trim(),
        duration,
        category: 'custom',
        notes,
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
      setName('')
      setDuration(10)
      setNotes('')
      onClose()
      
      toast.success('Custom drill created and added to practice!')
    } catch (error) {
      console.error('Error creating custom drill:', error)
      toast.error('Failed to create custom drill')
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setName('')
    setDuration(10)
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#003366] font-semibold">Add Custom Drill</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a simple custom drill for your practice plan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drill Name */}
          <div>
            <label className="block text-sm font-medium text-[#003366] mb-1">
              Drill Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
              placeholder="e.g., 3v2 Ground Ball to Clear"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#003366] mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] bg-white text-[#003366]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#003366] mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none bg-white text-[#003366]"
              placeholder="Any additional notes or instructions for this drill..."
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