'use client'

import { useState } from 'react'
import { Edit, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SetupTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (notes: string[]) => void
  defaultNotes?: string[]
  setupTime?: number
}

export default function SetupTimeModal({
  isOpen,
  onClose,
  onSave,
  defaultNotes = [],
  setupTime = 15
}: SetupTimeModalProps) {
  const [notes, setNotes] = useState(defaultNotes.join('\n'))

  const handleSave = () => {
    // Convert textarea content to array of notes (each line becomes a note)
    const notesArray = notes
      .split('\n')
      .map(note => note.trim())
      .filter(note => note.length > 0)
    
    onSave(notesArray)
    onClose()
  }

  const handleClose = () => {
    // Reset to default when closing without saving
    setNotes(defaultNotes.join('\n'))
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003366]">
            <Clock className="h-5 w-5" />
            Setup Time Notes ({setupTime} minutes)
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Add notes for what needs to be done during setup time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#003366] mb-2">
              Setup Tasks (one per line)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md bg-white text-[#003366] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-none"
              placeholder="Set up goals 30 yards apart
Have teams chosen
Players line up bags and zip them
Check field conditions
Set up cones for drill stations"
            />
            <p className="text-xs text-gray-500 mt-1">
              Each line will become a bullet point in your practice plan
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#003366] hover:bg-[#003366]/90 text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}