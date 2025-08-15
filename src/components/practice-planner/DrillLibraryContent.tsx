'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Star, ChevronDown, ChevronRight, Video, Link, Beaker, User, Search, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useDrills } from '@/hooks/useDrills'
import { useFavorites } from '@/hooks/useFavorites'
import AddCustomDrillModal from './modals/AddCustomDrillModal'
import FilterDrillsModal from './FilterDrillsModal'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'
import StudyDrillModal from './modals/StudyDrillModal'

// Using proper Supabase User type
interface User {
  id: string
  email: string
  full_name?: string
  wordpress_id?: number
  role: string
  roles: string[]
  avatar_url?: string
  display_name: string
}

interface Drill {
  id: string
  title: string
  duration_minutes: number
  category: string
  drill_types?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  isFavorite?: boolean
  notes?: string
  coach_instructions?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  source?: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
}

interface DrillLibraryContentProps {
  onAddDrill: (drill: Drill) => void
  isMobile?: boolean
  user?: User | null
}

export default function DrillLibraryContent({ 
  onAddDrill, 
  isMobile = false,
  user = null
}: DrillLibraryContentProps) {
  const { drills: supabaseDrills, loading, error, refreshDrills } = useDrills()
  const { toggleFavorite, isFavorite, getFavoriteDrills, loading: favoritesLoading } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['favorites'])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showAddDrillModal, setShowAddDrillModal] = useState(false)
  const [showEditDrillModal, setShowEditDrillModal] = useState(false)
  const [editingCustomDrill, setEditingCustomDrill] = useState<Drill | null>(null)
  
  // Modal states for individual drills
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [showLacrosseLabModal, setShowLacrosseLabModal] = useState(false)
  const [showStudyDrillModal, setShowStudyDrillModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
  
  // Filter state
  const [selectedGamePhases, setSelectedGamePhases] = useState<string[]>([])
  const [selectedDrillTypes, setSelectedDrillTypes] = useState<string[]>([])
  
  // Mobile drill selection removed - now uses immediate add/remove

  // Get unique drill categories from drills (Concept Drills, Skill Development, Admin, Live Play)
  const drillCategories = useMemo(() => {
    const categories = new Set<string>()
    supabaseDrills.forEach(drill => {
      if (drill.category) {
        categories.add(drill.category)
      }
    })
    return Array.from(categories).sort()
  }, [supabaseDrills])

  // Organize drills by category (Concept Drills, Skill Development, Admin, Live Play)
  const drillsByCategory = useMemo(() => {
    const organized: Record<string, Drill[]> = {
      'Favorites': [],
      'User Drills': [] // Changed from 'Custom Drills' to 'User Drills' per requirements
    }
    
    // Add all drill categories
    drillCategories.forEach(category => {
      organized[category] = []
    })
    
    // Organize drills
    supabaseDrills.forEach(drill => {
      // Add to favorites if favorited
      if (isFavorite(drill.id, 'drill')) {
        organized['Favorites'].push(drill)
      }
      
      // Add to user drills if it's a custom drill
      if (drill.source === 'user') {
        organized['User Drills'].push(drill)
      }
      
      // Add to appropriate category
      if (drill.category && organized[drill.category]) {
        organized[drill.category].push(drill)
      }
    })
    
    return organized
  }, [supabaseDrills, drillCategories, isFavorite])

  // Apply search and filter
  const filteredDrillsByCategory = useMemo(() => {
    const filtered: Record<string, Drill[]> = {}
    
    Object.entries(drillsByCategory).forEach(([category, drills]) => {
      filtered[category] = drills.filter(drill => {
        // Search filter
        const matchesSearch = !searchTerm || 
          drill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drill.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drill.drill_types?.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Game phase filter
        const matchesGamePhase = selectedGamePhases.length === 0 || 
          selectedGamePhases.some(phase => 
            drill.strategies?.some(strategy => strategy.toLowerCase().includes(phase.toLowerCase()))
          )
        
        // Drill type filter
        const matchesDrillType = selectedDrillTypes.length === 0 ||
          selectedDrillTypes.some(type => 
            drill.drill_types?.toLowerCase().includes(type.toLowerCase())
          )
        
        return matchesSearch && matchesGamePhase && matchesDrillType
      })
    })
    
    return filtered
  }, [drillsByCategory, searchTerm, selectedGamePhases, selectedDrillTypes])

  const activeFilterCount = selectedGamePhases.length + selectedDrillTypes.length

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId))
    } else {
      setExpandedCategories([...expandedCategories, categoryId])
    }
  }

  const handleToggleFavorite = async (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(drill.id, 'drill')
    } catch (error) {
      toast.error('Failed to toggle favorite')
    }
  }

  const handleEditDrill = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCustomDrill(drill)
    setShowEditDrillModal(true)
  }

  const handleMobileToggleDrill = (drillId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const drill = supabaseDrills.find(d => d.id === drillId)
    if (!drill) return

    const isChecked = e.target.checked
    
    if (isChecked) {
      // Add drill immediately
      onAddDrill(drill)
    } else {
      // Remove drill if onRemoveDrill function is provided
      if (onRemoveDrill) {
        onRemoveDrill(drillId)
      }
    }
  }

  // Batch operations removed - mobile now uses immediate add/remove

  const handleFilterApply = (filters: any) => {
    setSelectedGamePhases(filters.gamePhases || [])
    setSelectedDrillTypes(filters.drillTypes || [])
    setShowFilterModal(false)
  }

  const handleFilterClear = () => {
    setSelectedGamePhases([])
    setSelectedDrillTypes([])
    setShowFilterModal(false)
  }

  const renderDrillCard = (drill: Drill) => (
    <div
      key={drill.id}
      className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => !isMobile ? onAddDrill(drill) : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">{drill.title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{drill.duration_minutes || 0} min</span>
            <span>•</span>
            <span>{drill.category}</span>
          </div>
        </div>
        
        {/* Mobile checkbox */}
        {isMobile && (
          <input
            type="checkbox"
            onChange={(e) => handleMobileToggleDrill(drill.id, e)}
            className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
      </div>
      
      <div className="flex items-center justify-between">
        {/* Action buttons for desktop */}
        <div className="flex items-center gap-1">
          {/* Edit button for custom drills */}
          {drill.source === 'user' && (
            <button
              onClick={(e) => handleEditDrill(drill, e)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
              title="Edit custom drill"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {/* Favorite button */}
          <button
            onClick={(e) => handleToggleFavorite(drill, e)}
            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0"
            title={isFavorite(drill.id, 'drill') ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star 
              className={`h-4 w-4 ${isFavorite(drill.id, 'drill') ? 'fill-yellow-400 text-yellow-400' : ''}`} 
            />
          </button>
        </div>
        
        {/* Source Badge and Study button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {drill.source === 'user' && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  <User className="h-3 w-3" />
                  Custom
                </span>
              </div>
            )}
          </div>
          
          {/* Study button replacing all icons */}
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading drills...</p>
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
      <div className="px-4 pt-2 pb-4 border-b">
        <h3 className="text-lg font-semibold mb-4">Drill Library</h3>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md relative"
          >
            <Filter className="h-4 w-4" />
            Filter Drills
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowAddDrillModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Plus className="h-4 w-4" />
            Add Custom Drill
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Drills List */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Mobile accordion removed - now uses immediate add/remove */}
        
        {/* Drill Categories */}
        <div className="px-4 pt-4 pb-4 space-y-2">
          {Object.entries(filteredDrillsByCategory).map(([category, drills]) => {
            if (drills.length === 0 && category !== 'Favorites' && category !== 'User Drills') return null
            
            const isExpanded = expandedCategories.includes(category)
            
            return (
              <div key={category} className="border rounded-lg">
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-all ${
                    isExpanded ? 'sticky top-0 -mx-4 px-8 z-20 shadow-md border-b bg-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-gray-500">({drills.length})</span>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-2 space-y-2">
                    {drills.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">
                        {category === 'Favorites' ? 'No favorites yet' : 
                         category === 'User Drills' ? 'No custom drills yet' : 
                         'No drills in this category'}
                      </p>
                    ) : (
                      drills.map(renderDrillCard)
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      <AddCustomDrillModal
        isOpen={showAddDrillModal || showEditDrillModal}
        onClose={() => {
          setShowAddDrillModal(false)
          setShowEditDrillModal(false)
          setEditingCustomDrill(null)
        }}
        onDrillCreated={refreshDrills}
        editingDrill={editingCustomDrill}
      />

      <FilterDrillsModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        initialFilters={{
          gamePhases: selectedGamePhases,
          drillTypes: selectedDrillTypes
        }}
      />

      {/* Study Modal */}
      {selectedDrill && (
        <StudyDrillModal
          isOpen={showStudyDrillModal}
          onClose={() => setShowStudyDrillModal(false)}
          drill={selectedDrill}
          onUpdateDrill={(updatedDrill) => {
            setSelectedDrill(updatedDrill)
          }}
        />
      )}
    </div>
  )
}
