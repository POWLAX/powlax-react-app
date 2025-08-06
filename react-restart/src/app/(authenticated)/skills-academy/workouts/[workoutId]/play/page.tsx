'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, X, ChevronRight, ChevronLeft, SkipForward,
  Target, Clock, ListOrdered
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/JWTAuthContext'
import { toast } from 'sonner'

interface Drill {
  id: string
  title: string
  vimeo_id?: string
  drill_category: string[]
  complexity: 'foundation' | 'building' | 'advanced'
  duration_minutes: number
  instructions?: string
  coaching_tips?: string
  equipment_needed?: string[]
  point_values?: {
    lax_credit: number
    [key: string]: number
  }
}

interface WorkoutSession {
  id: string
  title: string
  position: string
  workout_type: string
  drills: Drill[]
  totalDuration: number
  totalPoints: number
  isCoachAssigned?: boolean
  bonusMultiplier?: number
}

const BASE_DRILL_POINTS = 25
const MAX_DRILL_TIME = 120 // 2 minutes max per drill

export default function SimplifiedWorkoutPlayer() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [workout, setWorkout] = useState<WorkoutSession | null>(null)
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [completedDrills, setCompletedDrills] = useState<string[]>([])
  const [drillActive, setDrillActive] = useState(false)
  const [drillTimeRemaining, setDrillTimeRemaining] = useState(0)
  const [totalPointsEarned, setTotalPointsEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const drillTimerRef = useRef<NodeJS.Timeout | null>(null)

  const workoutId = params.workoutId as string

  useEffect(() => {
    fetchWorkout()
  }, [workoutId])

  useEffect(() => {
    // Auto-advance drill after timer completes
    if (drillActive && drillTimeRemaining > 0) {
      drillTimerRef.current = setTimeout(() => {
        setDrillTimeRemaining(prev => {
          if (prev <= 1) {
            handleDrillComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (drillTimerRef.current) {
        clearTimeout(drillTimerRef.current)
      }
    }
  }, [drillActive, drillTimeRemaining])

  const fetchWorkout = async () => {
    try {
      // Fetch workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('skills_academy_workouts')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (workoutError) throw workoutError

      // Fetch drills for this workout
      let drills: Drill[] = []
      if (workoutData?.drill_order && workoutData.drill_order.length > 0) {
        const { data: drillsData, error: drillsError } = await supabase
          .from('skills_academy_drills')
          .select('*')
          .in('id', workoutData.drill_order)

        if (drillsError) throw drillsError
        
        // Sort drills by the order specified in drill_order
        drills = workoutData.drill_order.map((drillId: string) => 
          drillsData?.find(d => d.id === drillId)
        ).filter(Boolean)
      }

      // If no real data, use mock data
      if (drills.length === 0) {
        drills = getMockDrills()
      }

      setWorkout({
        id: workoutData?.id || workoutId,
        title: workoutData?.title || 'Skills Training Workout',
        position: workoutData?.position || 'attack',
        workout_type: workoutData?.workout_type || 'more',
        drills,
        totalDuration: drills.reduce((sum, d) => sum + (d.duration_minutes || 5), 0),
        totalPoints: drills.length * BASE_DRILL_POINTS,
        isCoachAssigned: false, // TODO: Check if coach assigned
        bonusMultiplier: 1
      })
    } catch (error) {
      console.error('Error fetching workout:', error)
      // Use mock data as fallback
      const mockDrills = getMockDrills()
      setWorkout({
        id: workoutId,
        title: 'Skills Training Workout',
        position: 'attack',
        workout_type: 'more',
        drills: mockDrills,
        totalDuration: mockDrills.reduce((sum, d) => sum + d.duration_minutes, 0),
        totalPoints: mockDrills.length * BASE_DRILL_POINTS,
        isCoachAssigned: false,
        bonusMultiplier: 1
      })
    } finally {
      setLoading(false)
    }
  }

  const getMockDrills = (): Drill[] => [
    {
      id: '1',
      title: 'Wall Ball - Right Hand',
      vimeo_id: '123456',
      drill_category: ['Wall Ball', 'Fundamentals'],
      complexity: 'foundation',
      duration_minutes: 3,
      instructions: 'Stand 5 feet from wall. Use only right hand for 50 reps.',
      coaching_tips: 'Keep elbow high, snap wrist on release',
      equipment_needed: ['Stick', 'Ball', 'Wall'],
      point_values: { lax_credit: 25 }
    },
    {
      id: '2',
      title: 'Roll Dodge Progression',
      vimeo_id: '123457',
      drill_category: ['Dodging', 'Attack'],
      complexity: 'building',
      duration_minutes: 5,
      instructions: 'Set up cones 5 yards apart. Execute roll dodge at each cone.',
      coaching_tips: 'Keep stick protected, explode out of dodge',
      equipment_needed: ['Stick', 'Ball', 'Cones'],
      point_values: { lax_credit: 25, attack_tokens: 25 }
    },
    {
      id: '3',
      title: 'Quick Stick Shooting',
      vimeo_id: '123458',
      drill_category: ['Shooting', 'Attack'],
      complexity: 'advanced',
      duration_minutes: 4,
      instructions: 'Receive pass and shoot in one motion. 20 reps each side.',
      coaching_tips: 'No cradle, direct to target',
      equipment_needed: ['Stick', 'Ball', 'Goal'],
      point_values: { lax_credit: 25, attack_tokens: 25 }
    }
  ]

  const currentDrill = workout?.drills[currentDrillIndex]
  
  const handleBeginDrill = () => {
    setDrillActive(true)
    setDrillTimeRemaining(Math.min(currentDrill?.duration_minutes || 1 * 60, MAX_DRILL_TIME))
  }

  const handleDrillComplete = () => {
    if (!currentDrill) return

    setDrillActive(false)
    setCompletedDrills([...completedDrills, currentDrill.id])
    setTotalPointsEarned(prev => prev + BASE_DRILL_POINTS)

    // Auto-advance to next drill
    if (currentDrillIndex < (workout?.drills.length || 0) - 1) {
      setTimeout(() => {
        setCurrentDrillIndex(prev => prev + 1)
      }, 1000)
    } else {
      handleWorkoutComplete()
    }
  }
  
  const handleSkipDrill = () => {
    if (drillTimerRef.current) {
      clearTimeout(drillTimerRef.current)
    }
    handleDrillComplete()
  }

  const handleWorkoutComplete = () => {
    const basePoints = completedDrills.length * BASE_DRILL_POINTS
    const completionBonus = completedDrills.length === workout?.drills.length ? 100 : 0
    const totalWithBonuses = basePoints + completionBonus

    setTotalPointsEarned(totalWithBonuses)
    saveWorkoutCompletion(totalWithBonuses)
    
    toast.success(`Workout Complete! +${totalWithBonuses} points earned!`)
    router.push('/skills-academy/player')
  }

  const saveWorkoutCompletion = async (points: number) => {
    if (!user || !workout) return

    try {
      // TODO: Save to Supabase
      console.log('Saving workout completion:', {
        user_id: user.id,
        workout_id: workout.id,
        drills_completed: completedDrills,
        points_earned: points,
        completion_time: new Date()
      })
    } catch (error) {
      console.error('Error saving workout completion:', error)
    }
  }

  const handleExitWorkout = () => {
    if (drillTimerRef.current) {
      clearTimeout(drillTimerRef.current)
    }
    if (completedDrills.length > 0) {
      toast.info(`${totalPointsEarned} points earned from ${completedDrills.length} drills`)
    }
    router.push('/skills-academy/player')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!workout || !currentDrill) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8">
          <p className="text-gray-600">Workout not found</p>
          <Button onClick={() => router.push('/skills-academy/player')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitWorkout}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-80">Drill {currentDrillIndex + 1} / {workout.drills.length}</span>
              <span className="text-sm flex items-center gap-1">
                <Target className="h-3 w-3" />
                {totalPointsEarned} pts
              </span>
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex gap-1">
            {workout.drills.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx < currentDrillIndex
                    ? 'bg-green-500'
                    : idx === currentDrillIndex
                    ? 'bg-white w-8'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <ListOrdered className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Video-Centric Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl">
          {/* Video Container */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
            {currentDrill.vimeo_id ? (
              <iframe
                src={`https://player.vimeo.com/video/${currentDrill.vimeo_id}?autoplay=1&loop=1&title=0&byline=0&portrait=0`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="h-10 w-10 text-white/60" />
                  </div>
                  <p className="text-white/60">No video available</p>
                </div>
              </div>
            )}
          </div>

          {/* Drill Info Below Video */}
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentDrill.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  {currentDrill.complexity}
                </Badge>
                {currentDrill.drill_category?.map((cat, idx) => (
                  <Badge key={idx} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Sets/Reps Display */}
            {currentDrill.sets_reps && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-green-900">
                  {currentDrill.sets_reps}
                </p>
              </div>
            )}
            
            {/* Instructions */}
            {currentDrill.instructions && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                <p className="text-gray-700">{currentDrill.instructions}</p>
              </div>
            )}
            
            {/* Coaching Tips / Emphasis Notes */}
            {currentDrill.coaching_tips && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-1">Emphasis</h3>
                <p className="text-blue-800">{currentDrill.coaching_tips}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!drillActive ? (
                <Button
                  onClick={handleBeginDrill}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Begin Drill
                </Button>
              ) : (
                <>
                  <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                    <p className="text-3xl font-bold text-gray-900">{formatTime(drillTimeRemaining)}</p>
                  </div>
                  <Button
                    onClick={handleSkipDrill}
                    size="lg"
                    variant="outline"
                    className="px-8"
                  >
                    <SkipForward className="h-5 w-5 mr-2" />
                    Next Drill
                  </Button>
                </>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => currentDrillIndex > 0 && setCurrentDrillIndex(currentDrillIndex - 1)}
                disabled={currentDrillIndex === 0}
                className="text-gray-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                {currentDrillIndex + 1} of {workout.drills.length}
              </span>
              <Button
                variant="ghost"
                onClick={() => currentDrillIndex < workout.drills.length - 1 && setCurrentDrillIndex(currentDrillIndex + 1)}
                disabled={currentDrillIndex === workout.drills.length - 1}
                className="text-gray-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Drill List */}
      {showSidebar && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-40 overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Workout Drills</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {workout.drills.map((drill, idx) => (
                <button
                  key={drill.id}
                  onClick={() => {
                    setCurrentDrillIndex(idx)
                    setShowSidebar(false)
                    setDrillActive(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    idx === currentDrillIndex
                      ? 'bg-green-50 border-2 border-green-500'
                      : completedDrills.includes(drill.id)
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      completedDrills.includes(drill.id)
                        ? 'bg-green-500 text-white'
                        : idx === currentDrillIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        idx === currentDrillIndex ? 'font-semibold' : ''
                      } truncate`}>
                        {drill.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {drill.duration_minutes} min • {drill.complexity}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}