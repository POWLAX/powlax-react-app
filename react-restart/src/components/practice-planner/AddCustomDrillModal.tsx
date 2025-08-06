'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
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

interface AddCustomDrillModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (drill: any) => void
}

export default function AddCustomDrillModal({ isOpen, onClose, onAdd }: AddCustomDrillModalProps) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(10)
  const [category, setCategory] = useState('skill')
  const [strategies, setStrategies] = useState<string[]>([])
  const [concepts, setConcepts] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // Input states for adding tags
  const [newStrategy, setNewStrategy] = useState('')
  const [newConcept, setNewConcept] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!name.trim()) {
      alert('Please enter a drill name')
      return
    }

    const customDrill = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      duration,
      category,
      strategies: strategies.filter(Boolean),
      concepts: concepts.filter(Boolean),
      skills: skills.filter(Boolean),
      notes,
      videoUrl: videoUrl.trim(),
      isCustom: true,
    }

    onAdd(customDrill)
    
    // Reset form
    setName('')
    setDuration(10)
    setCategory('skill')
    setStrategies([])
    setConcepts([])
    setSkills([])
    setNotes('')
    setVideoUrl('')
    onClose()
  }

  const addStrategy = () => {
    if (newStrategy.trim() && !strategies.includes(newStrategy.trim())) {
      setStrategies([...strategies, newStrategy.trim()])
      setNewStrategy('')
    }
  }

  const addConcept = () => {
    if (newConcept.trim() && !concepts.includes(newConcept.trim())) {
      setConcepts([...concepts, newConcept.trim()])
      setNewConcept('')
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeTag = (list: string[], setList: (list: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Add Custom Drill</DialogTitle>
          <DialogDescription>
            Create a custom drill for your practice plan
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drill Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drill Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3v2 Ground Ball to Clear"
                required
              />
            </div>

            {/* Duration and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="skill">Skill Drills</option>
                  <option value="1v1">1v1 Drills</option>
                  <option value="concept">Concept Drills</option>
                </select>
              </div>
            </div>

            {/* Strategies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategies
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrategy())}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ground Ball, Clearing"
                />
                <Button
                  type="button"
                  onClick={addStrategy}
                  size="sm"
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {strategies.map((strategy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                  >
                    #{strategy}
                    <button
                      type="button"
                      onClick={() => removeTag(strategies, setStrategies, index)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Concepts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concepts
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcept())}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Communication, Spacing"
                />
                <Button
                  type="button"
                  onClick={addConcept}
                  size="sm"
                  className="px-3 bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                  >
                    #{concept}
                    <button
                      type="button"
                      onClick={() => removeTag(concepts, setConcepts, index)}
                      className="hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Scooping, Passing, Dodging"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  className="px-3 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"
                  >
                    #{skill}
                    <button
                      type="button"
                      onClick={() => removeTag(skills, setSkills, index)}
                      className="hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL (optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://vimeo.com/..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Any additional notes or instructions for this drill..."
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit()}>
            Add Drill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}