'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, Save, Filter, Search, Clock, Target, Dumbbell, 
  X, ChevronDown, ChevronRight, Trash2, GripVertical,
  Video, CircleDot, Goal, Triangle, Square, Home, Play, Trophy,
  Users, Shield, Zap, Flag, Mountain
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Drill {
  id: string
  title: string
  drill_category: string[]
  complexity: 'foundation' | 'building' | 'advanced'
  duration_minutes: number
  sets_reps?: string
  equipment_needed?: string[]
  vimeo_id?: string
  point_values?: {
    lax_credit: number
    [key: string]: number
  }
}

interface WorkoutDrill extends Drill {
  order: number
  workoutId: string
}

const complexityConfig = {
  foundation: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Foundation', icon: '🟢' },
  building: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Building', icon: '🟠' },
  advanced: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Advanced', icon: '🔴' }
}

const equipmentIcons: Record<string, any> = {
  'ball': { icon: CircleDot, label: 'Ball', color: 'text-orange-600' },
  'balls': { icon: CircleDot, label: 'Balls', color: 'text-orange-600' },
  'cone': { icon: Triangle, label: 'Cone', color: 'text-yellow-600' },
  'cones': { icon: Triangle, label: 'Cones', color: 'text-yellow-600' },
  'goal': { icon: Goal, label: 'Goal', color: 'text-blue-600' },
  'goals': { icon: Goal, label: 'Goals', color: 'text-blue-600' },
  'stick': { icon: Dumbbell, label: 'Stick', color: 'text-gray-700' },
  'sticks': { icon: Dumbbell, label: 'Sticks', color: 'text-gray-700' },
  'wall': { icon: Square, label: 'Wall', color: 'text-purple-600' },
  'ladder': { icon: Mountain, label: 'Ladder', color: 'text-green-600' },
  'agility ladder': { icon: Mountain, label: 'Agility Ladder', color: 'text-green-600' },
  'field': { icon: Flag, label: 'Field', color: 'text-green-700' },
  'partner': { icon: Users, label: 'Partner', color: 'text-indigo-600' },
  'partners': { icon: Users, label: 'Partners', color: 'text-indigo-600' },
  'defender': { icon: Shield, label: 'Defender', color: 'text-red-600' },
  'defenders': { icon: Shield, label: 'Defenders', color: 'text-red-600' },
  'rebounder': { icon: Zap, label: 'Rebounder', color: 'text-purple-600' },
  'none': { icon: X, label: 'None', color: 'text-gray-400' }
}

