'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, Pause, SkipForward, ArrowLeft, ArrowRight, 
  CheckCircle, Trophy, Activity, Timer, Home, Target,
  Clock, ChevronLeft, ChevronRight, Award, Zap
} from 'lucide-react'
import Link from 'next/link'

export default function WorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params?.id ? parseInt(params.id as string) : null
  
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [drillTimer, setDrillTimer] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchWorkout() {
      if (!workoutId) return
      
      try {
        const { data: workoutData } = await supabase
          .from('skills_academy_workouts')
          .select(`
            *,
            series:skills_academy_series(*)
          `)
          .eq('id', workoutId)
          .single()

        const { data: drills } = await supabase
          .from('skills_academy_workout_drills')
          .select(`
            *,
            drill:skills_academy_drill_library(*)
          `)
          .eq('workout_id', workoutId)
          .order('sequence_order')

        setWorkout({
          ...workoutData,
          drills: drills || []
        })
      } catch (error) {
        console.error('Error fetching workout:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [workoutId])

  const handleMarkComplete = () => {
    setCompletedDrills(prev => new Set([...prev, currentDrillIndex]))
    setTotalPoints(prev => prev + 10) // 10 points per drill
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentDrillIndex < workout.drills.length - 1) {
        handleNext()
      } else {
        setIsCompleted(true)
      }
    }, 1000)
  }

  const handleNext = () => {
    if (currentDrillIndex < workout.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1)
      setDrillTimer(0)
      setIsPlaying(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => prev - 1)
      setDrillTimer(0)
      setIsPlaying(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      timerInterval.current = setInterval(() => {
        setDrillTimer(prev => prev + 1)
      }, 1000)
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
        timerInterval.current = null
      }
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-powlax-blue" />
              <p className="text-muted-foreground">Loading workout...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout Not Found</h1>
          <Button asChild>
            <Link href="/skills-academy">Back to Skills Academy</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    const bonusMultiplier = completedDrills.size === workout.drills.length ? 2 : 1
    const finalPoints = totalPoints * bonusMultiplier
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Celebration Header */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workout Complete!</h1>
                <p className="text-lg text-gray-600 mt-2">Outstanding work on {workout.workout_name}</p>
              </div>
            </div>

            {/* Points Card */}
            <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">{finalPoints}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {bonusMultiplier > 1 && (
                      <span className="text-green-600 font-semibold">2x Bonus for Full Completion!</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{completedDrills.size}</div>
                    <div className="text-xs text-gray-600">Drills Done</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{workout.drills.length}</div>
                    <div className="text-xs text-gray-600">Total Drills</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Math.floor(drillTimer / 60)}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="py-6 space-y-4">
                <div className="flex gap-3">
                  <Button onClick={() => {
                    setIsCompleted(false)
                    setCurrentDrillIndex(0)
                    setCompletedDrills(new Set())
                    setTotalPoints(0)
                    setDrillTimer(0)
                  }} variant="outline" className="flex-1">
                    Do Again
                  </Button>
                  <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Link href="/skills-academy">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Academy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentDrill = workout.drills[currentDrillIndex]
  const progress = (completedDrills.size / workout.drills.length) * 100
  
  // Get video URL
  const getVideoUrl = () => {
    if (!currentDrill?.drill) return null
    const drill = currentDrill.drill
    const videoType = currentDrill.video_type || 'both_hands'
    
    switch (videoType) {
      case 'strong_hand':
        return drill.strong_hand_video_url || drill.strong_hand_vimeo_id
      case 'off_hand':
        return drill.off_hand_video_url || drill.off_hand_vimeo_id
      case 'both_hands':
      default:
        return drill.both_hands_video_url || drill.both_hands_vimeo_id || 
               drill.strong_hand_video_url || drill.strong_hand_vimeo_id
    }
  }
  
  const videoUrl = getVideoUrl()
  const vimeoId = videoUrl?.includes('vimeo.com') 
    ? videoUrl.match(/vimeo\.com\/(\d+)/)?.[1] 
    : videoUrl

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/skills-academy">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{workout.workout_name}</h1>
                  <div className="text-sm text-gray-600">
                    Drill {currentDrillIndex + 1} of {workout.drill_count} - {completedDrills.size} completed
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {totalPoints} pts
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <Progress value={progress} className="h-3" />
          </div>

          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-black">
              {vimeoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={currentDrill?.drill?.drill_name || 'Drill Video'}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Target className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">No video available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Drill Info & Controls */}
          <Card>
            <CardHeader>
              <CardTitle>{currentDrill?.drill?.drill_name || `Drill ${currentDrillIndex + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDrill?.drill?.description && (
                <p className="text-gray-600">{currentDrill.drill.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                {currentDrill?.drill_duration_seconds && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold">{currentDrill.drill_duration_seconds}s</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                )}
                {currentDrill?.repetitions && (
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold">{currentDrill.repetitions}</div>
                    <div className="text-xs text-gray-500">Reps</div>
                  </div>
                )}
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold">
                    {formatTime(drillTimer)}
                  </div>
                  <div className="text-xs text-gray-500">Time</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentDrillIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {!completedDrills.has(currentDrillIndex) ? (
                  <Button 
                    onClick={handleMarkComplete}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mark Complete
                  </Button>
                ) : (
                  <Button
                    variant="outline" 
                    disabled
                    className="flex-1"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Completed!
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentDrillIndex === workout.drills.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}