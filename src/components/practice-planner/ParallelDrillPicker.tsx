'use client'

import { useState } from 'react'
import { X, Plus, Search } from 'lucide-react'
import { useDrills } from '@/hooks/useDrills'

interface ParallelDrillPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (drill: any) => void
  existingDrills: any[]
}

export default function ParallelDrillPicker({
  isOpen,
  onClose,
  onSelect,
  existingDrills
}: ParallelDrillPickerProps) {
  const { drills: allDrills, loading } = useDrills()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter out drills that are already in this time slot
  const existingDrillIds = existingDrills.map(d => d.id.split('-')[0]) // Handle timestamped IDs
  const availableDrills = allDrills.filter(drill => 
    !existingDrillIds.includes(drill.id)
  )

  const filteredDrills = availableDrills.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || drill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: 'admin', name: 'Admin' },
    { id: 'skill', name: 'Skill Drills' },
    { id: '1v1', name: '1v1 Drills' },
    { id: 'concept', name: 'Concept Drills' },
  ]

  const handleSelect = (drill: any) => {
    const newDrill = {
      ...drill,
      id: `${drill.id}-${Date.now()}` // Add timestamp to make unique
    }
    onSelect(newDrill)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Add Parallel Activity</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a drill to run at the same time (max 4 parallel activities)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 border-b overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Drills List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDrills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No drills found
            </div>
          ) : (
            <div className="divide-y">
              {filteredDrills.map(drill => (
                <div
                  key={drill.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(drill)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{drill.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{drill.duration} min</span>
                        {drill.strategies && drill.strategies.length > 0 && (
                          <span className="text-sm text-blue-600">
                            {drill.strategies.map(s => `#${s}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
          <p>💡 Tip: Use parallel activities for station work or when splitting the team into groups</p>
        </div>
      </div>
    </div>
  )
}