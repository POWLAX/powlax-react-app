'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, CheckCircle, Trophy, Activity, Home, Target,
  ChevronLeft, ChevronRight, Award, PlayCircle
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
  console.log('🔍 extractVimeoId called with:', drill)
  
  // First priority: use the new video_url field (complete Vimeo URL)
  const videoUrl = drill?.video_url;
  if (videoUrl) {
    console.log('✅ Found video_url:', videoUrl)
    // Handle different Vimeo URL formats
    const patterns = [
      /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456
      /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456
      /^(\d+)$/                        // Just the ID: 123456
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) {
        console.log('✅ Extracted Vimeo ID:', match[1])
        return match[1];
      }
    }
  }
  
  // Fallback to legacy vimeo ID fields
  if (drill?.both_hands_vimeo_id) {
    console.log('✅ Fallback: both_hands_vimeo_id:', drill.both_hands_vimeo_id)
    return drill.both_hands_vimeo_id;
  }
  if (drill?.strong_hand_vimeo_id) {
    console.log('✅ Fallback: strong_hand_vimeo_id:', drill.strong_hand_vimeo_id)
    return drill.strong_hand_vimeo_id;
  }
  if (drill?.off_hand_vimeo_id) {
    console.log('✅ Fallback: off_hand_vimeo_id:', drill.off_hand_vimeo_id)
    return drill.off_hand_vimeo_id;
  }
  if (drill?.vimeo_id) {
    console.log('✅ Fallback: vimeo_id:', drill.vimeo_id)
    return drill.vimeo_id;
  }
  
  // Additional fallback to other URL fields
  const fallbackUrl = drill?.both_hands_video_url || drill?.strong_hand_video_url || drill?.video_link;
  if (fallbackUrl) {
    console.log('⚙️ Fallback URL extraction:', fallbackUrl)
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /^(\d+)$/
    ];
    
    for (const pattern of patterns) {
      const match = fallbackUrl.match(pattern);
      if (match) {
        console.log('✅ Extracted from fallback:', match[1])
        return match[1];
      }
    }
  }
  
  console.log('❌ No video ID found in any field')
  return null;
}

// Test user ID for development  
const TEST_USER_ID = 'test-user-12345'

