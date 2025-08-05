'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, Star, Target, Shield, Zap, Award, 
  User, Calendar, MapPin, TrendingUp, Medal,
  Crown, Flame, CheckCircle
} from 'lucide-react'

export default function PlayerProfileDemoPage() {
  // Mock player data based on POWLAX gamification system
  const mockPlayer = {
    name: "Alex Thompson",
    avatar: "/api/placeholder/150/150", // Placeholder for avatar
    position: "Midfielder",
    team: "Thunder Hawks",
    joinDate: "2024-03-15",
    currentRank: {
      title: "Elite Midfielder",
      level: 12,
      progress: 78, // Progress to next level
      nextRank: "All-Star"
    },
    totalPoints: 24750,
    pointCategories: [
      { name: "Lax Credit", value: 8240, icon: Trophy, color: "text-blue-500", bg: "bg-blue-50" },
      { name: "Attack Tokens", value: 3420, icon: Target, color: "text-red-500", bg: "bg-red-50" },
      { name: "Defense Dollars", value: 4120, icon: Shield, color: "text-green-500", bg: "bg-green-50" },
      { name: "Midfield Medals", value: 5210, icon: Medal, color: "text-purple-500", bg: "bg-purple-50" },
      { name: "Rebound Rewards", value: 2180, icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
      { name: "Lax IQ Points", value: 1580, icon: Star, color: "text-indigo-500", bg: "bg-indigo-50" }
    ],
    recentBadges: [
      { name: "Wall Ball Warrior", description: "1000+ wall ball reps completed", icon: "🏐", date: "2024-01-10", rarity: "Epic" },
      { name: "Attack Master", description: "Mastered 50+ attack drills", icon: "⚡", date: "2024-01-08", rarity: "Rare" },
      { name: "Defense Specialist", description: "Perfect defense drill completion", icon: "🛡️", date: "2024-01-05", rarity: "Legendary" },
      { name: "Midfield Maven", description: "Elite midfielder certification", icon: "🏃", date: "2024-01-02", rarity: "Epic" },
      { name: "Practice Perfect", description: "30 consecutive practice sessions", icon: "🔥", date: "2023-12-28", rarity: "Rare" },
      { name: "Lax IQ Scholar", description: "Advanced strategy comprehension", icon: "🧠", date: "2023-12-25", rarity: "Epic" }
    ],
    stats: {
      practicesCompleted: 127,
      drillsCompleted: 2840,
      wallBallReps: 15600,
      averageSessionTime: "47 minutes",
      currentStreak: 12,
      longestStreak: 28
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'Epic': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'Rare': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="text-sm text-blue-700 font-medium">
            🏆 DEMO MODE - Player Profile | Mock gamification data showcase
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        {/* Main Player Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white rounded-full p-2">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-center lg:text-left">{mockPlayer.name}</h1>
                <p className="text-gray-600">{mockPlayer.position}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {mockPlayer.team}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(mockPlayer.joinDate).toLocaleDateString()}
                </div>
              </div>

              {/* Rank Progress */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{mockPlayer.currentRank.title}</h3>
                    <span className="text-sm text-gray-600">Level {mockPlayer.currentRank.level}</span>
                  </div>
                  <Progress value={mockPlayer.currentRank.progress} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {mockPlayer.currentRank.progress}% to {mockPlayer.currentRank.nextRank}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockPlayer.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{mockPlayer.stats.practicesCompleted}</div>
                    <div className="text-sm text-gray-600">Practices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockPlayer.stats.drillsCompleted.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Drills</div>
                  </div>
                  <div className="text-center flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500 mr-1" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{mockPlayer.stats.currentStreak}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Point Categories */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Point Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPlayer.pointCategories.map((category, index) => {
                    const IconComponent = category.icon
                    return (
                      <div key={index} className={`p-4 rounded-lg ${category.bg} border`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <IconComponent className={`w-5 h-5 mr-2 ${category.color}`} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span className={`font-bold text-lg ${category.color}`}>
                            {category.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Wall Ball Reps</div>
                    <div className="text-2xl font-bold text-yellow-600">{mockPlayer.stats.wallBallReps.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Session</div>
                    <div className="text-2xl font-bold text-blue-600">{mockPlayer.stats.averageSessionTime}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                    <div className="text-2xl font-bold text-orange-600">{mockPlayer.stats.longestStreak} days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="w-5 h-5 mr-2" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPlayer.recentBadges.map((badge, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold truncate">{badge.name}</h4>
                          <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(badge.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View All Badges ({mockPlayer.recentBadges.length + 15}+)
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}