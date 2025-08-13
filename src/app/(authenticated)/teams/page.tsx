'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChevronRight, Plus, Activity, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTeams } from '@/hooks/useTeams'
import { supabase } from '@/lib/supabase'

interface TeamWithMemberCount {
  id: string
  name: string
  club_id: string
  member_count: number
  club_name?: string
}

export default function TeamsPage() {
  const { teams, loading: teamsLoading, error: teamsError } = useTeams()
  const [teamsWithCounts, setTeamsWithCounts] = useState<TeamWithMemberCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeamCounts() {
      if (!teams || teams.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Get member counts for all teams
        const { data: teamCounts, error } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            club_id,
            clubs:club_id(name),
            team_members(count)
          `)

        if (error) {
          console.error('Error fetching team counts:', error)
          setLoading(false)
          return
        }

        const teamsWithCountsData = teamCounts?.map(team => ({
          id: team.id,
          name: team.name,
          club_id: team.club_id,
          member_count: (team as any).team_members?.[0]?.count || 0,
          club_name: (team as any).clubs?.name || 'Unknown Club'
        })) || []

        setTeamsWithCounts(teamsWithCountsData)
      } catch (err) {
        console.error('Error processing team data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamCounts()
  }, [teams])

  const getTeamColor = (index: number) => {
    const colors = ['blue-600', 'green-600', 'purple-600', 'red-600', 'yellow-600', 'indigo-600']
    return colors[index % colors.length]
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage your lacrosse teams and rosters</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {loading || teamsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading teams...</span>
          </div>
        ) : teamsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading teams: {teamsError}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : teamsWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h3>
            <p className="text-gray-600 mb-4">You&apos;re not currently a member of any teams.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamsWithCounts.map((team, index) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className={`w-5 h-5 text-${getTeamColor(index)}`} />
                      <span className="truncate">{team.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Players:</span>
                    <span className="font-medium">{team.member_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Club:</span>
                    <span className="font-medium text-right truncate">{team.club_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Season:</span>
                    <span className="font-medium">Spring 2025</span>
                  </div>
                  <Link href={`/teams/${team.id}/dashboard`}>
                    <Button className="w-full">
                      View Team
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/teams/no-team/practiceplan">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Practice Planner</div>
                      <div className="text-sm text-gray-500">Create practice plans</div>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Add Players</div>
                    <div className="text-sm text-gray-500">Manage rosters</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Team Stats</div>
                    <div className="text-sm text-gray-500">View performance</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Communication</div>
                    <div className="text-sm text-gray-500">Send messages</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}