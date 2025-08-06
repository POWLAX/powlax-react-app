'use client'

import { useState } from 'react'
import { Plus, Save, FolderOpen, Trophy, Clock, Target, Zap, Lock, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DrillLibraryAcademy from '@/components/skills-academy/workout-builder/DrillLibraryAcademy'
import WorkoutTimeline from '@/components/skills-academy/workout-builder/WorkoutTimeline'
import CategoryBalance from '@/components/skills-academy/workout-builder/CategoryBalance'
import SaveWorkoutModal from '@/components/skills-academy/workout-builder/SaveWorkoutModal'
import { toast } from 'sonner'

interface WorkoutTemplate {
  id: string
  name: string
  category: 'attack' | 'defense' | 'midfield' | 'wall_ball'
  level: 'mini' | 'more' | 'complete'
  duration: number
  drillCount: number
  complexity: 'foundation' | 'building' | 'advanced'
  targetPoints: {
    category: number
    lax_credit: number
  }
  drills: string[] // Drill names/IDs that should be included
  unlockRequirement?: {
    level: 'mini' | 'more'
    completions: number
  }
  isLocked?: boolean
  completions?: number
}

interface LearningPath {
  category: 'attack' | 'defense' | 'midfield' | 'wall_ball'
  mini: WorkoutTemplate
  more: WorkoutTemplate
  complete: WorkoutTemplate
  userProgress: {
    miniCompletions: number
    moreCompletions: number
    completeCompletions: number
    currentStreak: number
    totalPoints: number
  }
}

const structuredPaths: Record<string, LearningPath> = {
  attack: {
    category: 'attack',
    mini: {
      id: 'attack-mini',
      name: 'Attack Foundations - Mini',
      category: 'attack',
      level: 'mini',
      duration: 5,
      drillCount: 3,
      complexity: 'foundation',
      targetPoints: { category: 5, lax_credit: 5 },
      drills: ['Wall Ball Basic', 'Catch & Throw', 'Shooting Form']
    },
    more: {
      id: 'attack-more',
      name: 'Attack Development - More',
      category: 'attack',
      level: 'more',
      duration: 10,
      drillCount: 5,
      complexity: 'building',
      targetPoints: { category: 12, lax_credit: 12 },
      drills: ['Split Dodge', 'Roll Dodge', 'Basic Shooting', 'Wall Ball Series', 'Quick Stick'],
      unlockRequirement: { level: 'mini', completions: 3 }
    },
    complete: {
      id: 'attack-complete',
      name: 'Attack Mastery - Complete',
      category: 'attack',
      level: 'complete',
      duration: 16,
      drillCount: 8,
      complexity: 'advanced',
      targetPoints: { category: 25, lax_credit: 25 },
      drills: ['Advanced Dodging', 'Shooting Variety', '1v1 Situations', 'Pressure Drills', 'Face Dodge', 'Behind the Back', 'Time & Room', 'Quick Release'],
      unlockRequirement: { level: 'more', completions: 5 }
    },
    userProgress: {
      miniCompletions: 2,
      moreCompletions: 0,
      completeCompletions: 0,
      currentStreak: 1,
      totalPoints: 120
    }
  },
  defense: {
    category: 'defense',
    mini: {
      id: 'defense-mini',
      name: 'Defense Foundations - Mini',
      category: 'defense',
      level: 'mini',
      duration: 5,
      drillCount: 3,
      complexity: 'foundation',
      targetPoints: { category: 5, lax_credit: 5 },
      drills: ['Defensive Stance', 'Footwork Basics', 'Stick Positioning']
    },
    more: {
      id: 'defense-more',
      name: 'Defense Development - More',
      category: 'defense',
      level: 'more',
      duration: 10,
      drillCount: 5,
      complexity: 'building',
      targetPoints: { category: 12, lax_credit: 12 },
      drills: ['Approach & Breakdown', 'Hip Positioning', 'Defensive Slides', 'Checking Technique', 'Recovery Steps'],
      unlockRequirement: { level: 'mini', completions: 3 }
    },
    complete: {
      id: 'defense-complete',
      name: 'Defense Mastery - Complete',
      category: 'defense',
      level: 'complete',
      duration: 16,
      drillCount: 8,
      complexity: 'advanced',
      targetPoints: { category: 25, lax_credit: 25 },
      drills: ['Advanced Positioning', '1v1 Defense', 'Team Slides', 'Communication Drills', 'Pressure Defense', 'Adjacent Slides', 'Crease Defense', 'Transition D'],
      unlockRequirement: { level: 'more', completions: 5 }
    },
    userProgress: {
      miniCompletions: 0,
      moreCompletions: 0,
      completeCompletions: 0,
      currentStreak: 0,
      totalPoints: 0
    }
  },
  midfield: {
    category: 'midfield',
    mini: {
      id: 'midfield-mini',
      name: 'Midfield Foundations - Mini',
      category: 'midfield',
      level: 'mini',
      duration: 5,
      drillCount: 3,
      complexity: 'foundation',
      targetPoints: { category: 5, lax_credit: 5 },
      drills: ['Ground Ball Technique', 'Transition Basics', 'Two-Way Running']
    },
    more: {
      id: 'midfield-more',
      name: 'Midfield Development - More',
      category: 'midfield',
      level: 'more',
      duration: 10,
      drillCount: 5,
      complexity: 'building',
      targetPoints: { category: 12, lax_credit: 12 },
      drills: ['Ground Ball Battles', 'Fast Break', 'Clearing Patterns', 'Face-off Wings', 'Two-Way Middie'],
      unlockRequirement: { level: 'mini', completions: 3 }
    },
    complete: {
      id: 'midfield-complete',
      name: 'Midfield Mastery - Complete',
      category: 'midfield',
      level: 'complete',
      duration: 16,
      drillCount: 8,
      complexity: 'advanced',
      targetPoints: { category: 25, lax_credit: 25 },
      drills: ['Advanced Ground Balls', 'Transition Offense', 'Transition Defense', 'LSM Skills', 'Face-off Specialist', 'Conditioning Drills', 'Riding', 'Clearing'],
      unlockRequirement: { level: 'more', completions: 5 }
    },
    userProgress: {
      miniCompletions: 1,
      moreCompletions: 0,
      completeCompletions: 0,
      currentStreak: 0,
      totalPoints: 45
    }
  },
  wall_ball: {
    category: 'wall_ball',
    mini: {
      id: 'wallball-mini',
      name: 'Wall Ball Foundations - Mini',
      category: 'wall_ball',
      level: 'mini',
      duration: 5,
      drillCount: 3,
      complexity: 'foundation',
      targetPoints: { category: 5, lax_credit: 5 },
      drills: ['Basic Wall Ball', 'Strong Hand Focus', 'Weak Hand Development']
    },
    more: {
      id: 'wallball-more',
      name: 'Wall Ball Development - More',
      category: 'wall_ball',
      level: 'more',
      duration: 10,
      drillCount: 5,
      complexity: 'building',
      targetPoints: { category: 12, lax_credit: 12 },
      drills: ['Quick Stick Wall Ball', 'One Hand Cradle', 'Behind the Back', 'Cross Hand', 'Rapid Fire'],
      unlockRequirement: { level: 'mini', completions: 3 }
    },
    complete: {
      id: 'wallball-complete',
      name: 'Wall Ball Mastery - Complete',
      category: 'wall_ball',
      level: 'complete',
      duration: 16,
      drillCount: 8,
      complexity: 'advanced',
      targetPoints: { category: 25, lax_credit: 25 },
      drills: ['Advanced Patterns', 'BTB Variations', 'Split Dodge Wall', 'Canadian Wall Ball', 'Two Ball Wall Ball', 'Fake & Shoot', 'Ground Ball Wall', 'Competition Series'],
      unlockRequirement: { level: 'more', completions: 5 }
    },
    userProgress: {
      miniCompletions: 5,
      moreCompletions: 3,
      completeCompletions: 0,
      currentStreak: 3,
      totalPoints: 210
    }
  }
}

const categoryIcons = {
  attack: '⚔️',
  defense: '🛡️',
  midfield: '🏃',
  wall_ball: '🎾'
}

export default function AdvancedWorkoutBuilderPage() {
  const [activeTab, setActiveTab] = useState('paths')
  const [selectedPath, setSelectedPath] = useState<string>('attack')
  const [customWorkoutSlots, setCustomWorkoutSlots] = useState<any[]>([])
  const [showDrillLibrary, setShowDrillLibrary] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [workoutName, setWorkoutName] = useState('My Custom Workout')

  const currentPath = structuredPaths[selectedPath]

  const isWorkoutUnlocked = (workout: WorkoutTemplate): boolean => {
    if (!workout.unlockRequirement) return true
    
    const progress = currentPath.userProgress
    if (workout.unlockRequirement.level === 'mini') {
      return progress.miniCompletions >= workout.unlockRequirement.completions
    } else if (workout.unlockRequirement.level === 'more') {
      return progress.moreCompletions >= workout.unlockRequirement.completions
    }
    return false
  }

  const startWorkout = (template: WorkoutTemplate) => {
    if (!isWorkoutUnlocked(template)) {
      toast.error('Complete previous workouts to unlock this level')
      return
    }
    
    // TODO: Navigate to interactive workout with template
    toast.success(`Starting ${template.name}`)
  }

  const handleAddDrill = (drill: any) => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      drill,
      order: customWorkoutSlots.length
    }
    setCustomWorkoutSlots([...customWorkoutSlots, newSlot])
  }

  const handleRemoveDrill = (slotId: string) => {
    setCustomWorkoutSlots(customWorkoutSlots.filter(slot => slot.id !== slotId))
  }

  const handleReorderDrills = (newOrder: any[]) => {
    setCustomWorkoutSlots(newOrder)
  }

  const handleSaveWorkout = async (name: string, notes?: string) => {
    // TODO: Save to Supabase
    toast.success(`Workout "${name}" saved!`)
    setShowSaveModal(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🎓 Structured Learning Paths</h1>
            <p className="text-sm text-gray-600">Progressive skill development with Mini/More/Complete workouts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="custom">Custom Builder</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab}>
          <TabsContent value="paths" className="p-4">
            {/* Category Selection */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {Object.keys(structuredPaths).map(category => (
                <Button
                  key={category}
                  variant={selectedPath === category ? 'default' : 'outline'}
                  onClick={() => setSelectedPath(category)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </div>

            {/* Path Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[selectedPath as keyof typeof categoryIcons]}</span>
                  {selectedPath.charAt(0).toUpperCase() + selectedPath.slice(1).replace('_', ' ')} Development Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentPath.userProgress.miniCompletions + currentPath.userProgress.moreCompletions + currentPath.userProgress.completeCompletions}
                    </div>
                    <div className="text-xs text-gray-600">Total Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentPath.userProgress.currentStreak}
                    </div>
                    <div className="text-xs text-gray-600">Current Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentPath.userProgress.totalPoints}
                    </div>
                    <div className="text-xs text-gray-600">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((currentPath.userProgress.miniCompletions > 0 ? 33 : 0) + 
                                 (currentPath.userProgress.moreCompletions > 0 ? 33 : 0) + 
                                 (currentPath.userProgress.completeCompletions > 0 ? 34 : 0))}%
                    </div>
                    <div className="text-xs text-gray-600">Path Progress</div>
                  </div>
                </div>
                <Progress 
                  value={(currentPath.userProgress.miniCompletions > 0 ? 33 : 0) + 
                         (currentPath.userProgress.moreCompletions > 0 ? 33 : 0) + 
                         (currentPath.userProgress.completeCompletions > 0 ? 34 : 0)} 
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Workout Levels */}
            <div className="space-y-4">
              {/* Mini Workout */}
              <Card className={!isWorkoutUnlocked(currentPath.mini) ? 'opacity-75' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                          📍
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            Mini ({currentPath.mini.duration} min)
                            {currentPath.userProgress.miniCompletions >= 3 && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </h3>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Foundation Level
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-13 space-y-2">
                        <p className="text-sm text-gray-600">
                          {currentPath.mini.drillCount} essential drills • {currentPath.mini.targetPoints.category} category pts • {currentPath.mini.targetPoints.lax_credit} lax credit
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-6 h-6 rounded-full border-2 border-white ${
                                    i < currentPath.userProgress.miniCompletions ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              Completed {currentPath.userProgress.miniCompletions}/3
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => startWorkout(currentPath.mini)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {currentPath.userProgress.miniCompletions > 0 ? 'Continue' : 'Start'} Path
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      {currentPath.userProgress.miniCompletions > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startWorkout(currentPath.mini)}
                        >
                          Start Over
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* More Workout */}
              <Card className={!isWorkoutUnlocked(currentPath.more) ? 'opacity-75' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          📈
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            More ({currentPath.more.duration} min)
                            {!isWorkoutUnlocked(currentPath.more) && <Lock className="h-4 w-4 text-gray-400" />}
                            {currentPath.userProgress.moreCompletions >= 5 && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </h3>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Building Level
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-13 space-y-2">
                        <p className="text-sm text-gray-600">
                          {currentPath.more.drillCount} progressive drills • {currentPath.more.targetPoints.category} category pts • {currentPath.more.targetPoints.lax_credit} lax credit
                        </p>
                        {!isWorkoutUnlocked(currentPath.more) ? (
                          <p className="text-xs text-orange-600 font-medium">
                            🔒 Unlock: Complete {currentPath.more.unlockRequirement?.completions} Mini workouts ({currentPath.userProgress.miniCompletions}/{currentPath.more.unlockRequirement?.completions})
                          </p>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-6 h-6 rounded-full border-2 border-white ${
                                      i < currentPath.userProgress.moreCompletions ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                Completed {currentPath.userProgress.moreCompletions}/5
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => startWorkout(currentPath.more)}
                        size="sm"
                        disabled={!isWorkoutUnlocked(currentPath.more)}
                        className="flex items-center gap-2"
                      >
                        {!isWorkoutUnlocked(currentPath.more) ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Locked
                          </>
                        ) : currentPath.userProgress.moreCompletions > 0 ? (
                          <>Continue Path <ChevronRight className="h-4 w-4" /></>
                        ) : (
                          <>Start Path <ChevronRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Workout */}
              <Card className={!isWorkoutUnlocked(currentPath.complete) ? 'opacity-75' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          🏆
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            Complete ({currentPath.complete.duration} min)
                            {!isWorkoutUnlocked(currentPath.complete) && <Lock className="h-4 w-4 text-gray-400" />}
                            {currentPath.userProgress.completeCompletions > 0 && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </h3>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            Advanced Level
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-13 space-y-2">
                        <p className="text-sm text-gray-600">
                          {currentPath.complete.drillCount} mastery drills • {currentPath.complete.targetPoints.category} category pts • {currentPath.complete.targetPoints.lax_credit} lax credit
                        </p>
                        {!isWorkoutUnlocked(currentPath.complete) ? (
                          <p className="text-xs text-orange-600 font-medium">
                            🔒 Unlock: Complete {currentPath.complete.unlockRequirement?.completions} More workouts ({currentPath.userProgress.moreCompletions}/{currentPath.complete.unlockRequirement?.completions})
                          </p>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">
                                Completed {currentPath.userProgress.completeCompletions} times
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => startWorkout(currentPath.complete)}
                        size="sm"
                        disabled={!isWorkoutUnlocked(currentPath.complete)}
                        className="flex items-center gap-2"
                      >
                        {!isWorkoutUnlocked(currentPath.complete) ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Locked
                          </>
                        ) : (
                          <>Start Path <ChevronRight className="h-4 w-4" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Build Custom Workout CTA */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Want more flexibility?</h3>
                    <p className="text-sm text-blue-700 mt-1">Build a completely custom workout with any drills you choose</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('custom')}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Build Custom Workout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="p-4">
            <div className="flex gap-4">
              {/* Main Builder Area */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <input
                        type="text"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        className="text-xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowSaveModal(true)}
                          disabled={customWorkoutSlots.length === 0}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm"
                          disabled={customWorkoutSlots.length === 0}
                        >
                          <Trophy className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkoutTimeline
                      slots={customWorkoutSlots}
                      onRemoveDrill={handleRemoveDrill}
                      onReorderDrills={handleReorderDrills}
                    />
                    
                    {customWorkoutSlots.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No drills added yet</p>
                        <p className="text-sm mt-1">Add drills from the library to build your workout</p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setShowDrillLibrary(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Drill
                    </Button>
                  </CardContent>
                </Card>

                {customWorkoutSlots.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryBalance slots={customWorkoutSlots} />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Drill Library Sidebar - Desktop */}
              <div className="hidden lg:block w-96 border-l bg-white">
                <DrillLibraryAcademy onAddDrill={handleAddDrill} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Drill Library */}
      {showDrillLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Skills Academy Drills</h3>
              <button
                onClick={() => setShowDrillLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <DrillLibraryAcademy onAddDrill={(drill) => {
              handleAddDrill(drill)
              setShowDrillLibrary(false)
            }} />
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveWorkoutModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveWorkout}
        defaultName={workoutName}
      />
    </div>
  )
}