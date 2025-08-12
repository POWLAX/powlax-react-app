'use client'

import { useTeams } from '@/hooks/useTeams'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ChevronRight, Loader2, AlertCircle, MessageCircle, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

function TeamsPageContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  // Use the real useTeams hook with correct table mappings
  const { teams, loading, error } = useTeams()
  const [teamRosters, setTeamRosters] = useState<Record<string, any[]>>({})
  const [rostersLoading, setRostersLoading] = useState(true)

  // Debug logging
  console.log('TeamsPage render:', { user, authLoading, loading, error, teams })

  // Fetch real rosters for teams
  useEffect(() => {
    const fetchRosters = async () => {
      if (teams.length > 0) {
        setRostersLoading(true)
        const rosters: Record<string, any[]> = {}
        
        for (const team of teams) {
          try {
            const { data: memberData } = await supabase
              .from('team_members')
              .select(`
                *,
                users!inner(
                  id,
                  email,
                  first_name,
                  last_name,
                  display_name,
                  role
                )
              `)
              .eq('team_id', team.id)
            
            rosters[team.id] = memberData || []
          } catch (error) {
            console.error(`Error fetching roster for team ${team.id}:`, error)
            rosters[team.id] = []
          }
        }
        
        setTeamRosters(rosters)
        setRostersLoading(false)
      }
    }
    
    fetchRosters()
  }, [teams])

  // Show loading spinner while authentication is being verified
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold">Error Loading Teams</h3>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold">No Teams Yet</h3>
        <p className="text-gray-600 mt-2">You haven&apos;t been added to any teams.</p>
      </div>
    )
  }

  // Group teams by club
  const teamsByOrg = teams.reduce((acc, team) => {
    const orgName = team.clubs?.name || 'Your Club OS'
    if (!acc[orgName]) {
      acc[orgName] = []
    }
    acc[orgName].push(team)
    return acc
  }, {} as Record<string, typeof teams>)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <p className="text-gray-600 mt-2">View your teams from Your Club OS with real roster data</p>
      </div>

      <div className="space-y-8">
        {Object.entries(teamsByOrg).map(([orgName, orgTeams]) => (
          <div key={orgName}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{orgName}</h2>
            
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {orgTeams.map((team) => {
                const roster = teamRosters[team.id] || []
                return (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {roster.length} {roster.length === 1 ? 'member' : 'members'}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {team.subscription_tier || 'activated'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Real Roster Section */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Team Roster
                        </h4>
                        {rostersLoading ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Loading roster...
                          </div>
                        ) : roster.length > 0 ? (
                          <div className="space-y-1">
                            {roster.slice(0, 3).map((member: any) => (
                              <div key={member.id} className="flex items-center text-sm">
                                <span className="font-medium">
                                  {member.users.display_name || `${member.users.first_name} ${member.users.last_name}`.trim() || member.users.email}
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs capitalize">
                                  {member.role}
                                </Badge>
                              </div>
                            ))}
                            {roster.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{roster.length - 3} more members
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No members yet</div>
                        )}
                      </div>

                      {/* Mock Features with Clear Indicators */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-dashed border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                          disabled
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <div className="flex flex-col items-start">
                            <span className="text-xs">Team Chat</span>
                            <span className="text-xs font-normal">Mock: Coming Soon</span>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-dashed border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                          disabled
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <div className="flex flex-col items-start">
                            <span className="text-xs">Team Stats</span>
                            <span className="text-xs font-normal">Mock: Coming Soon</span>
                          </div>
                        </Button>
                      </div>

                      {/* Team HQ Link */}
                      <Link href={`/teams/${team.slug}/hq`} className="block">
                        <Button className="w-full">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Access Team HQ
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mock Data Indicator */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <div className="bg-gray-200 p-2 rounded-full mr-3">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Real Data Display</h4>
            <p className="text-sm text-gray-600 mt-1">
              Team rosters show actual members from Your Club OS. 
              Features marked "Mock: Coming Soon" are placeholders for future functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Client-side only wrapper to prevent hydration mismatch
export default function TeamsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <TeamsPageContent />
}