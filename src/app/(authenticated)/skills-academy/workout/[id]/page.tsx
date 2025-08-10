'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, CheckCircle, Trophy, Activity,
  ChevronDown, Award, PlayCircle, Check
} from 'lucide-react'
import Link from 'next/link'
import { useWorkoutProgressTracking } from '@/hooks/useProgressTracking'
import { useWorkoutPointsTracker } from '@/hooks/usePointsCalculation'
import CelebrationAnimation from '@/components/skills-academy/CelebrationAnimation'
import WorkoutErrorBoundary from '@/components/skills-academy/WorkoutErrorBoundary'
import { useWorkoutSession } from '@/hooks/useSkillsAcademyWorkouts'
import { supabase } from '@/lib/supabase'

// Helper function to extract Vimeo ID from drill data
function extractVimeoId(drill: any): string | null {
  const videoUrl = drill?.video_url;
  if (videoUrl) {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /^(\d+)$/
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }
  }
  
  if (drill?.vimeo_id) {
    return drill.vimeo_id;
  }
  
  return null;
}

// Test user ID for development  
const TEST_USER_ID = 'test-user-12345'

function WorkoutPageContent() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null)
  const [showDrillsDropdown, setShowDrillsDropdown] = useState(false)
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || TEST_USER_ID)
    }
    fetchUser()
  }, [])

  // Get workout data
  const { session, loading, error } = useWorkoutSession(workoutId)
  const workout = session?.workout
  const drills = session?.drills || []
  
  // Get series information for better workout naming
  const [seriesInfo, setSeriesInfo] = useState<any>(null)
  
  useEffect(() => {
    const fetchSeriesInfo = async () => {
      if (workout?.series_id) {
        const { data } = await supabase
          .from('skills_academy_series')
          .select('*')
          .eq('id', workout.series_id)
          .single()
        setSeriesInfo(data)
      }
    }
    fetchSeriesInfo()
  }, [workout?.series_id])
  
  // Local drill index state
  const [localCurrentDrillIndex, setLocalCurrentDrillIndex] = useState(0)
  const currentDrillIndex = localCurrentDrillIndex
  
  // Points tracking
  const [localTotalPoints, setLocalTotalPoints] = useState(0)
  const totalPoints = localTotalPoints
  
  // Local state for UI
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [drillTimer, setDrillTimer] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  // Save progress to database
  const saveProgress = async (isComplete = false) => {
    if (!userId || !workout) return;
    
    try {
      const response = await fetch('/api/workouts/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          workout_id: workoutId,
          current_drill_index: currentDrillIndex,
          drills_completed: completedDrills.size,
          total_drills: drills.length,
          total_time_seconds: drillTimer,
          points_earned: totalPoints,
          status: isComplete ? 'completed' : 'in_progress',
          completion_percentage: (completedDrills.size / drills.length) * 100
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // Timer effect - always running during workout
  useEffect(() => {
    if (!isCompleted) {
      const interval = setInterval(() => {
        setDrillTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCompleted])
  
  // Save progress periodically (every 30 seconds)
  useEffect(() => {
    if (!isCompleted && userId && workout) {
      const saveInterval = setInterval(() => {
        saveProgress(false)
      }, 30000) // Save every 30 seconds
      
      return () => clearInterval(saveInterval)
    }
  }, [isCompleted, userId, workout, currentDrillIndex, completedDrills.size])

  const handleMarkComplete = async () => {
    const newCompleted = new Set(completedDrills)
    newCompleted.add(currentDrillIndex)
    setCompletedDrills(newCompleted)
    
    const pointsForDrill = 10
    setLocalTotalPoints(prev => prev + pointsForDrill)
    
    // Save progress to database
    const isLastDrill = currentDrillIndex === drills.length - 1
    if (isLastDrill) {
      await saveProgress(true) // Mark as complete
      setIsCompleted(true)
      setTimeout(() => setShowCelebration(true), 500)
    } else {
      await saveProgress(false) // Still in progress
      // Auto-advance after a short delay
      setTimeout(() => {
        setLocalCurrentDrillIndex(prev => prev + 1)
      }, 1000)
    }
  }

  const handleDrillSelect = (index: number) => {
    setLocalCurrentDrillIndex(index)
    setShowDrillsDropdown(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-powlax-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !workout) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Workout Not Found</h2>
          <p className="text-gray-600 mb-8">This workout could not be loaded.</p>
          <Button asChild>
            <Link href="/skills-academy/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  // No drills state
  if (drills.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Drills Available</h2>
          <p className="text-gray-600 mb-8">This workout doesn't have any drills yet.</p>
          <Button asChild>
            <Link href="/skills-academy/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isCompleted && showCelebration) {
    return (
      <>
        {showCelebration && (
          <CelebrationAnimation 
            points={totalPoints}
            isVisible={showCelebration}
            onAnimationEnd={() => setShowCelebration(false)}
          />
        )}
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center max-w-md mx-auto p-8">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold mb-4">Workout Complete!</h1>
            <div className="space-y-4 mb-8">
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-powlax-blue">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{drills.length}</div>
                  <div className="text-sm text-gray-600">Drills Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(drillTimer)}</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <Link href="/skills-academy/workouts">More Workouts</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isCompleted) {
    const finalPoints = totalPoints * (completedDrills.size === drills.length ? 2 : 1)
    
    const pointsBreakdown = {
      lax_credits: Math.floor(finalPoints * 0.3),
      attack_tokens: Math.floor(finalPoints * 0.15),
      defense_dollars: Math.floor(finalPoints * 0.15),
      midfield_medals: Math.floor(finalPoints * 0.15),
      rebound_rewards: Math.floor(finalPoints * 0.15),
      flex_points: Math.floor(finalPoints * 0.1)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
        <div className="flex-1 container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Celebration Header */}
            <div className="text-center space-y-4 px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workout Complete!</h1>
                <p className="text-lg text-gray-600 mt-2">{workout?.workout_name || 'Workout'}</p>
              </div>
            </div>

            {/* Points Card */}
            <Card className="border-2 border-green-500">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{finalPoints}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{pointsBreakdown.lax_credits}</div>
                    <div className="text-xs text-gray-600">Lax Credits</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{pointsBreakdown.attack_tokens}</div>
                    <div className="text-xs text-gray-600">Attack Tokens</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/skills-academy/workouts">More Workouts</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentDrill = drills[currentDrillIndex]
  const progress = drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0

  return (
    <WorkoutErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Mobile optimization: Ensure no scrolling */}
        {/* Compact Header with Workout Name - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/skills-academy/workouts">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="text-center flex-1 px-2">
              <h1 className="text-lg md:text-xl font-bold text-powlax-blue truncate">
                {seriesInfo?.series_name && workout?.workout_size 
                  ? `${seriesInfo.series_name.replace(/^SS\d+\s*-?\s*/, '').trim()} - ${workout.workout_size.charAt(0).toUpperCase() + workout.workout_size.slice(1)}` 
                  : workout?.workout_name || 'Loading...'}
              </h1>
              <div className="text-xs md:text-sm text-gray-600">
                Drill {currentDrillIndex + 1} of {drills.length}
              </div>
            </div>
            <div className="text-xs md:text-sm font-semibold text-powlax-blue">
              {formatTime(drillTimer)}
            </div>
          </div>
          
          {/* Progress Bar - Integrated into header for mobile */}
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        {/* Compact Drill Navigation - Mobile Optimized */}
        <div className="bg-white px-3 py-2 border-b border-gray-200 flex-shrink-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2">
              {drills.map((drill: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleDrillSelect(index)}
                  className={`relative flex-shrink-0 px-2 py-2 rounded-lg border-2 transition-all duration-300 text-left ${
                    completedDrills.has(index) 
                      ? 'border-green-500 bg-green-50' 
                      : index === currentDrillIndex 
                      ? 'border-powlax-blue bg-blue-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={{ minWidth: '180px' }}
                >
                  {/* Celebration animation for completed drills */}
                  {completedDrills.has(index) && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-green-500 text-white rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      completedDrills.has(index) 
                        ? 'text-green-700' 
                        : index === currentDrillIndex 
                        ? 'text-powlax-blue' 
                        : 'text-gray-500'
                    }`}>
                      Drill {index + 1}
                    </span>
                    <span className="text-xs text-gray-400">-</span>
                    <span className={`text-xs font-medium truncate ${
                      completedDrills.has(index) 
                        ? 'text-green-700' 
                        : index === currentDrillIndex 
                        ? 'text-powlax-blue' 
                        : 'text-gray-700'
                    }`}>
                      {drill?.drill?.drill_name || drill?.drill?.title || `Exercise ${index + 1}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black">
            {(() => {
              const drill = currentDrill?.drill
              const vimeoId = extractVimeoId(drill)
              
              if (vimeoId) {
                return (
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={drill?.drill_name || 'Drill Video'}
                  />
                )
              } else {
                return (
                  <div className="flex items-center justify-center h-full bg-gray-900">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Video coming soon</p>
                      <p className="text-sm text-gray-500 mt-2">{drill?.drill_name || drill?.title}</p>
                    </div>
                  </div>
                )
              }
            })()}
          </div>

          {/* Compact Drill Info and Action - Mobile Optimized */}
          <div className="bg-gray-800 text-white px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex-1 pr-4">
                {currentDrill?.drill?.drill_name || currentDrill?.drill?.title || `Drill ${currentDrillIndex + 1}`}
              </h2>
              
              <div className="flex space-x-2 text-black">
                {currentDrill?.drill_duration_seconds && (
                  <div className="bg-white/90 px-2 py-1 rounded text-xs">
                    <span className="font-bold">{currentDrill.drill_duration_seconds}s</span>
                  </div>
                )}
                {currentDrill?.repetitions && (
                  <div className="bg-white/90 px-2 py-1 rounded text-xs">
                    <span className="font-bold">{currentDrill.repetitions} reps</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Button - Integrated into info card */}
            <Button 
              onClick={handleMarkComplete}
              className="w-full h-12 text-base font-bold bg-powlax-blue hover:bg-powlax-blue/90 text-white"
              disabled={completedDrills.has(currentDrillIndex)}
            >
              {completedDrills.has(currentDrillIndex) ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-white" />
                  <span className="text-white">Completed</span>
                </>
              ) : (
                <span className="text-white">Did It!</span>
              )}
            </Button>
          </div>
        </div>

      </div>
    </WorkoutErrorBoundary>
  )
}

export default function WorkoutPage() {
  return <WorkoutPageContent />
}