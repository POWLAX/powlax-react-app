'use client'

import { useTeams } from '@/hooks/useTeams'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/SupabaseAuthContext'

export default function TeamsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  // Use the real useTeams hook with correct table mappings
  const { teams, loading, error } = useTeams()

  // Debug logging
  console.log('TeamsPage render:', { user, authLoading, loading, error, teams })

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

  // Group teams by organization
  const teamsByOrg = teams.reduce((acc, team) => {
    const orgName = team.organization?.name || 'Unassigned'
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
        <p className="text-gray-600 mt-2">Select a team to access your Team HQ</p>
      </div>

      <div className="space-y-8">
        {Object.entries(teamsByOrg).map(([orgName, orgTeams]) => (
          <div key={orgName}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{orgName}</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orgTeams.map((team) => (
                <Link 
                  key={team.id} 
                  href={`/teams/${team.slug}/hq`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {team.age_group && <span>{team.age_group} • </span>}
                            {team.level && <span className="capitalize">{team.level}</span>}
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {team.gender && (
                            <Badge variant="secondary" className="capitalize">
                              {team.gender}
                            </Badge>
                          )}
                          <Badge 
                            variant={
                              team.subscription_tier === 'activated' ? 'default' :
                              team.subscription_tier === 'leadership' ? 'secondary' :
                              'outline'
                            }
                            className="capitalize"
                          >
                            {team.subscription_tier}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}