'use client'

import { useParams } from 'next/navigation'
import { useTeam } from '@/hooks/useTeams'
import { useAuth } from '@/contexts/JWTAuthContext'
import Link from 'next/link'
import { 
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TeamRosterCard } from '@/components/team-dashboard/TeamRosterCard'
import { PracticeScheduleCard } from '@/components/team-dashboard/PracticeScheduleCard'
import { QuickActionsCard } from '@/components/team-dashboard/QuickActionsCard'
import { TeamAnnouncementsCard } from '@/components/team-dashboard/TeamAnnouncementsCard'
import { TeamStatsOverview } from '@/components/team-dashboard/TeamStatsOverview'

export default function TeamDashboardPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { team, members, loading, error } = useTeam(teamId)
  const { user } = useAuth()

  // Determine user's role in the team
  const getUserRole = () => {
    if (!user || !members) return 'player'
    
    const userMember = members.find(m => m.user.email === user.email)
    return userMember?.role || 'player'
  }

  const userRole = getUserRole()
  const isCoach = ['head_coach', 'assistant_coach'].includes(userRole)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Team Not Found</h3>
        <p className="text-gray-600 mt-2">Unable to load team information.</p>
        <Link href="/teams">
          <Button className="mt-4">Back to Teams</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/teams/${teamId}/hq`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Team HQ
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{team.name} Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {team.organization?.name} • {team.age_group} {team.level && `• ${team.level}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Quick Actions - Full width on mobile */}
          <QuickActionsCard 
            teamId={teamId} 
            role={userRole as any}
          />

          {/* Announcements */}
          <TeamAnnouncementsCard 
            teamId={teamId} 
            isCoach={isCoach}
          />

          {/* Schedule */}
          <PracticeScheduleCard 
            teamId={teamId} 
            isCoach={isCoach}
          />

          {/* Roster */}
          <TeamRosterCard 
            members={members} 
            teamId={teamId} 
            isCoach={isCoach}
          />

          {/* Stats Overview */}
          <TeamStatsOverview 
            teamId={teamId}
            members={members}
          />
        </div>

        {/* Desktop Layout - 3 column grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <QuickActionsCard 
              teamId={teamId} 
              role={userRole as any}
            />
            <TeamStatsOverview 
              teamId={teamId}
              members={members}
            />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <TeamAnnouncementsCard 
              teamId={teamId} 
              isCoach={isCoach}
            />
            <PracticeScheduleCard 
              teamId={teamId} 
              isCoach={isCoach}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TeamRosterCard 
              members={members} 
              teamId={teamId} 
              isCoach={isCoach}
            />
          </div>
        </div>
      </div>
    </div>
  )
}