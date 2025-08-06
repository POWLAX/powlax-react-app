'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, Target, Zap, Clock, TrendingUp, ChevronRight, 
  Star, Award, Calendar, PlayCircle, Users, BookOpen 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/JWTAuthContext'

interface Workout {
  id: string
  title: string
  position: 'attack' | 'defense' | 'midfield' | 'goalie' | 'wall_ball'
  workout_type: 'mini' | 'more' | 'complete'
  track_type?: 'exposure' | 'mastery'
  duration_minutes: number
  drill_count: number
  points_possible: number
  complexity: 'foundation' | 'building' | 'advanced'
  drill_order?: string[]
}

interface CoachAssignment {
  id: string
  workout: Workout
  coach_name: string
  due_date?: string
  message?: string
  bonus_multiplier: number
  completed: boolean
}

interface UserProgress {
  totalPoints: number
  currentStreak: number
  workoutsCompleted: number
  position: string
  weeklyGoal: number
  weeklyProgress: number
  lastWorkoutDate?: string
}

const positionIcons = {
  attack: '⚔️',
  defense: '🛡️',
  midfield: '🏃',
  goalie: '🥅',
  wall_ball: '🎾'
}

const complexityColors = {
  foundation: 'bg-green-500',
  building: 'bg-blue-500',
  advanced: 'bg-purple-500'
}

const workoutTypeLabels = {
  mini: { label: 'Mini', duration: '5-10 min', color: 'bg-green-100 text-green-800' },
  more: { label: 'More', duration: '10-20 min', color: 'bg-blue-100 text-blue-800' },
  complete: { label: 'Complete', duration: '20-30 min', color: 'bg-purple-100 text-purple-800' }
}

