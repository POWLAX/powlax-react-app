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
  Server, 
  Users, 
  Database, 
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileText,
  BarChart3,
  UserCheck,
  Zap,
  HardDrive,
  Cpu,
  Monitor,
  Clock,
  Key,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AdminDashboardProps {
  user: any
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  // Use only mock data for now - no database queries
  const [stats] = useState({
    totalUsers: 42,     // Mock: Total users
    totalDrills: 167,   // From Skills Academy
    totalTeams: 8,      // Mock: Team count
    totalWorkouts: 166, // From Skills Academy
    activeChildren: 2   // Mock: Children count for Patrick
  })

  // Mock children data for Patrick (admin who is also a parent)
  const [children] = useState([
    {
      id: '1',
      display_name: 'Alex Chapla (MOCK)',
      first_name: 'Alex',
      age_group: 'u12',
      player_position: 'Attack',
      wallet: [{ balance: 850 }],
      badges: [{ name: 'Wall Ball Warrior' }, { name: 'Practice Star' }],
      progress: [
        { status: 'completed', workout_id: 1 },
        { status: 'completed', workout_id: 2 },
        { status: 'completed', workout_id: 3 }
      ]
    },
    {
      id: '2',
      display_name: 'Sam Chapla (MOCK)',
      first_name: 'Sam',
      age_group: 'u10',
      player_position: 'Midfield',
      wallet: [{ balance: 720 }],
      badges: [{ name: 'First Goal' }],
      progress: [
        { status: 'completed', workout_id: 1 },
        { status: 'completed', workout_id: 2 }
      ]
    }
  ])

  // Mock dashboard data
  const dashboardData = {
    recentUsers: [
      { email: 'coach.smith@mock.com', created_at: '2025-01-12T10:00:00Z' },
      { email: 'player.jones@mock.com', created_at: '2025-01-12T09:30:00Z' },
      { email: 'parent.wilson@mock.com', created_at: '2025-01-12T09:00:00Z' }
    ]
  }

  const loading = false // Never show loading spinner

  // Use real data when available, otherwise fall back to mock
  const mockData = {
    systemUptime: "99.9%",
    newUsersToday: dashboardData?.recentUsers?.filter((u: any) => {
      const created = new Date(u.created_at)
      const today = new Date()
      return created.toDateString() === today.toDateString()
    }).length || 0,
    totalDrills: stats.totalDrills,
    activeSessions: Math.floor(Math.random() * 50) + 20, // Mock: Active session count
    systemMetrics: [
      { label: "Mock: System Uptime", value: 99.9, maxValue: 100, color: 'green' as const },
      { label: "Mock: Database Performance", value: 95, maxValue: 100, color: 'blue' as const },
      { label: "Mock: API Response Time", value: 87, maxValue: 100, color: 'orange' as const }
    ],
    recentActivity: [
      { user: "Mock: coach.smith@club.com", action: "Created practice plan", time: "5 min ago", status: "normal" },
      { user: "Mock: parent.johnson@email.com", action: "Registered child", time: "12 min ago", status: "normal" },
      { user: "Mock: admin.wilson@powlax.com", action: "Updated drill library", time: "1 hour ago", status: "admin" },
      { user: "Mock: director.davis@elite.com", action: "Generated financial report", time: "2 hours ago", status: "normal" }
    ],
    systemHealth: [
      { component: "Mock: Authentication Service", status: "healthy", uptime: "100%" },
      { component: "Mock: Database", status: "healthy", uptime: "99.9%" },
      { component: "Mock: File Storage", status: "warning", uptime: "98.5%" },
      { component: "Mock: Email Service", status: "healthy", uptime: "99.8%" }
    ],
    upcomingTasks: [
      {
        id: '1',
        title: 'Mock: System Backup',
        date: 'Tonight',
        time: '2:00 AM',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/admin/backups'
      },
      {
        id: '2',
        title: 'Mock: Security Audit',
        date: 'This Weekend',
        time: '9:00 AM',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/admin/security'
      },
      {
        id: '3',
        title: 'Mock: Performance Review',
        date: 'Next Week',
        time: '10:00 AM',
        type: 'event' as const,
        status: 'upcoming' as const,
        href: '/admin/performance'
      }
    ],
    contentStats: {
      drills: stats.totalDrills,
      strategies: 89, // Mock: Strategy count placeholder
      workouts: stats.totalWorkouts,
      users: stats.totalUsers
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
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
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user.display_name || user.first_name || 'Admin'}!</p>
        </div>

      {/* Children Overview (if Patrick has parent role) */}
      {children.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Your Children
            </CardTitle>
            <CardDescription>
              Quick overview of your children&apos;s progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <div key={child.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-sm mb-2">{child.display_name || child.first_name}</h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600">Age Group: {child.age_group?.replace('_', ' ')}</p>
                    <p className="text-gray-600">Position: {child.player_position || 'Not set'}</p>
                    <p className="text-gray-600">
                      Points: {child.wallet?.[0]?.balance || 0}
                    </p>
                    <p className="text-gray-600">
                      Badges: {child.badges?.length || 0}
                    </p>
                    <p className="text-gray-600">
                      Workouts: {child.progress?.filter((p: any) => p.status === 'completed').length || 0} completed
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 w-full" asChild>
                    <Link href={`/children/${child.id}/progress`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Banner */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Server className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  System Status: All Systems Operational
                </h3>
                <p className="text-green-700">
                  Uptime: {mockData.systemUptime} • {mockData.activeSessions} active sessions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Logs
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/system-status">System Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="System Uptime"
          value={mockData.systemUptime}
          subtitle="Last 30 days"
          icon={Server}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Platform wide"
          icon={Users}
          color="blue"
          trend={mockData.newUsersToday > 0 ? { value: mockData.newUsersToday, label: "new today" } : undefined}
        />
        <StatCard
          title="Total Drills"
          value={mockData.totalDrills}
          subtitle="In library"
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Your Children"
          value={stats.activeChildren}
          subtitle="Linked accounts"
          icon={UserPlus}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* System Performance */}
        <div className="lg:col-span-2">
          <ProgressCard
            title="System Performance"
            description="Key performance indicators"
            items={mockData.systemMetrics}
            icon={BarChart3}
            showBadges={true}
          />
        </div>

        {/* Quick Admin Actions */}
        <div className="space-y-4">
          <ActionCard
            title="Role Management"
            description="Manage user roles and permissions"
            href="/admin/role-management"
            icon={UserCheck}
            color="blue"
            buttonText="Manage Roles"
          />
          
          <ActionCard
            title="Content Library"
            description="Manage drills and strategies"
            href="/admin/content"
            icon={FileText}
            color="orange"
            buttonText="Manage Content"
          />

          <ActionCard
            title="System Settings"
            description="Configure platform settings"
            href="/admin/settings"
            icon={Settings}
            color="purple"
            buttonText="Settings"
          />
        </div>
      </div>

      {/* System Health Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            System Health
          </CardTitle>
          <CardDescription>
            Real-time status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.systemHealth.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <h4 className="font-medium text-sm">{component.component}</h4>
                    <p className="text-xs text-gray-600">Uptime: {component.uptime}</p>
                  </div>
                </div>
                <Badge 
                  variant={component.status === 'healthy' ? 'default' : 'secondary'}
                  className={
                    component.status === 'healthy' 
                      ? 'bg-green-100 text-green-800'
                      : component.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {component.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Content Statistics
          </CardTitle>
          <CardDescription>
            Platform content and user data overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{mockData.contentStats.drills}</div>
              <p className="text-sm text-blue-700">Drills</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{mockData.contentStats.strategies}</div>
              <p className="text-sm text-green-700">Strategies</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{mockData.contentStats.workouts}</div>
              <p className="text-sm text-orange-700">Workouts</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{mockData.contentStats.users}</div>
              <p className="text-sm text-purple-700">Total Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system and user activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{activity.user}</span>
                    {activity.status === 'admin' && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Button size="sm" variant="outline" className="w-full">
                <Link href="/admin/activity-log" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Full Activity Log
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Tasks */}
        <ScheduleCard
          title="Scheduled Tasks"
          description="Upcoming maintenance and system tasks"
          events={mockData.upcomingTasks}
          icon={Clock}
          maxEvents={4}
          showMoreHref="/admin/scheduled-tasks"
        />
      </div>

      {/* Critical Admin Tools */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-red-600" />
            Critical Admin Tools
          </CardTitle>
          <CardDescription>
            High-privilege administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/database" className="flex flex-col items-center gap-2">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">Database Admin</div>
                  <div className="text-xs text-gray-600">Manage database operations</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/security" className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">Security Center</div>
                  <div className="text-xs text-gray-600">Manage security settings</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/admin/performance" className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-orange-600" />
                <div className="text-center">
                  <div className="font-medium">Performance</div>
                  <div className="text-xs text-gray-600">System optimization</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}