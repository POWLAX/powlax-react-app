'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  GraduationCap, 
  Play, 
  Trophy, 
  Target,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  BookOpen,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/SupabaseAuthContext'

// Mock data - in production this would come from user's actual progress
const mockPlayerProgress = {
  level: 'Intermediate',
  xp: 2847,
  nextLevelXp: 3500,
  totalWorkoutsCompleted: 23,
  streakDays: 7,
  favoriteCategory: 'Attack',
  recentAchievements: [
    { name: 'Shooting Specialist', icon: '🎯', earned: '2 days ago' },
    { name: 'Week Warrior', icon: '🔥', earned: '1 week ago' },
    { name: 'Dodge Master', icon: '⚡', earned: '2 weeks ago' }
  ]
}

const skillCategories = [
  {
    id: 'attack',
    name: 'Attack Skills',
    description: 'Shooting, dodging, and offensive techniques',
    icon: Target,
    color: 'bg-red-500',
    progress: 78,
    workoutsCount: 12,
    estimatedTime: '45 min'
  },
  {
    id: 'defense', 
    name: 'Defense Skills',
    description: 'Checking, positioning, and defensive strategies',
    icon: GraduationCap,
    color: 'bg-blue-500',
    progress: 65,
    workoutsCount: 8,
    estimatedTime: '35 min'
  },
  {
    id: 'midfield',
    name: 'Midfield Skills', 
    description: 'Transition play and two-way skills',
    icon: Zap,
    color: 'bg-green-500',
    progress: 42,
    workoutsCount: 6,
    estimatedTime: '40 min'
  },
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Stick skills, footwork, and basic techniques',
    icon: BookOpen,
    color: 'bg-purple-500',
    progress: 89,
    workoutsCount: 15,
    estimatedTime: '30 min'
  }
]

export default function AcademyPage() {
  const { user } = useAuth()

  const progressPercentage = (mockPlayerProgress.xp / mockPlayerProgress.nextLevelXp) * 100

  // Temporarily bypass auth check to fix loading issue
  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading academy...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Skills Academy
            </h1>
            <p className="text-gray-600 mt-1">
              Develop your lacrosse skills with structured workouts and drills
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-yellow-100 text-yellow-800">
              {mockPlayerProgress.level}
            </Badge>
          </div>
        </div>
      </div>

      {/* Player Progress Overview */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Level Progress */}
            <div>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">Level Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{mockPlayerProgress.level}</span>
                  <span>{mockPlayerProgress.xp} / {mockPlayerProgress.nextLevelXp} XP</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            {/* Workouts Completed */}
            <div>
              <div className="flex items-center mb-2">
                <Play className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Workouts</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {mockPlayerProgress.totalWorkoutsCompleted}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>

            {/* Streak */}
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium">Streak</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {mockPlayerProgress.streakDays}
              </div>
              <div className="text-sm text-gray-500">Days</div>
            </div>

            {/* Recent Achievements */}
            <div>
              <div className="flex items-center mb-2">
                <Trophy className="h-5 w-5 text-purple-500 mr-2" />
                <span className="font-medium">Latest Achievement</span>
              </div>
              <div className="text-sm">
                <div className="flex items-center">
                  <span className="mr-2">{mockPlayerProgress.recentAchievements[0].icon}</span>
                  {mockPlayerProgress.recentAchievements[0].name}
                </div>
                <div className="text-gray-500 text-xs">
                  {mockPlayerProgress.recentAchievements[0].earned}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Continue Learning
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Pick up where you left off with your personalized workout
                </p>
                <Link href="/skills-academy/interactive-workout">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </Link>
              </div>
              <Play className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Track Progress
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  View your skill development and achievements
                </p>
                <Link href="/skills-academy/progress">
                  <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
                  </Button>
                </Link>
              </div>
              <TrendingUp className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skill Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className={`${category.color} p-3 rounded-lg mr-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{category.progress}%</span>
                      </div>
                      <Progress value={category.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {category.workoutsCount} workouts
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        ~{category.estimatedTime}
                      </div>
                    </div>

                    <Link href={`/skills-academy?category=${category.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        Start Training
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockPlayerProgress.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{achievement.name}</p>
                  <p className="text-sm text-gray-500">{achievement.earned}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}