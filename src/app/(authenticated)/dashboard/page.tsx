'use client'

import { useEffect, useState } from 'react'
import { useAuth, useRequireAuth } from '@/contexts/JWTAuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Trophy, TrendingUp, AlertCircle, Shield } from 'lucide-react'
import Link from 'next/link'

type UserRole = 'admin' | 'coach' | 'player' | 'parent' | 'director'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { loading: authCheckLoading } = useRequireAuth()
  const hasActiveSubscription = true // TODO: Implement subscription check
  const activeSubscriptions: any[] = []
  const [userRole, setUserRole] = useState<UserRole>('coach')

  useEffect(() => {
    if (user) {
      // Determine role from WordPress roles
      const roles = user.roles || []
      if (roles.includes('administrator')) {
        setUserRole('admin')
      } else if (roles.includes('club_director')) {
        setUserRole('director')
      } else if (roles.includes('team_coach')) {
        setUserRole('coach')
      } else if (roles.includes('player')) {
        setUserRole('player')
      } else if (roles.includes('parent')) {
        setUserRole('parent')
      } else {
        setUserRole('coach') // Default
      }
    }
  }, [user])

  if (authLoading || authCheckLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useRequireAuth
  }

  // Show subscription warning if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Subscription Required
            </CardTitle>
            <CardDescription>
              You need an active subscription to access POWLAX features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Your subscription has expired or you don't have an active plan. 
              Please visit POWLAX.com to renew or subscribe.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <a href="https://powlax.com/pricing" target="_blank" rel="noopener noreferrer">
                  View Plans
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://powlax.com/my-account" target="_blank" rel="noopener noreferrer">
                  Manage Subscription
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard user={user} subscriptions={activeSubscriptions} />
    case 'coach':
      return <CoachDashboard user={user} subscriptions={activeSubscriptions} />
    case 'player':
      return <PlayerDashboard user={user} />
    case 'parent':
      return <ParentDashboard user={user} />
    case 'director':
      return <DirectorDashboard user={user} subscriptions={activeSubscriptions} />
    default:
      return <CoachDashboard user={user} subscriptions={activeSubscriptions} />
  }
}

function CoachDashboard({ user, subscriptions }: { user: any; subscriptions: any[] }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.first_name || user.username}!</h1>
        <p className="text-gray-600">Coach Dashboard</p>
      </div>
      
      {/* Subscription Status */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {subscriptions.length > 0 ? (
                <>
                  <p className="font-medium">{subscriptions[0].membership_name}</p>
                  <p className="text-sm text-gray-600">
                    {subscriptions[0].expires_at 
                      ? `Expires ${new Date(subscriptions[0].expires_at).toLocaleDateString()}`
                      : 'Lifetime access'
                    }
                  </p>
                </>
              ) : (
                <p className="text-gray-600">No active subscription</p>
              )}
            </div>
            <Badge variant={subscriptions.length > 0 ? "default" : "secondary"}>
              {subscriptions.length > 0 ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/teams/1/practice-plans">
                Create Practice Plan
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/teams/1/roster">
                Manage Roster
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/academy">
                Skills Academy
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No recent activity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Players</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Practice Plans</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drills Used</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PlayerDashboard({ user }: { user: any }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.first_name || user.username}!</h1>
        <p className="text-gray-600">Player Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Skills Academy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/academy">
                Start Training
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Track your skills development here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ParentDashboard({ user }: { user: any }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.first_name || user.username}!</h1>
        <p className="text-gray-600">Parent Dashboard</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Children's Progress</CardTitle>
          <CardDescription>
            Monitor your children's lacrosse development and team activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Connect with your child's coach to view their progress</p>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboard({ user, subscriptions }: { user: any; subscriptions: any[] }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.first_name || user.username}!</h1>
        <p className="text-gray-600">System Administrator Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/role-management">
                Manage User Roles
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/organizations">
                Manage Organizations
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/analytics">
                Platform Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Organizations</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Subscriptions</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin/content">
                Manage Content
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/billing">
                Billing Overview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DirectorDashboard({ user, subscriptions }: { user: any; subscriptions: any[] }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.first_name || user.username}!</h1>
        <p className="text-gray-600">Club Director Dashboard</p>
      </div>
      
      {/* Subscription Status */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Club Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {subscriptions.length > 0 ? (
                <>
                  <p className="font-medium">{subscriptions[0].membership_name}</p>
                  <p className="text-sm text-gray-600">
                    {subscriptions[0].expires_at 
                      ? `Expires ${new Date(subscriptions[0].expires_at).toLocaleDateString()}`
                      : 'Lifetime access'
                    }
                  </p>
                </>
              ) : (
                <p className="text-gray-600">No active subscription</p>
              )}
            </div>
            <Badge variant={subscriptions.length > 0 ? "default" : "secondary"}>
              {subscriptions.length > 0 ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Club Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Practice Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Club Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/club/teams">
                Manage Teams
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/club/coaches">
                Manage Coaches
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/role-management">
                Manage Roles
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Club Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/club/analytics">
                View Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/club/reports">
                Generate Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}