function WorkoutPageContent() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || TEST_USER_ID)
    }
    getUser()
  }, [])
  
  // Fetch real workout data using the drill_ids implementation
  const { session: workoutSession, loading: sessionLoading, error: sessionError } = useWorkoutSession(workoutId, userId || undefined)
  
  // Use real workout data
  const workout = workoutSession?.workout || null
  const drills = workoutSession?.drills || []
  
  // Use local mode only for better performance and reliability
  const [localCurrentDrillIndex, setLocalCurrentDrillIndex] = useState(0)
  const [localTotalPoints, setLocalTotalPoints] = useState(0)
  
  // Always use local state for predictable performance
  const currentDrillIndex = localCurrentDrillIndex
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
    } else {
      await saveProgress(false) // Still in progress
    }
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentDrillIndex < drills.length - 1) {
        setLocalCurrentDrillIndex(prev => prev + 1)
      } else {
        setIsCompleted(true)
        // Trigger celebration animation
        setTimeout(() => setShowCelebration(true), 500)
      }
    }, 1000)
  }

  const handleNext = () => {
    if (currentDrillIndex < drills.length - 1) {
      setLocalCurrentDrillIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
      // Trigger celebration animation
      setTimeout(() => setShowCelebration(true), 500)
    }
  }

  const handlePrevious = () => {
    if (currentDrillIndex > 0) {
      setLocalCurrentDrillIndex(prev => prev - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (sessionLoading) {
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

  if (!sessionLoading && (!workout || drills.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout Not Found</h1>
          <p className="text-gray-600 mb-4">This workout doesn&apos;t exist or has no drills configured.</p>
          <Button asChild>
            <Link href="/skills-academy">Back to Skills Academy</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    // Local session stats for fast performance
    const sessionStats = {
      currentDrillIndex,
      completedDrills: completedDrills.size,
      totalDrills: drills.length,
      totalPoints,
      perfectDrills: 0,
      totalTimeSeconds: drillTimer,
      completionPercentage: drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0,
      averageTimePerDrill: completedDrills.size > 0 ? drillTimer / completedDrills.size : 0,
      isComplete: true,
      lastSyncTime: Date.now()
    }
    
    const finalPoints = totalPoints * (completedDrills.size === drills.length ? 2 : 1)
    
    // Local points breakdown
    const pointsBreakdown = {
      lax_credits: Math.floor(finalPoints * 0.3),
      attack_tokens: Math.floor(finalPoints * 0.15),
      defense_dollars: Math.floor(finalPoints * 0.15),
      midfield_medals: Math.floor(finalPoints * 0.15),
      rebound_rewards: Math.floor(finalPoints * 0.15),
      flex_points: Math.floor(finalPoints * 0.1)
    }
    
    return (
      <>
        {/* Celebration Animation Overlay */}
        <CelebrationAnimation 
          points={finalPoints}
          isVisible={showCelebration}
          onAnimationEnd={() => setShowCelebration(false)}
        />
        
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" data-testid="completion-screen">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Celebration Header - Mobile optimized with animations */}
              <div className="text-center space-y-4 px-4 animate-slide-in-down">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-trophy-bounce animate-pulse-glow">
                  <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="animate-bounce-in">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Workout Complete!</h1>
                  <p className="text-lg md:text-xl text-gray-600 mt-2">{workout?.workout_name || 'Workout'}</p>
                </div>
              </div>

            {/* Points Card - All 6 types */}
            <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-green-600">{finalPoints}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {completedDrills.size === drills.length && (
                      <span className="text-green-600 font-semibold">Perfect completion bonus!</span>
                    )}
                  </div>
                </div>
                
                {/* 6 Point Types Grid - Mobile optimized */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded-lg animate-scale-in animate-stagger-1" data-testid="points-lax-credits">
                    <div className="text-lg font-bold text-blue-600">{pointsBreakdown.lax_credits}</div>
                    <div className="text-xs text-gray-600">Lax Credits</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg animate-scale-in animate-stagger-2" data-testid="points-attack-tokens">
                    <div className="text-lg font-bold text-red-600">{pointsBreakdown.attack_tokens}</div>
                    <div className="text-xs text-gray-600">Attack Tokens</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg animate-scale-in animate-stagger-3" data-testid="points-defense-dollars">
                    <div className="text-lg font-bold text-green-600">{pointsBreakdown.defense_dollars}</div>
                    <div className="text-xs text-gray-600">Defense Dollars</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg animate-scale-in animate-stagger-4" data-testid="points-midfield-medals">
                    <div className="text-lg font-bold text-purple-600">{pointsBreakdown.midfield_medals}</div>
                    <div className="text-xs text-gray-600">Midfield Medals</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg animate-scale-in animate-stagger-5" data-testid="points-rebound-rewards">
                    <div className="text-lg font-bold text-orange-600">{pointsBreakdown.rebound_rewards}</div>
                    <div className="text-xs text-gray-600">Rebound Rewards</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg animate-scale-in animate-stagger-6" data-testid="points-flex-points">
                    <div className="text-lg font-bold text-gray-600">{pointsBreakdown.flex_points}</div>
                    <div className="text-xs text-gray-600">Flex Points</div>
                  </div>
                </div>
                
                {/* Workout Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{completedDrills.size}</div>
                    <div className="text-xs text-gray-600">Drills Done</div>
                  </div>
                  <div className="text-center p-3 bg-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{drills.length}</div>
                    <div className="text-xs text-gray-600">Total Drills</div>
                  </div>
                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Math.floor(drillTimer / 60)}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons - 60px touch targets */}
            <Card>
              <CardContent className="py-6 space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setIsCompleted(false)
                      setLocalCurrentDrillIndex(0)
                      setCompletedDrills(new Set())
                      setLocalTotalPoints(0)
                      setDrillTimer(0)
                      setShowCelebration(false)
                    }} 
                    variant="outline" 
                    className="flex-1 h-16 text-lg"
                    data-testid="do-again-button"
                  >
                    Do Again
                  </Button>
                  <Button 
                    asChild 
                    className="flex-1 h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    data-testid="back-to-academy-button"
                  >
                    <Link href="/skills-academy">
                      <Home className="w-6 h-6 mr-2" />
                      Back to Academy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
    )
  }

  const currentDrill = drills[currentDrillIndex]
  const progress = drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
        <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
          {/* Header - Mobile optimized */}
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild
                  className="h-12 w-12"
                  data-testid="back-button"
                >
                  <Link href="/skills-academy">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg md:text-xl font-bold">{workout?.workout_name || 'Loading...'}</h1>
                  <div className="text-sm text-gray-600">
                    Drill {currentDrillIndex + 1} of {drills.length} - {completedDrills.size} completed
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-sm md:text-base px-2 py-1">
                {totalPoints} pts
              </Badge>
            </div>
          </div>

          {/* Enhanced Progress Bar - Mobile optimized */}
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm md:text-base font-medium text-gray-700">
                Progress: {completedDrills.size} of {drills.length} drills
              </span>
              <span className="text-sm md:text-base font-bold text-green-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-4 md:h-3" data-testid="progress-bar" />
            <div className="flex justify-between mt-2">
              <span className="text-xs md:text-sm text-gray-500">
                Time: {formatTime(drillTimer)}
              </span>
              <span className="text-xs md:text-sm text-gray-500">
                Points: {totalPoints}
              </span>
            </div>
          </div>

          {/* Video Player - Mobile optimized */}
          <Card className="overflow-hidden">
            {(() => {
              const drill = currentDrill?.drill
              
              // Debug logging
              console.log('🎬 Video Player Debug:', {
                currentDrill: currentDrill,
                drill: drill,
                drillKeys: drill ? Object.keys(drill) : 'no drill',
                vimeo_id: drill?.vimeo_id,
                both_hands_vimeo_id: drill?.both_hands_vimeo_id,
                strong_hand_vimeo_id: drill?.strong_hand_vimeo_id,
                off_hand_vimeo_id: drill?.off_hand_vimeo_id
              })
              
              // Extract Vimeo ID from drill data
              const vimeoId = extractVimeoId(drill)
              console.log('🎯 Extracted Vimeo ID:', vimeoId)

              if (vimeoId) {
                return (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allowFullScreen
                      title={drill?.title || drill?.drill_name || 'Drill Video'}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                    />
                  </div>
                )
              }

              return (
                <div className="aspect-video bg-gray-50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-600">
                    <PlayCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4" />
                    <p className="text-base md:text-lg font-medium">Video not available</p>
                    {(drill?.title || drill?.drill_name) && (
                      <p className="text-sm mt-2 text-gray-500">{drill.title || drill.drill_name}</p>
                    )}
                    <p className="text-xs mt-2 text-gray-400">No video content found for this drill</p>
                  </div>
                </div>
              )
            })()
            }
          </Card>

          {/* Drill Info & Controls - Mobile optimized with big captions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="drill-caption">
                  {currentDrill?.drill?.title || currentDrill?.drill?.drill_name || `Drill ${currentDrillIndex + 1}`}
                </CardTitle>
                <Badge variant="outline" className="ml-2 text-sm">
                  {currentDrillIndex + 1} / {drills.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDrill?.drill?.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{currentDrill.drill.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {currentDrill?.drill_duration_seconds && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-xl md:text-2xl font-bold">{currentDrill.drill_duration_seconds}s</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                )}
                {currentDrill?.repetitions && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-xl md:text-2xl font-bold">{currentDrill.repetitions}</div>
                    <div className="text-sm text-gray-500">Reps</div>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl md:text-2xl font-bold">
                    {formatTime(drillTimer)}
                  </div>
                  <div className="text-sm text-gray-500">Time</div>
                </div>
              </div>

              {/* Progress Dots - Larger for mobile */}
              <div className="flex justify-center gap-2 mb-4">
                {drills.map((_: any, index: number) => (
                  <div
                    key={index}
                    className={`h-3 w-3 md:h-2 md:w-2 rounded-full transition-all duration-300 ${
                      completedDrills.has(index)
                        ? 'bg-green-500 w-4 md:w-3'
                        : index === currentDrillIndex
                        ? 'bg-blue-500 w-4 md:w-3'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons - 60px touch targets */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentDrillIndex === 0}
                  className="h-16 w-16"
                  data-testid="previous-button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                {!completedDrills.has(currentDrillIndex) ? (
                  <Button 
                    onClick={handleMarkComplete}
                    className="flex-1 h-16 text-lg md:text-base bg-green-600 hover:bg-green-700 font-bold"
                    data-testid="did-it-button"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Did It!
                  </Button>
                ) : (
                  <Button
                    variant="outline" 
                    disabled
                    className="flex-1 h-16 text-lg md:text-base"
                    data-testid="did-it-button"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Completed!
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentDrillIndex === drills.length - 1}
                  className="h-16 w-16"
                  data-testid="next-drill-button"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPage() {
  return (
    <WorkoutErrorBoundary>
      <WorkoutPageContent />
    </WorkoutErrorBoundary>
  )
}