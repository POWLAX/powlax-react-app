'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Plus, Star, Video, ChevronDown, ChevronRight, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface AcademyDrill {
  id: string
  title: string
  category: 'attack' | 'defense' | 'midfield' | 'wall_ball' | 'fundamentals'
  duration_minutes: number
  complexity: 'foundation' | 'building' | 'advanced'
  point_values: {
    lax_credit: number
    attack_tokens?: number
    defense_dollars?: number
    midfield_medals?: number
    rebound_rewards?: number
    lax_iq_points?: number
    flex_points?: number
  }
  vimeo_id?: string
  description?: string
  equipment?: string[]
  drill_category?: string[] // Array from Supabase
  equipment_needed?: string[]
  tags?: string[]
}

interface DrillLibraryAcademyProps {
  onAddDrill: (drill: AcademyDrill) => void
}

// Define drill categories similar to Practice Planner
const drillCategories = [
  { id: 'offense', name: 'Offense Drills', icon: '⚔️' },
  { id: 'defense', name: 'Defense Drills', icon: '🛡️' },
  { id: 'ground_balls', name: 'Ground Balls', icon: '🏃' },
  { id: 'shooting', name: 'Shooting', icon: '🎯' },
  { id: 'cradling', name: 'Cradling', icon: '🎾' },
  { id: 'dodging', name: 'Dodging', icon: '💨' },
  { id: 'passing', name: 'Passing & Catching', icon: '🤝' },
  { id: 'wall_ball', name: 'Wall Ball', icon: '🧱' },
  { id: 'footwork', name: 'Footwork & Agility', icon: '👟' },
  { id: 'conditioning', name: 'Conditioning', icon: '💪' }
]

const complexityColors = {
  foundation: 'bg-green-100 text-green-800',
  building: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800'
}

const complexityDescriptions = {
  foundation: 'Basic skills for beginners',
  building: 'Developing core competencies',
  advanced: 'Elite level techniques'
}

