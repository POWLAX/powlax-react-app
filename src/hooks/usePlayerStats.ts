'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PlayerStats {
  // Points data
  totalPoints: number
  pointsByType: {
    lax_credit: number
    attack_token: number
    defense_dollar: number
    midfield_medal: number
    rebound_reward: number
    flex_points: number
  }
  
  // Rank data
  currentRank: {
    title: string
    level: number
    lax_credits_required: number
    description?: string
    next_rank?: {
      title: string
      lax_credits_required: number
    }
    progress_percentage: number
    points_to_next: number
  } | null
  
  // Badges data
  badges: {
    id: string
    badge_key: string
    badge_name: string
    awarded_at: string
    source: string
  }[]
  
  // Skills Academy progress
  skillsProgress: {
    total_workouts_completed: number
    total_points_earned: number
    completion_percentage: number
    recent_activity: {
      workout_id: number
      drill_id: number
      completed_at: string
      points_earned: number
    }[]
  }
  
  // WordPress integration
  wordpress_username?: string
}

interface UsePlayerStatsReturn {
  playerStats: PlayerStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

export function usePlayerStats(userId: string | null): UsePlayerStatsReturn {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayerStats = useCallback(async () => {
    if (!userId) {
      setPlayerStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel following SUPABASE_PERMANENCE_PATTERN
      const [
        pointsResponse,
        userResponse,
        badgesResponse,
        skillsProgressResponse,
        ranksResponse
      ] = await Promise.all([
        // 1. Get user points from user_points_wallets
        supabase
          .from('user_points_wallets')
          .select('currency, balance')
          .eq('user_id', userId),
        
        // 2. Get user data (including wordpress_username)
        supabase
          .from('users')
          .select('wordpress_username')
          .eq('id', userId)
          .single(),
        
        // 3. Get user badges
        supabase
          .from('user_badges')
          .select('id, badge_key, badge_name, awarded_at, source')
          .eq('user_id', userId)
          .order('awarded_at', { ascending: false }),
        
        // 4. Get skills academy progress
        supabase
          .from('skills_academy_user_progress')
          .select('workout_id, drill_id, points_earned, completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false }),
        
        // 5. Get rank definitions for calculation
        supabase
          .from('powlax_player_ranks')
          .select('*')
          .order('lax_credits_required', { ascending: true })
      ])

      // Handle potential errors
      if (pointsResponse.error) throw pointsResponse.error
      if (userResponse.error) throw userResponse.error
      if (badgesResponse.error) throw badgesResponse.error
      if (skillsProgressResponse.error) throw skillsProgressResponse.error
      if (ranksResponse.error) throw ranksResponse.error

      // Process points data - Direct column mapping (PERMANENCE PATTERN)
      const pointsData = pointsResponse.data || []
      const pointsByType = {
        lax_credit: 0,
        attack_token: 0,
        defense_dollar: 0,
        midfield_medal: 0,
        rebound_reward: 0,
        flex_points: 0
      }
      
      let totalPoints = 0
      pointsData.forEach(wallet => {
        const currency = wallet.currency as keyof typeof pointsByType
        const balance = wallet.balance || 0
        if (currency in pointsByType) {
          pointsByType[currency] = balance
          totalPoints += balance
        }
      })

      // Process rank data - Calculate current rank from total lax_credits
      const ranks = ranksResponse.data || []
      const laxCredits = pointsByType.lax_credit
      
      let currentRank = null
      if (ranks.length > 0) {
        // Find current rank (highest rank where user meets requirement)
        const userCurrentRank = ranks
          .filter(rank => laxCredits >= (rank.lax_credits_required || 0))
          .pop() // Get the highest eligible rank
        
        // Find next rank
        const nextRank = ranks.find(rank => 
          (rank.lax_credits_required || 0) > laxCredits
        )
        
        if (userCurrentRank) {
          const pointsToNext = nextRank 
            ? (nextRank.lax_credits_required || 0) - laxCredits 
            : 0
          
          const progressPercentage = nextRank
            ? ((laxCredits - (userCurrentRank.lax_credits_required || 0)) / 
               ((nextRank.lax_credits_required || 0) - (userCurrentRank.lax_credits_required || 0))) * 100
            : 100
          
          currentRank = {
            title: userCurrentRank.title || 'Unranked',
            level: userCurrentRank.rank_order || 0,
            lax_credits_required: userCurrentRank.lax_credits_required || 0,
            description: userCurrentRank.description,
            next_rank: nextRank ? {
              title: nextRank.title || '',
              lax_credits_required: nextRank.lax_credits_required || 0
            } : undefined,
            progress_percentage: Math.min(Math.max(progressPercentage, 0), 100),
            points_to_next: Math.max(pointsToNext, 0)
          }
        }
      }

      // Process badges - Direct mapping (PERMANENCE PATTERN)
      const badges = (badgesResponse.data || []).map(badge => ({
        id: badge.id,
        badge_key: badge.badge_key || '',
        badge_name: badge.badge_name || '',
        awarded_at: badge.awarded_at || '',
        source: badge.source || 'system'
      }))

      // Process skills progress - Aggregate and calculate
      const skillsData = skillsProgressResponse.data || []
      const skillsProgress = {
        total_workouts_completed: skillsData.length,
        total_points_earned: skillsData.reduce((sum, item) => sum + (item.points_earned || 0), 0),
        completion_percentage: 0, // Would need total available workouts to calculate
        recent_activity: skillsData.slice(0, 5).map(item => ({
          workout_id: item.workout_id || 0,
          drill_id: item.drill_id || 0,
          completed_at: item.completed_at || '',
          points_earned: item.points_earned || 0
        }))
      }

      // Combine all data - Direct assignment (PERMANENCE PATTERN)
      const stats: PlayerStats = {
        totalPoints,
        pointsByType,
        currentRank,
        badges,
        skillsProgress,
        wordpress_username: userResponse.data?.wordpress_username
      }

      setPlayerStats(stats)

    } catch (err: any) {
      console.error('Error fetching player stats:', err)
      setError(`Failed to load player statistics: ${err.message}`)
      setPlayerStats(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Refresh function for external use
  const refreshStats = useCallback(async () => {
    await fetchPlayerStats()
  }, [fetchPlayerStats])

  // Load data when userId changes
  useEffect(() => {
    fetchPlayerStats()
  }, [fetchPlayerStats])

  // Real-time subscriptions for data changes (following PERMANENCE PATTERN)
  useEffect(() => {
    if (!userId) return

    const pointsChannel = supabase
      .channel('player_points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points_wallets',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh stats when points change
          refreshStats()
        }
      )
      .subscribe()

    const badgesChannel = supabase
      .channel('player_badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh stats when badges change
          refreshStats()
        }
      )
      .subscribe()

    const skillsChannel = supabase
      .channel('player_skills_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skills_academy_user_progress',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Refresh stats when skills progress changes
          refreshStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(pointsChannel)
      supabase.removeChannel(badgesChannel)
      supabase.removeChannel(skillsChannel)
    }
  }, [userId, refreshStats])

  return {
    playerStats,
    loading,
    error,
    refreshStats
  }
}