'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, CheckCircle, Trophy, Activity, Home, Target,
  ChevronDown, Award, PlayCircle, Check, Users, BookOpen, Compass, MessageSquare
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

// Mobile Bottom Navigation Component
function MobileBottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (Math.abs(diff) > 50) {
        setIsVisible(diff > 0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [startY]);

  return (
    <div 
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="h-16 flex items-center justify-around">
        <Link href="/dashboard" className="flex flex-col items-center justify-center p-2 text-gray-600">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link href="/teams" className="flex flex-col items-center justify-center p-2 text-gray-600">
          <Users className="w-6 h-6" />
          <span className="text-xs mt-1">Teams</span>
        </Link>
        <Link href="/skills-academy" className="flex flex-col items-center justify-center p-2 text-powlax-blue">
          <Target className="w-6 h-6" />
          <span className="text-xs mt-1">Academy</span>
        </Link>
        <Link href="/resources" className="flex flex-col items-center justify-center p-2 text-gray-600">
          <BookOpen className="w-6 h-6" />
          <span className="text-xs mt-1">Resources</span>
        </Link>
        <Link href="/community" className="flex flex-col items-center justify-center p-2 text-gray-600">
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs mt-1">Community</span>
        </Link>
      </div>
    </div>
  );
}

function WorkoutPageContent() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1
  
  // Get current user
  const [userId, setUserId] = useState<string | null>(null)
  const [showDrillsDropdown, setShowDrillsDropdown] = useState(false)
  
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

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Activity className="w-8 h-8 animate-spin text-powlax-blue" />
      </div>
    )
  }

  if (!sessionLoading && (!workout || drills.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen">
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
      <>
        <CelebrationAnimation 
          points={finalPoints}
          isVisible={showCelebration}
          onAnimationEnd={() => setShowCelebration(false)}
        />
        
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
          <MobileBottomNav />
        </div>
      </>
    )
  }

  const currentDrill = drills[currentDrillIndex]
  const progress = drills.length > 0 ? (completedDrills.size / drills.length) * 100 : 0

  return (
    <WorkoutErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/skills-academy/workouts">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold">{workout?.workout_name || 'Loading...'}</h1>
              <div className="text-sm text-gray-600">
                Drill {currentDrillIndex + 1} of {drills.length}
              </div>
            </div>
            <div className="text-sm font-semibold text-powlax-blue">
              {formatTime(drillTimer)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Drill Dropdown Menu */}
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <button
            onClick={() => setShowDrillsDropdown(!showDrillsDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg"
          >
            <span className="text-sm font-medium">
              {currentDrill?.drill?.title || `Drill ${currentDrillIndex + 1}`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDrillsDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDrillsDropdown && (
            <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {drills.map((drill, index) => (
                <button
                  key={index}
                  onClick={() => handleDrillSelect(index)}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                    completedDrills.has(index) ? 'bg-green-50' : index === currentDrillIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className={`text-sm ${completedDrills.has(index) ? 'text-green-700' : ''}`}>
                    {drill?.drill?.title || `Drill ${index + 1}`}
                  </span>
                  {completedDrills.has(index) && <Check className="w-4 h-4 text-green-600" />}
                </button>
              ))}
            </div>
          )}
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
                    title={drill?.title || 'Drill Video'}
                  />
                )
              } else {
                return (
                  <div className="flex items-center justify-center h-full bg-gray-900">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Video coming soon</p>
                    </div>
                  </div>
                )
              }
            })()}
          </div>

          {/* Drill Info Card */}
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-xl font-bold mb-2">
              {currentDrill?.drill?.title || `Drill ${currentDrillIndex + 1}`}
            </h2>
            
            <div className="flex space-x-4 text-black">
              {currentDrill?.drill_duration_seconds && (
                <div className="bg-white/90 px-3 py-1 rounded">
                  <span className="font-bold">{currentDrill.drill_duration_seconds}s</span>
                  <span className="text-xs ml-1">Duration</span>
                </div>
              )}
              {currentDrill?.repetitions && (
                <div className="bg-white/90 px-3 py-1 rounded">
                  <span className="font-bold">{currentDrill.repetitions}</span>
                  <span className="text-xs ml-1">Reps</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-white p-4 border-t border-gray-200">
            <Button 
              onClick={handleMarkComplete}
              className="w-full h-14 text-lg font-bold bg-powlax-blue hover:bg-powlax-blue/90"
              disabled={completedDrills.has(currentDrillIndex)}
            >
              {completedDrills.has(currentDrillIndex) ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Completed
                </>
              ) : (
                'Did It!'
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </WorkoutErrorBoundary>
  )
}

export default function WorkoutPage() {
  return <WorkoutPageContent />
}