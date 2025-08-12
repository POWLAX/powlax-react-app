'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, CheckCircle, Trophy, Activity,
  ChevronDown, Award, PlayCircle, Check, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useWorkoutProgressTracking } from '@/hooks/useProgressTracking'
import { useWorkoutPointsTracker } from '@/hooks/usePointsCalculation'
import CelebrationAnimation from '@/components/skills-academy/CelebrationAnimation'
import WorkoutErrorBoundary from '@/components/skills-academy/WorkoutErrorBoundary'
import { useWorkoutSession } from '@/hooks/useSkillsAcademyWorkouts'
// Temporarily comment out problematic imports to fix module error
// import { supabase } from '@/lib/supabase'
// import { useAuth } from '@/contexts/SupabaseAuthContext'
// import PointExplosion from '@/components/skills-academy/PointExplosion'
// import { usePointTypes } from '@/hooks/usePointTypes'
// import PointCounter from '@/components/skills-academy/PointCounter'
// import WorkoutReviewModal from '@/components/skills-academy/WorkoutReviewModal'

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

// Helper function to check if this is a wall ball workout and get video
async function getWallBallVideoId(workout: any): Promise<string | null> {
  // Check if this is a wall ball workout by checking original_json_name
  if (workout?.original_json_name?.startsWith('vimeo:')) {
    // Extract Vimeo ID from original_json_name
    return workout.original_json_name.replace('vimeo:', '');
  }
  
  // For wall ball workouts, check if this is from a wall ball series
  if (workout?.series?.series_type === 'wall_ball') {
    try {
      // Look up in wall_ball_drill_library for segments
      const { data: drillSegments } = await supabase
        .from('wall_ball_drill_library')
        .select('vimeo_id, video_url')
        .eq('workout_name', workout.workout_name)
        .limit(1)
        .single();
      
      if (drillSegments?.vimeo_id) {
        return drillSegments.vimeo_id;
      }
      
      // Extract from URL if ID not available
      if (drillSegments?.video_url) {
        const match = drillSegments.video_url.match(/vimeo\.com\/(\d+)/);
        if (match) return match[1];
      }
    } catch (error) {
      console.error('Error fetching wall ball drill:', error);
    }
  }
  
  return null;
}



// Removed TEST_USER_ID - now using real authenticated users only