export default function DrillLibraryAcademy({ onAddDrill }: DrillLibraryAcademyProps) {
  const [drills, setDrills] = useState<AcademyDrill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['offense'])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    fetchDrills()
  }, [])

  const fetchDrills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills_academy_drills')
        .select('*')
        .order('title')

      if (error) throw error

      const formattedDrills = data?.map(drill => {
        // Map primary category based on drill_category array
        let primaryCategory: AcademyDrill['category'] = 'fundamentals'
        const categories = drill.drill_category?.join(' ').toLowerCase() || ''
        
        if (categories.includes('offense') || categories.includes('shooting') || categories.includes('dodging')) {
          primaryCategory = 'attack'
        } else if (categories.includes('defense')) {
          primaryCategory = 'defense'
        } else if (categories.includes('ground ball') || categories.includes('transition')) {
          primaryCategory = 'midfield'
        } else if (categories.includes('wall') || categories.includes('cradle')) {
          primaryCategory = 'wall_ball'
        }

        // Calculate point values based on complexity
        const basePoints = drill.complexity === 'advanced' ? 12 : 
                          drill.complexity === 'building' ? 6 : 3
        
        const pointValues: any = { lax_credit: basePoints }
        if (primaryCategory === 'attack') pointValues.attack_tokens = basePoints
        if (primaryCategory === 'defense') pointValues.defense_dollars = basePoints
        if (primaryCategory === 'midfield') pointValues.midfield_medals = basePoints
        if (primaryCategory === 'wall_ball') pointValues.rebound_rewards = basePoints

        return {
          id: drill.id?.toString() || 'drill-' + Math.random(),
          title: drill.title || 'Unnamed Drill',
          category: primaryCategory,
          drill_category: drill.drill_category || [],
          duration_minutes: drill.duration_minutes || 5,
          complexity: drill.complexity || 'foundation',
          point_values: drill.point_values || pointValues,
          vimeo_id: drill.vimeo_id,
          description: drill.description,
          equipment_needed: drill.equipment_needed || [],
          tags: drill.tags || []
        }
      }) || []

      setDrills(formattedDrills)
    } catch (error) {
      console.error('Error fetching drills:', error)
      // Use mock data as fallback
      setDrills(getMockDrills())
    } finally {
      setLoading(false)
    }
  }

  const getMockDrills = (): AcademyDrill[] => [
    {
      id: 'mock-1',
      title: '2 Hand Cradle Away Drill',
      category: 'wall_ball',
      drill_category: ['Offense (with ball)', 'Cradling'],
      duration_minutes: 3,
      complexity: 'foundation',
      point_values: { lax_credit: 3, rebound_rewards: 3 },
      equipment_needed: ['Stick', 'Ball', 'Wall']
    },
    {
      id: 'mock-2',
      title: 'Roll Dodge Progression',
      category: 'attack',
      drill_category: ['Offense (with ball)', 'Dodging', 'Roll Dodge'],
      duration_minutes: 5,
      complexity: 'building',
      point_values: { lax_credit: 6, attack_tokens: 6 },
      equipment_needed: ['Stick', 'Ball', 'Cones']
    },
    {
      id: 'mock-3',
      title: 'Defensive Approach and Recover',
      category: 'defense',
      drill_category: ['Defense (no ball)', 'Approach and Recover'],
      duration_minutes: 4,
      complexity: 'building',
      point_values: { lax_credit: 6, defense_dollars: 6 },
      equipment_needed: ['Stick', 'Cones']
    },
    {
      id: 'mock-4',
      title: 'Ground Ball Battles',
      category: 'midfield',
      drill_category: ['Offense (with ball)', 'Ground Balls'],
      duration_minutes: 5,
      complexity: 'advanced',
      point_values: { lax_credit: 12, midfield_medals: 12 },
      equipment_needed: ['Stick', 'Ball', 'Partner']
    },
    {
      id: 'mock-5',
      title: 'Time and Room Shooting',
      category: 'attack',
      drill_category: ['Offense (with ball)', 'Shooting', 'Time and Room'],
      duration_minutes: 6,
      complexity: 'advanced',
      point_values: { lax_credit: 12, attack_tokens: 12 },
      equipment_needed: ['Stick', 'Ball', 'Goal']
    }
  ]

  const getDrillCategoryFromArray = (drillCategories: string[]): string => {
    if (!drillCategories || drillCategories.length === 0) return 'other'
    
    const categoryStr = drillCategories.join(' ').toLowerCase()
    
    if (categoryStr.includes('offense') && categoryStr.includes('ball')) return 'offense'
    if (categoryStr.includes('defense')) return 'defense'
    if (categoryStr.includes('ground ball')) return 'ground_balls'
    if (categoryStr.includes('shooting')) return 'shooting'
    if (categoryStr.includes('cradle') || categoryStr.includes('cradling')) return 'cradling'
    if (categoryStr.includes('dodge') || categoryStr.includes('dodging')) return 'dodging'
    if (categoryStr.includes('passing') || categoryStr.includes('catching')) return 'passing'
    if (categoryStr.includes('wall')) return 'wall_ball'
    if (categoryStr.includes('footwork') || categoryStr.includes('agility')) return 'footwork'
    if (categoryStr.includes('conditioning')) return 'conditioning'
    
    return 'other'
  }

  const filteredDrills = useMemo(() => {
    return drills.filter(drill => {
      // Search filter
      const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           drill.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Complexity filter
      const matchesComplexity = selectedComplexity === 'all' || drill.complexity === selectedComplexity
      
      // Duration filter
      let matchesDuration = true
      if (selectedDuration === 'quick') matchesDuration = drill.duration_minutes <= 3
      else if (selectedDuration === 'medium') matchesDuration = drill.duration_minutes > 3 && drill.duration_minutes <= 6
      else if (selectedDuration === 'long') matchesDuration = drill.duration_minutes > 6
      
      // Category filter
      let matchesCategory = selectedCategories.length === 0
      if (selectedCategories.length > 0 && drill.drill_category) {
        const drillCat = getDrillCategoryFromArray(drill.drill_category)
        matchesCategory = selectedCategories.includes(drillCat)
      }
      
      return matchesSearch && matchesComplexity && matchesDuration && matchesCategory
    })
  }, [drills, searchTerm, selectedComplexity, selectedDuration, selectedCategories])

  // Group drills by category
  const drillsByCategory = useMemo(() => {
    const grouped: Record<string, AcademyDrill[]> = {}
    
    drillCategories.forEach(cat => {
      grouped[cat.id] = []
    })
    grouped['other'] = []
    
    filteredDrills.forEach(drill => {
      if (drill.drill_category && drill.drill_category.length > 0) {
        const category = getDrillCategoryFromArray(drill.drill_category)
        if (grouped[category]) {
          grouped[category].push(drill)
        } else {
          grouped['other'].push(drill)
        }
      } else {
        grouped['other'].push(drill)
      }
    })
    
    return grouped
  }, [filteredDrills])

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(c => c !== categoryId))
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

  const toggleCategoryFilter = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedComplexity('all')
    setSelectedDuration('all')
    setSelectedCategories([])
  }

  const activeFilterCount = (selectedComplexity !== 'all' ? 1 : 0) + 
                           (selectedDuration !== 'all' ? 1 : 0) + 
                           selectedCategories.length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-3">🎯 Skills Academy Drill Library</h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search drills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full mb-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="space-y-3 pb-3 border-b mb-3">
            {/* Complexity Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Complexity Level</label>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="all">All Levels</option>
                <option value="foundation">🟢 Foundation - Basic skills</option>
                <option value="building">🔵 Building - Core skills</option>
                <option value="advanced">🟣 Advanced - Elite skills</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Duration</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="all">All Durations</option>
                <option value="quick">⚡ Quick (≤3 min)</option>
                <option value="medium">⏱️ Medium (4-6 min)</option>
                <option value="long">⏳ Long (>6 min)</option>
              </select>
            </div>

            {/* Category Filters */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Drill Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {drillCategories.slice(0, 8).map(cat => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategoryFilter(cat.id)}
                      className="h-3 w-3"
                    />
                    <span className="text-xs">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600">
          Showing {filteredDrills.length} of {drills.length} drills
        </div>
      </div>

      {/* Drill List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading drills...</div>
        ) : (
          <div className="space-y-4">
            {drillCategories.concat([{ id: 'other', name: 'Other Drills', icon: '📚' }]).map(category => {
              const categoryDrills = drillsByCategory[category.id] || []
              if (categoryDrills.length === 0) return null
              
              const isExpanded = expandedCategories.includes(category.id)
              
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full text-left mb-2 hover:bg-gray-50 p-1 rounded"
                  >
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      {category.name} ({categoryDrills.length})
                    </span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-2 ml-2">
                      {categoryDrills.map(drill => (
                        <Card key={drill.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  {drill.title}
                                  <button
                                    onClick={(e) => toggleFavorite(drill.id, e)}
                                    className="text-gray-400 hover:text-yellow-500"
                                  >
                                    <Star 
                                      className={`h-3 w-3 ${favorites.includes(drill.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} 
                                    />
                                  </button>
                                  {drill.vimeo_id && (
                                    <Video className="h-3 w-3 text-gray-400" />
                                  )}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-600">{drill.duration_minutes} min</span>
                                  <Badge variant="outline" className={`text-xs ${complexityColors[drill.complexity]}`}>
                                    {drill.complexity}
                                  </Badge>
                                  <span className="text-xs font-semibold">
                                    💰 {drill.point_values.lax_credit} pts
                                  </span>
                                  {drill.drill_category && drill.drill_category.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      • {drill.drill_category[0]}
                                    </span>
                                  )}
                                </div>
                                {drill.equipment_needed && drill.equipment_needed.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Equipment: {drill.equipment_needed.join(', ')}
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAddDrill(drill)}
                                className="ml-2"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}