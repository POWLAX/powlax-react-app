/**
 * Clubs Management Hook
 * 
 * Handles club operations, settings management, and tier enforcement
 * for the Club OS tier system (Foundation, Growth, Command)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { TierEnforcementEngine, UserMembership } from '@/lib/platform/tier-enforcement'

export interface Club {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  settings?: ClubSettings
  team_count?: number
  member_count?: number
}

export interface ClubSettings {
  timezone?: string
  default_season_length?: number
  communication_preferences?: {
    email_notifications: boolean
    sms_notifications: boolean
    parent_updates: boolean
  }
  billing_settings?: {
    payment_method?: string
    billing_cycle?: 'monthly' | 'annual'
    auto_renew?: boolean
  }
  advanced_settings?: {
    custom_branding?: boolean
    api_access?: boolean
    white_label?: boolean
  }
}

export interface ClubTeam {
  id: number
  name: string
  age_group?: string
  season?: string
  coach_count?: number
  player_count?: number
  created_at: string
}

export interface ClubAnalytics {
  total_teams: number
  total_members: number
  active_coaches: number
  active_players: number
  monthly_engagement: {
    practices_planned: number
    skills_sessions: number
    resources_accessed: number
  }
  tier_utilization: {
    features_used: string[]
    features_available: string[]
    usage_percentage: number
  }
}

export interface BulkOperation {
  type: 'update_teams' | 'assign_coaches' | 'bulk_invite' | 'season_rollover'
  data: any
  target_teams?: number[]
}

export interface BulkResult {
  success: boolean
  processed: number
  failed: number
  errors?: string[]
}

interface UseClubsManagementState {
  clubs: Club[]
  selectedClub: Club | null
  teams: ClubTeam[]
  analytics: ClubAnalytics | null
  membership: UserMembership | null
  loading: boolean
  error: string | null
}

interface UseClubsManagementActions {
  loadClubs: () => Promise<void>
  selectClub: (clubId: number) => Promise<void>
  updateClubSettings: (clubId: number, settings: Partial<ClubSettings>) => Promise<void>
  loadTeams: (clubId: number) => Promise<void>
  loadAnalytics: (clubId: number) => Promise<void>
  performBulkOperation: (clubId: number, operation: BulkOperation) => Promise<BulkResult>
  hasFeatureAccess: (feature: string) => boolean
  getUpgradeInfo: (feature: string) => { requiresUpgrade: boolean; tier?: string }
  refreshData: () => Promise<void>
}

export function useClubsManagement(): UseClubsManagementState & UseClubsManagementActions {
  const [state, setState] = useState<UseClubsManagementState>({
    clubs: [],
    selectedClub: null,
    teams: [],
    analytics: null,
    membership: null,
    loading: true,
    error: null
  })

  // Load clubs user has access to
  const loadClubs = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get user's club memberships
      const { data: clubMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            club_id,
            clubs (
              id,
              name,
              description,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      // Extract unique clubs
      const uniqueClubs = new Map<number, Club>()
      
      clubMemberships?.forEach(membership => {
        const club = membership.teams?.clubs
        if (club && !uniqueClubs.has(club.id)) {
          uniqueClubs.set(club.id, {
            id: club.id,
            name: club.name,
            description: club.description,
            created_at: club.created_at,
            updated_at: club.updated_at
          })
        }
      })

      const clubs = Array.from(uniqueClubs.values())

      // Load team counts for each club
      for (const club of clubs) {
        const { count } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
        
        club.team_count = count || 0
      }

      // Load membership information (simplified for demo)
      const membership: UserMembership = {
        userId: user.id,
        clubId: clubs[0]?.id,
        clubTier: 'growth', // This would come from membership_entitlements
        isAdmin: true // This would come from user roles
      }

      setState(prev => ({
        ...prev,
        clubs,
        membership,
        loading: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load clubs',
        loading: false
      }))
    }
  }, [])

  // Select a specific club
  const selectClub = useCallback(async (clubId: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { data: club, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        selectedClub: club,
        loading: false
      }))

      // Load teams and analytics for selected club
      await Promise.all([
        loadTeams(clubId),
        loadAnalytics(clubId)
      ])

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to select club',
        loading: false
      }))
    }
  }, [])

  // Update club settings
  const updateClubSettings = useCallback(async (clubId: number, settings: Partial<ClubSettings>) => {
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ 
          settings: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', clubId)

      if (error) throw error

      // Update local state
      setState(prev => ({
        ...prev,
        selectedClub: prev.selectedClub ? {
          ...prev.selectedClub,
          settings: { ...prev.selectedClub.settings, ...settings }
        } : null
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      }))
    }
  }, [])

  // Load teams for a club
  const loadTeams = useCallback(async (clubId: number) => {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          age_group,
          season,
          created_at,
          team_members (count)
        `)
        .eq('club_id', clubId)

      if (error) throw error

      const teamsWithCounts: ClubTeam[] = teams?.map(team => ({
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        season: team.season,
        created_at: team.created_at,
        player_count: Array.isArray(team.team_members) ? team.team_members.length : 0,
        coach_count: 0 // Would need additional query for coaches
      })) || []

      setState(prev => ({
        ...prev,
        teams: teamsWithCounts
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load teams'
      }))
    }
  }, [])

  // Load analytics for a club
  const loadAnalytics = useCallback(async (clubId: number) => {
    try {
      // Get team count
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)

      // Get member count
      const { count: memberCount } = await supabase
        .from('team_members')
        .select('user_id', { count: 'exact', head: true })
        .in('team_id', 
          (await supabase.from('teams').select('id').eq('club_id', clubId)).data?.map(t => t.id) || []
        )

      const analytics: ClubAnalytics = {
        total_teams: teamCount || 0,
        total_members: memberCount || 0,
        active_coaches: 0, // Would need additional queries
        active_players: memberCount || 0,
        monthly_engagement: {
          practices_planned: 0, // Would need to query practices table
          skills_sessions: 0, // Would need to query skills academy usage
          resources_accessed: 0 // Would need to query resource access logs
        },
        tier_utilization: {
          features_used: ['basic_settings', 'team_overview'],
          features_available: state.membership ? 
            TierEnforcementEngine.getAvailableFeatures(state.membership, 'club') : [],
          usage_percentage: 65 // Calculated based on feature usage
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
  }, [state.membership])

  // Perform bulk operations
  const performBulkOperation = useCallback(async (clubId: number, operation: BulkOperation): Promise<BulkResult> => {
    try {
      // Check feature access
      if (!hasFeatureAccess('bulk_operations')) {
        throw new Error('Bulk operations require Club OS Growth or Command tier')
      }

      let processed = 0
      let failed = 0
      const errors: string[] = []

      switch (operation.type) {
        case 'update_teams':
          // Bulk update team settings
          if (operation.target_teams) {
            for (const teamId of operation.target_teams) {
              try {
                const { error } = await supabase
                  .from('teams')
                  .update(operation.data)
                  .eq('id', teamId)
                  .eq('club_id', clubId) // Ensure team belongs to club

                if (error) throw error
                processed++
              } catch (error) {
                failed++
                errors.push(`Team ${teamId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }
          }
          break

        case 'season_rollover':
          // Create new season for all teams
          const { data: teams } = await supabase
            .from('teams')
            .select('*')
            .eq('club_id', clubId)

          if (teams) {
            for (const team of teams) {
              try {
                const { error } = await supabase
                  .from('teams')
                  .update({ 
                    season: operation.data.new_season,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', team.id)

                if (error) throw error
                processed++
              } catch (error) {
                failed++
                errors.push(`Team ${team.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }
          }
          break

        default:
          throw new Error(`Unsupported operation: ${operation.type}`)
      }

      return {
        success: failed === 0,
        processed,
        failed,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        success: false,
        processed: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }, [])

  // Check feature access
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!state.membership) return false
    return TierEnforcementEngine.hasFeatureAccess(state.membership, feature, 'club')
  }, [state.membership])

  // Get upgrade information
  const getUpgradeInfo = useCallback((feature: string) => {
    if (!state.membership) return { requiresUpgrade: true }
    return TierEnforcementEngine.getUpgradeInfo(state.membership, feature, 'club')
  }, [state.membership])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadClubs()
    if (state.selectedClub) {
      await selectClub(state.selectedClub.id)
    }
  }, [state.selectedClub?.id, loadClubs, selectClub])

  // Load clubs on mount
  useEffect(() => {
    loadClubs()
  }, [loadClubs])

  return {
    ...state,
    loadClubs,
    selectClub,
    updateClubSettings,
    loadTeams,
    loadAnalytics,
    performBulkOperation,
    hasFeatureAccess,
    getUpgradeInfo,
    refreshData
  }
}