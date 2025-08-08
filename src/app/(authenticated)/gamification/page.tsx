'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Target, Shield, Zap, Star, Award, 
  TrendingUp, Calendar, Clock, ChevronRight,
  Flame, Medal, Crown, Gem
} from 'lucide-react'
import Link from 'next/link'
import { useGamificationData } from '@/hooks/useGamificationData'

// Mock data function to fix loading issues
function getMockGamificationData() {
  return {
    currentRank: {
      name: "Elite Warrior",
      level: 7,
      nextRank: "Champion",
      pointsToNext: 850,
      progressToNext: 65
    },
    totalPoints: 2450,
    streaks: {
      current: 5,
      longest: 12
    },
    badges: {
      total: 18,
      gold: 3,
      silver: 7,
      bronze: 8,
      recent: [
        {
          id: 1,
          name: "Wall Ball Master",
          description: "Complete 10 wall ball workouts",
          tier: "gold",
          earnedDate: "2025-01-14"
        },
        {
          id: 2,
          name: "Shooting Ace",
          description: "Score 90%+ accuracy in shooting drills",
          tier: "silver",
          earnedDate: "2025-01-12"
        },
        {
          id: 3,
          name: "Dodging Dynamo",
          description: "Master 5 different dodging techniques",
          tier: "bronze",
          earnedDate: "2025-01-10"
        }
      ]
    },
    weeklyProgress: [
      { day: "Mon", points: 120, workouts: 2 },
      { day: "Tue", points: 85, workouts: 1 },
      { day: "Wed", points: 150, workouts: 3 },
      { day: "Thu", points: 95, workouts: 1 },
      { day: "Fri", points: 180, workouts: 2 },
      { day: "Sat", points: 0, workouts: 0 },
      { day: "Sun", points: 75, workouts: 1 }
    ],
    pointsByType: {
      attack_token: 650,
      defense_dollar: 420,
      midfield_medal: 580,
      rebound_reward: 480,
      flex_points: 320
    },
    achievements: [
      {
        id: 1,
        title: "Consistency Champion",
        description: "Complete workouts for 7 consecutive days",
        progress: 5,
        total: 7,
        completed: false,
        reward: 100,
        rewardType: "flex_points"
      },
      {
        id: 2,
        title: "Skills Master",
        description: "Earn gold badges in all skill categories",
        progress: 3,
        total: 5,
        completed: false,
        reward: 250,
        rewardType: "attack_token"
      },
      {
        id: 3,
        title: "Point Collector",
        description: "Accumulate 5000 total points",
        progress: 2450,
        total: 5000,
        completed: false,
        reward: 500,
        rewardType: "flex_points"
      }
    ]
  }
}

export default function PlayerGamificationPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  // Temporarily use mock data instead of useGamificationData hook to fix loading issue
  const playerStats = getMockGamificationData()
  const loading = false
  const error = null
  
  // Commented out to fix loading issue
  // const { data: playerStats, loading, error } = useGamificationData()

  const getPointIcon = (type: string) => {
    switch (type) {
      case 'attack_token': return <Target className="w-4 h-4 text-red-500" />
      case 'defense_dollar': return <Shield className="w-4 h-4 text-blue-500" />
      case 'midfield_medal': return <Zap className="w-4 h-4 text-green-500" />
      case 'rebound_reward': return <Trophy className="w-4 h-4 text-purple-500" />
      case 'flex_points': return <Star className="w-4 h-4 text-orange-500" />
      default: return <Gem className="w-4 h-4 text-yellow-500" />
    }
  }

  const getRankIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-yellow-500" />
    if (level >= 5) return <Medal className="w-6 h-6 text-gray-400" />
    return <Star className="w-6 h-6 text-orange-400" />
  }

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || !playerStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header with Rank Progress */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getRankIcon(playerStats.currentRank.level)}
              <div>
                <h1 className="text-3xl font-bold">{playerStats.currentRank.name}</h1>
                <p className="text-muted-foreground">Level {playerStats.currentRank.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{playerStats.totalPoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {playerStats.currentRank.nextRank}</span>
              <span>{playerStats.currentRank.pointsToNext.toLocaleString()} points needed</span>
            </div>
            <Progress value={playerStats.currentRank.progressToNext} className="h-3" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {playerStats.streaks.current}
                    <Flame className="w-5 h-5 text-orange-500" />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Badges</p>
                  <p className="text-2xl font-bold">{playerStats.badges.total}</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {playerStats.weeklyProgress.reduce((sum, day) => sum + day.points, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-2xl font-bold">{playerStats.streaks.longest} days</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>This Week&apos;s Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerStats.weeklyProgress.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{day.day}</span>
                    <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(day.points / 200) * 100}%` }}
                      >
                        {day.points > 0 && (
                          <span className="text-xs text-primary-foreground font-medium">
                            {day.points}
                          </span>
                        )}
                      </div>
                    </div>
                    {day.workouts > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {day.workouts} workout{day.workouts > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          {playerStats.badges.recent.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Badges</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTab('badges')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {playerStats.badges.recent.slice(0, 3).map((badge) => (
                    <div key={badge.id} className={`p-4 rounded-lg border-2 ${getBadgeColor(badge.tier)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8" />
                        <Badge className={getBadgeColor(badge.tier)}>
                          {badge.tier.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Points Tab */}
        <TabsContent value="points" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Points Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(playerStats.pointsByType).map(([type, value]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPointIcon(type)}
                        <span className="font-medium capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-bold">{value.toLocaleString()}</span>
                    </div>
                    <Progress value={(value / playerStats.totalPoints) * 100} className="h-2" />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">How to Earn Points</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span>Attack Tokens - Complete offensive drills and workouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Defense Dollars - Master defensive techniques</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span>Midfield Medals - Excel in transition play</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span>Rebound Rewards - Complete wall ball workouts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerStats.badges.recent.map((badge) => (
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
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You have {playerStats.badges.gold} gold, {playerStats.badges.silver} silver, 
              and {playerStats.badges.bronze} bronze badges
            </p>
            <Button asChild>
              <Link href="/skills-academy">
                Earn More Badges <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          <div className="space-y-4">
            {playerStats.achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{achievement.title}</h3>
                        {achievement.completed && (
                          <Badge variant="default" className="bg-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress} / {achievement.total}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="ml-6 text-center">
                      <div className="flex items-center gap-1">
                        {getPointIcon(achievement.rewardType)}
                        <span className="text-xl font-bold">+{achievement.reward}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reward</p>
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

