'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Target, Shield, Zap, TrendingUp, Calendar,
  Award, Clock, CheckCircle, Circle, Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProgressData {
  totalWorkoutsCompleted: number
  totalDrillsCompleted: number
  totalPoints: number
  pointsByType: {
    lax_credit: number
    attack_token: number
    defense_dollar: number
    midfield_medal: number
    rebound_reward: number
    flex_points: number
  }
  currentStreak: number
  longestStreak: number
  badges: Badge[]
  recentActivities: Activity[]
  skillProgress: SkillProgress[]
}

interface Badge {
  id: string
  name: string
  description: string
  tier: 'bronze' | 'silver' | 'gold'
  earnedDate: string
  category: string
  imageUrl?: string
}

interface Activity {
  id: string
  type: 'workout' | 'drill' | 'badge'
  name: string
  completedAt: string
  pointsEarned: number
  pointType: string
}

interface SkillProgress {
  skill: string
  level: 'foundation' | 'building' | 'advanced'
  progress: number
  drillsCompleted: number
  totalDrills: number
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      // TODO: Fetch real user progress data
      // For now, using mock data
      setProgressData(getMockProgressData())
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPointIcon = (type: string) => {
    switch (type) {
      case 'attack_token': return <Target className="w-4 h-4 text-red-500" />
      case 'defense_dollar': return <Shield className="w-4 h-4 text-blue-500" />
      case 'midfield_medal': return <Zap className="w-4 h-4 text-green-500" />
      case 'rebound_reward': return <Trophy className="w-4 h-4 text-purple-500" />
      default: return <Star className="w-4 h-4 text-yellow-500" />
    }
  }

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || !progressData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">My Progress</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{progressData.totalPoints}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{progressData.totalWorkoutsCompleted}</span>
            </div>
            <p className="text-sm text-muted-foreground">Workouts Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">{progressData.currentStreak}</span>
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{progressData.badges.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {activity.type === 'badge' ? (
                        <Award className="w-5 h-5 text-purple-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPointIcon(activity.pointType)}
                      <span className="font-semibold">+{activity.pointsEarned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Tab */}
        <TabsContent value="points" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Points Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(progressData.pointsByType).map(([type, value]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPointIcon(type)}
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="font-bold">{value}</span>
                    </div>
                    <Progress value={(value / progressData.totalPoints) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.badges.map((badge) => (
              <Card key={badge.id} className={`border-2 ${getBadgeColor(badge.tier)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-12 h-12" />
                    <Badge className={getBadgeColor(badge.tier)}>
                      {badge.tier.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <div className="space-y-4">
            {progressData.skillProgress.map((skill) => (
              <Card key={skill.skill}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{skill.skill}</h3>
                      <Badge variant={skill.level === 'advanced' ? 'default' : 'secondary'}>
                        {skill.level}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{skill.drillsCompleted} / {skill.totalDrills} drills</span>
                      </div>
                      <Progress value={skill.progress} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMockProgressData(): ProgressData {
  return {
    totalWorkoutsCompleted: 47,
    totalDrillsCompleted: 234,
    totalPoints: 3750,
    pointsByType: {
      lax_credit: 1500,
      attack_token: 750,
      defense_dollar: 600,
      midfield_medal: 500,
      rebound_reward: 300,
      flex_points: 100
    },
    currentStreak: 7,
    longestStreak: 14,
    badges: [
      {
        id: '1',
        name: 'Wall Ball Warrior',
        description: 'Complete 10 wall ball workouts',
        tier: 'gold',
        earnedDate: '2025-01-10',
        category: 'wall_ball'
      },
      {
        id: '2',
        name: 'Defensive Dynamo',
        description: 'Master 5 defensive footwork drills',
        tier: 'silver',
        earnedDate: '2025-01-08',
        category: 'defense'
      },
      {
        id: '3',
        name: 'Ankle Breaker',
        description: 'Complete all dodging fundamentals',
        tier: 'bronze',
        earnedDate: '2025-01-05',
        category: 'attack'
      }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'workout',
        name: 'Ankle Breaker 10',
        completedAt: '2025-01-14T10:30:00',
        pointsEarned: 100,
        pointType: 'attack_token'
      },
      {
        id: '2',
        type: 'badge',
        name: 'Wall Ball Warrior',
        completedAt: '2025-01-10T15:45:00',
        pointsEarned: 500,
        pointType: 'lax_credit'
      },
      {
        id: '3',
        type: 'drill',
        name: 'Defensive Slide Package',
        completedAt: '2025-01-09T09:00:00',
        pointsEarned: 25,
        pointType: 'defense_dollar'
      }
    ],
    skillProgress: [
      {
        skill: 'Dodging',
        level: 'building',
        progress: 65,
        drillsCompleted: 13,
        totalDrills: 20
      },
      {
        skill: 'Defensive Footwork',
        level: 'advanced',
        progress: 85,
        drillsCompleted: 17,
        totalDrills: 20
      },
      {
        skill: 'Stick Skills',
        level: 'foundation',
        progress: 40,
        drillsCompleted: 8,
        totalDrills: 20
      }
    ]
  }
}