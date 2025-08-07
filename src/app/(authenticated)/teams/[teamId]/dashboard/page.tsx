'use client'

import { useParams } from 'next/navigation'
import { useTeam } from '@/hooks/useTeams'
import { useTeamDashboard } from '@/hooks/useTeamDashboard'
import { useSupabase } from '@/hooks/useSupabase'
import { Loader2, AlertCircle } from 'lucide-react'
import { TeamHeader } from '@/components/teams/dashboard/TeamHeader'
import { CoachQuickActions } from '@/components/teams/dashboard/CoachQuickActions'
import { UpcomingSchedule } from '@/components/teams/dashboard/UpcomingSchedule'
import { TeamRoster } from '@/components/teams/dashboard/TeamRoster'
import { ProgressOverview } from '@/components/teams/dashboard/ProgressOverview'
import { RecentActivity } from '@/components/teams/dashboard/RecentActivity'
import { ParentView } from '@/components/teams/dashboard/ParentView'
import { PlayerView } from '@/components/teams/dashboard/PlayerView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TeamDashboardPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { user } = useSupabase()
  const { team, members, loading: teamLoading, error: teamError } = useTeam(teamId)
  const { 
    upcomingEvents, 
    teamStats, 
    recentActivity, 
    loading: dashboardLoading 
  } = useTeamDashboard(teamId)

  // Get current user's role on this team
  const userRole = members.find(m => m.user_id === user?.id)?.role
  const isCoach = userRole && ['head_coach', 'assistant_coach', 'team_admin'].includes(userRole)
  const isPlayer = userRole === 'player'
  const isParent = userRole === 'parent'

  if (teamLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading team dashboard...</p>
        </div>
      </div>
    )
  }

  if (teamError || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-6">{teamError || 'Team not found'}</p>
          <Link href="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Age-based player view rendering
  const renderPlayerView = () => {
    const playerMember = members.find(m => m.user_id === user?.id)
    let ageGroup: 'youth' | 'middle' | 'teen' = 'teen' // default

    if (team.age_group) {
      const ageMatch = team.age_group.match(/(\d+)/)
      if (ageMatch) {
        const age = parseInt(ageMatch[1])
        if (age <= 10) ageGroup = 'youth'
        else if (age <= 14) ageGroup = 'middle'  
        else ageGroup = 'teen'
      }
    }

    return (
      <PlayerView 
        team={team}
        player={playerMember}
        ageGroup={ageGroup}
        upcomingEvents={upcomingEvents}
        teamStats={teamStats}
        recentActivity={recentActivity}
      />
    )
  }

  // Role-based dashboard rendering
  if (isParent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeamHeader 
          team={team} 
          userRole={userRole} 
          members={members}
        />
        
        <div className="container mx-auto px-4 py-6">
          <ParentView 
            team={team}
            playerMembers={members.filter(m => m.role === 'player')} // Simplified for demo
            upcomingEvents={upcomingEvents}
            recentActivity={recentActivity}
          />
        </div>
      </div>
    )
  }

  if (isPlayer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeamHeader 
          team={team} 
          userRole={userRole} 
          members={members}
        />
        
        <div className="container mx-auto px-4 py-6">
          {renderPlayerView()}
        </div>
      </div>
    )
  }

  // Coach Dashboard (default/primary view)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized team header with emergency contacts */}
      <TeamHeader 
        team={team} 
        userRole={userRole} 
        members={members}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions - Large touch targets for field use */}
        {isCoach && (
          <CoachQuickActions 
            team={team}
            upcomingEvents={upcomingEvents}
          />
        )}

        {/* Two-column layout on desktop, stacked on mobile */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Priority information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next event with weather and field info */}
            <UpcomingSchedule 
              events={upcomingEvents}
              team={team}
              canManage={!!isCoach}
            />

            {/* Live roster with attendance tracking */}
            <TeamRoster 
              team={team}
              members={members}
              canTakeAttendance={!!isCoach}
              upcomingEvent={upcomingEvents[0]}
            />
          </div>

          {/* Right column - Progress and activity */}
          <div className="space-y-6">
            {/* Team development progress */}
            <ProgressOverview 
              team={team}
              members={members}
              stats={teamStats}
            />

            {/* Recent activity feed */}
            <RecentActivity 
              activity={recentActivity}
              team={team}
              canManage={!!isCoach}
            />
          </div>
        </div>
      </div>
    </div>
  )
}