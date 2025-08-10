'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, Pause, SkipForward, RotateCcw, Home, 
  ArrowLeft, ArrowRight, Clock, Trophy, Target,
  CheckCircle, Timer
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface WallBallDrill {
  id: number
  sequence_order: number
  video_type: 'strong_hand' | 'off_hand' | 'both_hands'
  duration_seconds?: number
  drill: {
    id: number
    name: string
    description?: string
    strong_hand_video_url?: string
    off_hand_video_url?: string
    both_hands_video_url?: string
    strong_hand_vimeo_id?: string
    off_hand_vimeo_id?: string
    both_hands_vimeo_id?: string
    difficulty_level?: number
  }
}

interface WallBallWorkout {
  id: number
  name: string
  workout_type?: string
  duration_minutes?: number
  has_coaching?: boolean
  video_url?: string
  vimeo_id?: string
  difficulty_level?: number
  description?: string
  drills: WallBallDrill[]
}

interface WorkoutProgress {
  currentDrillIndex: number
  totalDrills: number
  isPlaying: boolean
  drillTimeRemaining: number
  totalTime: number
  startTime: Date
  completedAt?: Date
}

interface WallBallWorkoutRunnerProps {
  workout: WallBallWorkout | any // Allow both structures for now
}

export default function WallBallWorkoutRunner({ workout }: WallBallWorkoutRunnerProps) {
  const router = useRouter()
  
  // Handle both WallBallWorkout and WallBallVariant structures
  const drillsCount = workout.drills?.length || workout.total_drills || 0
  const durationMinutes = workout.duration_minutes || 10
  const workoutName = workout.name || workout.variant_name || workout.series?.series_name || 'Wall Ball Workout'
  
  const [progress, setProgress] = useState<WorkoutProgress>({
    currentDrillIndex: 0,
    totalDrills: drillsCount,
    isPlaying: false,
    drillTimeRemaining: 0,
    totalTime: durationMinutes * 60,
    startTime: new Date()
  })
  const [isCompleted, setIsCompleted] = useState(false)

  // Handle both structures - create mock drill if using WallBallVariant
  const currentDrill = workout.drills?.[progress.currentDrillIndex] || {
    id: progress.currentDrillIndex + 1,
    name: `Wall Ball Drill ${progress.currentDrillIndex + 1}`,
    description: `Wall Ball exercise ${progress.currentDrillIndex + 1}`,
    duration_seconds: 60,
    video_type: 'both_hands'
  }
  const isLastDrill = progress.currentDrillIndex === progress.totalDrills - 1
  const progressPercentage = ((progress.currentDrillIndex + 1) / progress.totalDrills) * 100

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (progress.isPlaying && progress.drillTimeRemaining > 0) {
      interval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          drillTimeRemaining: Math.max(0, prev.drillTimeRemaining - 1)
        }))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [progress.isPlaying, progress.drillTimeRemaining])

  // Auto-advance when drill time is up
  useEffect(() => {
    if (progress.drillTimeRemaining === 0 && progress.isPlaying) {
      handleNextDrill()
    }
  }, [progress.drillTimeRemaining, progress.isPlaying])

  // Initialize drill time when drill changes
  useEffect(() => {
    if (currentDrill) {
      const drillDuration = currentDrill?.duration_seconds || 30 // Default 30 seconds
      setProgress(prev => ({
        ...prev,
        drillTimeRemaining: drillDuration,
        isPlaying: false
      }))
    }
  }, [progress.currentDrillIndex])

  const handlePlayPause = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  const handleNextDrill = useCallback(() => {
    if (isLastDrill) {
      setProgress(prev => ({
        ...prev,
        completedAt: new Date(),
        isPlaying: false
      }))
      setIsCompleted(true)
    } else {
      setProgress(prev => ({
        ...prev,
        currentDrillIndex: prev.currentDrillIndex + 1,
        isPlaying: false
      }))
    }
  }, [isLastDrill])

  const handlePreviousDrill = useCallback(() => {
    if (progress.currentDrillIndex > 0) {
      setProgress(prev => ({
        ...prev,
        currentDrillIndex: prev.currentDrillIndex - 1,
        isPlaying: false
      }))
    }
  }, [progress.currentDrillIndex])

  const handleRestart = useCallback(() => {
    setProgress({
      currentDrillIndex: 0,
      totalDrills: drillsCount,
      isPlaying: false,
      drillTimeRemaining: workout.drills?.[0]?.duration_seconds || 30,
      totalTime: (workout.duration_minutes || 10) * 60,
      startTime: new Date()
    })
    setIsCompleted(false)
  }, [workout])

  const getVideoUrl = (drill: WallBallDrill) => {
    const { video_type, drill: drillData } = drill
    switch (video_type) {
      case 'strong_hand':
        return drillData.strong_hand_video_url
      case 'off_hand':
        return drillData.off_hand_video_url
      case 'both_hands':
        return drillData.both_hands_video_url
      default:
        return drillData.strong_hand_video_url
    }
  }

  const getVimeoId = (drill: WallBallDrill) => {
    const { video_type, drill: drillData } = drill
    switch (video_type) {
      case 'strong_hand':
        return drillData.strong_hand_vimeo_id
      case 'off_hand':
        return drillData.off_hand_vimeo_id
      case 'both_hands':
        return drillData.both_hands_vimeo_id
      default:
        return drillData.strong_hand_vimeo_id
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isCompleted) {
    const completionTime = progress.completedAt && progress.startTime
      ? Math.round((progress.completedAt.getTime() - progress.startTime.getTime()) / 1000)
      : 0

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Completion Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wall Ball Complete!</h1>
            <p className="text-muted-foreground">Excellent work on {workoutName}</p>
          </div>
        </div>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Workout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{progress.totalDrills}</div>
                <div className="text-sm text-muted-foreground">Drills Completed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{formatTime(completionTime)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>

            {/* Workout Info */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {workout.workout_type && (
                  <Badge variant="outline">{workout.workout_type}</Badge>
                )}
                {workout.duration_minutes && (
                  <span>{workout.duration_minutes} min target</span>
                )}
                {workout.difficulty_level && (
                  <span>Level {workout.difficulty_level}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRestart} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
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
    )
  }

  if (!currentDrill) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertDescription>
            This workout doesn&apos;t have any drills configured yet.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workoutName}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {workout.workout_type && (
              <Badge variant="outline">{workout.workout_type}</Badge>
            )}
            {workout.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {workout.duration_minutes} min
              </span>
            )}
            {!workout.has_coaching && (
              <Badge variant="secondary">No Coaching</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/skills-academy/wall-ball">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Drill {progress.currentDrillIndex + 1} of {progress.totalDrills}</span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTime(progress.drillTimeRemaining)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Drill Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              {currentDrill.drill?.name || currentDrill.name}
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize",
                currentDrill?.video_type === 'strong_hand' && "border-blue-500 text-blue-700",
                currentDrill?.video_type === 'off_hand' && "border-red-500 text-red-700",
                currentDrill?.video_type === 'both_hands' && "border-green-500 text-green-700"
              )}
            >
              {currentDrill?.video_type?.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {currentDrill?.drill?.description && (
            <p className="text-muted-foreground">{currentDrill?.drill?.description}</p>
          )}

          {/* Timer Display */}
          <div className="text-center">
            <div className={cn(
              "text-6xl font-mono font-bold transition-colors",
              progress.drillTimeRemaining <= 5 && "text-red-500",
              progress.drillTimeRemaining <= 10 && progress.drillTimeRemaining > 5 && "text-yellow-500"
            )}>
              {formatTime(progress.drillTimeRemaining)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {progress.isPlaying ? "Timer running..." : "Ready to start"}
            </p>
          </div>

          {/* Video Display */}
          {getVideoUrl(currentDrill) && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Video: {currentDrill?.drill?.name || currentDrill?.name} ({currentDrill?.video_type?.replace('_', ' ')})
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousDrill}
              disabled={progress.currentDrillIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handlePlayPause}
              size="lg"
              className={cn(
                progress.isPlaying && "bg-red-500 hover:bg-red-600"
              )}
            >
              {progress.isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleNextDrill}
            >
              {isLastDrill ? "Finish" : "Next"}
              {!isLastDrill && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Quick Skip */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDrill}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Drill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}