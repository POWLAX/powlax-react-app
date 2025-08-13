'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, CheckCircle, Trophy, PlayCircle, Check, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import PointExplosion from '@/components/skills-academy/PointExplosion'
import { usePointTypes } from '@/hooks/usePointTypes'
import PointCounter from '@/components/skills-academy/PointCounter'
import WorkoutReviewModal from '@/components/skills-academy/WorkoutReviewModal'
import CelebrationAnimation from '@/components/skills-academy/CelebrationAnimation'
import WorkoutErrorBoundary from '@/components/skills-academy/WorkoutErrorBoundary'
import { useWorkoutSession } from '@/hooks/useSkillsAcademyWorkouts'

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

// Helper function to check if this is a wall ball workout
async function getWallBallVideoId(workout: any): Promise<string | null> {
  if (workout?.original_json_name?.startsWith('vimeo:')) {
    return workout.original_json_name.replace('vimeo:', '');
  }
  
  if (workout?.series?.series_type === 'wall_ball') {
    try {
      const { data: drillSegments } = await supabase
        .from('wall_ball_drill_library')
        .select('vimeo_id, video_url')
        .eq('workout_name', workout.workout_name)
        .limit(1)
        .single();
      
      if (drillSegments?.vimeo_id) {
        return drillSegments.vimeo_id;
      }
      
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

function WorkoutPageContent() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1
  const { user, loading: authLoading } = useAuth()
  
  // Get workout data
  const { session, loading, error } = useWorkoutSession(workoutId)
  const workout = session?.workout
  const drills = session?.drills || []
  
  // Get point types for display
  const { pointTypes } = usePointTypes()
  
  // State management
  const [userId, setUserId] = useState<string | null>(null)
  const [isWallBallWorkout, setIsWallBallWorkout] = useState(false)
  const [wallBallVimeoId, setWallBallVimeoId] = useState<string | null>(null)
  const [seriesInfo, setSeriesInfo] = useState<any>(null)
  const [localCurrentDrillIndex, setLocalCurrentDrillIndex] = useState(0)
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  const [drillTimer, setDrillTimer] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  
  // Points tracking with real-time updates
  const [userPoints, setUserPoints] = useState<any>({
    academy_points: 0,
    attack_token: 0,
    defense_dollar: 0,
    midfield_medal: 0,
    rebound_reward: 0,
    lax_iq_point: 0,
    flex_point: 0
  })
  const [localTotalPoints, setLocalTotalPoints] = useState(0)
  
  // Point explosion animation state
  const [showPointExplosion, setShowPointExplosion] = useState(false)
  const [explosionOrigin, setExplosionOrigin] = useState<HTMLElement | null>(null)
  const [explosionPoints, setExplosionPoints] = useState<Record<string, number>>({})  
  
  // Timer enforcement state
  const [drillStartTime, setDrillStartTime] = useState<number | null>(null)
  const [drillTimeElapsed, setDrillTimeElapsed] = useState(0)
  const [drillTimes, setDrillTimes] = useState<Record<number, any>>({})  
  
  // Set user ID
  useEffect(() => {
    setUserId(user?.id || null)
  }, [user])
  
  // Check for wall ball workout
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
  
  // Fetch series info
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
  
  // Fetch user points
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
  
  // Workout timer
  useEffect(() => {
    if (!isCompleted) {
      const interval = setInterval(() => {
        setDrillTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCompleted])
  
  // Drill timer enforcement
  useEffect(() => {
    if (drillStartTime && !completedDrills.has(localCurrentDrillIndex) && !isCompleted) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - drillStartTime) / 1000)
        setDrillTimeElapsed(elapsed)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [drillStartTime, localCurrentDrillIndex, completedDrills, isCompleted])
  
  // Start timer when drill changes
  useEffect(() => {
    if (!isCompleted && !completedDrills.has(localCurrentDrillIndex)) {
      const startTime = Date.now()
      setDrillStartTime(startTime)
      setDrillTimeElapsed(0)
      
      const currentDrill = session?.drills?.[localCurrentDrillIndex]
      if (currentDrill) {
        const drillName = isWallBallWorkout 
          ? (session?.workout?.workout_name || 'Wall Ball Workout')
          : (currentDrill?.drill?.title || currentDrill?.title || `Drill ${localCurrentDrillIndex + 1}`)
        
        let requiredSeconds: number
        if (isWallBallWorkout) {
          requiredSeconds = (session?.workout?.estimated_duration_minutes || 10) * 60
        } else {
          const durationMinutes = currentDrill?.drill?.duration_minutes || currentDrill?.duration_minutes || 3
          requiredSeconds = Math.max((durationMinutes - 1), 1) * 60
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
  }, [localCurrentDrillIndex, isCompleted, completedDrills, isWallBallWorkout, session])

  // Handle drill completion with real-time updates
  const handleMarkComplete = async () => {
    if (!session?.drills) return
    
    const currentDrill = drills[localCurrentDrillIndex]
    const drillId = currentDrill?.drill?.id || currentDrill?.id
    
    // Mark as completed
    const newCompleted = new Set(completedDrills)
    newCompleted.add(localCurrentDrillIndex)
    setCompletedDrills(newCompleted)
    
    // IMMEDIATE state update for real-time point counter (Patrick's requirement)
    // Get drill point values - map lax_credit to academy_points
    const rawPointValues = currentDrill?.drill?.point_values || currentDrill?.point_values || {}
    
    // Convert lax_credit to academy_points and ensure minimum 10 points
    const drillPointValues = {
      academy_points: Math.max(10, rawPointValues.lax_credit || rawPointValues.academy_points || 10),
      attack_token: rawPointValues.attack_token || 0,
      defense_dollar: rawPointValues.defense_dollar || 0,
      midfield_medal: rawPointValues.midfield_medal || 0,
      rebound_reward: rawPointValues.rebound_reward || 0,
      lax_iq_point: rawPointValues.lax_iq_point || 0,
      flex_point: rawPointValues.flex_point || 0
    }
    
    // Update points immediately in UI
    setUserPoints((prevPoints: any) => ({
      ...prevPoints,
      academy_points: (prevPoints.academy_points || 0) + drillPointValues.academy_points,
      attack_token: (prevPoints.attack_token || 0) + drillPointValues.attack_token,
      defense_dollar: (prevPoints.defense_dollar || 0) + drillPointValues.defense_dollar,
      midfield_medal: (prevPoints.midfield_medal || 0) + drillPointValues.midfield_medal,
      rebound_reward: (prevPoints.rebound_reward || 0) + drillPointValues.rebound_reward,
      lax_iq_point: (prevPoints.lax_iq_point || 0) + drillPointValues.lax_iq_point,
      flex_point: (prevPoints.flex_point || 0) + drillPointValues.flex_point
    }))
    
    setLocalTotalPoints(prev => prev + drillPointValues.academy_points)
    
    // Trigger point explosion animation from the Did It button
    // Animation will travel to the header points display
    const didItButton = document.querySelector('[data-did-it-button]') as HTMLElement
    
    if (didItButton) {
      setExplosionOrigin(didItButton)
      setExplosionPoints(drillPointValues)
      setShowPointExplosion(true)
      
      // Optional: Add visual feedback that points are going to header
      const headerPoints = document.querySelector('[data-header-points]') as HTMLElement
      if (headerPoints) {
        setTimeout(() => {
          headerPoints.classList.add('animate-pulse')
          setTimeout(() => {
            headerPoints.classList.remove('animate-pulse')
          }, 1000)
        }, 1500) // Pulse header when points arrive
      }
      
      setTimeout(() => {
        setShowPointExplosion(false)
      }, 2500)
    }
    
    // Save progress to database (background)
    if (userId) {
      try {
        await supabase.rpc('award_drill_points', {
          p_user_id: userId,
          p_drill_id: drillId,
          p_points: drillPointValues
        })
      } catch (error) {
        console.error('Error saving points:', error)
      }
    }
    
    // Check if last drill
    const isLastDrill = localCurrentDrillIndex === drills.length - 1
    if (isLastDrill) {
      setIsCompleted(true)
      setTimeout(() => setShowCelebration(true), 500)
    } else {
      setTimeout(() => {
        setLocalCurrentDrillIndex(prev => prev + 1)
      }, 1000)
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Loading state
  if (loading || authLoading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error || !workout) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
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
  if (drills.length === 0 && !isWallBallWorkout) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
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
            points={localTotalPoints}
            isVisible={showCelebration}
            onAnimationEnd={() => setShowCelebration(false)}
          />
        )}
        <div className="h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center max-w-md mx-auto p-8">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold mb-4">Workout Complete!</h1>
            <div className="space-y-4 mb-8">
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{localTotalPoints}</div>
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
              <Button 
                onClick={() => setShowReviewModal(true)}
                variant="outline" 
                className="flex-1"
              >
                Review Workout
              </Button>
              <Button asChild className="flex-1">
                <Link href="/skills-academy/workouts">More Workouts</Link>
              </Button>
            </div>
            <Button asChild variant="ghost" className="w-full mt-2">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
        
        <WorkoutReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          workout={workout}
          drills={drills}
          drillTimes={drillTimes}
          totalPoints={localTotalPoints}
          totalTime={drillTimer}
          completedDrills={completedDrills}
          isWallBallWorkout={isWallBallWorkout}
        />
      </>
    )
  }
  
  const currentDrill = drills[localCurrentDrillIndex]
  const progress = drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0
  
  // Calculate timer enforcement
  let requiredSeconds: number
  if (isWallBallWorkout) {
    requiredSeconds = (workout?.estimated_duration_minutes || 10) * 60
  } else {
    const durationMinutes = currentDrill?.drill?.duration_minutes || currentDrill?.duration_minutes || 3
    requiredSeconds = Math.max((durationMinutes - 1), 1) * 60
  }
  const timeRemaining = Math.max(0, requiredSeconds - drillTimeElapsed)
  const canMarkComplete = drillTimeElapsed >= requiredSeconds
  const isAlreadyCompleted = completedDrills.has(localCurrentDrillIndex)

  return (
    <WorkoutErrorBoundary>
      <PointExplosion
        isVisible={showPointExplosion}
        originElement={explosionOrigin}
        points={explosionPoints}
        pointTypes={pointTypes.map((pt: any) => ({
          name: pt.name || pt.slug,
          display_name: pt.display_name || pt.title,
          icon_url: pt.icon_url || pt.image_url
        }))}
        onAnimationComplete={() => setShowPointExplosion(false)}
        duration={2000}
      />
      
      {/* 5-ZONE CONTAINER ARCHITECTURE WITH STICKY FOOTER */}
      <div className="h-screen flex flex-col bg-gray-50">
        
        {/* ZONE 1: HEADER */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/skills-academy/workouts" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="text-center flex-1 px-2">
              <h1 className="text-base md:text-lg font-bold text-blue-600 truncate">
                {seriesInfo?.series_name && workout?.workout_size 
                  ? `${seriesInfo.series_name.replace(/^SS\d+\s*-?\s*/, '').trim()} - ${workout.workout_size.charAt(0).toUpperCase() + workout.workout_size.slice(1)}` 
                  : workout?.workout_name || 'Loading...'}
              </h1>
            </div>
            <div className="flex items-center gap-2" data-header-points>
              {/* Academy Points - always shown */}
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 relative">
                  <img 
                    src="/images/points/academy-point.png" 
                    alt="Academy Points"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">AP</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-700">{userPoints.academy_points || 0}</span>
              </div>
              
              {/* Show series-specific points if earned */}
              {(seriesInfo?.series_type === 'midfield' && userPoints.midfield_medal > 0) && (
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 relative">
                    <img 
                      src="/images/points/midfield-medal.png" 
                      alt="Midfield Medal"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">MM</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{userPoints.midfield_medal}</span>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* ZONE 2: POINT COUNTER with horizontal layout and 48x48px images */}
        <section className="bg-white/95 backdrop-blur-sm border-b flex-shrink-0" data-point-counter>
          <PointCounter 
            points={userPoints}
            seriesType={workout?.series?.series_type || seriesInfo?.series_type}
            animate={true}
          />
        </section>
        
        {/* ZONE 3: DRILL TIMELINE (horizontal scroll, non-clickable) */}
        {!isWallBallWorkout && (
          <nav className="bg-white border-b flex-shrink-0 px-3 py-2">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2">
                {drills.map((drill: any, index: number) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 px-3 py-2 rounded-lg border-2 pointer-events-none ${
                      completedDrills.has(index) 
                        ? 'border-green-500 bg-green-50' 
                        : index === localCurrentDrillIndex 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                    style={{ minWidth: '180px' }}
                    role="img"
                    aria-label={`Drill ${index + 1} reference - ${drill?.drill?.title || drill?.title}`}
                  >
                    {completedDrills.has(index) && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-green-500 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold ${
                        completedDrills.has(index) 
                          ? 'text-green-700' 
                          : index === localCurrentDrillIndex 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }`}>
                        Drill {index + 1}
                      </span>
                      <span className="text-xs text-gray-400">-</span>
                      <span className={`text-xs truncate ${
                        completedDrills.has(index) 
                          ? 'text-green-700' 
                          : index === localCurrentDrillIndex 
                          ? 'text-blue-600' 
                          : 'text-gray-700'
                      }`}>
                        {drill?.drill?.title || drill?.title || `Exercise ${index + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        )}
        
        {/* PROGRESS BAR - Moved below drill timeline */}
        <div className="bg-white border-b flex-shrink-0 px-4 py-2">
          <div className="relative">
            <Progress value={progress} className="h-3 bg-gray-100" />
            <div className="absolute inset-0 flex items-center justify-end pr-2">
              <span className="text-xs text-white font-semibold backdrop-blur-sm bg-black/20 px-1 rounded">
                {Math.round(progress)}% • {formatTime(drillTimer)} • {completedDrills.size}/{drills.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* ZONE 4: VIDEO PLAYER - Fills remaining space with max dimensions */}
        <main className="flex-1 bg-black flex items-center justify-center min-h-0 overflow-hidden">
          <div className="relative w-full h-full max-w-full max-h-full">
            {(() => {
              if (isWallBallWorkout && wallBallVimeoId) {
                return (
                  <iframe
                    src={`https://player.vimeo.com/video/${wallBallVimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={workout?.workout_name || 'Wall Ball Workout'}
                  />
                )
              }
              
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
                    title={drill?.title || 'Drill Video'}
                  />
                )
              } else {
                return (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
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
        </main>
        
        {/* ZONE 5: STICKY FOOTER - Not fixed, part of flex layout */}
        <footer className="bg-gray-800 text-white px-4 py-2 md:py-4 flex-shrink-0 
                         pb-[calc(env(safe-area-inset-bottom)+80px)] md:pb-4">
          {/* Drill Name */}
          <div className="mb-1 md:mb-1.5">
            <h2 className="text-lg font-bold text-center">
              {isWallBallWorkout 
                ? (workout?.workout_name || 'Wall Ball Workout')
                : (currentDrill?.drill?.title || currentDrill?.title || `Drill ${localCurrentDrillIndex + 1}`)}
            </h2>
          </div>
          
          {/* ONLY sets_and_reps pill (Patrick's requirement) */}
          <div className="flex justify-center mb-1 md:mb-2">
            {(currentDrill?.drill?.sets_and_reps) ? (
              <div className="bg-white/90 px-4 py-2 rounded-full">
                <span className="font-bold text-gray-800 text-sm">
                  {currentDrill.drill.sets_and_reps}
                </span>
              </div>
            ) : null}
          </div>
          
          {/* Always-visible Did It button with timer enforcement */}
          <Button 
            data-did-it-button
            onClick={isWallBallWorkout ? () => {
              setIsCompleted(true)
              setTimeout(() => setShowCelebration(true), 500)
            } : handleMarkComplete}
            className={`w-full h-12 text-base font-bold ${
              canMarkComplete || isAlreadyCompleted
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!canMarkComplete && !isAlreadyCompleted}
          >
            {isAlreadyCompleted ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Completed</span>
              </>
            ) : canMarkComplete ? (
              <span>Did It!</span>
            ) : (
              <span>
                Wait {formatTime(timeRemaining)}
              </span>
            )}
          </Button>
        </footer>
      </div>
    </WorkoutErrorBoundary>
  )
}

export default function WorkoutPage() {
  return <WorkoutPageContent />
}