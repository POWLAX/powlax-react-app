'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import type { 
  Team, 
  Organization, 
  UserTeamRole, 
  UserOrganizationRole,
  UserTeamAccess,
  CreateTeamInput,
  AddUserToTeamInput
} from '@/types/teams'

export function useTeams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserTeams()
    } else {
      // If no user, stop loading and show empty teams
      setLoading(false)
      setTeams([])
    }
  }, [user])

  const fetchUserTeams = async () => {
    try {
      setLoading(true)
      console.log('Fetching teams for user:', user?.id)
      
      // First get the full user record to check club_id
      // Use a minimal select to avoid RLS recursion issues
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, club_id')
        .eq('id', user?.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user data:', userError)
        // If we can't get user data due to RLS, just skip to team memberships
        console.log('Falling back to team memberships check')
        // Don't return here, continue with team memberships check
      }

      let teamsData = null
      
      // If user has a club_id, fetch all teams for that club (admin/director pattern)
      if (userData && userData.club_id) {
        console.log('User has club_id:', userData.club_id, '- fetching all club teams')
        
        const { data: clubTeams, error: clubTeamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('club_id', userData.club_id)
        
        if (clubTeamsError) {
          console.error('Error fetching club teams:', clubTeamsError)
          setError(clubTeamsError.message)
          return
        }
        
        teamsData = clubTeams
      } else {
        // Otherwise, fetch team memberships for the current user
        console.log('User has no club_id or error fetching user - checking team memberships')
        
        const { data: membershipData, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id, role')
          .eq('user_id', user?.id)
        
        if (membershipError) {
          console.error('Error fetching team memberships:', membershipError)
          setError(membershipError.message)
          return
        }

        if (!membershipData || membershipData.length === 0) {
          console.log('No team memberships found for user')
          setTeams([])
          setError(null)
          setLoading(false)
          return
        }

        const teamIds = membershipData.map(m => m.team_id)
        console.log('User is member of teams:', teamIds)
        
        // Fetch teams data for teams the user is a member of
        const { data: memberTeams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
        
        if (teamsError) {
          console.error('Error fetching teams:', teamsError)
          setError(teamsError.message)
          return
        }
        
        teamsData = memberTeams
      }

      console.log('Teams data:', teamsData)

      // Fetch clubs separately to avoid join issues
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
      
      if (clubsError) {
        console.error('Error fetching clubs:', clubsError)
        setError(clubsError.message)
        return
      }

      console.log('Clubs data:', clubsData)

      // Transform the data to match our Team interface
      const transformedTeams: Team[] = (teamsData || []).map((team: any) => {
        const club = clubsData?.find(club => club.id === team.club_id)
        
        return {
          id: team.id,
          name: team.name,
          slug: team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          club_id: team.club_id,
          organization_id: team.club_id, // Legacy compatibility
          age_group: 'U16', // Default for now
          level: 'competitive', // Default for now
          gender: 'mixed', // Default for now
          subscription_tier: 'activated', // Default for now
          team_type: 'team_hq',
          created_at: team.created_at,
          club: club ? {
            id: club.id,
            name: club.name,
            slug: club.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            type: 'club_os' as const,
            settings: {},
            branding: {
              primary_color: '#003366',
              secondary_color: '#FF6600'
            },
            created_at: club.created_at,
            updated_at: club.updated_at
          } : undefined,
          organization: club ? {
            id: club.id,
            name: club.name,
            slug: club.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            type: 'club_os' as const,
            settings: {},
            branding: {
              primary_color: '#003366',
              secondary_color: '#FF6600'
            },
            created_at: club.created_at,
            updated_at: club.updated_at
          } : undefined // Legacy compatibility
        }
      })
      
      console.log('Transformed teams:', transformedTeams)
      setTeams(transformedTeams)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching teams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (input: CreateTeamInput) => {
    try {
      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: input.name,
          club_id: input.club_id || input.organization_id, // Support both new and legacy
          ...input
        }])
        .select()
        .single()

      if (error) throw error

      // Add creating user as head coach
      if (user && data) {
        await addUserToTeam({
          user_id: user.id,
          team_id: data.id,
          role: 'head_coach'
        })
      }

      setTeams([...teams, data])
      return { data, error: null }
    } catch (err: any) {
      console.error('Error creating team:', err)
      return { data: null, error: err.message }
    }
  }

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTeams(teams.map(t => t.id === id ? data : t))
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating team:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTeams(teams.filter(t => t.id !== id))
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting team:', err)
      return { error: err.message }
    }
  }

  const addUserToTeam = async (input: AddUserToTeamInput) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([input])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err: any) {
      console.error('Error adding user to team:', err)
      return { data: null, error: err.message }
    }
  }

  const removeUserFromTeam = async (userId: string, teamId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({ user_id: userId, team_id: teamId })

      if (error) throw error

      return { error: null }
    } catch (err: any) {
      console.error('Error removing user from team:', err)
      return { error: err.message }
    }
  }

  const getTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users!inner(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('team_id', teamId)

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err: any) {
      console.error('Error fetching team members:', err)
      return { data: [], error: err.message }
    }
  }

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    addUserToTeam,
    removeUserFromTeam,
    getTeamMembers,
    refetch: fetchUserTeams
  }
}

// Hook for single team
export function useTeam(teamId: string) {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<UserTeamRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teamId) {
      fetchTeam()
    }
  }, [teamId])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      
      // Fetch team with club
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          club:clubs(
            id,
            name
          )
        `)
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError
      setTeam(teamData)

      // Fetch team members
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select(`
          *,
          users!inner(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('team_id', teamId)

      if (memberError) throw memberError
      setMembers(memberData || [])

    } catch (err: any) {
      console.error('Error fetching team:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    team,
    members,
    loading,
    error,
    refetch: fetchTeam
  }
}