export default function PlayerDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState<'exposure' | 'mastery'>('exposure')
  const [coachAssignments, setCoachAssignments] = useState<CoachAssignment[]>([])
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<Workout[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    currentStreak: 0,
    workoutsCompleted: 0,
    position: 'attack',
    weeklyGoal: 3,
    weeklyProgress: 0
  })

  useEffect(() => {
    fetchUserData()
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    
    try {
      // Fetch user progress
      // TODO: Connect to real Supabase data
      setUserProgress({
        totalPoints: 2450,
        currentStreak: 5,
        workoutsCompleted: 23,
        position: 'attack',
        weeklyGoal: 3,
        weeklyProgress: 2
      })

      // Fetch coach assignments
      setCoachAssignments([
        {
          id: '1',
          workout: {
            id: 'coach-1',
            title: 'Attack Focus - Shooting Drills',
            position: 'attack',
            workout_type: 'more',
            duration_minutes: 15,
            drill_count: 5,
            points_possible: 150,
            complexity: 'building'
          },
          coach_name: 'Coach Johnson',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Focus on your shooting form and follow through',
          bonus_multiplier: 2,
          completed: false
        }
      ])

      // Fetch recommended workouts based on position
      setRecommendedWorkouts([
        {
          id: 'rec-1',
          title: 'Attack Fundamentals',
          position: 'attack',
          workout_type: 'mini',
          duration_minutes: 8,
          drill_count: 3,
          points_possible: 75,
          complexity: 'foundation'
        },
        {
          id: 'rec-2',
          title: 'Dodging Mastery',
          position: 'attack',
          workout_type: 'more',
          duration_minutes: 15,
          drill_count: 5,
          points_possible: 150,
          complexity: 'building'
        },
        {
          id: 'rec-3',
          title: 'Complete Attack Training',
          position: 'attack',
          workout_type: 'complete',
          duration_minutes: 25,
          drill_count: 8,
          points_possible: 300,
          complexity: 'advanced'
        }
      ])

      // Fetch recent workouts
      setRecentWorkouts([
        {
          id: 'recent-1',
          title: 'Wall Ball Basics',
          position: 'wall_ball',
          workout_type: 'mini',
          duration_minutes: 10,
          drill_count: 4,
          points_possible: 100,
          complexity: 'foundation'
        }
      ])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = (workoutId: string) => {
    router.push(`/skills-academy/workouts/${workoutId}/play`)
  }

  const weeklyProgressPercentage = (userProgress.weeklyProgress / userProgress.weeklyGoal) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-green-600">Skills Academy Training</h1>
        <p className="text-gray-600">Your personalized lacrosse skill development journey</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{userProgress.totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-green-600">{userProgress.currentStreak} days</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workouts Done</p>
                <p className="text-2xl font-bold text-green-600">{userProgress.workoutsCompleted}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Goal</p>
                <div className="flex items-center gap-2">
                  <Progress value={weeklyProgressPercentage} className="flex-1 h-2" />
                  <span className="text-sm font-bold text-green-600">
                    {userProgress.weeklyProgress}/{userProgress.weeklyGoal}
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coach Assignments */}
      {coachAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Coach Assignments
            <Badge className="bg-green-500 text-white">2x Points!</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coachAssignments.map(assignment => (
              <Card key={assignment.id} className="border-green-300 bg-green-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {positionIcons[assignment.workout.position]}
                        {assignment.workout.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={workoutTypeLabels[assignment.workout.workout_type].color}>
                          {workoutTypeLabels[assignment.workout.workout_type].label}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {assignment.workout.duration_minutes} min • {assignment.workout.drill_count} drills
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      {assignment.bonus_multiplier}x
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">From: {assignment.coach_name}</p>
                      {assignment.due_date && (
                        <p className="text-gray-600">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {assignment.message && (
                        <p className="italic text-gray-600 mt-2">"{assignment.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-600">
                        +{assignment.workout.points_possible * assignment.bonus_multiplier} pts possible
                      </span>
                      <Button 
                        onClick={() => startWorkout(assignment.workout.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Two-Track System */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Choose Your Training Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedTrack === 'exposure' ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedTrack('exposure')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Exposure Track
                </span>
                {selectedTrack === 'exposure' && (
                  <Badge className="bg-green-500 text-white">Active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Different workout each session for broad skill exposure
              </p>
              <div className="text-xs text-gray-500">
                <p>• Monday: Workout A1</p>
                <p>• Wednesday: Workout A2</p>
                <p>• Friday: Workout A3</p>
                <p className="mt-2 font-semibold">Complete exposure in 4 weeks</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              selectedTrack === 'mastery' ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedTrack('mastery')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Mastery Track
                </span>
                {selectedTrack === 'mastery' && (
                  <Badge className="bg-green-500 text-white">Active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Same workout 3x per week for deep skill mastery
              </p>
              <div className="text-xs text-gray-500">
                <p>• Week 1-4: Master Workout A1</p>
                <p>• Week 5-8: Master Workout A2</p>
                <p>• Week 9-12: Master Workout A3</p>
                <p className="mt-2 font-semibold">Elite development in 12 weeks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended Workouts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          Recommended for You
          <span className="text-sm font-normal text-gray-600 ml-2">
            Based on your {userProgress.position} position
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedWorkouts.map(workout => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {positionIcons[workout.position]}
                    {workout.title}
                  </CardTitle>
                  <div className={`h-2 w-2 rounded-full ${complexityColors[workout.complexity]}`} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={workoutTypeLabels[workout.workout_type].color}>
                    {workoutTypeLabels[workout.workout_type].label}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    {workout.complexity}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {workout.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-gray-400" />
                      {workout.drill_count} drills
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-gray-400" />
                      {workout.points_possible} pts
                    </span>
                  </div>
                  <Button 
                    onClick={() => startWorkout(workout.id)}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Start Workout
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Continue Where You Left Off */}
      {recentWorkouts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Continue Training</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentWorkouts.map(workout => (
              <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {positionIcons[workout.position]}
                        {workout.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Last completed 2 days ago
                      </p>
                    </div>
                    <Button
                      onClick={() => startWorkout(workout.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Repeat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => router.push('/skills-academy/workouts')}
          variant="outline"
          size="lg"
        >
          Browse All Workouts
        </Button>
        <Button 
          onClick={() => router.push('/skills-academy/progress')}
          variant="outline"
          size="lg"
        >
          View Progress
        </Button>
        <Button 
          onClick={() => router.push('/skills-academy/leaderboard')}
          variant="outline"
          size="lg"
        >
          Leaderboard
        </Button>
      </div>
    </div>
  )
}