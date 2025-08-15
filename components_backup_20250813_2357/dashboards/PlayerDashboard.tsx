'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from './StatCard'
import { ActionCard } from './ActionCard'
import { ProgressCard } from './ProgressCard'
import { ScheduleCard } from './ScheduleCard'
import { 
  Trophy, 
  Zap, 
  Target, 
  Calendar,
  Star,
  Play,
  Users,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Flame,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useTeams } from '@/hooks/useTeams'

interface PlayerDashboardProps {
  user: any
}

export function PlayerDashboard({ user }: PlayerDashboardProps) {
  // Use real data hooks instead of mock data
  const { playerStats, loading: statsLoading, error: statsError } = usePlayerStats(user?.id || null)
  const { teams, loading: teamsLoading } = useTeams()
  
  // Calculate streak from skills academy progress
  const calculateStreak = () => {
    if (!playerStats?.skillsProgress.recent_activity) return 0
    // Simple streak calculation - would need more sophisticated logic for real streaks
    return Math.min(playerStats.skillsProgress.recent_activity.length, 7)
  }
  
  // Get user's primary team
  const primaryTeam = teams.length > 0 ? teams[0] : null
  
  // Show loading state
  if (statsLoading || teamsLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show error state if data failed to load
  if (statsError && !playerStats) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load player data</h2>
          <p className="text-gray-600 mb-4">{statsError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }
  
  // Default values if no data available
  const totalPoints = playerStats?.totalPoints || 0
  const currentStreak = calculateStreak()
  const currentRank = playerStats?.currentRank?.title || 'Rookie'
  const badgesCount = playerStats?.badges.length || 0
  const workoutsCompleted = playerStats?.skillsProgress.total_workouts_completed || 0
  const teamName = primaryTeam?.name || 'No Team Assigned'
  
  // Skill progress from real data - simplified version
  const skillProgress = [
    { 
      label: "Workouts Completed", 
      value: Math.min(workoutsCompleted * 10, 100), // Rough calculation
      maxValue: 100, 
      color: 'orange' as const 
    },
    { 
      label: "Attack Tokens", 
      value: Math.min((playerStats?.pointsByType.attack_token || 0) / 10, 100), 
      maxValue: 100, 
      color: 'blue' as const 
    },
    { 
      label: "Defense Dollars", 
      value: Math.min((playerStats?.pointsByType.defense_dollar || 0) / 10, 100), 
      maxValue: 100, 
      color: 'green' as const 
    }
  ]
  
  // Recent badges from real data
  const recentBadges = (playerStats?.badges || []).slice(0, 2).map(badge => ({
    name: badge.badge_name,
    icon: '🏆' // Default icon - could be enhanced with badge-specific icons
  }))
  
  // Simple upcoming events (would need real calendar integration)
  const upcomingEvents = [
    {
      id: '1',
      title: 'Continue Training',
      date: 'Any Time',
      time: '',
      location: 'Skills Academy',
      type: 'workout' as const,
      status: 'upcoming' as const,
      href: '/skills-academy'
    }
  ]

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.display_name || 'Player'}!
        </h1>
        <p className="text-gray-600">Player Dashboard - {teamName}</p>
      </div>

      {/* Current Streak Banner */}
      <Card className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  {currentStreak > 0 ? `${currentStreak} Day Streak! 🔥` : 'Start Your Streak!'}
                </h3>
                <p className="text-orange-700">
                  {currentStreak > 0 ? 'Keep up the momentum!' : 'Complete a workout to start your streak'}
                </p>
              </div>
            </div>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/skills-academy">Train Now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Points"
          value={totalPoints}
          subtitle="All currencies"
          icon={Star}
          color="orange"
        />
        <StatCard
          title="Current Rank"
          value={currentRank}
          subtitle="Player ranking"
          icon={Trophy}
          color="blue"
        />
        <StatCard
          title="Badges Earned"
          value={badgesCount}
          subtitle="Achievements unlocked"
          icon={Shield}
          color="green"
        />
        <StatCard
          title="Workouts Done"
          value={workoutsCompleted}
          subtitle="Skills Academy"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* My Progress */}
        <div className="lg:col-span-2">
          <ProgressCard
            title="Training Progress"
            description="Your progress in the Skills Academy"
            items={skillProgress}
            icon={TrendingUp}
            showBadges={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <ActionCard
            title="Skills Academy"
            description="Continue your training journey"
            href="/skills-academy"
            icon={Play}
            color="orange"
            buttonText="Train Now"
          />
          
          <ActionCard
            title="Practice Plans"
            description="View team practice schedules"
            href="/teams/practices"
            icon={Calendar}
            color="blue"
            buttonText="View Schedule"
          />
        </div>
      </div>

      {/* Team Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team Information
            </CardTitle>
            <CardDescription>
              Your team membership and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {primaryTeam ? (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{primaryTeam.name}</h4>
                      <p className="text-xs text-gray-500">
                        {primaryTeam.club?.name || 'Independent Team'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/teams/${primaryTeam.id}`}>View Team</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
                  <div className="text-center py-4">
                    <h4 className="font-medium text-sm text-gray-600">No Team Assigned</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Contact your coach to join a team
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Badges and milestones you&apos;ve unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBadges.length > 0 ? (
                recentBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-gray-600">Unlocked recently</p>
                    </div>
                    <Badge variant="secondary">Earned</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <h4 className="font-medium text-sm text-gray-600">No badges yet</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete workouts to earn your first badge!
                  </p>
                </div>
              )}
              
              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/gamification">View All Badges</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <ScheduleCard
        title="Recommended"
        description="Continue your training journey"
        events={upcomingEvents}
        icon={Clock}
        maxEvents={3}
        showMoreHref="/skills-academy"
      />
      </div>
    </div>
  )
}