'use client'

import { useState, useMemo } from 'react'
import { X, Plus, Search, ChevronDown, ChevronRight, Play, User, Star, Filter } from 'lucide-react'
import { useDrills } from '@/hooks/useDrills'
import { useFavorites } from '@/hooks/useFavorites'
import StudyDrillModal from './modals/StudyDrillModal'

interface Drill {
  id: string
  name: string
  duration: number
  category: string
  drill_types?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  notes?: string
  coach_instructions?: string
  custom_url?: string
  lab_urls?: string[] | string
  lacrosse_lab_urls?: string[]
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  source?: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
}

interface ParallelDrillPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (drill: Drill) => void
  existingDrills: any[]
}

export default function ParallelDrillPicker({
  isOpen,
  onClose,
  onSelect,
  existingDrills
}: ParallelDrillPickerProps) {
  const { drills: allDrills, loading } = useDrills()
  const { isFavorite } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorites'])
  const [showStudyDrillModal, setShowStudyDrillModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)

  // Filter out drills that are already in this time slot
  const existingDrillIds = existingDrills.map(d => d.id.split('-')[0]) // Handle timestamped IDs
  const availableDrills = allDrills.filter(drill => 
    !existingDrillIds.includes(drill.id)
  )

  // Get unique drill categories from drills
  const drillCategories = useMemo(() => {
    const categories = new Set<string>()
    availableDrills.forEach(drill => {
      if (drill.category) {
        categories.add(drill.category)
      }
    })
    return Array.from(categories).sort()
  }, [availableDrills])

  // Organize drills by category (same structure as DrillLibraryTabbed)
  const drillsByCategory = useMemo(() => {
    const organized: Record<string, Drill[]> = {
      'Favorites': [],
      'Custom Drills': []
    }
    
    // Add all drill categories
    drillCategories.forEach(category => {
      organized[category] = []
    })
    
    // Organize drills
    availableDrills.forEach(drill => {
      // Check if it's a favorite
      if (isFavorite(drill.id)) {
        organized['Favorites'].push(drill)
      }
      
      // Check if it's a custom drill
      if (drill.source === 'user') {
        organized['Custom Drills'].push(drill)
      }
      
      // Add to category
      if (drill.category && organized[drill.category]) {
        organized[drill.category].push(drill)
      }
    })
    
    return organized
  }, [availableDrills, drillCategories, isFavorite])

  // Filter drills based on search
  const filteredDrillsByCategory = useMemo(() => {
    const filtered: Record<string, Drill[]> = {}
    
    Object.entries(drillsByCategory).forEach(([category, drills]) => {
      filtered[category] = drills.filter(drill => {
        return drill.name.toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
    
    return filtered
  }, [drillsByCategory, searchTerm])

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const handleSelect = (drill: Drill) => {
    const newDrill = {
      ...drill,
      id: `${drill.id}-${Date.now()}` // Add timestamp to make unique
    }
    onSelect(newDrill)
  }

  const renderDrillCard = (drill: Drill) => (
    <div
      key={drill.id}
      className="p-3 bg-white border rounded-lg hover:bg-gray-50 mb-2"
    >
      <div className="flex flex-col gap-2">
        {/* Title row with Plus button on left */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelect(drill)}
            className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
            title="Add to Parallel Activity"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
          <h4 className="font-medium text-sm flex-1">{drill.name}</h4>
          {isFavorite(drill.id) && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>
        
        {/* Duration and Study button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{drill.duration} min</span>
            {drill.source === 'user' && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                <User className="h-3 w-3" />
                Custom
              </span>
            )}
          </div>
          
          {/* Study button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedDrill(drill)
              setShowStudyDrillModal(true)
            }}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <Play className="h-3 w-3" fill="white" />
            Study
          </button>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <>
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

          {/* Drills List with Categories */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show categories with drills */}
                {Object.entries(filteredDrillsByCategory).map(([category, drills]) => {
                  if (drills.length === 0) return null
                  
                  const isExpanded = expandedCategories.includes(category)
                  
                  return (
                    <div key={category} className="border rounded-lg">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <h3 className="font-medium text-gray-900">{category}</h3>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {drills.length}
                        </span>
                      </button>
                      
                      {/* Category Content */}
                      {isExpanded && (
                        <div className="p-4 border-t bg-gray-50">
                          <div className="space-y-2">
                            {drills.map(drill => renderDrillCard(drill))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {Object.values(filteredDrillsByCategory).every(drills => drills.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No drills found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
            <p>💡 Tip: Use parallel activities for station work or when splitting the team into groups</p>
          </div>
        </div>
      </div>

      {/* Study Drill Modal */}
      {showStudyDrillModal && selectedDrill && (
        <StudyDrillModal
          isOpen={showStudyDrillModal}
          onClose={() => setShowStudyDrillModal(false)}
          drill={selectedDrill}
          onUpdateDrill={() => {}} // No updates needed in this context
        />
      )}
    </>
  )
}