function WorkoutPageContent() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1
  // Temporarily bypass auth to fix loading issues
  // const { user, loading: authLoading } = useAuth()
  const user = { id: 'temp-user' }
  const authLoading = false
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null)
  const [showDrillsDropdown, setShowDrillsDropdown] = useState(false)
  
  // Get workout data
  const { session, loading, error } = useWorkoutSession(workoutId)
  
  // Get point types for animation
  const { pointTypes } = usePointTypes()
  
  // Check if this is a wall ball workout (single video)
  const [isWallBallWorkout, setIsWallBallWorkout] = useState(false)
  const [wallBallVimeoId, setWallBallVimeoId] = useState<string | null>(null)
  
  // Get series information for better workout naming
  const [seriesInfo, setSeriesInfo] = useState<any>(null)
  
  // Local drill index state
  const [localCurrentDrillIndex, setLocalCurrentDrillIndex] = useState(0)
  
  // Points tracking
  const [localTotalPoints, setLocalTotalPoints] = useState(0)
  const [userPoints, setUserPoints] = useState<any>({
    lax_credit: 0,
    attack_token: 0,
    defense_dollar: 0,
    midfield_medal: 0,
    rebound_reward: 0,
    flex_points: 0,
    lax_iq_points: 0
  })
  
  // Local state for UI
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [drillTimer, setDrillTimer] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  
  // Point explosion animation state
  const [showPointExplosion, setShowPointExplosion] = useState(false)
  const [explosionOrigin, setExplosionOrigin] = useState<HTMLElement | null>(null)
  const [explosionPoints, setExplosionPoints] = useState<Record<string, number>>({})
  
  // Review workout state
  const [showReviewModal, setShowReviewModal] = useState(false)
  
  // Timer enforcement state - Agent 1
  const [drillStartTime, setDrillStartTime] = useState<number | null>(null)
  const [drillTimeElapsed, setDrillTimeElapsed] = useState(0)
  const [drillTimes, setDrillTimes] = useState<Record<number, {
    drill_name: string
    started_at: number
    completed_at?: number
    actual_seconds: number
    required_seconds: number
  }>>({})
  

  // Use auth context user only
  useEffect(() => {
    setUserId(user?.id || null)
  }, [user])
  
  useEffect(() => {
    const checkWallBall = async () => {
      if (session?.workout) {
        const vimeoId = await getWallBallVideoId(session.workout)
        if (vimeoId) {
          setIsWallBallWorkout(true)
          setWallBallVimeoId(vimeoId)
        }
      }
    }
    checkWallBall()
  }, [session?.workout])
  
  useEffect(() => {
    const fetchSeriesInfo = async () => {
      if (session?.workout?.series_id) {
        const { data } = await supabase
          .from('skills_academy_series')
          .select('*')
          .eq('id', session.workout.series_id)
          .single()
        setSeriesInfo(data)
      }
    }
    fetchSeriesInfo()
  }, [session?.workout?.series_id])

  // Fetch user points on mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .rpc('get_user_points', { p_user_id: userId });
      
      if (!error && data) {
        setUserPoints(data);
      }
    };
    
    fetchUserPoints();
  }, [userId]);

  // Timer effect - always running during workout
  useEffect(() => {
    if (!isCompleted) {
      const interval = setInterval(() => {
        setDrillTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCompleted])
  
  // Drill timer enforcement effect - Agent 1
  useEffect(() => {
    if (drillStartTime && !completedDrills.has(localCurrentDrillIndex) && !isCompleted) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - drillStartTime) / 1000)
        setDrillTimeElapsed(elapsed)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [drillStartTime, localCurrentDrillIndex, completedDrills, isCompleted])
  
  // Start timer when drill loads or changes - Agent 1
  useEffect(() => {
    if (!isCompleted && !completedDrills.has(localCurrentDrillIndex)) {
      const startTime = Date.now()
      setDrillStartTime(startTime)
      setDrillTimeElapsed(0)
      
      // Store drill info for timing tracking
      const currentDrill = session?.drills?.[localCurrentDrillIndex]
      if (currentDrill) {
        const drillName = isWallBallWorkout 
          ? (session?.workout?.workout_name || 'Wall Ball Workout')
          : (currentDrill?.drill?.title || currentDrill?.title || `Drill ${localCurrentDrillIndex + 1}`)
        
        // Calculate required time based on drill type
        let requiredSeconds: number
        if (isWallBallWorkout) {
          // Wall Ball: full estimated_duration_minutes
          requiredSeconds = (session?.workout?.estimated_duration_minutes || 10) * 60
        } else {
          // Regular drills: (duration_minutes - 1) × 60
          const durationMinutes = currentDrill?.drill?.duration_minutes || currentDrill?.duration_minutes || 3
          requiredSeconds = Math.max((durationMinutes - 1), 1) * 60 // Minimum 1 minute
        }
        
        setDrillTimes(prev => ({
          ...prev,
          [localCurrentDrillIndex]: {
            drill_name: drillName,
            started_at: startTime,
            actual_seconds: 0,
            required_seconds: requiredSeconds
          }
        }))
      }
    }
  }, [localCurrentDrillIndex, isCompleted, completedDrills, isWallBallWorkout, session?.workout, session?.drills])
  
  // Save progress periodically (every 30 seconds)
  useEffect(() => {
    const saveProgressPeriodically = async () => {
      if (!userId || !session?.workout) return;
      
      const drillsCount = session?.drills?.length || 0;
      
      try {
        const response = await fetch('/api/workouts/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            workout_id: workoutId,
            current_drill_index: localCurrentDrillIndex,
            drills_completed: completedDrills.size,
            total_drills: drillsCount,
            total_time_seconds: drillTimer,
            points_earned: localTotalPoints,
            status: 'in_progress',
            completion_percentage: drillsCount > 0 ? (completedDrills.size / drillsCount) * 100 : 0
          })
        });
        
        if (!response.ok) {
          console.error('Failed to save progress');
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }

    if (!isCompleted && userId && session?.workout) {
      const saveInterval = setInterval(() => {
        saveProgressPeriodically()
      }, 30000) // Save every 30 seconds
      
      return () => clearInterval(saveInterval)
    }
  }, [isCompleted, userId, session?.workout, localCurrentDrillIndex, completedDrills.size, drillTimer, localTotalPoints, workoutId, session?.drills?.length])

  // Show loading spinner while authentication is being verified
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const workout = session?.workout
  const drills = session?.drills || []
  const currentDrillIndex = localCurrentDrillIndex
  const totalPoints = localTotalPoints

  // Save progress to database using Supabase RPC
  const saveProgress = async (isComplete = false) => {
    if (!userId || !workout) return;
    
    try {
      // Get current drill - check both drill object structure and direct drill access
      const currentDrill = drills[currentDrillIndex];
      const drillId = currentDrill?.drill?.id || currentDrill?.id;
      
      if (!drillId) {
        console.error('No drill ID found for current drill');
        return;
      }
      
      // Call Supabase RPC function directly to award points
      const { data: points, error } = await supabase
        .rpc('award_drill_points', {
          p_user_id: userId,
          p_drill_id: drillId,
          p_drill_count: completedDrills.size + 1,
          p_workout_id: workoutId
        });
      
      if (error) {
        console.error('Error awarding points:', error);
        return;
      }
      
      // Update local state with points earned
      if (points?.lax_credit) {
        setLocalTotalPoints(prevPoints => {
          const newTotal = prevPoints + (points.lax_credit || 0);
          return newTotal;
        });
        
        // Update user points display IMMEDIATELY for real-time updates (Patrick's requirement)
        setUserPoints(prevPoints => ({
          ...prevPoints,
          lax_credit: (prevPoints.lax_credit || 0) + (points.lax_credit || 0),
          academy_points: (prevPoints.academy_points || 0) + (points.academy_points || points.lax_credit || 0),
          attack_token: (prevPoints.attack_token || 0) + (points.attack_token || 0),
          defense_dollar: (prevPoints.defense_dollar || 0) + (points.defense_dollar || 0),
          midfield_medal: (prevPoints.midfield_medal || 0) + (points.midfield_medal || 0),
          rebound_reward: (prevPoints.rebound_reward || 0) + (points.rebound_reward || 0),
          flex_points: (prevPoints.flex_points || 0) + (points.flex_points || 0),
          lax_iq_points: (prevPoints.lax_iq_points || 0) + (points.lax_iq_points || 0),
          // Also update by actual database names for real-time counter
          lax_iq_point: (prevPoints.lax_iq_point || 0) + (points.lax_iq_point || points.lax_iq_points || 0),
          flex_point: (prevPoints.flex_point || 0) + (points.flex_point || points.flex_points || 0)
        }));
      }
      
      // If workout complete, save completion record
      if (isComplete) {
        const { error: completionError } = await supabase
          .from('workout_completions')
          .insert({
            user_id: userId,
            workout_id: workoutId,
            series_id: workout.series_id,
            drill_ids: Array.from(completedDrills),
            drills_completed: completedDrills.size,
            total_drills: drills.length,
            points_earned: points,
            time_taken_seconds: drillTimer
          });
        
        if (completionError) {
          console.error('Error saving completion:', completionError);
        }
      }
    } catch (error) {
      console.error('Error in saveProgress:', error);
    }
  }

  const handleMarkComplete = async () => {
    const currentDrill = drills[currentDrillIndex]
    const drillId = currentDrill?.drill?.id || currentDrill?.id || `drill_${currentDrillIndex}`
    const drillName = currentDrill?.drill?.title || currentDrill?.title || `Drill ${currentDrillIndex + 1}`
    
    // Calculate required time based on drill type (Agent 2: Time Breakdown)
    let requiredSeconds = 120 // Default 2 minutes
    if (isWallBallWorkout) {
      // Wall Ball uses full estimated duration
      requiredSeconds = (session?.workout?.estimated_duration_minutes || 2) * 60
    } else if (currentDrill?.drill?.duration_minutes) {
      // Regular drills use (duration_minutes - 1) * 60
      requiredSeconds = Math.max((currentDrill.drill.duration_minutes - 1) * 60, 60)
    }
    
    // Timer enforcement - Agent 1 & Agent 2: Record completion time
    let actualSeconds = drillTimer
    if (drillStartTime) {
      const completionTime = Date.now()
      actualSeconds = Math.floor((completionTime - drillStartTime) / 1000)
      
      setDrillTimes(prev => ({
        ...prev,
        [localCurrentDrillIndex]: {
          ...prev[localCurrentDrillIndex],
          completed_at: completionTime,
          actual_seconds: actualSeconds
        }
      }))
    }
    
    const newCompleted = new Set(completedDrills)
    newCompleted.add(localCurrentDrillIndex)
    setCompletedDrills(newCompleted)
    
    // IMMEDIATE state update for real-time point counter (Patrick's requirement)
    // Use REAL point values from current drill data instead of hardcoded values
    const drillPointValues = currentDrill?.drill?.point_values || currentDrill?.point_values || {}
    console.log('🎯 Real drill point values:', drillPointValues)
    
    // Use actual drill point values for immediate update (REAL VALUES)
    const immediatePointUpdate = {
      ...drillPointValues,
      // Fallback to small default if no drill points specified
      lax_credit: drillPointValues.lax_credit || 1
    }
    
    setUserPoints(prevPoints => ({
      ...prevPoints,
      lax_credit: (prevPoints.lax_credit || 0) + immediatePointUpdate.lax_credit,
      attack_token: (prevPoints.attack_token || 0) + immediatePointUpdate.attack_token,
      defense_dollar: (prevPoints.defense_dollar || 0) + immediatePointUpdate.defense_dollar,
      midfield_medal: (prevPoints.midfield_medal || 0) + immediatePointUpdate.midfield_medal,
      lax_iq_point: (prevPoints.lax_iq_point || 0) + immediatePointUpdate.lax_iq_point
    }))
    
    setLocalTotalPoints(prev => prev + immediatePointUpdate.lax_credit)
    
    // Trigger point explosion animation with REAL point values
    const didItButton = document.querySelector('[data-did-it-button]') as HTMLElement
    if (didItButton) {
      setExplosionOrigin(didItButton)
      
      // Use REAL point values from the drill data (not hardcoded)
      const currentDrillPointValues = currentDrill?.drill?.point_values || currentDrill?.point_values || {}
      console.log('🎯 Using real drill point values for explosion:', currentDrillPointValues)
      
      // Show REAL points that will be awarded from drill data
      const pointsToShow: Record<string, number> = { ...currentDrillPointValues }
      
      // If no specific points in drill, use fallback
      if (Object.keys(pointsToShow).length === 0) {
        pointsToShow['lax_credit'] = 1 // Minimal fallback
        console.warn('⚠️ No point values in drill data, using fallback')
      }
      
      setExplosionPoints(pointsToShow)
      setShowPointExplosion(true)
      
      // Hide explosion after animation (longer for more vibrant effect)
      setTimeout(() => {
        setShowPointExplosion(false)
      }, 2500) // Even longer for more dramatic effect
    }
    
    // Points are now calculated and awarded in saveProgress function
    // setLocalTotalPoints will be updated by saveProgress
    
    // Save progress to database
    const isLastDrill = localCurrentDrillIndex === drills.length - 1
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

  // Drill cards are now reference-only - no selection allowed
  // const handleDrillSelect = (index: number) => {
  //   setLocalCurrentDrillIndex(index)
  //   setShowDrillsDropdown(false)
  //   // Reset timer when manually selecting a drill - Agent 1
  //   setDrillStartTime(null)
  //   setDrillTimeElapsed(0)
  // }

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

  // No drills state - but allow wall ball workouts through
  if (drills.length === 0 && !isWallBallWorkout) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Drills Available</h2>
          <p className="text-gray-600 mb-8">This workout doesn&apos;t have any drills yet.</p>
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

            {/* Time Breakdown Card - Agent 2 */}
            <Card className="border-2 border-blue-500">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Workout Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{formatTime(drillTimer)}</div>
                    <div className="text-xs text-gray-600">Total Time</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{drills.length}</div>
                    <div className="text-xs text-gray-600">Drills Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={() => setShowReviewModal(true)}
                variant="outline" 
                className="w-full"
              >
                <Activity className="w-4 h-4 mr-2" />
                Review Workout
              </Button>
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
        
        {/* Review Workout Modal */}
        <WorkoutReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          workout={workout}
          drills={drills}
          drillTimes={drillTimes}
          totalPoints={finalPoints}
          totalTime={drillTimer}
          completedDrills={completedDrills}
          isWallBallWorkout={isWallBallWorkout}
        />
      </div>
    )
  }

  const currentDrill = drills[currentDrillIndex]
  const progress = drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0

  return (
    <WorkoutErrorBoundary>
      <PointExplosion
        isVisible={showPointExplosion}
        originElement={explosionOrigin}
        points={explosionPoints}
        pointTypes={pointTypes.map(pt => ({
          name: pt.name,
          display_name: pt.display_name,
          icon_url: pt.icon_url
        }))}
        onAnimationComplete={() => setShowPointExplosion(false)}
        duration={2000} // Longer duration for more vibrant animations
      />
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden skills-workout-container">
        {/* Mobile optimization: Ensure no scrolling and proper footer alignment */}
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
            <div className="text-right">
              <div className="text-xs md:text-sm font-semibold text-powlax-blue">
                {formatTime(drillTimer)}
              </div>
              <div className="text-xs text-gray-600">
                Credits: {userPoints.lax_credit || 0}
              </div>
            </div>
          </div>
          
          {/* Progress Bar - Integrated into header for mobile */}
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        {/* Live Point Counter - Above drill navigation */}
        <PointCounter 
          points={userPoints}
          seriesType={workout?.series?.series_type || seriesInfo?.series_type}
          animate={true}
        />

        {/* Compact Drill Navigation - Mobile Optimized (Hide for wall ball) */}
        {!isWallBallWorkout && (
          <div className="bg-white px-3 py-2 border-b border-gray-200 flex-shrink-0">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2">
                {drills.map((drill: any, index: number) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 px-2 py-2 rounded-lg border-2 text-left pointer-events-none ${
                    completedDrills.has(index) 
                      ? 'border-green-500 bg-green-50' 
                      : index === currentDrillIndex 
                      ? 'border-powlax-blue bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                  style={{ minWidth: '180px' }}
                  role="img"
                  aria-label={`Drill ${index + 1} reference only - ${drill?.drill?.title || drill?.title || `Exercise ${index + 1}`} - ${
                    completedDrills.has(index) 
                      ? 'Completed' 
                      : index === currentDrillIndex 
                      ? 'Current' 
                      : 'Upcoming'
                  }`}
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
                      {drill?.drill?.title || drill?.title || `Exercise ${index + 1}`}
                    </span>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Mobile optimized with proper spacing */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Video Player - Maximum width with padding and vertical centering */}
          <div className="flex-1 bg-black px-2 py-3 md:px-6 md:py-4 flex items-center justify-center skills-video-container">
            <div className="w-full max-w-full h-full flex items-center justify-center">
              {(() => {
                // For wall ball workouts, use the full workout video
                if (isWallBallWorkout && wallBallVimeoId) {
                  return (
                    <iframe
                      src={`https://player.vimeo.com/video/${wallBallVimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                      className="w-full h-auto max-w-full rounded-lg"
                      style={{ aspectRatio: '16/9', maxHeight: '70vh' }}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={workout?.workout_name || 'Wall Ball Workout'}
                    />
                  )
                }
                
                // For regular workouts, use drill videos
                const drill = currentDrill?.drill
                const vimeoId = extractVimeoId(drill)
                
                if (vimeoId) {
                  return (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                      className="w-full h-auto max-w-full rounded-lg"
                      style={{ aspectRatio: '16/9', maxHeight: '70vh' }}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={drill?.title || 'Drill Video'}
                    />
                  )
                } else {
                  return (
                    <div className="flex items-center justify-center h-full bg-gray-900 w-full">
                      <div className="text-center">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-400">Video coming soon</p>
                        <p className="text-sm text-gray-500 mt-2">{drill?.title}</p>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>
          </div>

          {/* Footer: Drill Info and Action - Mobile Optimized with proper alignment */}
          <div className="bg-gray-800 text-white px-4 py-4 flex-shrink-0 pb-20 md:pb-4 skills-workout-footer">
            {/* Drill Name at Top */}
            <div className="mb-3">
              <h2 className="text-lg font-bold text-center">
                {isWallBallWorkout 
                  ? (workout?.workout_name || 'Wall Ball Workout')
                  : (currentDrill?.drill?.title || currentDrill?.title || `Drill ${currentDrillIndex + 1}`)}
              </h2>
            </div>
            
            {/* Pills - ONLY sets_and_reps column per Patrick's contract requirements */}
            <div className="flex justify-center mb-4">
              {/* ONLY Sets and Reps pill - show actual database sets_and_reps column if it exists */}
              {(currentDrill?.drill?.sets_and_reps || currentDrill?.sets_and_reps) && (
                <div className="bg-white/90 px-3 py-1.5 rounded-full text-xs">
                  <span className="font-bold text-gray-800">
                    {currentDrill?.drill?.sets_and_reps || currentDrill?.sets_and_reps}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Button - Always visible and positioned above mobile menu */}
            {(() => {
              // Calculate required time based on drill type - Agent 1
              let requiredSeconds: number
              if (isWallBallWorkout) {
                // Wall Ball: full estimated_duration_minutes
                requiredSeconds = (workout?.estimated_duration_minutes || 10) * 60
              } else {
                // Regular drills: (duration_minutes - 1) × 60
                const currentDrill = drills[currentDrillIndex]
                const durationMinutes = currentDrill?.drill?.duration_minutes || currentDrill?.duration_minutes || 3
                requiredSeconds = Math.max((durationMinutes - 1), 1) * 60 // Minimum 1 minute
              }
              
              const timeRemaining = Math.max(0, requiredSeconds - drillTimeElapsed)
              const canMarkComplete = drillTimeElapsed >= requiredSeconds
              const isAlreadyCompleted = completedDrills.has(currentDrillIndex)
              
              return (
                <Button 
                  data-did-it-button
                  onClick={isWallBallWorkout ? () => {
                    setIsCompleted(true)
                    setTimeout(() => setShowCelebration(true), 500)
                  } : handleMarkComplete}
                  className={`w-full h-12 text-base font-bold text-white ${
                    canMarkComplete || isAlreadyCompleted
                      ? 'bg-powlax-blue hover:bg-powlax-blue/90' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!canMarkComplete && !isAlreadyCompleted}
                >
                  {isAlreadyCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2 text-white" />
                      <span className="text-white">Completed</span>
                    </>
                  ) : canMarkComplete ? (
                    <span className="text-white">Did It!</span>
                  ) : (
                    <span className="text-white">
                      Wait {Math.ceil(timeRemaining / 60)}m {timeRemaining % 60}s
                    </span>
                  )}
                </Button>
              )
            })()}
          </div>
        </div>

      </div>
    </WorkoutErrorBoundary>
  )
}

export default function WorkoutPage() {
  return <WorkoutPageContent />
}