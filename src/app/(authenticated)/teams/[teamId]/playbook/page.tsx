'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TeamPlaybook from '@/components/team-playbook/TeamPlaybook'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Team {
  id: string
  name: string
}

export default function TeamPlaybookPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params?.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeam()
  }, [teamId])

  const fetchTeam = async () => {
    if (!teamId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('team_teams')
        .select('id, name')
        .eq('id', teamId)
        .single()

      if (error) {
        throw error
      }

      setTeam(data)
    } catch (err: any) {
      console.error('Error fetching team:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStrategy = () => {
    // Navigate to practice planner for this team
    router.push(`/teams/${teamId}/practice-plans`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-powlax-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team playbook...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load team</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Team not found</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/teams/${teamId}/dashboard`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Team Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{team.name}</h1>
                <p className="text-sm text-gray-500">Team Playbook</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Playbook Component */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-64px)]">
        <TeamPlaybook 
          teamId={teamId}
          teamName={team.name}
          onAddStrategy={handleAddStrategy}
        />
      </div>
    </div>
  )
}