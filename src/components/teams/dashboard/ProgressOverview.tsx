'use client'

import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  Award,
  BarChart3,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Team, UserTeamRole } from '@/types/teams'
import type { TeamStats } from '@/hooks/useTeamDashboard'

interface ProgressOverviewProps {
  team: Team
  members: UserTeamRole[]
  stats: TeamStats | null
}

export function ProgressOverview({ team, members, stats }: ProgressOverviewProps) {
  const players = members.filter(m => m.role === 'player')
  
  // Mock detailed stats - would come from database aggregation
  const detailedStats = {
    skills_mastery: {
      passing: 78,
      shooting: 65,
      defense: 82,
      field_vision: 71
    },
    team_chemistry: 85,
    practice_consistency: stats?.attendance_rate || 85,
    recent_improvement: 12, // percentage increase this month
    top_performers: [
      { name: 'Mike Johnson', skill: 'Passing', progress: 95 },
      { name: 'Sarah Wilson', skill: 'Defense', progress: 88 },
      { name: 'Tom Davis', skill: 'Shooting', progress: 82 }
    ],
    upcoming_milestones: [
      { title: '100 Team Practices', current: 89, target: 100 },
      { title: 'Advanced Offense Mastery', current: 67, target: 80 },
      { title: 'Perfect Attendance Month', current: 85, target: 95 }
    ]
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatStatChange = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value}%`
  }

  return (
    <div className="space-y-6">
      {/* Team Progress Overview */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
            <span>Team Progress</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {detailedStats.recent_improvement > 0 ? '↗' : '↘'} 
              {formatStatChange(detailedStats.recent_improvement)} this month
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Skills Completed</span>
                <span className="font-medium">{stats?.skills_completed || 0}</span>
              </div>
              <Progress value={((stats?.skills_completed || 0) / 100) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Team Chemistry</span>
                <span className="font-medium">{detailedStats.team_chemistry}%</span>
              </div>
              <Progress value={detailedStats.team_chemistry} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Practice Attendance</span>
                <span className="font-medium">{detailedStats.practice_consistency}%</span>
              </div>
              <Progress value={detailedStats.practice_consistency} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Team Level</span>
                <span className="font-medium">{stats?.team_level_progress || 0}%</span>
              </div>
              <Progress value={stats?.team_level_progress || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Breakdown */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-powlax-blue" />
            <span>Skills Mastery</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {Object.entries(detailedStats.skills_mastery).map(([skill, percentage]) => (
            <div key={skill} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-600">{skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{percentage}%</span>
                  <div className={`w-2 h-2 rounded-full ${getProgressColor(percentage)}`} />
                </div>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          ))}
          
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Trophy className="h-4 w-4 mr-2" />
            View Detailed Skills Report
          </Button>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {detailedStats.top_performers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  'bg-orange-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <p className="text-sm text-gray-600">{performer.skill}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{performer.progress}%</div>
                <div className="text-xs text-gray-500">mastery</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Upcoming Goals</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {detailedStats.upcoming_milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                <span className="text-sm text-gray-600">
                  {milestone.current}/{milestone.target}
                </span>
              </div>
              <Progress 
                value={(milestone.current / milestone.target) * 100} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {Math.ceil(((milestone.target - milestone.current) / milestone.target) * 100)}% remaining
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {stats?.recent_achievements && stats.recent_achievements.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-powlax-orange" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {stats.recent_achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg bg-orange-50/30">
                <div className="w-10 h-10 bg-powlax-orange rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-600">
                    {achievement.user_name} • {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {achievement.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-powlax-blue" />
            <span className="text-sm font-medium text-gray-600">Total Practices</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.total_practices || 0}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Active Players</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{players.length}</div>
        </Card>
      </div>
    </div>
  )
}