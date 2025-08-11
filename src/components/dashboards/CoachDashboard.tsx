'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from './StatCard'
import { ActionCard } from './ActionCard'
import { ProgressCard } from './ProgressCard'
import { ScheduleCard } from './ScheduleCard'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Plus,
  ClipboardList,
  Award,
  Activity,
  Clock,
  Target,
  Megaphone,
  BookOpen,
  Star,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface CoachDashboardProps {
  user: any
}

export function CoachDashboard({ user }: CoachDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPlayers: 0,
    primaryTeam: '',
    totalTeams: 0,
    attendance: 0
  })

  // Patrick's ID for querying his coaching assignments
  const patrickId = '523f2768-6404-439c-a429-f9eb6736aa17'

  // Fetch real data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [user])

  async function fetchDashboardData() {
    try {
      // Fetch Patrick's coaching assignments
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          team:teams!inner (
            id,
            name,
            age_band,
            club:clubs (
              name
            ),
            members:team_members (
              id,
              role,
              user:users (
                id,
                display_name,
                first_name,
                last_name,
                age_group
              )
            )
          )
        `)
        .eq('user_id', patrickId)
        .in('role', ['head_coach', 'assistant_coach'])

      // Calculate stats
      let totalPlayers = 0
      let primaryTeam = ''
      
      teamMemberships?.forEach(membership => {
        const players = membership.team.members?.filter((m: any) => m.role === 'player') || []
        totalPlayers += players.length
        if (membership.role === 'head_coach' && !primaryTeam) {
          primaryTeam = membership.team.name
        }
      })

      if (!primaryTeam && teamMemberships?.length > 0) {
        primaryTeam = teamMemberships[0].team.name
      }

      setStats({
        totalPlayers,
        primaryTeam,
        totalTeams: teamMemberships?.length || 0,
        attendance: Math.floor(Math.random() * 20) + 80 // Mock: Attendance tracking
      })

      setDashboardData({ teamMemberships })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  // Real data combined with mock data
  const mockData = {
    team: stats.primaryTeam || "Your Teams",
    activePlayers: stats.totalPlayers,
    attendance: stats.attendance,
    recentActivity: Math.floor(Math.random() * 30) + 15, // Mock: Activity tracking
    todaysPractice: {
      title: "Mock: Today's Practice - Skill Development",
      time: "3:30 PM",
      location: "Field A",
      status: "scheduled"
    },
    topPerformer: {
      name: "Mock: Top Player",
      streak: 12,
      points: 850
    },
    favoriteDrills: [
      "Mock: Patrick's Favorite - Ground Ball Scramble",
      "Mock: Patrick's Favorite - 2v1 Fast Break",
      "Mock: Patrick's Favorite - Wall Ball Circuit",
      "Mock: Patrick's Favorite - Dodging Series"
    ],
    playerProgress: [
      { label: "Mock: Attendance Rate", value: stats.attendance, maxValue: 100, color: 'green' as const },
      { label: "Mock: Skill Development", value: 72, maxValue: 100, color: 'blue' as const },
      { label: "Mock: Engagement", value: 90, maxValue: 100, color: 'orange' as const }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: "Mock: Today's Practice - Skill Development",
        date: 'Today',
        time: '3:30 PM',
        location: 'Field A',
        type: 'practice' as const,
        status: 'today' as const,
        href: '/teams/practices/today'
      },
      {
        id: '2',
        title: 'Mock: Game vs Thunder',
        date: 'Saturday',
        time: '2:00 PM',
        location: 'Home Field',
        type: 'game' as const,
        status: 'upcoming' as const,
        href: '/teams/games/2'
      },
      {
        id: '3',
        title: 'Mock: Parent Meeting',
        date: 'Next Tuesday',
        time: '6:00 PM',
        location: 'Clubhouse',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/teams/events/3'
      }
    ],
    needsAttention: [
      { name: "Mock: Player A", issue: "Mock: Missed 3 practices", color: "red" },
      { name: "Mock: Player B", issue: "Mock: Behind on skills", color: "yellow" },
      { name: "Mock: Player C", issue: "Mock: Equipment check", color: "blue" }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Coach {user?.last_name || user?.username || 'Smith'}!
        </h1>
        <p className="text-gray-600">Coach Dashboard - {mockData.team}</p>
      </div>

      {/* Today's Practice Banner */}
      {mockData.todaysPractice.status === 'scheduled' && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {mockData.todaysPractice.title}
                  </h3>
                  <p className="text-blue-700">
                    {mockData.todaysPractice.time} at {mockData.todaysPractice.location}
                  </p>
                  <Badge variant="outline" className="mt-1 bg-gray-100 text-gray-600 text-xs">
                    Mock: Practice scheduler placeholder
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit Plan
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/teams/practices/today">View Practice</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Overview */}
      {stats.totalTeams > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Your Coaching Assignments
            </CardTitle>
            <CardDescription>
              Teams you coach at {dashboardData?.teamMemberships?.[0]?.team?.club?.name || "Your Club OS"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.teamMemberships?.map((membership: any, index: number) => (
                <div key={membership.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{membership.team.name}</h4>
                    <Badge variant={membership.role === 'head_coach' ? 'default' : 'secondary'}>
                      {membership.role === 'head_coach' ? 'Head Coach' : 'Assistant Coach'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600">Age Band: {membership.team.age_band}</p>
                    <p className="text-gray-600">
                      Players: {membership.team.members?.filter((m: any) => m.role === 'player').length || 0}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 w-full" asChild>
                    <Link href={`/teams/${membership.team.id}`}>Manage Team</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Players"
          value={mockData.activePlayers}
          subtitle="Team roster"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Attendance"
          value={`${mockData.attendance}%`}
          subtitle="This month"
          icon={Activity}
          color="green"
          trend={{ value: 5, label: "vs last month" }}
        />
        <StatCard
          title="Recent Activity"
          value={mockData.recentActivity}
          subtitle="Player actions today"
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Teams"
          value={stats.totalTeams}
          subtitle="Coaching assignments"
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Team Overview */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressCard
            title="Team Performance"
            description="Overall team progress and development"
            items={mockData.playerProgress}
            icon={TrendingUp}
            showBadges={true}
          />

          {/* Favorites & Mock Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Patrick&apos;s Favorites
                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs ml-2">
                  Mock
                </Badge>
              </CardTitle>
              <CardDescription>
                Mock: Your favorite drills and strategies placeholder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock Favorites */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Favorite Drills</h4>
                  {mockData.favoriteDrills.map((drill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-500 italic">{drill}</span>
                      </div>
                      <Button size="sm" variant="ghost" disabled>
                        View
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Mock Attention Items */}
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-gray-900">Mock: Player Tracking</h4>
                  {mockData.needsAttention.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded opacity-75">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-gray-400`}></div>
                        <span className="text-sm font-medium text-gray-500 italic">{player.name}</span>
                        <span className="text-xs text-gray-500 italic">{player.issue}</span>
                      </div>
                      <Button size="sm" variant="ghost" disabled>
                        Contact
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <ActionCard
            title="Create Practice"
            description="Build a new practice plan"
            href="/practice-planner"
            icon={Plus}
            color="orange"
            buttonText="Create Plan"
          />
          
          <ActionCard
            title="Assign Workout"
            description="Send skills training to players"
            href="/skills-academy/assign"
            icon={Target}
            color="blue"
            buttonText="Assign Now"
          />

          <ActionCard
            title="Mock: Team Message"
            description="Communication feature placeholder"
            href="/teams/messaging"
            icon={Megaphone}
            color="purple"
            buttonText="Send Message"
          />

          <ActionCard
            title="View Strategies"
            description="Browse strategy library"
            href="/strategies"
            icon={BookOpen}
            color="green"
            buttonText="Browse"
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule */}
        <ScheduleCard
          title="Upcoming Schedule"
          description="Team practices, games, and events"
          events={mockData.upcomingEvents}
          icon={Clock}
          maxEvents={4}
          showMoreHref="/teams/schedule"
        />

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              Quick Actions & Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg relative">
                <div className="text-lg font-semibold text-blue-900">15</div>
                <p className="text-xs text-blue-700">Mock: Practices This Season</p>
                <Badge variant="outline" className="absolute top-1 right-1 bg-gray-100 text-gray-600 text-xs">
                  Mock
                </Badge>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg relative">
                <div className="text-lg font-semibold text-green-900">8-2</div>
                <p className="text-xs text-green-700">Mock: Win-Loss Record</p>
                <Badge variant="outline" className="absolute top-1 right-1 bg-gray-100 text-gray-600 text-xs">
                  Mock
                </Badge>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg relative">
                <div className="text-lg font-semibold text-orange-900">24</div>
                <p className="text-xs text-orange-700">Mock: Skills Completed</p>
                <Badge variant="outline" className="absolute top-1 right-1 bg-gray-100 text-gray-600 text-xs">
                  Mock
                </Badge>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg relative">
                <div className="text-lg font-semibold text-purple-900">92%</div>
                <p className="text-xs text-purple-700">Mock: Parent Satisfaction</p>
                <Badge variant="outline" className="absolute top-1 right-1 bg-gray-100 text-gray-600 text-xs">
                  Mock
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <Button size="sm" variant="outline" className="w-full">
                <Link href="/teams/roster" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Roster
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Link href="/teams/reports" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}