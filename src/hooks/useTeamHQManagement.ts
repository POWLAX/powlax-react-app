/**
 * Team HQ Management Hook
 * 
 * Handles team operations, roster management, and tier enforcement
 * for the Team HQ tier system (Structure, Leadership, Activated)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { TierEnforcementEngine, UserMembership } from '@/lib/platform/tier-enforcement'

export interface Team {
  id: number
  name: string
  club_id: number
  age_group?: string
  season?: string
  description?: string
  created_at: string
  updated_at: string
  settings?: TeamSettings
  member_count?: number
  coach_count?: number
}

export interface TeamSettings {
  practice_schedule?: {
    default_duration: number
    preferred_days: string[]
    preferred_times: string[]
  }
  communication?: {
    parent_updates: boolean
    practice_reminders: boolean
    game_notifications: boolean
  }
  academy_access?: {
    enabled: boolean
    player_limit: number
    current_players: number
  }
  playbook_settings?: {
    custom_plays: boolean
    strategy_sharing: boolean
    game_analysis: boolean
  }
}

export interface TeamMember {
  id: string
  user_id: string
  team_id: number
  role: 'player' | 'coach' | 'manager' | 'parent'
  jersey_number?: number
  position?: string
  joined_at: string
  academy_access?: boolean
  user?: {
    id: string
    email: string
    full_name?: string
    first_name?: string
    last_name?: string
  }
}

export interface TeamSchedule {
  id: string
  team_id: number
  type: 'practice' | 'game' | 'tournament'
  title: string
  date: string
  start_time: string
  end_time: string
  location?: string
  notes?: string
  created_at: string
}

export interface TeamPlaybook {
  id: string
  team_id: number
  name: string
  description?: string
  plays: TeamPlay[]
  created_at: string
  updated_at: string
}

export interface TeamPlay {
  id: string
  name: string
  description?: string
  diagram_url?: string
  video_url?: string
  position_assignments: Record<string, string>
}

export interface TeamAnalytics {
  roster_size: number
  active_players: number
  practices_this_month: number
  academy_usage: {
    players_with_access: number
    total_sessions: number
    avg_session_length: number
  }
  performance_metrics: {
    attendance_rate: number
    skill_progression: number
    engagement_score: number
  }
}

interface UseTeamHQManagementState {
  teams: Team[]
  selectedTeam: Team | null
  roster: TeamMember[]
  schedule: TeamSchedule[]
  playbooks: TeamPlaybook[]
  analytics: TeamAnalytics | null
  membership: UserMembership | null
  loading: boolean
  error: string | null
}

interface UseTeamHQManagementActions {
  loadTeams: () => Promise<void>
  selectTeam: (teamId: number) => Promise<void>
  updateTeamSettings: (teamId: number, settings: Partial<TeamSettings>) => Promise<void>
  loadRoster: (teamId: number) => Promise<void>
  addTeamMember: (teamId: number, userId: string, role: TeamMember['role']) => Promise<void>
  removeTeamMember: (teamId: number, userId: string) => Promise<void>
  assignAcademyAccess: (teamId: number, userId: string) => Promise<void>
  removeAcademyAccess: (teamId: number, userId: string) => Promise<void>
  loadSchedule: (teamId: number) => Promise<void>
  createScheduleEvent: (teamId: number, event: Omit<TeamSchedule, 'id' | 'created_at'>) => Promise<void>
  loadPlaybooks: (teamId: number) => Promise<void>
  createPlaybook: (teamId: number, playbook: Omit<TeamPlaybook, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  loadAnalytics: (teamId: number) => Promise<void>
  hasFeatureAccess: (feature: string) => boolean
  getUpgradeInfo: (feature: string) => { requiresUpgrade: boolean; tier?: string }
  checkAcademyLimit: (teamId: number) => { withinLimit: boolean; remaining: number; limit: number }
  refreshData: () => Promise<void>
}

export function useTeamHQManagement(): UseTeamHQManagementState & UseTeamHQManagementActions {
  const [state, setState] = useState<UseTeamHQManagementState>({
    teams: [],
    selectedTeam: null,
    roster: [],
    schedule: [],
    playbooks: [],
    analytics: null,
    membership: null,
    loading: true,
    error: null
  })

  // Load teams user has access to
  const loadTeams = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user's team memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            club_id,
            age_group,
            season,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      const teams: Team[] = memberships?.map(membership => ({
        ...membership.teams,
        member_count: 0, // Will be loaded separately
        coach_count: 0
      })) || []

      // Load member counts for each team
      for (const team of teams) {
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id)
        
        team.member_count = count || 0
      }

      // Load membership information (simplified for demo)
      const membership: UserMembership = {
        userId: user.id,
        teamId: teams[0]?.id,
        teamTier: 'leadership', // This would come from membership_entitlements
        isAdmin: true // This would come from user roles
      }

      setState(prev => ({
        ...prev,
        teams,
        membership,
        loading: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load teams',
        loading: false
      }))
    }
  }, [])

  // Select a specific team
  const selectTeam = useCallback(async (teamId: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        selectedTeam: team,
        loading: false
      }))

      // Load associated data for selected team
      await Promise.all([
        loadRoster(teamId),
        loadSchedule(teamId),
        loadPlaybooks(teamId),
        loadAnalytics(teamId)
      ])

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to select team',
        loading: false
      }))
    }
  }, [])

  // Update team settings
  const updateTeamSettings = useCallback(async (teamId: number, settings: Partial<TeamSettings>) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ 
          settings: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)

      if (error) throw error

      // Update local state
      setState(prev => ({
        ...prev,
        selectedTeam: prev.selectedTeam ? {
          ...prev.selectedTeam,
          settings: { ...prev.selectedTeam.settings, ...settings }
        } : null
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      }))
    }
  }, [])

  // Load roster for a team
  const loadRoster = useCallback(async (teamId: number) => {
    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          team_id,
          role,
          jersey_number,
          position,
          joined_at,
          academy_access,
          users (
            id,
            email,
            full_name,
            first_name,
            last_name
          )
        `)
        .eq('team_id', teamId)

      if (error) throw error

      const roster: TeamMember[] = members?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        team_id: member.team_id,
        role: member.role,
        jersey_number: member.jersey_number,
        position: member.position,
        joined_at: member.joined_at,
        academy_access: member.academy_access,
        user: member.users
      })) || []

      setState(prev => ({
        ...prev,
        roster
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load roster'
      }))
    }
  }, [])

  // Add team member
  const addTeamMember = useCallback(async (teamId: number, userId: string, role: TeamMember['role']) => {
    try {
      if (!hasFeatureAccess('roster_management')) {
        throw new Error('Roster management requires Team Structure tier or higher')
      }

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        })

      if (error) throw error

      // Reload roster
      await loadRoster(teamId)

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add team member'
      }))
    }
  }, [])

  // Remove team member
  const removeTeamMember = useCallback(async (teamId: number, userId: string) => {
    try {
      if (!hasFeatureAccess('roster_management')) {
        throw new Error('Roster management requires Team Structure tier or higher')
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      // Reload roster
      await loadRoster(teamId)

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove team member'
      }))
    }
  }, [])

  // Assign academy access
  const assignAcademyAccess = useCallback(async (teamId: number, userId: string) => {
    try {
      // Check academy limit
      const currentPlayers = state.roster.filter(m => m.academy_access).length
      const { withinLimit } = TierEnforcementEngine.checkTeamAcademyLimit(currentPlayers + 1)
      
      if (!withinLimit) {
        throw new Error('Academy access limited to 25 players per team')
      }

      const { error } = await supabase
        .from('team_members')
        .update({ academy_access: true })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setState(prev => ({
        ...prev,
        roster: prev.roster.map(member => 
          member.user_id === userId 
            ? { ...member, academy_access: true }
            : member
        )
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign academy access'
      }))
    }
  }, [state.roster])

  // Remove academy access
  const removeAcademyAccess = useCallback(async (teamId: number, userId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ academy_access: false })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setState(prev => ({
        ...prev,
        roster: prev.roster.map(member => 
          member.user_id === userId 
            ? { ...member, academy_access: false }
            : member
        )
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove academy access'
      }))
    }
  }, [])

  // Load schedule
  const loadSchedule = useCallback(async (teamId: number) => {
    try {
      // This would query a team_schedule table when implemented
      setState(prev => ({
        ...prev,
        schedule: [] // Placeholder
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load schedule'
      }))
    }
  }, [])

  // Create schedule event
  const createScheduleEvent = useCallback(async (teamId: number, event: Omit<TeamSchedule, 'id' | 'created_at'>) => {
    try {
      if (!hasFeatureAccess('basic_scheduling')) {
        throw new Error('Scheduling requires Team Structure tier or higher')
      }

      // This would insert into team_schedule table when implemented
      // For now, just update local state
      const newEvent: TeamSchedule = {
        ...event,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        schedule: [...prev.schedule, newEvent]
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create schedule event'
      }))
    }
  }, [])

  // Load playbooks
  const loadPlaybooks = useCallback(async (teamId: number) => {
    try {
      // This would query team_playbooks table when implemented
      setState(prev => ({
        ...prev,
        playbooks: [] // Placeholder
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load playbooks'
      }))
    }
  }, [])

  // Create playbook
  const createPlaybook = useCallback(async (teamId: number, playbook: Omit<TeamPlaybook, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!hasFeatureAccess('playbook_access')) {
        throw new Error('Playbook access requires Team Leadership tier or higher')
      }

      // This would insert into team_playbooks table when implemented
      const newPlaybook: TeamPlaybook = {
        ...playbook,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        playbooks: [...prev.playbooks, newPlaybook]
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create playbook'
      }))
    }
  }, [])

  // Load analytics
  const loadAnalytics = useCallback(async (teamId: number) => {
    try {
      if (!hasFeatureAccess('team_stats')) {
        return // Analytics not available at this tier
      }

      const playersCount = state.roster.filter(m => m.role === 'player').length
      const playersWithAccess = state.roster.filter(m => m.academy_access).length

      const analytics: TeamAnalytics = {
        roster_size: state.roster.length,
        active_players: playersCount,
        practices_this_month: 0, // Would need to query schedule
        academy_usage: {
          players_with_access: playersWithAccess,
          total_sessions: 0, // Would need to query skills academy usage
          avg_session_length: 0
        },
        performance_metrics: {
          attendance_rate: 0, // Would need attendance tracking
          skill_progression: 0, // Would need skills academy progress
          engagement_score: 0 // Calculated metric
        }
      }

      setState(prev => ({
        ...prev,
        analytics
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analytics'
      }))
    }
  }, [state.roster])

  // Check feature access
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!state.membership) return false
    return TierEnforcementEngine.hasFeatureAccess(state.membership, feature, 'team')
  }, [state.membership])

  // Get upgrade information
  const getUpgradeInfo = useCallback((feature: string) => {
    if (!state.membership) return { requiresUpgrade: true }
    return TierEnforcementEngine.getUpgradeInfo(state.membership, feature, 'team')
  }, [state.membership])

  // Check academy limit
  const checkAcademyLimit = useCallback((teamId: number) => {
    const currentPlayers = state.roster.filter(m => m.academy_access).length
    return TierEnforcementEngine.checkTeamAcademyLimit(currentPlayers)
  }, [state.roster])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadTeams()
    if (state.selectedTeam) {
      await selectTeam(state.selectedTeam.id)
    }
  }, [state.selectedTeam?.id, loadTeams, selectTeam])

  // Load teams on mount
  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  return {
    ...state,
    loadTeams,
    selectTeam,
    updateTeamSettings,
    loadRoster,
    addTeamMember,
    removeTeamMember,
    assignAcademyAccess,
    removeAcademyAccess,
    loadSchedule,
    createScheduleEvent,
    loadPlaybooks,
    createPlaybook,
    loadAnalytics,
    hasFeatureAccess,
    getUpgradeInfo,
    checkAcademyLimit,
    refreshData
  }
}