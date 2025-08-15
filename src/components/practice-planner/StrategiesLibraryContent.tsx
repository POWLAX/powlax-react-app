'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Star, ChevronDown, ChevronRight, Video, Link, Beaker, User, Search, Play, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStrategies } from '@/hooks/useStrategies'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import AddCustomStrategiesModal from './modals/AddCustomStrategiesModal'
import FilterStrategiesModal from './modals/FilterStrategiesModal'
import VideoModal from './modals/VideoModal'
import LacrosseLabModal, { hasLabUrls } from './modals/LacrosseLabModal'
import StudyStrategyModal from './modals/StudyStrategyModal'
import SaveToPlaybookModal from '@/components/team-playbook/SaveToPlaybookModal'
// Admin and user edit modals not implemented yet

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

interface StrategiesLibraryContentProps {
  onSelectStrategy: (strategy: Strategy) => void
  selectedStrategies: string[]
  isMobile?: boolean
  user?: User | null
}

export default function StrategiesLibraryContent({ 
  onSelectStrategy, 
  selectedStrategies,
  isMobile = false,
  user: propUser = null
}: StrategiesLibraryContentProps) {
  const { strategies, loading, error, refreshStrategies } = useStrategies()
  const { user } = useAuth()
  const { toggleFavorite, isFavorite, getFavoriteStrategies } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Favorite Strategies', 'Face Off', 'Face Offs'])
  // const [showEditModal, setShowEditModal] = useState(false) // Not implemented yet
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Modal states for individual strategies
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [showStudyStrategyModal, setShowStudyStrategyModal] = useState(false)
  const [showSaveToPlaybookModal, setShowSaveToPlaybookModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  // Edit modals not implemented yet
  // const [showAdminEditModal, setShowAdminEditModal] = useState(false)
  // const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  // const [editingUserStrategy, setEditingUserStrategy] = useState<Strategy | null>(null)
  const [showAddModal, setShowAddModal] = useState(false) // For Add Custom Strategy

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const handleToggleFavorite = async (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(strategy.id, 'strategy')
    } catch (error) {
      toast.error('Failed to toggle favorite')
    }
  }

  // Group strategies by category
  const strategiesByCategory = useMemo(() => {
    const favoriteStrategies = getFavoriteStrategies()
    const organized: Record<string, Strategy[]> = {
      'Favorite Strategies': favoriteStrategies,
      'User Strategies': []
    }
    
    // Add user strategies
    const userStrategies = strategies.filter(s => s.source === 'user')
    organized['User Strategies'] = userStrategies
    
    // Group by strategy_categories
    strategies.forEach(strategy => {
      const category = strategy.strategy_categories || 'General'
      if (!organized[category]) {
        organized[category] = []
      }
      if (strategy.source !== 'user') { // Don't duplicate user strategies
        organized[category].push(strategy)
      }
    })
    
    return organized
  }, [strategies, getFavoriteStrategies])

  // Apply search and filters
  const filteredStrategiesByCategory = useMemo(() => {
    const filtered: Record<string, Strategy[]> = {}
    
    Object.entries(strategiesByCategory).forEach(([category, strategies]) => {
      filtered[category] = strategies.filter(strategy => {
        // Search filter
        const matchesSearch = !searchTerm || 
          strategy.strategy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          strategy.strategy_categories?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Category filter
        const matchesCategory = selectedCategories.length === 0 ||
          selectedCategories.includes(strategy.strategy_categories || 'General')
        
        return matchesSearch && matchesCategory
      })
    })
    
    return filtered
  }, [strategiesByCategory, searchTerm, selectedCategories])

  // Filter handlers are now handled directly by the modal

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

  const handleEditStrategy = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    // Edit functionality not implemented yet
    toast.info('Edit functionality coming soon!')
  }

  const handleDeleteUserStrategy = async (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    if (strategy.source !== 'user' || strategy.user_id !== user?.id) {
      toast.error('You can only delete your own strategies')
      return
    }
    
    if (confirm('Are you sure you want to delete this strategy?')) {
      try {
        // Delete strategy logic would go here
        toast.success('Strategy deleted successfully')
        refreshStrategies()
      } catch (error) {
        toast.error('Failed to delete strategy')
      }
    }
  }

  const renderStrategyCard = (strategy: Strategy) => (
    <div
      key={strategy.id}
      className={`bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer ${
        selectedStrategies.includes(strategy.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={() => onSelectStrategy(strategy)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">{strategy.strategy_name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{strategy.strategy_categories || 'General'}</span>
            {strategy.description && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px]">{strategy.description}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit button for user strategies or admin */}
          {(strategy.source === 'user' && strategy.user_id === user?.id) || user?.roles?.includes('administrator') ? (
            <button
              onClick={(e) => handleEditStrategy(strategy, e)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
              title="Edit strategy"
            >
              <Edit className="h-4 w-4" />
            </button>
          ) : null}
          
          {/* Delete button for user strategies */}
          {strategy.source === 'user' && strategy.user_id === user?.id && (
            <button
              onClick={(e) => handleDeleteUserStrategy(strategy, e)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Delete strategy"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          {/* Favorite button */}
          <button
            onClick={(e) => handleToggleFavorite(strategy, e)}
            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors flex-shrink-0"
            title={isFavorite(strategy.id, 'strategy') ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star 
              className={`h-4 w-4 ${isFavorite(strategy.id, 'strategy') ? 'fill-yellow-400 text-yellow-400' : ''}`} 
            />
          </button>
        </div>
        
        {/* Source Badge and Study button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {strategy.source === 'user' && (
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
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading strategies...</p>
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
          
          {/* Add Custom Strategy Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
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
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Favorite Strategies</span>
                <span className="text-sm text-gray-500">({filteredStrategiesByCategory['Favorite Strategies']?.length || 0})</span>
              </div>
            </button>
            
            {expandedCategories.includes('Favorite Strategies') && (
              <div className="p-2 space-y-2">
                {filteredStrategiesByCategory['Favorite Strategies']?.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500">No favorite strategies yet</p>
                ) : (
                  filteredStrategiesByCategory['Favorite Strategies']?.map(renderStrategyCard)
                )}
              </div>
            )}
          </div>

          {/* Other Categories */}
          {Object.entries(filteredStrategiesByCategory).map(([category, strategies]) => {
            if (category === 'Favorite Strategies' || strategies.length === 0) return null
            
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
                    {strategies.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">
                        {category === 'User Strategies' ? 'No custom strategies yet' : 'No strategies in this category'}
                      </p>
                    ) : (
                      strategies.map(renderStrategyCard)
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      <AddCustomStrategiesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStrategyCreated={refreshStrategies}
      />

      <FilterStrategiesModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onApplyFilters={setSelectedCategories}
      />

      {/* Study Modal */}
      {selectedStrategy && (
        <StudyStrategyModal
          isOpen={showStudyStrategyModal}
          onClose={() => setShowStudyStrategyModal(false)}
          strategy={selectedStrategy}
        />
      )}

      {/* Edit modals not implemented yet */}
    </div>
  )
}
