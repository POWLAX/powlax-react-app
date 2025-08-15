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
import { useLocalStorageContext } from '@/contexts/LocalStorageContext'
import { toast } from 'sonner'

interface SavePracticeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, notes?: string) => Promise<void>
  defaultTitle?: string
  defaultNotes?: string
  isUpdate?: boolean
  // Practice plan data for local storage
  practiceData?: {
    date: string
    startTime: string
    duration: number
    field: string
    drills: any[]
    strategies: any[]
    setupTime?: number
    setupNotes?: string[]
  }
}

export default function SavePracticeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultTitle = '', 
  defaultNotes = '',
  isUpdate = false,
  practiceData
}: SavePracticeModalProps) {
  const { savePracticePlan } = useLocalStorageContext()
  const [title, setTitle] = useState(defaultTitle)
  const [notes, setNotes] = useState(defaultNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveLocally, setSaveLocally] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a practice plan title')
      return
    }

    setError('')
    setSaving(true)

    try {
      if (saveLocally && practiceData) {
        // Save to local storage
        const localPracticePlan = {
          name: title.trim(),
          notes: notes.trim() || '',
          ...practiceData,
          isLocal: true,
          createdAt: new Date().toISOString()
        }
        savePracticePlan(localPracticePlan)
        toast.success('Practice plan saved locally!')
      } else {
        // Save to database
        await onSave(title.trim(), notes.trim())
      }
      
      onClose()
      // Reset form
      setTitle(defaultTitle)
      setNotes(defaultNotes)
      setSaveLocally(false)
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

          {/* Storage Option */}
          {practiceData && (
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveLocally}
                  onChange={(e) => setSaveLocally(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">
                  💾 Save locally only (no account sync, but works offline)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Local practice plans are saved in your browser and won&apos;t sync across devices.
              </p>
            </div>
          )}

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