import { useState, useEffect } from 'react'
import { SkillsAcademyUserProgress } from '@/types/skills-academy'

interface ProgressUpdate {
  user_id: string
  workout_id: number
  current_drill_index?: number
  drills_completed?: number
  total_drills?: number
  total_time_seconds?: number
  points_earned?: number
  status?: 'in_progress' | 'completed' | 'abandoned'
  completion_percentage?: number
  perfect_drills?: number
}

interface ProgressResponse {
  success: boolean
  progress: SkillsAcademyUserProgress
  message?: string
  error?: string
}

export function useProgressTracking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update progress via API
  const updateProgress = async (progressData: ProgressUpdate): Promise<ProgressResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/workouts/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update progress')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress'
      setError(errorMessage)
      console.error('Progress tracking error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch user progress
  const fetchProgress = async (userId: string, workoutId?: number): Promise<SkillsAcademyUserProgress[] | null> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ user_id: userId })
      if (workoutId) {
        params.append('workout_id', workoutId.toString())
      }

      const response = await fetch(`/api/workouts/progress?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch progress')
      }

      return result.progress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress'
      setError(errorMessage)
      console.error('Progress fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Real-time progress tracking functions
  const trackDrillStart = (userId: string, workoutId: number, drillIndex: number) => {
    return updateProgress({
      user_id: userId,
      workout_id: workoutId,
      current_drill_index: drillIndex,
      status: 'in_progress'
    })
  }

  const trackDrillComplete = (
    userId: string, 
    workoutId: number, 
    drillIndex: number, 
    totalDrills: number,
    pointsEarned: number = 10,
    isPerfect: boolean = false
  ) => {
    const completedDrills = drillIndex + 1
    const completionPercentage = (completedDrills / totalDrills) * 100
    const isWorkoutComplete = completedDrills >= totalDrills

    return updateProgress({
      user_id: userId,
      workout_id: workoutId,
      current_drill_index: isWorkoutComplete ? drillIndex : drillIndex + 1,
      drills_completed: completedDrills,
      total_drills: totalDrills,
      points_earned: pointsEarned,
      completion_percentage: completionPercentage,
      perfect_drills: isPerfect ? 1 : 0,
      status: isWorkoutComplete ? 'completed' : 'in_progress'
    })
  }

  const trackWorkoutComplete = (
    userId: string, 
    workoutId: number, 
    totalDrills: number,
    totalTimeSeconds: number,
    totalPointsEarned: number,
    perfectDrills: number = 0
  ) => {
    return updateProgress({
      user_id: userId,
      workout_id: workoutId,
      current_drill_index: totalDrills - 1,
      drills_completed: totalDrills,
      total_drills: totalDrills,
      total_time_seconds: totalTimeSeconds,
      points_earned: totalPointsEarned,
      completion_percentage: 100,
      perfect_drills: perfectDrills,
      status: 'completed'
    })
  }

  const trackWorkoutAbandoned = (userId: string, workoutId: number, currentIndex: number) => {
    return updateProgress({
      user_id: userId,
      workout_id: workoutId,
      current_drill_index: currentIndex,
      status: 'abandoned'
    })
  }

  return {
    loading,
    error,
    updateProgress,
    fetchProgress,
    trackDrillStart,
    trackDrillComplete,
    trackWorkoutComplete,
    trackWorkoutAbandoned
  }
}

// Real-time progress tracking hook for workout sessions
export function useWorkoutProgressTracking(
  userId: string,
  workoutId: number,
  totalDrills: number
) {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [completedDrills, setCompletedDrills] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [perfectDrills, setPerfectDrills] = useState(0)
  const [sessionStartTime] = useState(Date.now())
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())

  const { 
    trackDrillStart, 
    trackDrillComplete, 
    trackWorkoutComplete, 
    trackWorkoutAbandoned,
    loading,
    error 
  } = useProgressTracking()

  // Auto-sync progress every 30 seconds during active session
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentDrillIndex < totalDrills) {
        trackDrillStart(userId, workoutId, currentDrillIndex)
        setLastSyncTime(Date.now())
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [userId, workoutId, currentDrillIndex, totalDrills, trackDrillStart])

  const startDrill = async (drillIndex: number) => {
    setCurrentDrillIndex(drillIndex)
    await trackDrillStart(userId, workoutId, drillIndex)
  }

  const completeDrill = async (drillIndex: number, pointsEarned: number = 10, isPerfect: boolean = false) => {
    const newCompletedDrills = drillIndex + 1
    const newTotalPoints = totalPoints + pointsEarned
    
    setCompletedDrills(newCompletedDrills)
    setTotalPoints(newTotalPoints)
    
    if (isPerfect) {
      setPerfectDrills(prev => prev + 1)
    }

    const result = await trackDrillComplete(
      userId, 
      workoutId, 
      drillIndex, 
      totalDrills, 
      pointsEarned, 
      isPerfect
    )

    // If workout is complete, handle completion
    if (newCompletedDrills >= totalDrills) {
      const totalTimeSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
      await trackWorkoutComplete(
        userId,
        workoutId,
        totalDrills,
        totalTimeSeconds,
        newTotalPoints,
        perfectDrills + (isPerfect ? 1 : 0)
      )
    }

    return result
  }

  const abandonWorkout = async () => {
    await trackWorkoutAbandoned(userId, workoutId, currentDrillIndex)
  }

  const getSessionStats = () => {
    const currentTime = Date.now()
    const totalTimeSeconds = Math.floor((currentTime - sessionStartTime) / 1000)
    const completionPercentage = (completedDrills / totalDrills) * 100
    const averageTimePerDrill = completedDrills > 0 ? totalTimeSeconds / completedDrills : 0

    return {
      currentDrillIndex,
      completedDrills,
      totalDrills,
      totalPoints,
      perfectDrills,
      totalTimeSeconds,
      completionPercentage,
      averageTimePerDrill,
      isComplete: completedDrills >= totalDrills,
      lastSyncTime
    }
  }

  return {
    loading,
    error,
    startDrill,
    completeDrill,
    abandonWorkout,
    getSessionStats,
    currentDrillIndex,
    completedDrills,
    totalPoints,
    perfectDrills
  }
}