export default function DrillFocusedWorkoutBuilder() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [selectedDrills, setSelectedDrills] = useState<WorkoutDrill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedComplexity, setSelectedComplexity] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [workoutName, setWorkoutName] = useState('My Custom Workout')
  const [draggedDrill, setDraggedDrill] = useState<Drill | null>(null)

  useEffect(() => {
    fetchDrills()
  }, [])

  const fetchDrills = async () => {
    try {
      // First try skills_academy_drills table
      let { data, error } = await supabase
        .from('skills_academy_drills')
        .select(`
          id, title, drill_category, complexity, 
          duration_minutes, sets_reps, equipment_needed, 
          vimeo_id, point_values
        `)
        .order('title')

      if (error) {
        console.log('Trying academy_drills table...', error)
        // Fallback to academy_drills table
        const academyResult = await supabase
          .from('academy_drills')
          .select(`
            id, title, drill_category, complexity, 
            duration_minutes, sets_reps, equipment_needed, 
            vimeo_id, point_values
          `)
          .order('title')
        
        if (academyResult.error) throw academyResult.error
        data = academyResult.data
      }

      setDrills(data || [])
    } catch (error) {
      console.error('Error fetching drills:', error)
      // Use mock data if database fails
      setDrills(getMockDrills())
    } finally {
      setLoading(false)
    }
  }

  const getMockDrills = (): Drill[] => [
    {
      id: '1',
      title: 'Wall Ball Right Hand',
      drill_category: ['Wall Ball', 'Fundamentals'],
      complexity: 'foundation',
      duration_minutes: 3,
      sets_reps: '3 sets x 50 reps',
      equipment_needed: ['ball', 'stick', 'wall'],
      vimeo_id: '123456',
      point_values: { lax_credit: 25 }
    },
    {
      id: '2',
      title: 'Roll Dodge Progression',
      drill_category: ['Dodging', 'Attack'],
      complexity: 'building',
      duration_minutes: 5,
      sets_reps: '5 sets x 10 reps',
      equipment_needed: ['ball', 'stick', 'cones'],
      vimeo_id: '123457',
      point_values: { lax_credit: 35 }
    },
    {
      id: '3',
      title: 'Advanced Shooting Drills',
      drill_category: ['Shooting', 'Attack'],
      complexity: 'advanced',
      duration_minutes: 8,
      sets_reps: '4 sets x 15 shots',
      equipment_needed: ['balls', 'stick', 'goal'],
      vimeo_id: '123458',
      point_values: { lax_credit: 50 }
    },
    {
      id: '4',
      title: 'Defensive Footwork',
      drill_category: ['Defense', 'Footwork'],
      complexity: 'foundation',
      duration_minutes: 4,
      sets_reps: '3 sets x 20 reps',
      equipment_needed: ['stick', 'cones'],
      point_values: { lax_credit: 30 }
    },
    {
      id: '5',
      title: 'Ground Ball Technique',
      drill_category: ['Ground Balls', 'Fundamentals'],
      complexity: 'building',
      duration_minutes: 6,
      sets_reps: '5 sets x 10 GBs',
      equipment_needed: ['balls', 'stick'],
      point_values: { lax_credit: 40 }
    }
  ]

  // Get unique categories from all drills
  const allCategories = useMemo(() => {
    const categories = new Set<string>()
    drills.forEach(drill => {
      drill.drill_category?.forEach(cat => categories.add(cat))
    })
    return Array.from(categories).sort()
  }, [drills])

  // Get unique equipment from all drills
  const allEquipment = useMemo(() => {
    const equipment = new Set<string>()
    drills.forEach(drill => {
      drill.equipment_needed?.forEach(eq => equipment.add(eq.toLowerCase()))
    })
    return Array.from(equipment).sort()
  }, [drills])

  // Filter drills based on search and filters
  const filteredDrills = useMemo(() => {
    return drills.filter(drill => {
      // Search filter
      const matchesSearch = drill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           drill.drill_category?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Complexity filter
      const matchesComplexity = selectedComplexity.length === 0 || 
                               selectedComplexity.includes(drill.complexity)
      
      // Equipment filter
      const matchesEquipment = selectedEquipment.length === 0 ||
                              drill.equipment_needed?.some(eq => selectedEquipment.includes(eq.toLowerCase()))
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 ||
                            drill.drill_category?.some(cat => selectedCategories.includes(cat))
      
      return matchesSearch && matchesComplexity && matchesEquipment && matchesCategory
    })
  }, [drills, searchTerm, selectedComplexity, selectedEquipment, selectedCategories])

  // Calculate workout statistics
  const workoutStats = useMemo(() => {
    const totalDuration = selectedDrills.reduce((sum, drill) => sum + drill.duration_minutes, 0)
    const totalPoints = selectedDrills.reduce((sum, drill) => sum + (drill.point_values?.lax_credit || 25), 0)
    const complexityMix = {
      foundation: selectedDrills.filter(d => d.complexity === 'foundation').length,
      building: selectedDrills.filter(d => d.complexity === 'building').length,
      advanced: selectedDrills.filter(d => d.complexity === 'advanced').length
    }
    return { totalDuration, totalPoints, complexityMix, drillCount: selectedDrills.length }
  }, [selectedDrills])

  const addDrillToWorkout = (drill: Drill) => {
    const workoutDrill: WorkoutDrill = {
      ...drill,
      order: selectedDrills.length,
      workoutId: `workout-drill-${Date.now()}`
    }
    setSelectedDrills([...selectedDrills, workoutDrill])
    toast.success(`Added "${drill.title}" to workout`)
  }

  const removeDrillFromWorkout = (workoutId: string) => {
    setSelectedDrills(selectedDrills.filter(d => d.workoutId !== workoutId))
  }

  const reorderDrills = (startIndex: number, endIndex: number) => {
    const result = Array.from(selectedDrills)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    setSelectedDrills(result.map((drill, index) => ({ ...drill, order: index })))
  }

  const saveWorkout = async () => {
    if (selectedDrills.length === 0) {
      toast.error('Add at least one drill to save the workout')
      return
    }

    try {
      // Create workout object
      const workoutData = {
        title: workoutName,
        drill_order: selectedDrills.map(d => d.id),
        total_duration_minutes: workoutStats.totalDuration,
        total_points_possible: workoutStats.totalPoints,
        workout_type: 'custom',
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('skills_academy_workouts')
        .insert(workoutData)
        .select()
        .single()
      
      if (error) throw error
      
      toast.success(`Workout "${workoutName}" saved successfully!`)
      
      // Reset after save
      setSelectedDrills([])
      setWorkoutName('My Custom Workout')
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout. Please try again.')
    }
  }

  const getEquipmentIcon = (equipment: string) => {
    const eq = equipment.toLowerCase().trim()
    // Check for exact match first
    if (equipmentIcons[eq]) return equipmentIcons[eq]
    // Check for partial matches
    for (const key in equipmentIcons) {
      if (eq.includes(key) || key.includes(eq)) {
        return equipmentIcons[key]
      }
    }
    return equipmentIcons['none']
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">🏗️ Drill-Focused Workout Builder</h1>
              <p className="text-sm text-gray-600">Select drills to build your perfect custom workout</p>
            </div>
            <Button onClick={saveWorkout} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Workout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Drill Library */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Drill Library</CardTitle>
                  <Badge variant="secondary">{filteredDrills.length} drills</Badge>
                </div>
                
                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search drills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Filters */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {(selectedComplexity.length + selectedEquipment.length + selectedCategories.length) > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedComplexity.length + selectedEquipment.length + selectedCategories.length}
                        </Badge>
                      )}
                    </div>
                    {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>

                  {showFilters && (
                    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      {/* Complexity Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Complexity</label>
                        <div className="flex gap-2">
                          {Object.entries(complexityConfig).map(([key, config]) => (
                            <label key={key} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedComplexity.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComplexity([...selectedComplexity, key])
                                  } else {
                                    setSelectedComplexity(selectedComplexity.filter(c => c !== key))
                                  }
                                }}
                                className="mr-2"
                              />
                              <Badge variant="outline" className={config.color}>
                                {config.icon} {config.label}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Equipment Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Equipment Needed</label>
                        <div className="flex flex-wrap gap-2">
                          {allEquipment.map(eq => {
                            const icon = getEquipmentIcon(eq)
                            const Icon = icon.icon
                            return (
                              <label key={eq} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedEquipment.includes(eq)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedEquipment([...selectedEquipment, eq])
                                    } else {
                                      setSelectedEquipment(selectedEquipment.filter(e => e !== eq))
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Icon className="h-3 w-3" />
                                  {icon.label}
                                </Badge>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Categories</label>
                        <div className="flex flex-wrap gap-2">
                          {allCategories.map(cat => (
                            <label key={cat} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, cat])
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(c => c !== cat))
                                  }
                                }}
                                className="mr-2"
                              />
                              <Badge variant="outline">{cat}</Badge>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {(selectedComplexity.length + selectedEquipment.length + selectedCategories.length) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComplexity([])
                            setSelectedEquipment([])
                            setSelectedCategories([])
                          }}
                          className="w-full"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Drill List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading drills...</div>
                  ) : filteredDrills.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No drills found matching your filters</div>
                  ) : (
                    filteredDrills.map(drill => (
                      <div
                        key={drill.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer bg-white group"
                        onClick={() => addDrillToWorkout(drill)}
                      >
                        {/* Video Thumbnail */}
                        {drill.vimeo_id && (
                          <div className="relative h-32 bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200 transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="h-8 w-8 text-green-600" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded-full backdrop-blur">
                                <Video className="h-3 w-3 text-white" />
                                <span className="text-xs text-white font-medium">Video</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Drill Title */}
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">{drill.title}</h4>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {drill.drill_category?.map((cat, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>

                            {/* Drill Info */}
                            <div className="space-y-3">
                              {/* Top row: Complexity, Duration, and Points */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="outline" className={complexityConfig[drill.complexity].color}>
                                  {complexityConfig[drill.complexity].icon} {drill.complexity}
                                </Badge>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">{drill.duration_minutes} min</span>
                                </div>
                                {drill.point_values?.lax_credit && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Target className="h-3 w-3" />
                                    <span className="font-medium">{drill.point_values.lax_credit} pts</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Sets/Reps display */}
                              {drill.sets_reps && (
                                <div className="bg-gray-50 rounded-lg px-3 py-2">
                                  <span className="text-sm font-semibold text-gray-700">{drill.sets_reps}</span>
                                </div>
                              )}
                              
                              {/* Equipment display with visual icons */}
                              {drill.equipment_needed && drill.equipment_needed.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 uppercase tracking-wider">Equipment:</span>
                                  <div className="flex gap-1.5">
                                    {drill.equipment_needed.map((eq, idx) => {
                                      const icon = getEquipmentIcon(eq)
                                      const Icon = icon.icon
                                      return (
                                        <div 
                                          key={idx} 
                                          className="p-1.5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all" 
                                          title={icon.label}
                                        >
                                          <Icon className={`h-4 w-4 ${icon.color}`} />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                            <Button 
                              size="sm" 
                              className="ml-4 bg-green-600 hover:bg-green-700 group-hover:scale-110 transition-transform"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Selected Drills (Workout) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="text-xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none"
                />
              </CardHeader>

              <CardContent>
                {/* Workout Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <div className="text-2xl font-bold text-green-700">{workoutStats.drillCount}</div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Drills</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-700">{workoutStats.totalDuration}</div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-700">{workoutStats.totalPoints}</div>
                    </div>
                    <div className="text-xs text-yellow-600 font-medium">Points</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs font-semibold text-purple-700 mb-1">Complexity Mix</div>
                    <div className="flex gap-1 text-xs items-center">
                      <span className="flex items-center gap-0.5">
                        <span className="text-green-600">🟢</span>
                        <span className="font-bold text-green-700">{workoutStats.complexityMix.foundation}</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="text-orange-600">🟠</span>
                        <span className="font-bold text-orange-700">{workoutStats.complexityMix.building}</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="text-red-600">🔴</span>
                        <span className="font-bold text-red-700">{workoutStats.complexityMix.advanced}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Drills List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedDrills.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 bg-green-50 rounded-full animate-pulse" />
                        </div>
                        <Target className="h-12 w-12 mx-auto mb-4 text-green-400 relative z-10" />
                      </div>
                      <h3 className="font-semibold text-gray-700 mb-2">Build Your Workout</h3>
                      <p className="text-sm text-gray-500 mb-1">Click drills from the library to add them</p>
                      <p className="text-xs text-gray-400">Drag to reorder • Click + to add</p>
                    </div>
                  ) : (
                    selectedDrills.map((drill, index) => (
                      <div
                        key={drill.workoutId}
                        className="border rounded-lg bg-white hover:shadow-md transition-all group"
                        draggable
                        onDragStart={() => setDraggedDrill(drill)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedDrill) {
                            const draggedIndex = selectedDrills.findIndex(d => d.workoutId === draggedDrill.workoutId)
                            reorderDrills(draggedIndex, index)
                            setDraggedDrill(null)
                          }
                        }}
                      >
                        <div className="flex items-start p-3">
                          <div className="flex items-center gap-2 mr-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm text-gray-900 mb-1">{drill.title}</h5>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className={`text-xs ${complexityConfig[drill.complexity].color}`}>
                                    {complexityConfig[drill.complexity].icon} {drill.complexity}
                                  </Badge>
                                  <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {drill.duration_minutes} min
                                  </span>
                                  {drill.point_values?.lax_credit && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {drill.point_values.lax_credit} pts
                                    </span>
                                  )}
                                </div>
                                {drill.sets_reps && (
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">{drill.sets_reps}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeDrillFromWorkout(drill.workoutId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                {selectedDrills.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={saveWorkout}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Workout ({workoutStats.drillCount} drills)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDrills([])}
                      className="w-full"
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}