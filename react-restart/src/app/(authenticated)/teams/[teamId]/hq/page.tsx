'use client'

import { useParams } from 'next/navigation'
import { useTeam } from '@/hooks/useTeams'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  Trophy, 
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

  const coaches = members.filter(m => ['head_coach', 'assistant_coach'].includes(m.role))
  const players = members.filter(m => m.role === 'player')

  // Simplified sections - only show essentials
  const essentialSections: TeamHQSection[] = [
    {
      title: 'Practice Planner',
      description: 'Create and manage practice plans',
      icon: Calendar,
      href: `/teams/${teamId}/practice-plans`,
      available: true,
    },
    {
      title: 'Team Roster',
      description: 'Manage your players',
      icon: Users,
      href: `/teams/${teamId}/roster`,
      available: true,
    },
    {
      title: 'Skills Academy',
      description: 'Assign skill development workouts',
      icon: Trophy,
      href: `/teams/${teamId}/skills-academy`,
      available: team.subscription_tier === 'activated',
      badge: team.subscription_tier !== 'activated' ? 'Activated' : undefined,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Simplified Team Header */}
      <div className="mb-8 bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name} HQ</h1>
            <p className="text-gray-600 mt-2">
              {coaches.length} coaches • {players.length} players
            </p>
          </div>
          <Link href={`/teams/${teamId}/dashboard`}>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Simplified Feature Grid - Only essentials */}
      <div className="grid gap-4 md:grid-cols-3">
        {essentialSections.map((section) => {
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
                  ? 'hover:shadow-md cursor-pointer' 
                  : 'opacity-60'
              }`}>
                <CardHeader>
                  <Icon className={`h-6 w-6 mb-3 ${
                    isAvailable ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {section.description}
                  </CardDescription>
                  {section.badge && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {section.badge}
                    </Badge>
                  )}
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}