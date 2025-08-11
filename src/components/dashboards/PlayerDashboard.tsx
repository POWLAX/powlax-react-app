'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface PlayerDashboardProps {
  user: any
}

export function PlayerDashboard({ user }: PlayerDashboardProps) {
  // Mock data based on contract specifications
  const mockData = {
    streak: 7,
    points: {
      attack: 450,
      defense: 320,
      midfield: 280,
      total: 1050
    },
    weeklyWorkouts: 3,
    team: "Varsity Eagles",
    nextPractice: {
      date: "Tomorrow",
      time: "4:00 PM",
      location: "Field A"
    },
    recentBadges: [
      { name: "Week Warrior", icon: "🏆" },
      { name: "Wall Ball Master", icon: "🎯" }
    ],
    skillProgress: [
      { label: "Shooting", value: 75, maxValue: 100, color: 'orange' as const },
      { label: "Defense", value: 60, maxValue: 100, color: 'blue' as const },
      { label: "Dodging", value: 85, maxValue: 100, color: 'green' as const }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Team Practice',
        date: 'Tomorrow',
        time: '4:00 PM',
        location: 'Field A',
        type: 'practice' as const,
        status: 'upcoming' as const,
        href: '/teams/practices/1'
      },
      {
        id: '2',
        title: 'Game vs Thunder',
        date: 'Saturday',
        time: '2:00 PM',
        location: 'Home Field',
        type: 'game' as const,
        status: 'upcoming' as const,
        href: '/teams/games/2'
      },
      {
        id: '3',
        title: 'Skills Workout',
        date: 'Sunday',
        time: '10:00 AM',
        location: 'Wall Ball Area',
        type: 'workout' as const,
        status: 'upcoming' as const,
        href: '/skills-academy/workout/45'
      }
    ]
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username || 'Player'}!
        </h1>
        <p className="text-gray-600">Player Dashboard - {mockData.team}</p>
      </div>

      {/* Current Streak Banner */}
      <Card className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  {mockData.streak} Day Streak! 🔥
                </h3>
                <p className="text-orange-700">Keep up the momentum!</p>
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
          value={mockData.points.total}
          subtitle="All currencies"
          icon={Star}
          color="orange"
        />
        <StatCard
          title="Attack Tokens"
          value={mockData.points.attack}
          subtitle="Offensive skills"
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Defense Dollars"
          value={mockData.points.defense}
          subtitle="Defensive play"
          icon={Award}
          color="green"
        />
        <StatCard
          title="This Week"
          value={mockData.weeklyWorkouts}
          subtitle="Workouts completed"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* My Progress */}
        <div className="lg:col-span-2">
          <ProgressCard
            title="Skill Development"
            description="Your progress across key lacrosse skills"
            items={mockData.skillProgress}
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

      {/* Team Workouts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Mock: Team Workouts
                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs ml-2">
                  Mock
                </Badge>
            </CardTitle>
            <CardDescription>
              Mock: Coach-assigned workouts placeholder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 italic">Mock: Wall Ball Challenge</h4>
                    <p className="text-xs text-gray-500 italic">Mock: Assigned by Coach Smith</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gray-100 text-gray-600">Mock: +50 bonus</Badge>
                  </div>
                </div>
                <div className="mt-2">
                  <Button size="sm" variant="outline" disabled>
                    Start Workout
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 italic">Mock: Shooting Accuracy</h4>
                    <p className="text-xs text-gray-500 italic">Mock: Due by Friday</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">Mock: +25 bonus</Badge>
                  </div>
                </div>
                <div className="mt-2">
                  <Button size="sm" variant="outline" disabled>
                    View Details
                  </Button>
                </div>
              </div>
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
              {mockData.recentBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    <p className="text-xs text-gray-600">Unlocked recently</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
              
              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/achievements">View All Badges</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <ScheduleCard
        title="Upcoming"
        description="Your next practices, games, and workouts"
        events={mockData.upcomingEvents}
        icon={Clock}
        maxEvents={3}
        showMoreHref="/schedule"
      />
    </div>
  )
}