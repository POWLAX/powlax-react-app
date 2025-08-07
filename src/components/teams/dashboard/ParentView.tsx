'use client'

import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Camera,
  Bell,
  Users,
  Trophy,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Team, UserTeamRole } from '@/types/teams'
import type { TeamEvent, ActivityItem } from '@/hooks/useTeamDashboard'

interface ParentViewProps {
  team: Team
  playerMembers: UserTeamRole[] // Players that are children of this parent
  upcomingEvents: TeamEvent[]
  recentActivity: ActivityItem[]
}

export function ParentView({ team, playerMembers, upcomingEvents, recentActivity }: ParentViewProps) {
  const nextEvent = upcomingEvents[0]
  
  // Mock data for parent-specific information
  const parentData = {
    child: {
      name: 'Alex Johnson',
      jersey_number: '12',
      position: 'Midfield',
      attendance_rate: 95,
      recent_progress: [
        { skill: 'Passing', improvement: '+15%', date: '2025-01-05' },
        { skill: 'Team Play', improvement: '+8%', date: '2025-01-03' },
        { skill: 'Fitness', improvement: '+12%', date: '2025-01-01' }
      ],
      recent_badges: [
        { name: 'Team Player', date: '2025-01-05', icon: '🤝' },
        { name: 'Perfect Attendance', date: '2025-01-02', icon: '⭐' }
      ],
      upcoming_skills_goals: [
        { name: 'Shooting Accuracy', progress: 68, target: 80 },
        { name: 'Field Vision', progress: 45, target: 70 }
      ]
    },
    volunteer_opportunities: [
      { title: 'Game Day Photography', date: '2025-01-10', spots: 2, filled: 0 },
      { title: 'Equipment Manager', date: '2025-01-12', spots: 1, filled: 0 },
      { title: 'Snack Coordinator', date: '2025-01-15', spots: 3, filled: 2 }
    ],
    important_announcements: [
      {
        title: 'Weather Alert - Practice Cancelled',
        content: 'Due to severe weather, today\'s practice has been cancelled. Stay safe!',
        priority: 'high',
        date: '2025-01-06T14:30:00.000Z'
      },
      {
        title: 'Tournament Registration Due',
        content: 'Please submit tournament forms by Friday. Late submissions may not be accepted.',
        priority: 'medium',
        date: '2025-01-05T09:00:00.000Z'
      }
    ],
    coach_contact: {
      name: 'Coach Johnson',
      email: 'coach@team.com',
      phone: '(555) 123-4567',
      available_hours: 'Mon-Fri 6-8 PM'
    },
    season_calendar: [
      { date: '2025-01-10', event: 'Practice', time: '4:00 PM' },
      { date: '2025-01-12', event: 'Game vs Eagles', time: '2:00 PM' },
      { date: '2025-01-15', event: 'Team Meeting', time: '7:00 PM' }
    ]
  }

  const getTimeUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const diffHours = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 24) return `In ${diffHours} hours`
    const diffDays = Math.ceil(diffHours / 24)
    return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Parent Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {team.name} Parent Portal
              </h1>
              <p className="text-blue-100">
                Stay connected with {parentData.child.name}&apos;s lacrosse journey
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="text-sm text-blue-100">Parent Hub</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Alerts */}
      {parentData.important_announcements.length > 0 && (
        <div className="space-y-3">
          {parentData.important_announcements.map((announcement, index) => (
            <Alert key={index} className={
              announcement.priority === 'high' 
                ? 'border-red-200 bg-red-50' 
                : 'border-yellow-200 bg-yellow-50'
            }>
              <AlertCircle className={`h-4 w-4 ${
                announcement.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{announcement.title}</div>
                <AlertDescription className="text-gray-700 mt-1">
                  {announcement.content}
                </AlertDescription>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.date).toLocaleString()}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Event - Parent-focused info */}
          {nextEvent && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Next Event</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {getTimeUntilEvent(nextEvent.start_time)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{nextEvent.title}</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(nextEvent.start_time).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(nextEvent.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(nextEvent.end_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{nextEvent.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Team {team.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Action Items */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📋 Parent Checklist</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Equipment packed and ready</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Water bottle filled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Arrive 15 minutes early</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Child's Progress Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{parentData.child.name}&apos;s Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center bg-green-50 border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {parentData.child.attendance_rate}%
                      </div>
                      <div className="text-sm text-gray-600">Attendance Rate</div>
                    </Card>
                    <Card className="p-4 text-center bg-blue-50 border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {parentData.child.recent_badges.length}
                      </div>
                      <div className="text-sm text-gray-600">New Badges</div>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recent Improvements</h4>
                    {parentData.child.recent_progress.map((progress, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{progress.skill}</span>
                        <div className="text-right">
                          <span className="text-green-600 font-medium">{progress.improvement}</span>
                          <div className="text-xs text-gray-500">{progress.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    {parentData.child.upcoming_skills_goals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{goal.name}</span>
                          <span className="text-sm text-gray-600">{goal.progress}% of {goal.target}%</span>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-3 mt-4">
                  {parentData.child.recent_badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900">{badge.name}</p>
                        <p className="text-sm text-gray-600">
                          Earned on {new Date(badge.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Volunteer Opportunities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Ways to Help</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {parentData.volunteer_opportunities.length} opportunities
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parentData.volunteer_opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(opportunity.date).toLocaleDateString()} • 
                      {opportunity.spots - opportunity.filled} spot{opportunity.spots - opportunity.filled !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Sign Up
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Coach Contact */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>Contact Coach</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    C
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{parentData.coach_contact.name}</p>
                  <p className="text-sm text-gray-600">Head Coach</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{parentData.coach_contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{parentData.coach_contact.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Available {parentData.coach_contact.available_hours}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Calendar */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parentData.season_calendar.map((event, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{event.event}</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                View Full Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Team Photos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-pink-600" />
                <span>Recent Photos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View All Photos
              </Button>
            </CardContent>
          </Card>

          {/* Communication Center */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <span>Messages</span>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  2 new
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-sm">From Coach Johnson</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Great practice today! Alex showed excellent teamwork...
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                View All Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}