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
  Building, 
  Users, 
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Trophy,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface DirectorDashboardProps {
  user: any
}

export function DirectorDashboard({ user }: DirectorDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeTeams: 0,
    totalCoaches: 0
  })

  // Fetch real data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [user])

  async function fetchDashboardData() {
    try {
      // Fetch club data for "Your Club OS"
      const { data: club } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac')
        .single()

      // Fetch teams from Your Club OS
      const { data: teams } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members!inner (
            id,
            role,
            user:users!inner (
              id,
              display_name,
              first_name,
              last_name
            )
          )
        `)
        .eq('club_id', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac')

      // Calculate stats
      let totalPlayers = 0
      let totalCoaches = 0
      
      teams?.forEach(team => {
        team.members?.forEach((member: any) => {
          if (member.role === 'player') totalPlayers++
          if (member.role === 'head_coach' || member.role === 'assistant_coach') totalCoaches++
        })
      })

      setStats({
        totalPlayers,
        activeTeams: teams?.length || 0,
        totalCoaches
      })

      setDashboardData({ club, teams })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  // Real data combined with mock data
  const mockData = {
    club: dashboardData?.club?.name || "Your Club OS",
    totalPlayers: stats.totalPlayers,
    activeTeams: stats.activeTeams,
    engagementRate: 78, // Mock: Engagement tracking placeholder
    facilityMetrics: [
      { label: "Mock: Facility Usage", value: 85, maxValue: 100, color: 'green' as const },
      { label: "Mock: Equipment Status", value: 92, maxValue: 100, color: 'blue' as const },
      { label: "Mock: Program Utilization", value: 78, maxValue: 100, color: 'orange' as const }
    ],
    teamPerformance: dashboardData?.teams?.map((team: any) => {
      const coaches = team.members?.filter((m: any) => m.role === 'head_coach' || m.role === 'assistant_coach') || []
      const players = team.members?.filter((m: any) => m.role === 'player') || []
      return {
        id: team.id,
        name: team.name,
        coaches: coaches.map((c: any) => c.user.display_name || c.user.first_name).join(", ") || "TBD",
        players: players.length,
        engagement: 85, // MOCK: Engagement tracking
        status: players.length > 15 ? "excellent" : players.length > 10 ? "good" : "needs-attention"
      }
    }) || [],
    upcomingEvents: [
      {
        id: '1',
        title: 'Mock: Board Meeting',
        date: 'Tomorrow',
        time: '7:00 PM',
        location: 'Clubhouse',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/club/meetings/1'
      },
      {
        id: '2',
        title: 'Mock: Coach Training Workshop',
        date: 'This Weekend',
        time: '9:00 AM',
        location: 'Training Center',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/club/training/2'
      },
      {
        id: '3',
        title: 'Mock: Season Championships',
        date: 'Next Month',
        time: 'All Day',
        location: 'Tournament Fields',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/club/tournaments/3'
      }
    ],
    systemHealth: [
      { metric: "Mock: Platform Usage", value: 94, status: "excellent" },
      { metric: "Mock: Skills Academy Adoption", value: 67, status: "good" },
      { metric: "Mock: Practice Planner Usage", value: 82, status: "excellent" },
      { metric: "Mock: Parent Engagement", value: 76, status: "good" }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'needs-attention': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Director {user?.last_name || user?.username || 'Johnson'}!
        </h1>
        <p className="text-gray-600">Club Director Dashboard - {mockData.club}</p>
      </div>

      {/* Key Metrics Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{mockData.totalPlayers}</div>
              <p className="text-sm text-blue-700">Total Players</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{mockData.activeTeams}</div>
              <p className="text-sm text-purple-700">Active Teams</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{mockData.monthlyRevenue}</div>
              <p className="text-sm text-green-700">Monthly Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{mockData.engagementRate}%</div>
              <p className="text-sm text-orange-700">Engagement Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Players"
          value={mockData.totalPlayers}
          subtitle="Across all teams"
          icon={Users}
          color="blue"
          trend={{ value: 8, label: "vs last month" }}
        />
        <StatCard
          title="Coaches"
          value={stats.totalCoaches}
          subtitle="Active coaches"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Teams"
          value={mockData.activeTeams}
          subtitle="Active programs"
          icon={Trophy}
          color="orange"
        />
        <StatCard
          title="Engagement"
          value={`${mockData.engagementRate}%`}
          subtitle="Platform usage"
          icon={Activity}
          color="purple"
          trend={{ value: 5, label: "vs last quarter" }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Facility Overview */}
        <div className="lg:col-span-2">
          <ProgressCard
            title="Facility & Equipment"
            description="Mock: Facility management metrics placeholder"
            items={mockData.facilityMetrics}
            icon={BarChart3}
            showBadges={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <ActionCard
            title="Club Analytics"
            description="View detailed performance reports"
            href="/club/analytics"
            icon={BarChart3}
            color="blue"
            buttonText="View Reports"
          />
          
          <ActionCard
            title="Team Management"
            description="Manage teams and coaches"
            href="/club/teams"
            icon={Users}
            color="orange"
            buttonText="Manage Teams"
          />

          <ActionCard
            title="Mock: Facility Management"
            description="Field scheduling and equipment tracking"
            href="/club/facilities"
            icon={Building}
            color="green"
            buttonText="Manage Facilities"
          />
        </div>
      </div>

      {/* Team Performance Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Team Performance Overview
          </CardTitle>
          <CardDescription>
            Performance metrics for all club teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.teamPerformance.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-sm">{team.name}</h4>
                    <Badge 
                      variant={team.status === 'excellent' ? 'default' : 'secondary'}
                      className={team.status === 'excellent' ? 'bg-green-100 text-green-800' : team.status === 'good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {team.status}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                      Mock: Engagement
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{team.coaches} • {team.players} players</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{team.engagement}%</div>
                  <p className="text-xs text-gray-600">Mock: Engagement</p>
                </div>
                <div className="ml-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/teams/${team.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              System Health
            </CardTitle>
            <CardDescription>
              Platform usage and feature adoption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.systemHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.status === 'excellent' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : item.status === 'good' ? (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                  <span className="text-sm">{item.metric}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${getStatusColor(item.status)}`}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Button size="sm" variant="outline" className="w-full">
                <Link href="/club/system-health" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  View System Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <ScheduleCard
          title="Upcoming Events"
          description="Club meetings, training, and tournaments"
          events={mockData.upcomingEvents}
          icon={Clock}
          maxEvents={4}
          showMoreHref="/club/calendar"
        />
      </div>

      {/* Action Items */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Action Items & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-l-orange-500">
              <div>
                <h4 className="font-medium text-sm text-orange-900">
                  Monthly Financial Report Due
                </h4>
                <p className="text-xs text-orange-700">Submit to board by Friday</p>
              </div>
              <Button size="sm" variant="outline">
                Generate Report
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
              <div>
                <h4 className="font-medium text-sm text-blue-900">
                  New Coach Applications
                </h4>
                <p className="text-xs text-blue-700">3 applications pending review</p>
              </div>
              <Button size="sm" variant="outline">
                Review Applications
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500">
              <div>
                <h4 className="font-medium text-sm text-green-900">
                  Equipment Inventory
                </h4>
                <p className="text-xs text-green-700">Quarterly inventory complete</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}