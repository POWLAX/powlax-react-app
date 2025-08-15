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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from 'lucide-react'

interface SavePracticeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, notes?: string) => Promise<void>
  defaultTitle?: string
  defaultNotes?: string
  isUpdate?: boolean
}

export default function SavePracticeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultTitle = '',
  defaultNotes = '',
  isUpdate = false
}: SavePracticeModalProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [notes, setNotes] = useState(defaultNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a practice plan title')
      return
    }

    setError('')
    setSaving(true)

    try {
      await onSave(title.trim(), notes.trim())
      onClose()
    } catch (err) {
      setError('Failed to save practice plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {isUpdate ? 'Update Practice Plan' : 'Save Practice Plan'}
          </DialogTitle>
          <DialogDescription>
            Give your practice plan a name and optional notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              Practice Plan Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., U12 Team Practice - Ground Balls Focus"
              className={error && !title.trim() ? 'border-red-500' : ''}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this practice..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bg-[#003366] text-white hover:bg-[#002244]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isUpdate ? 'Update' : 'Save'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}