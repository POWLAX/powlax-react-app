'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, SkipForward, CheckCircle, 
  Timer, Target, Trophy, Star, Flame, 
  Video, RotateCcw, PlayCircle, PauseCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { DifficultyIndicator } from '@/components/gamification/DifficultyIndicator'

interface Drill {
  id: string
  name: string
  category: 'attack' | 'defense' | 'midfield' | 'wallball' | 'fundamentals'
  difficulty: number
  duration: number // in seconds
  instructions: string[]
  points: {
    lax_credit: number
    category_specific: number
  }
  videoUrl: string
  videoDuration: number // in seconds
  videoDescription: string
}

const workoutSession = {
  id: 'personalized-session',
  name: 'Your Personalized Workout',
  description: 'Tailored training session based on your skill level and goals',
  totalDuration: 1500, // 25 minutes
  difficulty: 3,
  estimatedPoints: 650,
  drills: [
    {
      id: 'skill-assessment',
      name: 'Skill Assessment Warm-up',
      category: 'fundamentals' as const,
      difficulty: 2,
      duration: 300, // 5 minutes
      instructions: [
        'Begin with basic stick handling',
        'Practice both hands equally',
        'Focus on clean catches and releases',
        'Maintain proper form throughout'
      ],
      points: { lax_credit: 50, category_specific: 30 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDuration: 120,
      videoDescription: 'Master the fundamentals with proper stick handling technique'
    },
    {
      id: 'targeted-drill',
      name: 'Targeted Skill Development',
      category: 'attack' as const,
      difficulty: 3,
      duration: 420, // 7 minutes
      instructions: [
        'Focus on your identified improvement area',
        'Practice specific techniques repeatedly',
        'Maintain intensity throughout',
        'Track your progress metrics'
      ],
      points: { lax_credit: 120, category_specific: 90 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      videoDuration: 180,
      videoDescription: 'Develop your attacking skills with targeted practice drills'
    },
    {
      id: 'conditioning-finish',
      name: 'Conditioning Finish',
      category: 'fundamentals' as const,
      difficulty: 4,
      duration: 480, // 8 minutes
      instructions: [
        'High-intensity skill work',
        'Combine multiple movements',
        'Push through fatigue',
        'Finish strong to build mental toughness'
      ],
      points: { lax_credit: 150, category_specific: 100 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: 200,
      videoDescription: 'Complete your workout with high-intensity conditioning drills'
    }
  ]
}

export default function InteractiveWorkoutPage() {
  const { user } = useAuth()
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completedDrills, setCompletedDrills] = useState<string[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [showVideo, setShowVideo] = useState(true)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const currentDrill = workoutSession.drills[currentDrillIndex]
  const isLastDrill = currentDrillIndex === workoutSession.drills.length - 1
  const workoutProgress = ((currentDrillIndex + (isWorkoutStarted ? 1 : 0)) / workoutSession.drills.length) * 100

  // Initialize timer when drill starts
  useEffect(() => {
    if (isWorkoutStarted && currentDrill && timeRemaining === 0) {
      setTimeRemaining(currentDrill.duration)
    }
  }, [currentDrillIndex, isWorkoutStarted, currentDrill, timeRemaining])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, timeRemaining])

  // Auto-advance when drill completes
  useEffect(() => {
    if (timeRemaining === 0 && isWorkoutStarted && currentDrill && !completedDrills.includes(currentDrill.id)) {
      // Mark drill as completed and award points
      setCompletedDrills(prev => [...prev, currentDrill.id])
      setTotalPoints(prev => prev + currentDrill.points.lax_credit + currentDrill.points.category_specific)
    }
  }, [timeRemaining, isWorkoutStarted, currentDrill, completedDrills])

  const nextDrill = useCallback(() => {
    if (!isLastDrill) {
      setCurrentDrillIndex(prev => prev + 1)
      setTimeRemaining(0)
      setIsPlaying(false)
    }
  }, [isLastDrill])

  // Video synchronization
  useEffect(() => {
    if (videoRef && currentDrill) {
      const handleVideoEnd = () => {
        if (timeRemaining === 0) {
          nextDrill()
        }
      }

      videoRef.addEventListener('ended', handleVideoEnd)
      return () => videoRef.removeEventListener('ended', handleVideoEnd)
    }
  }, [videoRef, currentDrill, nextDrill, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startWorkout = () => {
    setIsWorkoutStarted(true)
    setTimeRemaining(currentDrill.duration)
  }

  const toggleTimer = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleVideoPlayback = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause()
      } else {
        videoRef.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const skipDrill = () => {
    if (currentDrill && !completedDrills.includes(currentDrill.id)) {
      // Award partial points for skipped drill
      const partialPoints = Math.floor((currentDrill.points.lax_credit + currentDrill.points.category_specific) * 0.5)
      setTotalPoints(prev => prev + partialPoints)
      setCompletedDrills(prev => [...prev, currentDrill.id])
    }
    nextDrill()
  }

  const restartDrill = () => {
    setTimeRemaining(currentDrill.duration)
    setIsPlaying(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }

  if (!isWorkoutStarted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name || user.name}!
          </h1>
          <p className="text-gray-600">Ready for your personalized training session?</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{workoutSession.name}</h2>
                <p className="text-gray-600 mb-6">{workoutSession.description}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Duration: {Math.floor(workoutSession.totalDuration / 60)} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-green-500 mr-3" />
                    <span>Estimated Points: {workoutSession.estimatedPoints}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <DifficultyIndicator level={workoutSession.difficulty} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Drills</h3>
                <div className="space-y-3">
                  {workoutSession.drills.map((drill, index) => (
                    <div key={drill.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{drill.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{drill.category}</Badge>
                          <span className="text-sm text-gray-500">{formatTime(drill.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button onClick={startWorkout} className="px-8 py-3 text-lg">
                <PlayCircle className="h-6 w-6 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Workout Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {workoutSession.name}
            </h1>
            <p className="text-gray-600">
              Drill {currentDrillIndex + 1} of {workoutSession.drills.length}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-lg font-semibold text-gray-900">{totalPoints} pts</span>
            </div>
            <StreakCounter currentStreak={7} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Workout Progress</span>
            <span>{Math.round(workoutProgress)}%</span>
          </div>
          <Progress value={workoutProgress} className="h-2" />
        </div>
      </div>

      {/* Video Section */}
      {showVideo && currentDrill && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Drill Video
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowVideo(false)}
              >
                Hide Video
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={setVideoRef}
                src={currentDrill.videoUrl}
                className="w-full aspect-video"
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmQzNzQ4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyaWxsIFZpZGVvPC90ZXh0Pjwvc3ZnPg=="
                onClick={toggleVideoPlayback}
                onError={(e) => console.log('Video error:', e)}
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isVideoPlaying && (
                  <PlayCircle className="h-16 w-16 text-white opacity-80" />
                )}
              </div>
            </div>
            <p className="text-gray-600 text-center">
              {currentDrill.videoDescription}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Drill */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {currentDrill?.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{currentDrill?.category}</Badge>
                <DifficultyIndicator level={currentDrill?.difficulty || 1} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-500">remaining</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="space-y-1">
              {currentDrill?.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={restartDrill}
              disabled={timeRemaining === currentDrill?.duration}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            
            <Button
              onClick={toggleTimer}
              className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              size="lg"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={skipDrill}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>

          {/* Completion Status */}
          {timeRemaining === 0 && currentDrill && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Drill Complete! +{currentDrill.points.lax_credit + currentDrill.points.category_specific} points
                </span>
              </div>
              {!isLastDrill && (
                <Button onClick={nextDrill} className="w-full mt-4">
                  Continue to Next Drill
                </Button>
              )}
              {isLastDrill && (
                <div className="text-center mt-4">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    🎉 Workout Complete!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Great job! You earned {totalPoints} total points.
                  </p>
                  <Button onClick={() => window.location.href = '/academy'}>
                    Return to Academy
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}