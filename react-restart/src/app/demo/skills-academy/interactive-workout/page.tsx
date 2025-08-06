'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, SkipForward, SkipBack, CheckCircle, 
  Timer, Target, Trophy, Star, Flame, Zap, Shield,
  Volume2, VolumeX, RotateCcw, Video, Maximize2,
  PlayCircle, PauseCircle
} from 'lucide-react'
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

const mockWorkout = {
  id: 'elite-midfielder-session',
  name: 'Elite Midfielder Session',
  description: 'Advanced midfield training with dodging, shooting, and transition work',
  totalDuration: 1800, // 30 minutes
  difficulty: 4,
  estimatedPoints: 850,
  drills: [
    {
      id: 'warm-up-passing',
      name: 'Dynamic Warm-up Passing',
      category: 'fundamentals' as const,
      difficulty: 2,
      duration: 300, // 5 minutes
      instructions: [
        'Start with light jogging while cradling',
        'Progress to passing on the run',
        'Focus on clean catches and quick releases',
        'Maintain good stick protection'
      ],
      points: { lax_credit: 50, category_specific: 25 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDuration: 120,
      videoDescription: 'Watch proper warm-up passing technique and stick protection fundamentals'
    },
    {
      id: 'dodge-sequence',
      name: 'Advanced Dodge Sequence',
      category: 'midfield' as const,
      difficulty: 4,
      duration: 420, // 7 minutes
      instructions: [
        'Set up cones in box formation',
        'Practice split dodge through first cone',
        'Roll dodge at second cone',
        'Face dodge at third cone',
        'Finish with shot on goal'
      ],
      points: { lax_credit: 120, category_specific: 80 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      videoDuration: 180,
      videoDescription: 'Master advanced dodging techniques: split dodge, roll dodge, and face dodge sequences'
    },
    {
      id: 'transition-shooting',
      name: 'Transition Shooting Drill',
      category: 'attack' as const,
      difficulty: 4,
      duration: 360, // 6 minutes
      instructions: [
        'Start at midfield line',
        'Sprint to attack zone',
        'Receive pass from coach/partner',
        'Quick shot within 3 seconds',
        'Focus on accuracy over power'
      ],
      points: { lax_credit: 100, category_specific: 75 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: 150,
      videoDescription: 'Learn transition shooting fundamentals: sprint positioning, quick release, and accuracy drills'
    },
    {
      id: 'wall-ball-intensity',
      name: 'High-Intensity Wall Ball',
      category: 'wallball' as const,
      difficulty: 3,
      duration: 480, // 8 minutes
      instructions: [
        'Right hand quick stick - 1 minute',
        'Left hand quick stick - 1 minute',
        'Alternating hands - 2 minutes',
        'Behind the back catches - 1 minute',
        'Quick stick both hands - 3 minutes'
      ],
      points: { lax_credit: 90, category_specific: 60 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      videoDuration: 200,
      videoDescription: 'Perfect your wall ball technique: quick stick, alternating hands, and advanced catching drills'
    },
    {
      id: 'defensive-footwork',
      name: 'Defensive Footwork & Recovery',
      category: 'defense' as const,
      difficulty: 3,
      duration: 240, // 4 minutes
      instructions: [
        'Slide step defensive position',
        'Quick recovery on direction change',
        'Practice poke check technique',
        'Maintain proper body position'
      ],
      points: { lax_credit: 80, category_specific: 55 },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      videoDuration: 120,
      videoDescription: 'Master defensive fundamentals: footwork, recovery techniques, and proper positioning'
    }
  ]
}

export default function InteractiveWorkoutPage() {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(mockWorkout.drills[0].duration)
  const [completedDrills, setCompletedDrills] = useState<string[]>([])
  const [totalPointsEarned, setTotalPointsEarned] = useState(0)
  const [showPointExplosion, setShowPointExplosion] = useState(false)
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [recentBadge, setRecentBadge] = useState<string | null>(null)
  
  // Video-related state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [showVideo, setShowVideo] = useState(true)
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const currentDrill = mockWorkout.drills[currentDrillIndex]
  const workoutProgress = ((currentDrillIndex + (currentDrill.duration - timeRemaining) / currentDrill.duration) / mockWorkout.drills.length) * 100
  const isLastDrill = currentDrillIndex === mockWorkout.drills.length - 1
  const allDrillsCompleted = completedDrills.length === mockWorkout.drills.length

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isActive) {
      completeDrill()
    }
    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  // Reset timer when drill changes
  useEffect(() => {
    setTimeRemaining(currentDrill.duration)
    setIsActive(false)
    setIsVideoPlaying(false)
    setVideoCurrentTime(0)
    if (videoRef) {
      videoRef.currentTime = 0
      videoRef.pause()
    }
  }, [currentDrillIndex, videoRef])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const completeDrill = () => {
    setIsActive(false)
    if (!completedDrills.includes(currentDrill.id)) {
      setCompletedDrills(prev => [...prev, currentDrill.id])
      
      // Award points
      const pointsEarned = currentDrill.points.lax_credit + currentDrill.points.category_specific
      setTotalPointsEarned(prev => prev + pointsEarned)
      
      // Show point explosion animation (simplified)
      setShowPointExplosion(true)
      setTimeout(() => setShowPointExplosion(false), 3000)
      
      // Check for badge unlock (mock logic)
      if (completedDrills.length + 1 === 3) {
        setTimeout(() => {
          setRecentBadge('Workout Warrior')
          setShowBadgeUnlock(true)
        }, 1500)
        setTimeout(() => setShowBadgeUnlock(false), 5000)
      }
      
      // Update streak (mock)
      if (completedDrills.length + 1 === mockWorkout.drills.length) {
        setCurrentStreak(prev => prev + 1)
      }
    }
  }

  const nextDrill = useCallback(() => {
    if (currentDrillIndex < mockWorkout.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1)
    }
  }, [currentDrillIndex])

  const previousDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex(prev => prev - 1)
    }
  }

  const resetWorkout = () => {
    setCurrentDrillIndex(0)
    setCompletedDrills([])
    setTotalPointsEarned(0)
    setIsActive(false)
    setCurrentStreak(5) // Reset to demo value
    setIsVideoPlaying(false)
    setVideoCurrentTime(0)
    if (videoRef) {
      videoRef.currentTime = 0
      videoRef.pause()
    }
  }

  // Video control functions
  const toggleVideoPlayback = () => {
    if (videoRef) {
      if (isVideoPlaying) {
        videoRef.pause()
        setIsVideoPlaying(false)
      } else {
        videoRef.play()
        setIsVideoPlaying(true)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      attack: 'text-red-500 bg-red-50',
      defense: 'text-green-500 bg-green-50',
      midfield: 'text-purple-500 bg-purple-50',
      wallball: 'text-yellow-500 bg-yellow-50',
      fundamentals: 'text-blue-500 bg-blue-50'
    }
    return colors[category as keyof typeof colors] || 'text-gray-500 bg-gray-50'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      attack: Target,
      defense: Shield,
      midfield: Zap,
      wallball: Flame,
      fundamentals: Star
    }
    const IconComponent = icons[category as keyof typeof icons] || Star
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Demo Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="text-sm text-blue-700 font-medium">
            🏃 INTERACTIVE WORKOUT DEMO - Navigate drills & earn points with animations!
          </div>
        </div>
      </div>

      {/* Point Explosion Animation (simplified) */}
      {showPointExplosion && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl font-bold text-yellow-500 animate-bounce">
            +{currentDrill.points.lax_credit + currentDrill.points.category_specific} pts! 🎉
          </div>
        </div>
      )}

      {/* Badge Unlock Animation (simplified) */}
      {showBadgeUnlock && recentBadge && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Badge Unlocked!</h2>
            <p className="text-lg text-gray-700">{recentBadge}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 max-w-4xl">
        {/* Workout Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{mockWorkout.name}</CardTitle>
                <p className="text-gray-600 mb-3">{mockWorkout.description}</p>
                <div className="flex items-center gap-4">
                  <DifficultyIndicator score={mockWorkout.difficulty} showLabel />
                  <Badge variant="outline">
                    <Timer className="w-3 h-3 mr-1" />
                    {Math.floor(mockWorkout.totalDuration / 60)} min
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="w-3 h-3 mr-1" />
                    ~{mockWorkout.estimatedPoints} points
                  </Badge>
                </div>
              </div>
              <StreakCounter 
                currentStreak={currentStreak}
                longestStreak={28}
                streakTitle="Workout Streak"
                size="sm"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Progress & Stats */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(workoutProgress)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedDrills.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPointsEarned}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-gray-600">Time Left</div>
              </div>
            </div>
            <Progress value={workoutProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Video Player */}
        {showVideo && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Drill Video</h3>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowVideo(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={setVideoRef}
                  src={currentDrill?.videoUrl || ''}
                  className="w-full aspect-video"
                  onClick={toggleVideoPlayback}
                  controls
                />
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-3">{currentDrill?.videoDescription || 'Loading drill video...'}</p>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={toggleVideoPlayback}
                  >
                    {isVideoPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show Video Button (if hidden) */}
        {!showVideo && (
          <Card className="mb-6 border-dashed">
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">Video hidden</p>
              <Button onClick={() => setShowVideo(true)}>
                <Video className="w-4 h-4 mr-2" />
                Show Drill Video
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Drill */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Badge className={`${getCategoryColor(currentDrill.category)}`}>
                  {getCategoryIcon(currentDrill.category)}
                  <span className="ml-1 capitalize">{currentDrill.category}</span>
                </Badge>
                <h3 className="text-xl font-semibold">{currentDrill.name}</h3>
                {completedDrills.includes(currentDrill.id) && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <DifficultyIndicator score={currentDrill.difficulty} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="space-y-2">
                {currentDrill.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((currentDrill.duration - timeRemaining) / currentDrill.duration) * 100} 
                className="h-3 max-w-xs mx-auto"
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={previousDrill}
                disabled={currentDrillIndex === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => setIsActive(!isActive)}
                disabled={completedDrills.includes(currentDrill.id)}
                className="px-8"
              >
                {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isActive ? 'Pause' : completedDrills.includes(currentDrill.id) ? 'Completed' : 'Start'}
              </Button>

              <Button
                variant="outline"
                onClick={nextDrill}
                disabled={isLastDrill}
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={completeDrill}
                disabled={completedDrills.includes(currentDrill.id)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="outline" onClick={resetWorkout}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Workout
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowVideo(!showVideo)}
          >
            <Video className="w-4 h-4 mr-2" />
            {showVideo ? 'Hide Video' : 'Show Video'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
            {soundEnabled ? 'Mute' : 'Unmute'}
          </Button>
        </div>

        {/* Completion Message */}
        {allDrillsCompleted && (
          <Card className="mt-6 border-green-500 bg-green-50">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                Workout Complete! 🎉
              </h2>
              <p className="text-green-600 mb-4">
                You earned <strong>{totalPointsEarned} points</strong> and completed all {mockWorkout.drills.length} drills!
              </p>
              <Button onClick={resetWorkout}>
                Start New Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}