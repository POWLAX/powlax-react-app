'use client'

import { useParams } from 'next/navigation'
import { useTeam } from '@/hooks/useTeams'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Trophy, 
  MessageSquare, 
  BarChart3,
  Settings,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TeamHQSection {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  available: boolean
  badge?: string
}

export default function TeamHQPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { team, members, loading, error } = useTeam(teamId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Team Not Found</h3>
        <p className="text-gray-600 mt-2">Unable to load team information.</p>
        <Link href="/teams">
          <Button className="mt-4">Back to Teams</Button>
        </Link>
      </div>
    )
  }

  // Define sections based on subscription tier
  const sections: TeamHQSection[] = [
    {
      title: 'Practice Planner',
      description: 'Create and manage practice plans with our intelligent drill library',
      icon: Calendar,
      href: `/teams/${teamId}/practice-plans`,
      available: true,
    },
    {
      title: 'Team Playbook',
      description: 'Build your team\'s playbook with videos and strategies',
      icon: BookOpen,
      href: `/teams/${teamId}/playbook`,
      available: true,
    },
    {
      title: 'Team Roster',
      description: 'Manage your team roster and player information',
      icon: Users,
      href: `/teams/${teamId}/roster`,
      available: true,
    },
    {
      title: 'Team Communications',
      description: 'Send messages and updates to players and parents',
      icon: MessageSquare,
      href: `/teams/${teamId}/communications`,
      available: ['leadership', 'activated'].includes(team.subscription_tier),
      badge: team.subscription_tier === 'structure' ? 'Leadership' : undefined,
    },
    {
      title: 'Skills Academy',
      description: 'Prescribe skill development videos and track progress',
      icon: Trophy,
      href: `/teams/${teamId}/skills-academy`,
      available: team.subscription_tier === 'activated',
      badge: team.subscription_tier !== 'activated' ? 'Activated' : undefined,
    },
    {
      title: 'Team Analytics',
      description: 'View team progress and performance metrics',
      icon: BarChart3,
      href: `/teams/${teamId}/analytics`,
      available: ['leadership', 'activated'].includes(team.subscription_tier),
      badge: team.subscription_tier === 'structure' ? 'Leadership' : undefined,
    },
  ]

  const coaches = members.filter(m => ['head_coach', 'assistant_coach'].includes(m.role))
  const players = members.filter(m => m.role === 'player')

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Team Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{team.name} HQ</h1>
            <p className="text-gray-600 mt-2">
              {team.organization?.name} • {team.age_group} • {team.level && <span className="capitalize">{team.level}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={
                team.subscription_tier === 'activated' ? 'default' :
                team.subscription_tier === 'leadership' ? 'secondary' :
                'outline'
              }
              className="capitalize"
            >
              {team.subscription_tier} Plan
            </Badge>
            <Link href={`/teams/${teamId}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coaches.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Practice Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Next Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Not scheduled</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          const isAvailable = section.available
          
          return (
            <Link 
              key={section.title}
              href={isAvailable ? section.href : '#'}
              className={`block ${!isAvailable ? 'cursor-not-allowed' : ''}`}
              onClick={(e) => !isAvailable && e.preventDefault()}
            >
              <Card className={`h-full transition-all ${
                isAvailable 
                  ? 'hover:shadow-lg cursor-pointer hover:scale-105' 
                  : 'opacity-60'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Icon className={`h-8 w-8 ${
                      isAvailable ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {section.badge ? (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    ) : isAvailable ? (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    ) : null}
                  </div>
                  <CardTitle className="mt-4">{section.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Upgrade CTA for Structure Plan */}
      {team.subscription_tier === 'structure' && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>Unlock More Features</CardTitle>
            <CardDescription>
              Upgrade to Leadership or Activated to access team communications, analytics, and the full Skills Academy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>View Upgrade Options</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}