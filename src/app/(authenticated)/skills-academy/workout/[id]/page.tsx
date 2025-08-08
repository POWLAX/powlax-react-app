'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, Pause, SkipForward, ArrowLeft, ArrowRight, 
  CheckCircle, Trophy, Activity, Timer, Home
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
  }

  const handleNext = () => {
    handleMarkComplete()
    if (currentDrillIndex < workout.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => prev - 1)
    }
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Workout Complete!</h1>
              <p className="text-muted-foreground">Great job on {workout.workout_name}</p>
            </div>
          </div>

          <Card>
            <CardContent className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{completedDrills.size}/{workout.drills.length}</div>
                  <div className="text-sm text-muted-foreground">Drills Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{workout.estimated_duration_minutes || 15}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => {
                  setIsCompleted(false)
                  setCurrentDrillIndex(0)
                  setCompletedDrills(new Set())
                }} variant="outline" className="flex-1">
                  Do Again
                </Button>
                <Button asChild className="flex-1">
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
    )
  }

  const currentDrill = workout.drills[currentDrillIndex]
  const progress = ((currentDrillIndex + 1) / workout.drills.length) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workout.workout_name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{workout.workout_size}</Badge>
              <span>{workout.drill_count} drills</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/skills-academy">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Link>
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Drill {currentDrillIndex + 1} of {workout.drills.length}</span>
                <span>{completedDrills.size} completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Current Drill */}
        {currentDrill && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentDrill.drill?.drill_name || `Drill ${currentDrillIndex + 1}`}</span>
                {completedDrills.has(currentDrillIndex) && (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentDrill.drill?.description && (
                <p className="text-muted-foreground">{currentDrill.drill.description}</p>
              )}
              
              {currentDrill.workout_specific_instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm">{currentDrill.workout_specific_instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentDrill.drill_duration_seconds && (
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{currentDrill.drill_duration_seconds}s</span>
                  </div>
                )}
                {currentDrill.repetitions && (
                  <div>
                    <span className="text-muted-foreground">Reps: </span>
                    <span className="font-medium">{currentDrill.repetitions}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Hand: </span>
                  <span className="font-medium">{currentDrill.video_type.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentDrillIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {!completedDrills.has(currentDrillIndex) && (
                  <Button onClick={handleMarkComplete}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                )}

                <Button onClick={handleNext}>
                  {currentDrillIndex === workout.drills.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}