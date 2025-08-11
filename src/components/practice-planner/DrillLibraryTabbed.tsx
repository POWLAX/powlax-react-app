'use client'

import { useState, useMemo, useEffect } from 'react'
import { Filter, Plus, Star, ChevronDown, ChevronRight, Video, Link, Beaker, User, Search, Play } from 'lucide-react'
import { useDrills } from '@/hooks/useDrills'
import { useFavorites } from '@/hooks/useFavorites'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddCustomDrillModal from './AddCustomDrillModal'
import EditCustomDrillModal from './EditCustomDrillModal'
import FilterDrillsModal from './FilterDrillsModal'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal'
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'
import StudyDrillModal from './modals/StudyDrillModal'
import StrategiesTab from './StrategiesTab'
import AdminToolbar from './AdminToolbar'
import AdminEditModal from './modals/AdminEditModal'
import { useAdminEdit } from '@/hooks/useAdminEdit'
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
  onSelectStrategy?: (strategy: any) => void
  selectedStrategies?: string[]
  isMobile?: boolean
  user?: User | null
}

export default function DrillLibraryTabbed({ 
  onAddDrill, 
  onSelectStrategy,
  selectedStrategies = [],
  isMobile = false,
  user = null
}: DrillLibraryProps) {
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
  const [showAdminEditModal, setShowAdminEditModal] = useState(false)
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null)
  
  // Filter state
  const [selectedGamePhases, setSelectedGamePhases] = useState<string[]>([])
  const [selectedDrillTypes, setSelectedDrillTypes] = useState<string[]>([])
  
  // Mobile drill selection state
  const [selectedDrillsForMobile, setSelectedDrillsForMobile] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState('drills')

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
      // Check if it's a favorite
      if (isFavorite(drill.id, 'drill')) {
        organized['Favorites'].push(drill)
      }
      
      // Check if it's a user drill (show in User Drills accordion)
      if (drill.source === 'user') {
        organized['User Drills'].push(drill)
      }
      
      // Add to category (only for non-user drills to avoid duplication)
      if (drill.category && organized[drill.category] && drill.source !== 'user') {
        organized[drill.category].push(drill)
      }
    })
    
    return organized
  }, [supabaseDrills, drillCategories, isFavorite])

  // Filter drills based on search and filters
  const filteredDrillsByCategory = useMemo(() => {
    const filtered: Record<string, Drill[]> = {}
    
    Object.entries(drillsByCategory).forEach(([category, drills]) => {
      filtered[category] = drills.filter(drill => {
        // Search filter
        const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Game phase filter (if we still want this filter)
        const matchesGamePhase = selectedGamePhases.length === 0 ||
          (drill.strategies && drill.strategies.some(s => selectedGamePhases.includes(s)))
        
        // Drill type filter
        const matchesDrillType = selectedDrillTypes.length === 0 ||
          selectedDrillTypes.includes(category)
        
        return matchesSearch && matchesGamePhase && matchesDrillType
      })
    })
    
    return filtered
  }, [drillsByCategory, searchTerm, selectedGamePhases, selectedDrillTypes])

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const handleToggleFavorite = async (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(drill.id, 'drill', drill)
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

  const handleAdminEdit = (drill: Drill) => {
    setEditingDrill(drill)
    setShowAdminEditModal(true)
  }

  const clearFilters = () => {
    setSelectedGamePhases([])
    setSelectedDrillTypes([])
    setSearchTerm('')
  }

  const activeFilterCount = selectedGamePhases.length + selectedDrillTypes.length

  // Handle mobile drill selection
  const handleMobileDrillToggle = (drillId: string) => {
    if (selectedDrillsForMobile.includes(drillId)) {
      setSelectedDrillsForMobile(selectedDrillsForMobile.filter(id => id !== drillId))
    } else {
      setSelectedDrillsForMobile([...selectedDrillsForMobile, drillId])
    }
  }

  const handleAddSelectedDrills = () => {
    selectedDrillsForMobile.forEach(drillId => {
      const drill = supabaseDrills.find(d => d.id === drillId)
      if (drill) {
        onAddDrill(drill)
      }
    })
    setSelectedDrillsForMobile([])
  }

  // Handle tab switching with validation
  const handleTabChange = (value: string) => {
    if (isMobile && selectedDrillsForMobile.length > 0 && value !== currentTab) {
      if (confirm('Please add the selected drills before switching tabs. Do you want to add them now?')) {
        handleAddSelectedDrills()
        setCurrentTab(value)
      }
    } else {
      setCurrentTab(value)
    }
  }

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

  const renderDrillCard = (drill: Drill) => (
    <div
      key={drill.id}
      className="p-3 bg-white border rounded-lg hover:bg-gray-50 group relative"
    >
      <div className="flex flex-col gap-2">
        {/* Title row with Plus button on left */}
        <div className="flex items-center gap-2">
          {isMobile ? (
            <input
              type="checkbox"
              checked={selectedDrillsForMobile.includes(drill.id)}
              onChange={() => handleMobileDrillToggle(drill.id)}
              className="flex-shrink-0"
            />
          ) : (
            <button
              onClick={() => onAddDrill(drill)}
              className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
              title="Add to Practice"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          )}
          <h4 className="font-medium text-sm flex-1">{drill.title}</h4>
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
          {/* Admin Toolbar */}
          <AdminToolbar
            user={user}
            itemType="drill"
            item={drill}
            onEdit={() => handleAdminEdit(drill)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
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
                {/* Edit button for user-owned drills */}
                {user && drill.user_id === user.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Open EditCustomDrillModal
                      console.log('Edit drill:', drill.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit this custom drill"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
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

  return (
    <div className="h-full flex flex-col">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="h-full flex flex-col">
        <div className="p-4 pb-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drills">Drills</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Drills Tab */}
        <TabsContent value="drills" className="flex-1 flex flex-col overflow-hidden mt-0">
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
            {/* Mobile: Show selected drills accordion */}
            {isMobile && selectedDrillsForMobile.length > 0 && (
              <div className="mx-4 mt-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Drills to Add ({selectedDrillsForMobile.length})</h4>
                  <button
                    onClick={handleAddSelectedDrills}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Add to Plan
                  </button>
                </div>
                <button
                  onClick={() => setSelectedDrillsForMobile([])}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear Selection
                </button>
              </div>
            )}
            
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
        </TabsContent>
        
        {/* Strategies Tab */}
        <TabsContent value="strategies" className="flex-1 overflow-hidden mt-0">
          <StrategiesTab
            onSelectStrategy={onSelectStrategy || (() => {})}
            selectedStrategies={selectedStrategies}
            isMobile={isMobile}
            user={user}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <AddCustomDrillModal
        isOpen={showAddDrillModal}
        onClose={() => setShowAddDrillModal(false)}
        onAdd={(drill) => {
          onAddDrill(drill)
          setShowAddDrillModal(false)
        }}
        onDrillCreated={() => refreshDrills()}
      />
      
      <EditCustomDrillModal
        isOpen={showEditDrillModal}
        onClose={() => {
          setShowEditDrillModal(false)
          setEditingCustomDrill(null)
        }}
        drill={editingCustomDrill}
        onDrillUpdated={() => refreshDrills()}
      />
      
      <FilterDrillsModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        drills={supabaseDrills}
        selectedStrategies={selectedGamePhases}
        setSelectedStrategies={setSelectedGamePhases}
        selectedSkills={[]}
        setSelectedSkills={() => {}}
        selectedGamePhase={null}
        setSelectedGamePhase={() => {}}
        selectedDuration={null}
        setSelectedDuration={() => {}}
        selectedGameStates={[]}
        setSelectedGameStates={() => {}}
      />
      
      {selectedDrill && (
        <>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            drill={selectedDrill}
          />
          
          <LinksModal
            isOpen={showLinksModal}
            onClose={() => setShowLinksModal(false)}
            drill={selectedDrill}
          />
          
          <StrategiesModal
            isOpen={showStrategiesModal}
            onClose={() => setShowStrategiesModal(false)}
            drill={selectedDrill}
          />
          
          <LacrosseLabModal
            isOpen={showLacrosseLabModal}
            onClose={() => setShowLacrosseLabModal(false)}
            drill={selectedDrill}
          />
          
          <StudyDrillModal
            isOpen={showStudyDrillModal}
            onClose={() => setShowStudyDrillModal(false)}
            drill={selectedDrill}
          />
        </>
      )}

      {/* Admin Edit Modal */}
      <AdminEditModal
        isOpen={showAdminEditModal}
        onClose={() => setShowAdminEditModal(false)}
        itemType="drill"
        item={editingDrill}
        user={user}
        onSuccess={() => {
          refreshDrills()
          setShowAdminEditModal(false)
          setEditingDrill(null)
        }}
      />
    </div>
  )
}