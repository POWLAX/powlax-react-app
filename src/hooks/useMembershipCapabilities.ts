/**
 * useMembershipCapabilities Hook
 * React hook for accessing membership capabilities and product information
 * Contract: membership-capability-002.yaml
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  getUserCapabilities, 
  hasCapability as checkCapability,
  getTeamOverview,
  type UserCapabilities,
  type Capability
} from '@/lib/membership/capability-engine'

/**
 * Hook for getting user's complete capability information
 */
export function useMembershipCapabilities(userId: string | null) {
  const [capabilities, setCapabilities] = useState<UserCapabilities | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCapabilities(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userCaps = await getUserCapabilities(userId)
      setCapabilities(userCaps)
    } catch (err) {
      console.error('Error fetching capabilities:', err)
      setError(err instanceof Error ? err.message : 'Failed to load capabilities')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    capabilities,
    loading,
    error,
    refresh,
    // Convenience getters
    hasAcademyAccess: capabilities?.academyTier !== 'none',
    hasFullAcademy: capabilities?.academyTier === 'full',
    hasBasicAcademy: capabilities?.academyTier === 'basic',
    hasCoachAccess: capabilities?.capabilities.includes('practice_planner'),
    hasTeamAccess: capabilities?.capabilities.includes('team_management'),
    teamLimits: capabilities?.teamLimits
  }
}

/**
 * Hook for checking specific capabilities
 */
export function useCapabilityCheck(userId: string | null, capability: Capability) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setHasAccess(false)
      return
    }

    let mounted = true
    setLoading(true)

    checkCapability(userId, capability)
      .then(result => {
        if (mounted) {
          setHasAccess(result)
        }
      })
      .catch(err => {
        console.error('Error checking capability:', err)
        if (mounted) {
          setHasAccess(false)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => { mounted = false }
  }, [userId, capability])

  return { hasAccess, loading }
}

/**
 * Hook for multiple capability checks
 */
export function useMultipleCapabilities(userId: string | null, capabilities: Capability[]) {
  const [results, setResults] = useState<Record<Capability, boolean>>({} as Record<Capability, boolean>)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || capabilities.length === 0) {
      setResults({} as Record<Capability, boolean>)
      return
    }

    let mounted = true
    setLoading(true)

    Promise.all(
      capabilities.map(async capability => ({
        capability,
        hasAccess: await checkCapability(userId, capability)
      }))
    )
      .then(checks => {
        if (mounted) {
          const newResults = {} as Record<Capability, boolean>
          checks.forEach(({ capability, hasAccess }) => {
            newResults[capability] = hasAccess
          })
          setResults(newResults)
        }
      })
      .catch(err => {
        console.error('Error checking capabilities:', err)
        if (mounted) {
          setResults({} as Record<Capability, boolean>)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => { mounted = false }
  }, [userId, capabilities.join(',')])

  return { results, loading }
}

/**
 * Hook for team overview data
 */
export function useTeamOverview(teamId: number | null) {
  const [teamData, setTeamData] = useState<Awaited<ReturnType<typeof getTeamOverview>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!teamId) {
      setTeamData(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const overview = await getTeamOverview(teamId)
      setTeamData(overview)
    } catch (err) {
      console.error('Error fetching team overview:', err)
      setError(err instanceof Error ? err.message : 'Failed to load team data')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    teamData,
    loading,
    error,
    refresh,
    // Convenience getters
    hasOpenSlots: (teamData?.availableSlots || 0) > 0,
    isAtLimit: (teamData?.availableSlots || 0) === 0,
    playerCount: teamData?.currentPlayers || 0,
    playerLimit: teamData?.playerLimit || 0
  }
}

/**
 * Hook for academy access level
 */
export function useAcademyAccess(userId: string | null) {
  const { capabilities, loading, error } = useMembershipCapabilities(userId)

  return {
    academyTier: capabilities?.academyTier || 'none',
    hasAnyAccess: (capabilities?.academyTier || 'none') !== 'none',
    hasFullAccess: capabilities?.academyTier === 'full',
    hasBasicAccess: capabilities?.academyTier === 'basic' || capabilities?.academyTier === 'full',
    hasLimitedAccess: capabilities?.academyTier !== 'none',
    loading,
    error
  }
}

/**
 * Hook for coach feature access
 */
export function useCoachAccess(userId: string | null) {
  const { capabilities, loading, error } = useMembershipCapabilities(userId)

  const coachCapabilities = capabilities?.capabilities.filter(cap => 
    ['practice_planner', 'resources', 'custom_content', 'training'].includes(cap)
  ) || []

  return {
    hasPracticePlanner: capabilities?.capabilities.includes('practice_planner') || false,
    hasResources: capabilities?.capabilities.includes('resources') || false,
    hasCustomContent: capabilities?.capabilities.includes('custom_content') || false,
    hasTraining: capabilities?.capabilities.includes('training') || false,
    hasAnyCoachAccess: coachCapabilities.length > 0,
    coachCapabilities,
    loading,
    error
  }
}

/**
 * Hook for team management access
 */
export function useTeamAccess(userId: string | null) {
  const { capabilities, loading, error } = useMembershipCapabilities(userId)

  const teamCapabilities = capabilities?.capabilities.filter(cap => 
    ['team_management', 'roster', 'playbook', 'analytics'].includes(cap)
  ) || []

  return {
    hasTeamManagement: capabilities?.capabilities.includes('team_management') || false,
    hasRoster: capabilities?.capabilities.includes('roster') || false,
    hasPlaybook: capabilities?.capabilities.includes('playbook') || false,
    hasAnalytics: capabilities?.capabilities.includes('analytics') || false,
    hasAnyTeamAccess: teamCapabilities.length > 0,
    teamCapabilities,
    teamLimits: capabilities?.teamLimits,
    loading,
    error
  }
}

/**
 * Utility function to get capability display name
 */
export function getCapabilityDisplayName(capability: Capability): string {
  const displayNames: Record<Capability, string> = {
    // Academy
    full_academy: 'Full Academy Access',
    basic_academy: 'Basic Academy Access',
    limited_drills: 'Limited Academy Access',
    drills: 'Drill Access',
    workouts: 'Workout Access',
    
    // Coach
    practice_planner: 'Practice Planner',
    resources: 'Coaching Resources',
    custom_content: 'Custom Content',
    training: 'Training Materials',
    
    // Team
    team_management: 'Team Management',
    roster: 'Roster Management',
    playbook: 'Team Playbook',
    analytics: 'Team Analytics',
    
    // Basic
    platform_access: 'Platform Access'
  }

  return displayNames[capability] || capability
}

/**
 * Utility function to get product tier color
 */
export function getProductTierColor(academyTier: string): string {
  switch (academyTier) {
    case 'full':
      return 'text-green-600 bg-green-50'
    case 'basic':
      return 'text-blue-600 bg-blue-50'
    case 'limited':
      return 'text-yellow-600 bg-yellow-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}