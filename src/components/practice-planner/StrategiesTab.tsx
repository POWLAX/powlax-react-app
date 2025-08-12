'use client'

import { useState, useMemo, Fragment } from 'react'
import { Filter, Plus, Video, Image, Beaker, ChevronDown, ChevronRight, Search, Play, BookOpen, Pencil, Star } from 'lucide-react'
import { useStrategies, getStrategiesByActualCategory, getStrategiesBySource, searchStrategies } from '@/hooks/useStrategies'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import VideoModal from './modals/VideoModal'
import LacrosseLabModal from './modals/LacrosseLabModal'
import AddCustomStrategiesModal from './modals/AddCustomStrategiesModal'
import EditCustomStrategyModal from './modals/EditCustomStrategyModal'
import StudyStrategyModal from './modals/StudyStrategyModal'
import FilterStrategiesModal from './modals/FilterStrategiesModal'
import SaveToPlaybookModal from '@/components/team-playbook/SaveToPlaybookModal'
import AdminToolbar from './AdminToolbar'
import AdminEditModal from './modals/AdminEditModal'
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

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  vimeo_link?: string
  lacrosse_lab_links?: any
  thumbnail_urls?: any
  source: 'powlax' | 'user'
  user_id?: string
}

interface StrategiesTabProps {
  onSelectStrategy: (strategy: Strategy) => void
  selectedStrategies: string[]
  isMobile?: boolean
  user?: User | null
}

