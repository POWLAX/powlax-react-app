// React hook for user gamification data
// Provides badges, ranks, and progress tracking for Skills Academy

'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  getUserBadges, 
  checkBadgeEligibility, 
  checkAndAwardBadges,
  getBadgeDefinitions,
  type UserBadge,
  type BadgeDefinition,
  type BadgeEligibility
} from '@/lib/gamification/badges'
import { 
  getUserRankInfo, 
  getRankDefinitions,
  updateUserRank,
  checkForRankUp,
  type UserRankInfo,
  type PlayerRank
} from '@/lib/gamification/ranks'

interface GamificationState {
  // Badges
  userBadges: UserBadge[]
  badgeDefinitions: BadgeDefinition[]
  badgeEligibility: BadgeEligibility[]
  
  // Ranks
  userRankInfo: UserRankInfo | null
  rankDefinitions: PlayerRank[]
  
  // Status
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface GamificationActions {
  refreshData: () => Promise<void>
  checkAndAwardEligibleBadges: () => Promise<UserBadge[]>
  updateRank: () => Promise<boolean>
  checkRankUp: (newPoints: number) => Promise<{ ranked_up: boolean; old_rank?: PlayerRank; new_rank?: PlayerRank }>
}

export function useUserGamification(userId: string | null): GamificationState & GamificationActions {
  const [state, setState] = useState<GamificationState>({
    userBadges: [],
    badgeDefinitions: [],
    badgeEligibility: [],
    userRankInfo: null,
    rankDefinitions: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  // Load initial data
  const loadData = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Load all data in parallel
      const [
        userBadges,
        badgeDefinitions,
        badgeEligibility,
        userRankInfo,
        rankDefinitions
      ] = await Promise.all([
        getUserBadges(userId),
        getBadgeDefinitions(),
        checkBadgeEligibility(userId),
        getUserRankInfo(userId),
        getRankDefinitions()
      ])

      setState(prev => ({
        ...prev,
        userBadges,
        badgeDefinitions,
        badgeEligibility,
        userRankInfo,
        rankDefinitions,
        isLoading: false,
        lastUpdated: new Date()
      }))
    } catch (error) {
      console.error('Error loading gamification data:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to load gamification data',
        isLoading: false
      }))
    }
  }, [userId])

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData()
  }, [loadData])

  // Check and award eligible badges
  const checkAndAwardEligibleBadges = useCallback(async (): Promise<UserBadge[]> => {
    if (!userId) return []

    try {
      const newBadges = await checkAndAwardBadges(userId)
      
      if (newBadges.length > 0) {
        // Refresh user badges and eligibility
        const [updatedUserBadges, updatedEligibility] = await Promise.all([
          getUserBadges(userId),
          checkBadgeEligibility(userId)
        ])

        setState(prev => ({
          ...prev,
          userBadges: updatedUserBadges,
          badgeEligibility: updatedEligibility,
          lastUpdated: new Date()
        }))
      }

      return newBadges
    } catch (error) {
      console.error('Error checking and awarding badges:', error)
      return []
    }
  }, [userId])

  // Update user rank
  const updateRank = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    try {
      const success = await updateUserRank(userId)
      
      if (success) {
        // Refresh rank info
        const updatedRankInfo = await getUserRankInfo(userId)
        setState(prev => ({
          ...prev,
          userRankInfo: updatedRankInfo,
          lastUpdated: new Date()
        }))
      }

      return success
    } catch (error) {
      console.error('Error updating rank:', error)
      return false
    }
  }, [userId])

  // Check for rank up
  const checkRankUp = useCallback(async (newPoints: number) => {
    if (!userId) return { ranked_up: false }

    try {
      return await checkForRankUp(userId, newPoints)
    } catch (error) {
      console.error('Error checking rank up:', error)
      return { ranked_up: false }
    }
  }, [userId])

  // Load data on mount and when userId changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Listen for real-time updates to user badges and points
  useEffect(() => {
    if (!userId) return

    const badgesChannel = supabase
      .channel('user_badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh badges when user badges change
          refreshData()
        }
      )
      .subscribe()

    const pointsChannel = supabase
      .channel('user_points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points_wallets',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh rank info when points change
          refreshData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(badgesChannel)
      supabase.removeChannel(pointsChannel)
    }
  }, [userId, refreshData])

  return {
    ...state,
    refreshData,
    checkAndAwardEligibleBadges,
    updateRank,
    checkRankUp
  }
}

// Helper hook for checking eligibility of specific badges
export function useBadgeEligibility(userId: string | null, badgeKeys: string[]) {
  const [eligibility, setEligibility] = useState<Record<string, BadgeEligibility>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId || badgeKeys.length === 0) {
      setIsLoading(false)
      return
    }

    const checkEligibility = async () => {
      setIsLoading(true)
      try {
        const allEligibility = await checkBadgeEligibility(userId)
        const filteredEligibility = allEligibility
          .filter(e => badgeKeys.includes(e.badge_key))
          .reduce((acc, e) => {
            acc[e.badge_key] = e
            return acc
          }, {} as Record<string, BadgeEligibility>)

        setEligibility(filteredEligibility)
      } catch (error) {
        console.error('Error checking badge eligibility:', error)
      }
      setIsLoading(false)
    }

    checkEligibility()
  }, [userId, badgeKeys])

  return { eligibility, isLoading }
}

// Helper hook for rank progress visualization
export function useRankProgress(userId: string | null) {
  const { userRankInfo, isLoading } = useUserGamification(userId)

  const progress = userRankInfo ? {
    current_rank: userRankInfo.rank_title,
    current_points: userRankInfo.total_points,
    next_rank: userRankInfo.next_rank?.title || 'Max Rank',
    points_needed: userRankInfo.points_needed_for_next,
    progress_percentage: userRankInfo.progress_percentage,
    is_max_rank: !userRankInfo.next_rank
  } : null

  return { progress, isLoading }
}

// Helper hook for badge progress tracking
export function useBadgeProgress(userId: string | null, category?: string) {
  const { badgeEligibility, isLoading } = useUserGamification(userId)

  const filteredBadges = category 
    ? badgeEligibility.filter(b => 
        // Need to get badge definition to check category
        // This is a simplified version - in practice you'd join with definitions
        true
      )
    : badgeEligibility

  const earnedCount = filteredBadges.filter(b => b.requirement_met).length
  const totalCount = filteredBadges.length
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

  return {
    badges: filteredBadges,
    earnedCount,
    totalCount,
    progressPercentage: Math.round(progressPercentage),
    isLoading
  }
}