'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Star, ChevronDown, ChevronRight, X, Video, Link, Edit3, Beaker, User } from 'lucide-react'
import { useDrills } from '@/hooks/useDrills'
import { useFavorites } from '@/hooks/useFavorites'
import AddCustomDrillModal from './AddCustomDrillModal'
import FilterDrillsModal from './FilterDrillsModal'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'
import AddCustomStrategiesModal from './modals/AddCustomStrategiesModal'

interface Drill {
  id: string
  title: string
  duration_minutes: number
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
  source?: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
}

interface DrillLibraryProps {
  onAddDrill: (drill: Drill) => void
}

const categories = [
  { id: 'admin', name: 'Admin' },
  { id: 'skill', name: 'Skill Drills' },
  { id: '1v1', name: '1v1 Drills' },
  { id: 'concept', name: 'Concept Drills' },
]

export default function DrillLibrary({ onAddDrill }: DrillLibraryProps) {
  const { drills: supabaseDrills, loading, error, refreshDrills } = useDrills()
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['skill'])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showAddDrillModal, setShowAddDrillModal] = useState(false)
  const [showAddStrategiesModal, setShowAddStrategiesModal] = useState(false)
  // Removed local favorites state - now using useFavorites hook
  
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
  const [selectedGameStates, setSelectedGameStates] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId))
    } else {
      setExpandedCategories([...expandedCategories, categoryId])
    }
  }

  const handleToggleFavorite = async (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(drill.id, drill)
  }

  // Filter drills based on all criteria
  const filteredDrills = useMemo(() => {
    return supabaseDrills.filter(drill => {
      // Search term filter
      const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase())
      
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
        (drill.duration_minutes >= selectedDuration.min && drill.duration_minutes <= selectedDuration.max)
      
      // Game states filter
      const matchesGameStates = selectedGameStates.length === 0 ||
        (drill.game_states && 
         selectedGameStates.some(state => {
           const drillStates = typeof drill.game_states === 'string' 
             ? drill.game_states.split(',').map(s => s.trim())
             : Array.isArray(drill.game_states) 
               ? drill.game_states 
               : []
           return drillStates.includes(state)
         }))
      
      return matchesSearch && matchesCategory && matchesStrategies && matchesSkills && matchesDuration && matchesGameStates
    })
  }, [supabaseDrills, searchTerm, selectedCategory, selectedStrategies, selectedSkills, selectedDuration, selectedGameStates])

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
    setSelectedGameStates([])
    setSearchTerm('')
  }

  const activeFilterCount = 
    selectedStrategies.length + 
    selectedSkills.length + 
    (selectedGamePhase ? 1 : 0) + 
    (selectedDuration ? 1 : 0) +
    selectedGameStates.length

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
      <div className="p-4 field-border-strong border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold field-text">Drill Library</h2>
          <button
            onClick={() => setShowFilterModal(true)}
            className="touch-target bg-blue-600 text-white rounded-lg flex items-center text-sm relative font-semibold shadow-md hover:bg-blue-700 transition-colors"
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
        
        <button 
          onClick={() => setShowAddDrillModal(true)}
          className="w-full touch-target bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center mb-2 font-semibold shadow-md transition-colors"
          data-testid="add-custom-drill-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Custom Drill
        </button>
        
        <button 
          onClick={() => setShowAddStrategiesModal(true)}
          className="w-full touch-target bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center font-semibold shadow-md transition-colors"
          data-testid="add-custom-strategy-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Custom Strategy
        </button>
      </div>

      {/* Search */}
      <div className="p-4 field-border-strong border-b">
        <input
          type="text"
          placeholder="Search drills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 field-border rounded-lg field-text bg-white font-medium text-base touch-target"
        />
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2 bg-blue-50 field-border-strong border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm field-text font-semibold">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearFilters}
              className="touch-target-sm text-sm text-blue-600 hover:text-blue-700 font-semibold rounded-md field-button"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-center py-2 text-sm field-text-secondary font-semibold">
          Total drills: {filteredDrills.length} of {supabaseDrills.length}
        </div>
        
        {categories.map(category => {
          const categoryDrills = getDrillsByCategory(category.id)
          const isExpanded = expandedCategories.includes(category.id)
          
          return (
            <div key={category.id} className="field-border-strong border-b">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full touch-target field-category flex items-center justify-between hover:bg-gray-100 rounded-none transition-colors"
                data-testid={`category-${category.id}`}
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 mr-3 field-text" />
                  ) : (
                    <ChevronRight className="h-5 w-5 mr-3 field-text" />
                  )}
                  <span className="font-bold text-base">{category.name}</span>
                  <span className="ml-2 text-sm field-text-secondary font-semibold">({categoryDrills.length})</span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="bg-gray-50">
                  {categoryDrills.length === 0 ? (
                    <p className="px-6 py-3 text-sm text-gray-500">No drills found</p>
                  ) : (
                    <div>
                      {categoryDrills.map((drill, index) => (
                        <div
                          key={drill.id}
                          className="px-6 py-3 border-t border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="field-drill-name text-base">{drill.title}</h4>
                              {drill.source === 'user' && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-green-600" />
                                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                    Custom
                                  </span>
                                </div>
                              )}
                              {drill.source === 'powlax' && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  POWLAX
                                </span>
                              )}
                            </div>
                            {(drill.strategies && drill.strategies.length > 0) && (
                              <p className="text-sm text-blue-700 mt-1 font-semibold">
                                {drill.strategies.map(s => `#${s}`).join(' ')}
                              </p>
                            )}
                            
                            {/* Icon row for modals */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={(e) => openVideoModal(drill, e)}
                                className={`touch-target-sm rounded-lg transition-colors ${!drill.videoUrl ? 'opacity-40 bg-gray-50' : 'hover:bg-blue-50 field-button'}`}
                                title="View Video"
                                disabled={!drill.videoUrl}
                              >
                                <img 
                                  src="https://powlax.com/wp-content/uploads/2025/06/Video-1.svg" 
                                  alt="Video" 
                                  className="h-5 w-5"
                                />
                              </button>

                              {hasLabUrls(drill) && (
                                <button
                                  onClick={(e) => openLacrosseLabModal(drill, e)}
                                  className="touch-target-sm hover:bg-blue-50 field-button rounded-lg transition-colors"
                                  title="Lacrosse Lab Diagrams"
                                >
                                  <img 
                                    src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                                    alt="Lacrosse Lab" 
                                    className="h-5 w-5"
                                  />
                                </button>
                              )}

                              <button
                                onClick={(e) => openLinksModal(drill, e)}
                                className="touch-target-sm text-gray-600 hover:text-gray-900 hover:bg-green-50 field-button rounded-lg transition-colors"
                                title="External Links"
                              >
                                <Link className="h-5 w-5" />
                              </button>

                              <button
                                onClick={(e) => openStrategiesModal(drill, e)}
                                className="touch-target-sm text-gray-600 hover:text-gray-900 hover:bg-orange-50 field-button rounded-lg transition-colors"
                                title="Strategies & Concepts"
                              >
                                <span className="text-sm font-bold">X/O</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm field-text-secondary font-semibold">{drill.duration_minutes}m</span>
                            <button
                              onClick={(e) => handleToggleFavorite(drill, e)}
                              className={`touch-target-sm rounded-lg transition-colors ${
                                isFavorite(drill.id)
                                  ? 'text-yellow-500 bg-yellow-50 border-2 border-yellow-300'
                                  : 'text-gray-400 hover:text-gray-600 field-button'
                              }`}
                              disabled={favoritesLoading}
                              title="Toggle favorite"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  isFavorite(drill.id) ? 'fill-current' : ''
                                }`}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddDrill(drill)
                              }}
                              className="touch-target bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors"
                              data-testid={`add-drill-${drill.id}`}
                              title="Add to Practice"
                            >
                              <Plus className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                        </div>
                      ))}
                    </div>
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
          selectedGameStates={selectedGameStates}
          setSelectedGameStates={setSelectedGameStates}
        />
      )}

      {showAddDrillModal && (
        <AddCustomDrillModal
          isOpen={showAddDrillModal}
          onClose={() => setShowAddDrillModal(false)}
          onAdd={handleAddCustomDrill}
          onDrillCreated={refreshDrills}
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