export default function StrategiesTab({ 
  onSelectStrategy, 
  selectedStrategies,
  isMobile = false,
  user: propUser = null
}: StrategiesTabProps) {
  const { strategies, loading, error, refreshStrategies } = useStrategies()
  const { user } = useAuth()
  const { toggleFavorite, isFavorite, getFavoriteStrategies } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorite Strategies', 'Face Off', 'Face Offs'])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Modal states for individual strategies
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [showStudyStrategyModal, setShowStudyStrategyModal] = useState(false)
  const [showSaveToPlaybookModal, setShowSaveToPlaybookModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [showAdminEditModal, setShowAdminEditModal] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [editingUserStrategy, setEditingUserStrategy] = useState<Strategy | null>(null)
  const [showAddModal, setShowAddModal] = useState(false) // For Add Custom Strategy

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  // Get all available categories
  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    strategies.forEach(s => {
      if (s.strategy_categories) {
        categories.add(s.strategy_categories)
      }
    })
    return Array.from(categories).sort()
  }, [strategies])

  // Separate strategies by source
  const powlaxStrategies = useMemo(() => getStrategiesBySource(strategies, 'powlax'), [strategies])
  const userStrategies = useMemo(() => getStrategiesBySource(strategies, 'user').filter(s => s.user_id === user?.id), [strategies, user?.id])
  
  // Get favorite strategies from both powlax and user strategies
  const favoriteStrategies = useMemo(() => {
    const allStrategies = [...powlaxStrategies, ...userStrategies]
    return allStrategies.filter(strategy => isFavorite(strategy.id.toString(), 'strategy'))
  }, [powlaxStrategies, userStrategies, isFavorite])

  // Filter and organize strategies by actual category
  const filteredStrategies = useMemo(() => {
    let filtered = powlaxStrategies // Only POWLAX strategies in main display
    
    // Apply search filter
    if (searchTerm) {
      filtered = searchStrategies(filtered, searchTerm)
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(s => 
        s.strategy_categories && selectedCategories.includes(s.strategy_categories)
      )
    }
    
    return getStrategiesByActualCategory(filtered)
  }, [powlaxStrategies, searchTerm, selectedCategories])
  
  // Filter user strategies separately
  const filteredUserStrategies = useMemo(() => {
    let filtered = userStrategies
    
    // Apply search filter to user strategies too
    if (searchTerm) {
      filtered = searchStrategies(filtered, searchTerm)
    }
    
    return filtered
  }, [userStrategies, searchTerm])

  const handleStrategySelect = (strategy: Strategy) => {
    onSelectStrategy(strategy)
  }

  const openVideoModal = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedStrategy(strategy)
    setShowVideoModal(true)
  }

  const openLabModal = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedStrategy(strategy)
    setShowLabModal(true)
  }

  const handleAdminEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy)
    setShowAdminEditModal(true)
  }
  
  const handleEditUserStrategy = (strategy: Strategy) => {
    setEditingUserStrategy(strategy)
    setShowEditModal(true)
  }

  const handleToggleFavorite = async (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(strategy.id.toString(), 'strategy', strategy)
  }

  const hasVideo = (strategy: Strategy) => {
    return !!strategy.vimeo_link
  }

  const hasLabUrls = (strategy: Strategy) => {
    if (!strategy.lacrosse_lab_links) return false
    
    try {
      const links = typeof strategy.lacrosse_lab_links === 'string' 
        ? JSON.parse(strategy.lacrosse_lab_links)
        : strategy.lacrosse_lab_links
      
      if (Array.isArray(links)) {
        return links.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  const hasThumbnails = (strategy: Strategy) => {
    if (!strategy.thumbnail_urls) return false
    
    try {
      const urls = typeof strategy.thumbnail_urls === 'string'
        ? JSON.parse(strategy.thumbnail_urls)
        : strategy.thumbnail_urls
      
      if (Array.isArray(urls)) {
        return urls.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading strategies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading strategies</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - matching Drill Library */}
      <div className="px-4 pt-2 pb-4 border-b">
        <h3 className="text-lg font-semibold mb-4">Strategies Library</h3>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md relative"
          >
            <Filter className="h-4 w-4" />
            Filter Strategies
            {selectedCategories.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </button>
          
          {/* Add Custom Strategy Button - RESTORED */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4" />
            Add Custom Strategy
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Strategies List */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="px-4 pt-4 pb-4 space-y-2">
          {/* Favorites Section */}
          <div className="border rounded-lg mb-4">
            <button
              onClick={() => toggleCategory('Favorite Strategies')}
              className={`w-full px-4 py-3 flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 rounded-t-lg transition-all ${
                expandedCategories.includes('Favorite Strategies') ? 'sticky top-0 -mx-4 px-8 z-20 shadow-md border-b bg-white' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {expandedCategories.includes('Favorite Strategies') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Favorite Strategies</span>
                <span className="text-sm text-yellow-600">({favoriteStrategies.length})</span>
              </div>
            </button>
            
            {expandedCategories.includes('Favorite Strategies') && (
              <div className="p-2 space-y-2">
                {favoriteStrategies.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500">No favorite strategies yet</p>
                ) : (
                  favoriteStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-3 bg-white border rounded-md hover:bg-gray-50 group relative border-yellow-200"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Title row with Plus/checkbox on left */}
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <input
                              type="checkbox"
                              checked={selectedStrategies.includes(strategy.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleStrategySelect(strategy)
                              }}
                              className="flex-shrink-0"
                            />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStrategySelect(strategy)
                              }}
                              className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
                              title="Add to Practice"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          )}
                          <h4 className="font-medium text-sm flex-1">{strategy.strategy_name}</h4>
                          
                          {/* Favorite button (filled since it's in favorites) */}
                          <button
                            onClick={(e) => handleToggleFavorite(strategy, e)}
                            className="p-1 text-yellow-400 hover:text-yellow-600 transition-colors flex-shrink-0"
                            title="Remove from favorites"
                          >
                            <Star className="h-4 w-4 fill-yellow-400" />
                          </button>
                        </div>
                        
                        {/* Source Badge and Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {strategy.source === 'user' && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            {/* Save to Playbook button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStrategy(strategy)
                                setShowSaveToPlaybookModal(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-powlax-blue hover:bg-powlax-blue/90 text-white text-xs rounded transition-colors"
                              title="Save to Team Playbook"
                            >
                              <BookOpen className="h-3 w-3" />
                              Save
                            </button>
                            
                            {/* Study button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStrategy(strategy)
                                setShowStudyStrategyModal(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                            >
                              <Play className="h-3 w-3" fill="white" />
                              Study
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Strategies Section */}
          {filteredUserStrategies.length > 0 && (
            <div className="border rounded-lg mb-4">
              <button
                onClick={() => toggleCategory('User Strategies')}
                className={`w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 rounded-t-lg transition-all ${
                  expandedCategories.includes('User Strategies') ? 'sticky top-0 -mx-4 px-8 z-20 shadow-md border-b bg-white' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.includes('User Strategies') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">User Strategies</span>
                  <span className="text-sm text-green-600">({filteredUserStrategies.length})</span>
                </div>
              </button>
              
              {expandedCategories.includes('User Strategies') && (
                <div className="p-2 space-y-2">
                  {filteredUserStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-3 bg-white border rounded-md hover:bg-gray-50 group relative border-green-200"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Title row with Plus/checkbox on left */}
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <input
                              type="checkbox"
                              checked={selectedStrategies.includes(strategy.id.toString())}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleStrategySelect(strategy)
                              }}
                              className="flex-shrink-0"
                            />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStrategySelect(strategy)
                              }}
                              className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
                              title="Add to Practice"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          )}
                          <h4 className="font-medium text-sm flex-1">{strategy.strategy_name}</h4>
                          
                          {/* Edit button for user-owned strategies */}
                          {strategy.user_id === user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditUserStrategy(strategy)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                              title="Edit strategy"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Favorite button */}
                          <button
                            onClick={(e) => handleToggleFavorite(strategy, e)}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0"
                            title={isFavorite(strategy.id.toString(), 'strategy') ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star 
                              className={`h-4 w-4 ${isFavorite(strategy.id.toString(), 'strategy') ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                            />
                          </button>
                        </div>
                        
                        {/* Description and Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              Custom
                            </span>
                            {strategy.lesson_category && (
                              <span className="text-xs text-gray-500">
                                {strategy.lesson_category}
                              </span>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            {/* Save to Playbook button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStrategy(strategy)
                                setShowSaveToPlaybookModal(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-powlax-blue hover:bg-powlax-blue/90 text-white text-xs rounded transition-colors"
                              title="Save to Team Playbook"
                            >
                              <BookOpen className="h-3 w-3" />
                              Save
                            </button>
                            
                            {/* Study button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStrategy(strategy)
                                setShowStudyStrategyModal(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                            >
                              <Play className="h-3 w-3" fill="white" />
                              Study
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* POWLAX Strategies */}
          {filteredStrategies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No strategies found
            </div>
          ) : (
            filteredStrategies.map(({ category, strategies }) => {
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
                      <span className="text-sm text-gray-500">({strategies.length})</span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                  <div className="p-2 space-y-2">
                    {strategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="p-3 bg-white border rounded-md hover:bg-gray-50 group relative"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Title row with Plus/checkbox on left */}
                          <div className="flex items-center gap-2">
                            {isMobile ? (
                              <input
                                type="checkbox"
                                checked={selectedStrategies.includes(strategy.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="flex-shrink-0"
                              />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
                                title="Add to Practice"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            <h4 className="font-medium text-sm flex-1">{strategy.strategy_name}</h4>
                            {/* Favorite button */}
                            <button
                              onClick={(e) => handleToggleFavorite(strategy, e)}
                              className="p-1 text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0"
                              title={isFavorite(strategy.id.toString(), 'strategy') ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star 
                                className={`h-4 w-4 ${isFavorite(strategy.id.toString(), 'strategy') ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                              />
                            </button>
                            {/* Admin Toolbar */}
                            <AdminToolbar
                              user={user}
                              itemType="strategy"
                              item={strategy}
                              onEdit={() => handleAdminEdit(strategy)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          
                          {/* Source Badge and Action buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {strategy.source === 'user' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                  Custom
                                </span>
                              )}
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center gap-1">
                              {/* Save to Playbook button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedStrategy(strategy)
                                  setShowSaveToPlaybookModal(true)
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-powlax-blue hover:bg-powlax-blue/90 text-white text-xs rounded transition-colors"
                                title="Save to Team Playbook"
                              >
                                <BookOpen className="h-3 w-3" />
                                Save
                              </button>
                              
                              {/* Study button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedStrategy(strategy)
                                  setShowStudyStrategyModal(true)
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                              >
                                <Play className="h-3 w-3" fill="white" />
                                Study
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modals */}
      
      {/* VERSION 1 - Simple version with onStrategyUpdated */}
      {/* <EditCustomStrategyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        strategy={editingUserStrategy}
        onStrategyUpdated={refreshStrategies}
      /> */}
      
      <FilterStrategiesModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onApplyFilters={setSelectedCategories}
      />

      {selectedStrategy && (
        <>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            drill={{
              name: selectedStrategy.strategy_name,
              videoUrl: selectedStrategy.vimeo_link
            }}
          />
          
          <LacrosseLabModal
            isOpen={showLabModal}
            onClose={() => setShowLabModal(false)}
            drill={{
              name: selectedStrategy.strategy_name,
              lab_urls: selectedStrategy.lacrosse_lab_links
            }}
          />
          
          <StudyStrategyModal
            isOpen={showStudyStrategyModal}
            onClose={() => setShowStudyStrategyModal(false)}
            strategy={selectedStrategy}
          />
          
          <SaveToPlaybookModal
            isOpen={showSaveToPlaybookModal}
            onClose={() => setShowSaveToPlaybookModal(false)}
            strategy={selectedStrategy}
            onSuccess={() => {
              // Optional: Show success message or refresh something
              console.log('Strategy saved to team playbook successfully!')
            }}
          />
        </>
      )}

      {/* Admin Edit Modal */}
      <AdminEditModal
        isOpen={showAdminEditModal}
        onClose={() => setShowAdminEditModal(false)}
        itemType="strategy"
        item={editingStrategy}
        user={user}
        onSave={() => {
          refreshStrategies()
          setShowAdminEditModal(false)
          setEditingStrategy(null)
        }}
      />

      {/* Add Custom Strategy Modal - RESTORED */}
      {showAddModal && (
        <AddCustomStrategiesModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(strategy) => {
            // Refresh strategies after adding
            refreshStrategies()
            setShowAddModal(false)
          }}
        />
      )}

      {/* VERSION 2 - Full version with onSuccess callback (like AddCustomDrillModal pattern) */}
      {showEditModal && editingUserStrategy && (
        <EditCustomStrategyModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingUserStrategy(null)
          }}
          strategy={editingUserStrategy}
          onSuccess={() => {
            refreshStrategies()
            setShowEditModal(false)
            setEditingUserStrategy(null)
          }}
        />
      )}
    </div>
  )
}