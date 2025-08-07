'use client'

import { 
  Calendar, 
  Trophy, 
  Megaphone, 
  Users, 
  Target,
  Camera,
  Clock,
  MessageSquare,
  ChevronRight,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import type { Team } from '@/types/teams'
import type { ActivityItem } from '@/hooks/useTeamDashboard'

interface RecentActivityProps {
  activity: ActivityItem[]
  team: Team
  canManage: boolean
}

export function RecentActivity({ activity, team, canManage }: RecentActivityProps) {
  const [filter, setFilter] = useState('all')

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'practice_created':
        return Calendar
      case 'badge_earned':
        return Trophy
      case 'announcement':
        return Megaphone
      case 'attendance_taken':
        return Users
      case 'skill_completed':
        return Target
      case 'photo_shared':
        return Camera
      case 'message_posted':
        return MessageSquare
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'practice_created':
        return 'bg-blue-100 text-blue-700'
      case 'badge_earned':
        return 'bg-yellow-100 text-yellow-700'
      case 'announcement':
        return 'bg-orange-100 text-orange-700'
      case 'attendance_taken':
        return 'bg-green-100 text-green-700'
      case 'skill_completed':
        return 'bg-purple-100 text-purple-700'
      case 'photo_shared':
        return 'bg-pink-100 text-pink-700'
      case 'message_posted':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const filteredActivity = filter === 'all' 
    ? activity 
    : activity.filter(item => item.activity_type === filter)

  // Mock additional activity items for a richer feed
  const mockAdditionalActivity: ActivityItem[] = [
    {
      id: '4',
      team_id: team.id,
      user_id: 'user4',
      user_name: 'Emma Brown',
      activity_type: 'skill_completed',
      activity_data: {
        title: 'Completed Shooting Fundamentals',
        description: 'Advanced to next level',
        icon: 'target'
      },
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      team_id: team.id,
      user_id: 'user5',
      user_name: 'Coach Smith',
      activity_type: 'attendance_taken',
      activity_data: {
        title: 'Recorded practice attendance',
        description: '18 of 20 players present',
        icon: 'users'
      },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      team_id: team.id,
      user_id: 'user6',
      user_name: 'Parent Association',
      activity_type: 'photo_shared',
      activity_data: {
        title: 'Shared 8 practice photos',
        description: 'Team scrimmage highlights',
        icon: 'camera'
      },
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const allActivity = [...activity, ...mockAdditionalActivity].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const finalActivity = filter === 'all' 
    ? allActivity 
    : allActivity.filter(item => item.activity_type === filter)

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-powlax-blue" />
            <span>Recent Activity</span>
            <Badge variant="outline">{finalActivity.length}</Badge>
          </CardTitle>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="practice_created">Practices</SelectItem>
              <SelectItem value="badge_earned">Badges</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="skill_completed">Skills</SelectItem>
              <SelectItem value="attendance_taken">Attendance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {finalActivity.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600 mb-4">Activity will appear here as your team grows.</p>
            {canManage && (
              <Button size="sm">
                <Megaphone className="h-4 w-4 mr-2" />
                Post Announcement
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {finalActivity.slice(0, 8).map((item) => {
              const Icon = getActivityIcon(item.activity_type)
              const colorClass = getActivityColor(item.activity_type)
              
              return (
                <div 
                  key={item.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  {/* Activity Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          <span className="font-semibold">{item.user_name}</span>
                          {' '}
                          {item.activity_data.title.toLowerCase()}
                        </p>
                        
                        {item.activity_data.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {item.activity_data.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(item.created_at)}
                          </span>
                          
                          {/* Activity type badge */}
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.activity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* User Avatar */}
                      <div className="ml-3 flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-powlax-blue text-white">
                            {item.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Load More Button */}
            {allActivity.length > 8 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity ({allActivity.length})
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allActivity.filter(a => a.activity_type === 'practice_created').length}
              </div>
              <div className="text-xs text-gray-600">Practices This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allActivity.filter(a => a.activity_type === 'badge_earned').length}
              </div>
              <div className="text-xs text-gray-600">Badges Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allActivity.filter(a => a.activity_type === 'announcement').length}
              </div>
              <div className="text-xs text-gray-600">Announcements</div>
            </div>
          </div>
        </div>
        
        {/* Team Engagement Score */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Team Engagement</h4>
              <p className="text-sm text-gray-600">Activity level this week</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-xs text-green-600">↗ +8% from last week</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}