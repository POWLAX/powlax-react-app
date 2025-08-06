'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SaveWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, notes?: string) => Promise<void>
  defaultName?: string
}

export default function SaveWorkoutModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = 'My Custom Workout' 
}: SaveWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState(defaultName)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!workoutName.trim()) {
      setError('Please enter a workout name')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave(workoutName.trim(), notes.trim() || undefined)
      // Reset form
      setWorkoutName(defaultName)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Save Custom Workout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="workout-name" className="block text-sm font-medium text-gray-700 mb-1">
              Workout Name *
            </label>
            <input
              id="workout-name"
              type="text"
              value={workoutName}
              onChange={(e) => {
                setWorkoutName(e.target.value)
                setError('')
              }}
              placeholder="Enter workout name..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="workout-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or instructions for this workout..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </div>
    </div>
  )
}