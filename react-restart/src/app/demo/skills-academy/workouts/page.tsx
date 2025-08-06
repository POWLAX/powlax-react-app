'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Trophy, Target, Zap, Shield, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { vimeoService } from '@/lib/vimeo-service'
import VideoModal from '@/components/practice-planner/modals/VideoModal'

interface Workout {
  id: string
  name: string
  description?: string
  workout_type: string
  duration?: number
  complexity?: string
  point_value?: number
  point_type?: string
  video_url?: string
  tags?: string[]
  drills?: any[]
}

interface WorkoutStats {
  totalCompleted: number
  lastCompleted?: string
  averageScore?: number
  streak?: number
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [userStats, setUserStats] = useState<WorkoutStats>({
    totalCompleted: 0
  })

  useEffect(() => {
    fetchWorkouts()
    fetchUserStats()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('skills_academy_workouts')
        .select('*')
        .order('title')

      if (error) throw error

      const formattedWorkouts = data?.map(workout => ({
        id: workout.id?.toString() || 'workout-' + Math.random(),
        name: workout.title || 'Unnamed Workout',
        description: workout.description,
        workout_type: workout.workout_type || 'general',
        duration: workout.duration_minutes,
        complexity: workout.complexity,
        point_value: workout.point_values?.lax_credit || 0,
        point_type: 'lax_credit',
        video_url: workout.vimeo_link,
        tags: workout.tags || [],
        drills: [] // Will be populated when we have drill relationships
      })) || []

      setWorkouts(formattedWorkouts)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      // Use mock data as fallback
      setWorkouts(getMockWorkouts())
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    // TODO: Implement user stats fetching
    setUserStats({
      totalCompleted: 23,
      lastCompleted: '2025-01-14',
      averageScore: 85,
      streak: 5
    })
  }

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'attack': return <Target className="w-5 h-5" />
      case 'defense': return <Shield className="w-5 h-5" />
      case 'midfield': return <Zap className="w-5 h-5" />
      case 'wall_ball': return <Trophy className="w-5 h-5" />
      default: return <Users className="w-5 h-5" />
    }
  }

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'attack_token': return 'bg-red-500'
      case 'defense_dollar': return 'bg-blue-500'
      case 'midfield_medal': return 'bg-green-500'
      case 'rebound_reward': return 'bg-purple-500'
      default: return 'bg-yellow-500'
    }
  }

  const filteredWorkouts = selectedType === 'all' 
    ? workouts 
    : workouts.filter(w => w.workout_type === selectedType)

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    if (workout.video_url) {
      setCurrentVideoUrl(workout.video_url)
      setShowVideoModal(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Skills Academy Workouts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <p className="text-2xl font-bold">{userStats.totalCompleted}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{userStats.streak} days</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{userStats.averageScore}%</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{workouts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workout Type Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="attack">Attack</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="midfield">Midfield</TabsTrigger>
          <TabsTrigger value="wall_ball">Wall Ball</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getWorkoutIcon(workout.workout_type)}
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                </div>
                {workout.point_value && (
                  <Badge className={`${getPointTypeColor(workout.point_type || '')} text-white`}>
                    +{workout.point_value}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workout.description && (
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  {workout.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{workout.duration} min</span>
                    </div>
                  )}
                  {workout.drills && workout.drills.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{workout.drills.length} drills</span>
                    </div>
                  )}
                </div>

                {workout.tags && workout.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workout.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {workout.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{workout.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => handleStartWorkout(workout)}
                >
                  Start Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideoUrl && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={currentVideoUrl}
        />
      )}
    </div>
  )
}

function getMockWorkouts(): Workout[] {
  return [
    {
      id: '1',
      name: 'Ankle Breaker 5',
      workout_type: 'attack',
      duration: 5,
      point_value: 50,
      point_type: 'attack_token',
      tags: ['5-drill-workout', 'foundation-ace'],
      description: 'Quick attack-focused workout to improve dodging skills'
    },
    {
      id: '2',
      name: 'Fence Saver Defense',
      workout_type: 'defense',
      duration: 10,
      point_value: 75,
      point_type: 'defense_dollar',
      tags: ['10-drill-workout', 'long-pole-lizard'],
      description: 'Defensive positioning and footwork drills'
    },
    {
      id: '3',
      name: 'Wall Ball Warrior',
      workout_type: 'wall_ball',
      duration: 15,
      point_value: 100,
      point_type: 'rebound_reward',
      tags: ['wall-ball-hawk', 'stamina-star'],
      description: 'Complete wall ball routine for stick skills'
    }
  ]
}