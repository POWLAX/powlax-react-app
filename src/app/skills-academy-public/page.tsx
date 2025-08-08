'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Target, Shield, Zap, Users, Star, 
  Clock, ChevronRight, Award, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface WorkoutPreview {
  id: string
  name: string
  workout_type: string
  duration?: number
  point_value?: number
  tags?: string[]
  drill_count?: number
}

interface SkillCategory {
  name: string
  icon: any
  color: string
  description: string
  workoutCount: number
  totalPoints: number
}

export default function PublicSkillsAcademyPage() {
  const [workoutPreviews, setWorkoutPreviews] = useState<WorkoutPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkoutPreviews()
  }, [])

  const fetchWorkoutPreviews = async () => {
    try {
      const { data, error } = await supabase
        .from('skills_academy_workouts')
        .select('id, title, workout_type, duration_minutes, point_values, tags')
        .limit(6)

      if (error) throw error
      
      const previews = data?.map(workout => ({
        id: workout.id?.toString() || 'workout-' + Math.random(),
        name: workout.title || 'Unnamed Workout',
        workout_type: workout.workout_type || 'general',
        duration: workout.duration_minutes,
        point_value: workout.point_values?.lax_credit || 0,
        tags: workout.tags || [],
        drill_count: Math.floor(Math.random() * 8) + 3 // Mock for now
      })) || []
      
      setWorkoutPreviews(previews)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setWorkoutPreviews(getMockWorkoutPreviews())
    } finally {
      setLoading(false)
    }
  }

  const skillCategories: SkillCategory[] = [
    {
      name: 'Attack',
      icon: Target,
      color: 'text-red-500',
      description: 'Master dodging, shooting, and offensive tactics',
      workoutCount: 38,
      totalPoints: 1500
    },
    {
      name: 'Defense',
      icon: Shield,
      color: 'text-blue-500',
      description: 'Build defensive footwork and positioning skills',
      workoutCount: 24,
      totalPoints: 1200
    },
    {
      name: 'Midfield',
      icon: Zap,
      color: 'text-green-500',
      description: 'Develop two-way play and transition skills',
      workoutCount: 15,
      totalPoints: 800
    },
    {
      name: 'Wall Ball',
      icon: Trophy,
      color: 'text-purple-500',
      description: 'Perfect your stick skills with wall ball routines',
      workoutCount: 53,
      totalPoints: 2000
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground">
              167 Drills • 192 Workouts
            </Badge>
            <h1 className="text-5xl font-bold mb-6">POWLAX Skills Academy</h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Transform your game with structured workouts designed by elite coaches. 
              Track progress, earn points, and unlock achievements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/login">Start Training</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                View Sample Workout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Complete Training System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category) => (
            <Card key={category.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <category.icon className={`w-12 h-12 ${category.color}`} />
                  <Badge variant="secondary">{category.workoutCount} workouts</Badge>
                </div>
                <CardTitle>{category.name} Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Points</span>
                  <span className="text-lg font-bold">{category.totalPoints}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sample Workouts */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Workouts</h2>
          <p className="text-center text-muted-foreground mb-12">
            Get a taste of our comprehensive workout library
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPreviews.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    {workout.point_value && (
                      <Badge className="bg-yellow-500 text-white">
                        +{workout.point_value} pts
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {workout.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{workout.duration} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="capitalize">{workout.workout_type}</span>
                      </div>
                    </div>
                    
                    {workout.tags && workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {workout.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">
                View All 192 Workouts <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Level Up Your Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Earn Badges</h3>
              <p className="text-muted-foreground">
                Unlock Bronze, Silver, and Gold badges as you master skills
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your improvement with detailed analytics
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Daily Streaks</h3>
              <p className="text-muted-foreground">
                Build consistency with daily practice streaks
              </p>
            </div>
          </div>
          
          <Button size="lg" asChild>
            <Link href="/auth/login">Join Skills Academy</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function getMockWorkoutPreviews(): WorkoutPreview[] {
  return [
    {
      id: '1',
      name: 'Ankle Breaker Fundamentals',
      workout_type: 'attack',
      duration: 15,
      point_value: 100,
      tags: ['foundation-ace', 'dodging']
    },
    {
      id: '2',
      name: 'Defensive Slide Package',
      workout_type: 'defense',
      duration: 20,
      point_value: 150,
      tags: ['footwork', 'positioning']
    },
    {
      id: '3',
      name: 'Wall Ball Warrior',
      workout_type: 'wall_ball',
      duration: 10,
      point_value: 75,
      tags: ['stick-skills', 'daily']
    },
    {
      id: '4',
      name: 'Midfield Transition',
      workout_type: 'midfield',
      duration: 25,
      point_value: 200,
      tags: ['advanced', 'two-way']
    },
    {
      id: '5',
      name: 'Quick Stick Mastery',
      workout_type: 'general',
      duration: 12,
      point_value: 80,
      tags: ['passing', 'catching']
    },
    {
      id: '6',
      name: 'Ground Ball Dominance',
      workout_type: 'general',
      duration: 15,
      point_value: 90,
      tags: ['fundamentals', 'competition']
    }
  ]
}