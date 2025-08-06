'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Star, ChevronDown, ChevronRight, X, Video, Link, Edit3, Beaker } from 'lucide-react'
import { useDrills } from '@/hooks/useDrills'
import AddCustomDrillModal from './AddCustomDrillModal'
import FilterDrillsModal from './FilterDrillsModal'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal from './modals/LacrosseLabModal'

interface Drill {
  id: string
  name: string
  duration: number
  category: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  isFavorite?: boolean
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
}

interface DrillLibraryProps {
  onAddDrill: (drill: Drill) => void
  selectedStrategies?: string[]
}

const categories = [
  { id: 'admin', name: 'Admin' },
  { id: 'skill', name: 'Skill Drills' },
  { id: '1v1', name: '1v1 Drills' },
  { id: 'concept', name: 'Concept Drills' },
]

export default function DrillLibrary({ onAddDrill, selectedStrategies: parentSelectedStrategies = [] }: DrillLibraryProps) {
  const { drills: supabaseDrills, loading, error } = useDrills()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['skill'])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showAddDrillModal, setShowAddDrillModal] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Modal states for individual drills
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [showLacrosseLabModal, setShowLacrosseLabModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
  
  // Filter state
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedGamePhase, setSelectedGamePhase] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<{ min: number; max: number } | null>(null)
  const [strategyFilterActive, setStrategyFilterActive] = useState(false)

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId))
    } else {
      setExpandedCategories([...expandedCategories, categoryId])
    }
  }

  const toggleFavorite = (drillId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (favorites.includes(drillId)) {
      setFavorites(favorites.filter(id => id !== drillId))
    } else {
      setFavorites([...favorites, drillId])
    }
  }

  // Filter drills based on all criteria
  const filteredDrills = useMemo(() => {
    return supabaseDrills.filter(drill => {
      // Search term filter
      const matchesSearch = drill.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      const matchesCategory = !selectedCategory || drill.category === selectedCategory
      
      // Strategy filter
      const matchesStrategies = selectedStrategies.length === 0 || 
        (drill.strategies && drill.strategies.some(s => selectedStrategies.includes(s)))
      
      // Skills filter
      const matchesSkills = selectedSkills.length === 0 ||
        (drill.skills && drill.skills.some(s => selectedSkills.includes(s)))
      
      // Duration filter
      const matchesDuration = !selectedDuration ||
        (drill.duration >= selectedDuration.min && drill.duration <= selectedDuration.max)
      
      return matchesSearch && matchesCategory && matchesStrategies && matchesSkills && matchesDuration
    })
  }, [supabaseDrills, searchTerm, selectedCategory, selectedStrategies, selectedSkills, selectedDuration])

  const getDrillsByCategory = (categoryId: string) => {
    return filteredDrills.filter(drill => drill.category === categoryId)
  }

  const handleAddCustomDrill = (drill: Drill) => {
    onAddDrill(drill)
    setShowAddDrillModal(false)
  }

  const openVideoModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowVideoModal(true)
  }

  const openLinksModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowLinksModal(true)
  }

  const openStrategiesModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowStrategiesModal(true)
  }

  const openLacrosseLabModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowLacrosseLabModal(true)
  }

  const clearFilters = () => {
    setSelectedStrategies([])
    setSelectedSkills([])
    setSelectedGamePhase(null)
    setSelectedDuration(null)
    setSearchTerm('')
  }

  const activeFilterCount = 
    selectedStrategies.length + 
    selectedSkills.length + 
    (selectedGamePhase ? 1 : 0) + 
    (selectedDuration ? 1 : 0)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drills...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading drills</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Drill Library</h2>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded flex items-center text-sm relative"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter Drills
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Strategy Filter Toggle */}
        {parentSelectedStrategies.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-blue-700">
                Show only strategy-relevant drills
              </span>
              <input
                type="checkbox"
                checked={strategyFilterActive}
                onChange={(e) => setStrategyFilterActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </label>
            {strategyFilterActive && (
              <p className="text-xs text-blue-600 mt-1">
                Filtering for strategy-focused drills
              </p>
            )}
          </div>
        )}
        
        <button 
          onClick={() => setShowAddDrillModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Drill
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search drills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-2 text-sm text-gray-600">
          Total drills: {filteredDrills.length} of {supabaseDrills.length}
        </div>
        
        {categories.map(category => {
          const categoryDrills = getDrillsByCategory(category.id)
          const isExpanded = expandedCategories.includes(category.id)
          
          return (
            <div key={category.id} className="border-b">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                  )}
                  <span className="font-medium">{category.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({categoryDrills.length})</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="bg-gray-50">
                  {categoryDrills.length === 0 ? (
                    <p className="px-6 py-3 text-sm text-gray-500">No drills found</p>
                  ) : (
                    categoryDrills.map(drill => (
                      <div
                        key={drill.id}
                        className="px-4 sm:px-6 py-3 border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{drill.name}</h4>
                            {(drill.strategies && drill.strategies.length > 0) && (
                              <p className="text-xs sm:text-sm text-blue-600 mt-0.5 line-clamp-1">
                                {drill.strategies.map(s => `#${s}`).join(' ')}
                              </p>
                            )}
                            
                            {/* Icon row for modals */}
                            <div className="flex items-center gap-0.5 mt-2">
                              <button
                                onClick={(e) => openVideoModal(drill, e)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  drill.videoUrl 
                                    ? 'hover:bg-blue-50 hover:scale-110' 
                                    : 'opacity-30 cursor-not-allowed'
                                }`}
                                title="View Video"
                                disabled={!drill.videoUrl}
                              >
                                <img 
                                  src="https://powlax.com/wp-content/uploads/2025/06/Video-1.svg" 
                                  alt="Video" 
                                  className="h-4 w-4"
                                />
                              </button>

                              <button
                                onClick={(e) => openLacrosseLabModal(drill, e)}
                                className="p-1.5 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all"
                                title="Lacrosse Lab Diagrams"
                              >
                                <img 
                                  src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                                  alt="Lacrosse Lab" 
                                  className="h-4 w-4"
                                />
                              </button>

                              <button
                                onClick={(e) => openLinksModal(drill, e)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all"
                                title="External Links"
                              >
                                <Link className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={(e) => openStrategiesModal(drill, e)}
                                className="px-1.5 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all"
                                title="Strategies & Concepts"
                              >
                                <span className="text-xs font-bold">X/O</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{drill.duration}m</span>
                            <button
                              onClick={(e) => toggleFavorite(drill.id, e)}
                              className={`p-1 rounded-lg transition-all hover:scale-110 ${
                                favorites.includes(drill.id)
                                  ? 'text-yellow-500 hover:text-yellow-600'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label={favorites.includes(drill.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  favorites.includes(drill.id) ? 'fill-current' : ''
                                }`}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddDrill(drill)
                              }}
                              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                              aria-label="Add drill to practice"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {showFilterModal && (
        <FilterDrillsModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          drills={supabaseDrills}
          selectedStrategies={selectedStrategies}
          setSelectedStrategies={setSelectedStrategies}
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          selectedGamePhase={selectedGamePhase}
          setSelectedGamePhase={setSelectedGamePhase}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}

      {showAddDrillModal && (
        <AddCustomDrillModal
          isOpen={showAddDrillModal}
          onClose={() => setShowAddDrillModal(false)}
          onAdd={handleAddCustomDrill}
        />
      )}

      {/* Individual drill modals */}
      {selectedDrill && (
        <>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => {
              setShowVideoModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <LinksModal
            isOpen={showLinksModal}
            onClose={() => {
              setShowLinksModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <StrategiesModal
            isOpen={showStrategiesModal}
            onClose={() => {
              setShowStrategiesModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <LacrosseLabModal
            isOpen={showLacrosseLabModal}
            onClose={() => {
              setShowLacrosseLabModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />
        </>
      )}
    </div>
  )
}