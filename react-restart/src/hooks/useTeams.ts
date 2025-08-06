'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'
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
  const { user } = useSupabase()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserTeams()
    }
  }, [user])

  const fetchUserTeams = async () => {
    try {
      setLoading(true)
      
      // Get user's teams through the function
      const { data, error } = await supabase
        .rpc('get_user_teams', { user_uuid: user!.id })

      if (error) throw error

      // Transform the function result to Team objects
      if (data) {
        const { data: fullTeams, error: teamsError } = await supabase
          .from('teams')
          .select(`
            *,
            organization:club_id(*)
          `)
          .in('id', data.map((t: UserTeamAccess) => t.team_id))

        if (teamsError) throw teamsError
        
        setTeams(fullTeams || [])
      }
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
          ...input,
          slug
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
        .from('user_team_roles')
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
        .from('user_team_roles')
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
        .from('user_team_roles')
        .select(`
          *,
          user:users(*)
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
      
      // Fetch team with organization
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          organization:club_id(*)
        `)
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError
      setTeam(teamData)

      // Fetch team members
      const { data: memberData, error: memberError } = await supabase
        .from('user_team_roles')
        .select(`
          *,
          user:users(*)
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