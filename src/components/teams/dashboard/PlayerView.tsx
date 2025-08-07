'use client'

import { 
  Trophy, 
  Target, 
  Calendar, 
  Star,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Play,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Team, UserTeamRole } from '@/types/teams'
import type { TeamEvent, TeamStats, ActivityItem } from '@/hooks/useTeamDashboard'

interface PlayerViewProps {
  team: Team
  player: UserTeamRole | undefined
  ageGroup: 'youth' | 'middle' | 'teen'
  upcomingEvents: TeamEvent[]
  teamStats: TeamStats | null
  recentActivity: ActivityItem[]
}

export function PlayerView({ 
  team, 
  player, 
  ageGroup, 
  upcomingEvents, 
  teamStats, 
  recentActivity 
}: PlayerViewProps) {
  // Mock player-specific data
  const playerStats = {
    level: 'Intermediate',
    points: 1247,
    rank: 'Silver Striker',
    skills_completed: 23,
    total_skills: 50,
    badges_earned: 8,
    attendance_rate: 92,
    recent_badges: [
      { name: 'Passing Master', earned_date: '2025-01-05', icon: '🎯' },
      { name: 'Team Player', earned_date: '2025-01-03', icon: '🤝' },
      { name: 'Practice Streak', earned_date: '2025-01-01', icon: '🔥' }
    ],
    skill_progress: {
      passing: 85,
      shooting: 72,
      defense: 68,
      field_vision: 79,
      fitness: 83
    },
    goals: [
      { title: 'Complete Shooting Course', progress: 72, target: 100 },
      { title: 'Earn Defense Badge', progress: 40, target: 100 },
      { title: 'Perfect Practice Week', progress: 85, target: 100 }
    ]
  }

  const getAgeAppropriateContent = () => {
    switch (ageGroup) {
      case 'youth': // Ages 8-10: "Do It" Mode
        return {
          primaryColor: 'from-green-400 to-blue-500',
          encouragement: 'Great job practicing! 🌟',
          skillsTitle: 'Skills I Can Do',
          progressTitle: 'My Growth',
          showDetailedStats: false,
          gamification: {
            showPoints: false,
            showRank: false,
            emphasizeBadges: true,
            simpleProgress: true
          }
        }
      case 'middle': // Ages 11-14: "Coach It" Mode  
        return {
          primaryColor: 'from-blue-500 to-purple-600',
          encouragement: 'Keep improving to help your teammates! 💪',
          skillsTitle: 'Leadership Skills',
          progressTitle: 'Team Impact',
          showDetailedStats: true,
          gamification: {
            showPoints: true,
            showRank: true,
            emphasizeBadges: true,
            simpleProgress: false
          }
        }
      case 'teen': // Ages 15+: "Own It" Mode
        return {
          primaryColor: 'from-purple-600 to-red-500',
          encouragement: 'Take ownership of your development! 🚀',
          skillsTitle: 'Mastery Progress',
          progressTitle: 'Performance Analytics',
          showDetailedStats: true,
          gamification: {
            showPoints: true,
            showRank: true,
            emphasizeBadges: false,
            simpleProgress: false
          }
        }
    }
  }

  const ageContent = getAgeAppropriateContent()
  const nextEvent = upcomingEvents[0]

  return (
    <div className="space-y-6">
      {/* Player Header - Age-appropriate design */}
      <Card className={`bg-gradient-to-r ${ageContent.primaryColor} text-white overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-white/20">
                <AvatarFallback className="bg-white text-gray-900 text-xl font-bold">
                  {player?.user?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {player?.user?.name || 'Player'}
                </h1>
                <div className="flex items-center space-x-3 text-white/80">
                  <span>#{player?.jersey_number || '00'}</span>
                  <span>•</span>
                  <span>{player?.position || 'Player'}</span>
                  <span>•</span>
                  <span>{playerStats.level}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {ageContent.gamification.showRank && (
                <Badge className="bg-white/20 text-white mb-2">
                  {playerStats.rank}
                </Badge>
              )}
              <div className="text-3xl font-bold">{playerStats.points}</div>
              <div className="text-sm text-white/80">Total Points</div>
            </div>
          </div>
          
          <div className="mt-4 text-lg font-medium">
            {ageContent.encouragement}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Age-appropriate complexity */}
      <div className="grid gap-4 md:grid-cols-4">
        {ageContent.gamification.emphasizeBadges && (
          <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{playerStats.badges_earned}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </Card>
        )}
        
        <Card className="p-4 text-center">
          <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {playerStats.skills_completed}/{playerStats.total_skills}
          </div>
          <div className="text-sm text-gray-600">Skills</div>
        </Card>
        
        <Card className="p-4 text-center bg-green-50 border-green-200">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{playerStats.attendance_rate}%</div>
          <div className="text-sm text-gray-600">Attendance</div>
        </Card>
        
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">+12%</div>
          <div className="text-sm text-gray-600">This Month</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Event */}
          {nextEvent && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Next Event</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{nextEvent.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {new Date(nextEvent.start_time).toLocaleDateString()}</p>
                      <p>⏰ {new Date(nextEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p>📍 {nextEvent.location}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {nextEvent.event_type}
                  </Badge>
                </div>
                {nextEvent.description && (
                  <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {nextEvent.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills Progress - Age-appropriate detail */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-powlax-blue" />
                <span>{ageContent.skillsTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ageContent.gamification.simpleProgress ? (
                // Youth: Simple visual progress
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(playerStats.skill_progress).slice(0, 4).map(([skill, progress]) => (
                    <div key={skill} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-2">
                        {progress >= 80 ? '🌟' : progress >= 60 ? '⭐' : '📈'}
                      </div>
                      <div className="capitalize font-medium text-gray-900">{skill}</div>
                      <div className="text-sm text-gray-600">{progress}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                // Older: Detailed progress bars
                <div className="space-y-4">
                  {Object.entries(playerStats.skill_progress).map(([skill, progress]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium text-gray-700">{skill}</span>
                        <span className="text-sm font-medium text-gray-900">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Goals */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>My Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {playerStats.goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4">
                <Play className="h-4 w-4 mr-2" />
                Continue Training
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Badges - Prominent for younger players */}
          {ageContent.gamification.emphasizeBadges && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Recent Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {playerStats.recent_badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(badge.earned_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" size="sm" className="w-full">
                  View All Badges ({playerStats.badges_earned})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Skills Academy Quick Access */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Continue Learning</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Shooting Fundamentals</h4>
                <p className="text-sm text-gray-600 mb-2">Module 3 of 5</p>
                <Progress value={60} className="h-1.5 mb-3" />
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-600 mb-1">Defense Positioning</h4>
                <p className="text-sm text-gray-500 mb-2">Not started</p>
                <Button size="sm" variant="outline" className="w-full">
                  Start Course
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Connection - For middle/teen groups */}
          {ageGroup !== 'youth' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-powlax-orange" />
                  <span>Team Ranking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium">🥇 Top Scorer</span>
                    <span className="text-sm text-gray-600">Sarah W.</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">🎯 Most Accurate</span>
                    <span className="text-sm text-gray-600">You!</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium">🔥 Practice Streak</span>
                    <span className="text-sm text-gray-600">Mike J.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}