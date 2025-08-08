'use client'

import { useState } from 'react'
import { BookOpen, Clock, Target, Users, ChevronRight, X } from 'lucide-react'
import dynamic from 'next/dynamic'
const motion = dynamic(() => import('framer-motion').then(m => ({ default: m.motion })), { ssr: false })
const AnimatePresence = dynamic(() => import('framer-motion').then(m => ({ default: m.AnimatePresence })), { ssr: false })
import { practiceTemplates, PracticeTemplate } from '@/data/practice-templates'
import { Button } from '@/components/ui/button'

interface PracticeTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: PracticeTemplate) => void
}

export default function PracticeTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate
}: PracticeTemplateSelectorProps) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'8-10' | '11-14' | '15-18' | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PracticeTemplate | null>(null)

  const ageGroups = [
    { value: '8-10', label: '8-10 Years', description: 'Fun fundamentals and basic skills', color: 'bg-green-100 text-green-800' },
    { value: '11-14', label: '11-14 Years', description: 'Skill development and team play', color: 'bg-blue-100 text-blue-800' },
    { value: '15-18', label: '15-18 Years', description: 'Advanced tactics and conditioning', color: 'bg-purple-100 text-purple-800' }
  ] as const

  const handleTemplateSelect = (template: PracticeTemplate) => {
    onSelectTemplate(template)
    onClose()
    setSelectedAgeGroup(null)
    setSelectedTemplate(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Practice Plan Templates</h2>
            <p className="text-gray-600 mt-1">Choose from age-appropriate practice structures</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Age Group Selection */}
          {!selectedAgeGroup && (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4">Select Age Group</h3>
              <div className="grid gap-4">
                {ageGroups.map((group) => (
                  <button
                    key={group.value}
                    onClick={() => setSelectedAgeGroup(group.value)}
                    className="text-left p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${group.color}`}>
                            {group.label}
                          </span>
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600">{group.description}</p>
                        <div className="mt-3 text-sm text-gray-500">
                          {practiceTemplates.filter(t => t.ageGroup === group.value).length} templates available
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Template Selection */}
          {selectedAgeGroup && !selectedTemplate && (
            <div className="flex-1 p-6 border-l overflow-y-auto">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setSelectedAgeGroup(null)}
                  className="mr-3 p-1 text-gray-400 hover:text-gray-600"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold">
                  Templates for Ages {selectedAgeGroup}
                </h3>
              </div>

              <div className="space-y-4">
                {practiceTemplates
                  .filter(template => template.ageGroup === selectedAgeGroup)
                  .map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{template.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{template.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{template.timeSlots.length} activities</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{template.focus.length} focus areas</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {template.focus.slice(0, 3).map((focus) => (
                          <span
                            key={focus}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {focus}
                          </span>
                        ))}
                        {template.focus.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                            +{template.focus.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="flex-1 p-6 border-l overflow-y-auto">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="mr-3 p-1 text-gray-400 hover:text-gray-600"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              </div>

              <div className="space-y-6">
                {/* Template Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">{selectedTemplate.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Duration:</span>{' '}
                      <span className="text-gray-600">{selectedTemplate.duration} minutes</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Difficulty:</span>{' '}
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                        {selectedTemplate.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Practice Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Practice Timeline</h4>
                  <div className="space-y-3">
                    {selectedTemplate.timeSlots.map((slot, index) => (
                      <div key={slot.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0 w-12 h-8 bg-blue-100 rounded flex items-center justify-center text-sm font-medium text-blue-800">
                          {slot.duration}m
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{slot.drills[0]?.name}</h5>
                          <p className="text-sm text-gray-600">{slot.drills[0]?.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coaching Tips */}
                {selectedTemplate.coachingTips.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Coaching Tips</h4>
                    <ul className="space-y-2">
                      {selectedTemplate.coachingTips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Use Template Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => handleTemplateSelect(selectedTemplate)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}