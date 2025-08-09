import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Point type definitions for POWLAX gamification system
export interface UserPointsBalance {
  user_id: string
  lax_credits: number      // Universal currency
  attack_tokens: number    // Attack position-specific
  defense_dollars: number  // Defense position-specific
  midfield_medals: number  // Midfield position-specific
  rebound_rewards: number  // Goalie/ground ball specific
  flex_points: number      // Multi-position/utility points
  created_at: string
  updated_at: string
}

export interface PointsBreakdown {
  basePoints: number
  bonusPoints: number
  totalPoints: number
  breakdown: {
    lax_credits: number
    attack_tokens: number
    defense_dollars: number
    midfield_medals: number
    rebound_rewards: number
    flex_points: number
  }
}

export interface WorkoutPointsConfig {
  basePointsPerDrill: number
  perfectDrillBonus: number
  completionBonus: number
  streakMultiplier: number
  seriesTypeMultipliers: {
    solid_start: number
    attack: number
    midfield: number
    defense: number
  }
}

const DEFAULT_POINTS_CONFIG: WorkoutPointsConfig = {
  basePointsPerDrill: 10,
  perfectDrillBonus: 5,
  completionBonus: 20,
  streakMultiplier: 1.1, // 10% bonus per streak day
  seriesTypeMultipliers: {
    solid_start: 1.0,
    attack: 1.2,
    midfield: 1.15,
    defense: 1.1
  }
}

export function usePointsCalculation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate points for a completed workout
  const calculateWorkoutPoints = (
    totalDrills: number,
    perfectDrills: number,
    isCompleted: boolean,
    seriesType: 'solid_start' | 'attack' | 'midfield' | 'defense' = 'solid_start',
    currentStreak: number = 1,
    config: WorkoutPointsConfig = DEFAULT_POINTS_CONFIG
  ): PointsBreakdown => {
    // Base points calculation
    const basePoints = totalDrills * config.basePointsPerDrill

    // Bonus points calculation
    let bonusPoints = 0
    bonusPoints += perfectDrills * config.perfectDrillBonus // Perfect drill bonus
    if (isCompleted) bonusPoints += config.completionBonus // Completion bonus

    // Series type multiplier
    const seriesMultiplier = config.seriesTypeMultipliers[seriesType]
    const seriesAdjustedPoints = (basePoints + bonusPoints) * seriesMultiplier

    // Streak multiplier (capped at 50% bonus for very long streaks)
    const streakMultiplier = Math.min(
      Math.pow(config.streakMultiplier, Math.min(currentStreak - 1, 5)), 
      1.5
    )

    const totalPoints = Math.floor(seriesAdjustedPoints * streakMultiplier)

    // Distribute points across the 6 types
    const baseDistribution = Math.floor(totalPoints / 6)
    const remainder = totalPoints % 6

    const breakdown = {
      lax_credits: baseDistribution + (remainder > 0 ? 1 : 0),       // Always gets extra
      attack_tokens: baseDistribution + (remainder > 1 ? 1 : 0),     // Attack focus
      defense_dollars: baseDistribution + (remainder > 2 ? 1 : 0),   // Defense focus
      midfield_medals: baseDistribution + (remainder > 3 ? 1 : 0),   // Midfield focus
      rebound_rewards: baseDistribution + (remainder > 4 ? 1 : 0),   // Goalie/ground balls
      flex_points: baseDistribution + (remainder > 5 ? 1 : 0)        // Utility
    }

    // Adjust distribution based on series type (give more to relevant category)
    const typeBonus = Math.floor(totalPoints * 0.1) // 10% bonus to relevant type
    
    switch (seriesType) {
      case 'attack':
        breakdown.attack_tokens += typeBonus
        breakdown.lax_credits -= Math.floor(typeBonus / 2)
        break
      case 'defense':
        breakdown.defense_dollars += typeBonus
        breakdown.lax_credits -= Math.floor(typeBonus / 2)
        break
      case 'midfield':
        breakdown.midfield_medals += typeBonus
        breakdown.lax_credits -= Math.floor(typeBonus / 2)
        break
      case 'solid_start':
      default:
        // Solid start gets bonus flex points (beginner friendly)
        breakdown.flex_points += Math.floor(typeBonus / 2)
        break
    }

    return {
      basePoints,
      bonusPoints: totalPoints - basePoints,
      totalPoints,
      breakdown
    }
  }

  // Fetch current user points balance
  const fetchUserPoints = async (userId: string): Promise<UserPointsBalance | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('user_points_balance_powlax')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // Return default balance if no record exists
      if (!data) {
        return {
          user_id: userId,
          lax_credits: 0,
          attack_tokens: 0,
          defense_dollars: 0,
          midfield_medals: 0,
          rebound_rewards: 0,
          flex_points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user points'
      setError(errorMessage)
      console.error('Points fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update user points balance (used by progress API)
  const updateUserPoints = async (
    userId: string, 
    pointsBreakdown: PointsBreakdown['breakdown'],
    isAdditive: boolean = true
  ): Promise<UserPointsBalance | null> => {
    setLoading(true)
    setError(null)

    try {
      // Get current balance
      const currentBalance = await fetchUserPoints(userId)
      if (!currentBalance) return null

      // Calculate new balance
      const newBalance: UserPointsBalance = {
        user_id: userId,
        lax_credits: isAdditive 
          ? currentBalance.lax_credits + pointsBreakdown.lax_credits
          : pointsBreakdown.lax_credits,
        attack_tokens: isAdditive
          ? currentBalance.attack_tokens + pointsBreakdown.attack_tokens
          : pointsBreakdown.attack_tokens,
        defense_dollars: isAdditive
          ? currentBalance.defense_dollars + pointsBreakdown.defense_dollars
          : pointsBreakdown.defense_dollars,
        midfield_medals: isAdditive
          ? currentBalance.midfield_medals + pointsBreakdown.midfield_medals
          : pointsBreakdown.midfield_medals,
        rebound_rewards: isAdditive
          ? currentBalance.rebound_rewards + pointsBreakdown.rebound_rewards
          : pointsBreakdown.rebound_rewards,
        flex_points: isAdditive
          ? currentBalance.flex_points + pointsBreakdown.flex_points
          : pointsBreakdown.flex_points,
        created_at: currentBalance.created_at,
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('user_points_balance_powlax')
        .upsert(newBalance, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user points'
      setError(errorMessage)
      console.error('Points update error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get user's current streak for bonus calculation
  const getUserStreak = async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase
        .from('skills_academy_user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single()

      return data?.current_streak || 1
    } catch {
      return 1 // Default to 1 if no streak found
    }
  }

  // Calculate total points across all types
  const calculateTotalPoints = (balance: UserPointsBalance): number => {
    return balance.lax_credits + 
           balance.attack_tokens + 
           balance.defense_dollars + 
           balance.midfield_medals + 
           balance.rebound_rewards + 
           balance.flex_points
  }

  // Get points for specific achievement types
  const getAchievementPoints = (achievementType: string): PointsBreakdown => {
    const achievementMap: Record<string, { base: number, type?: keyof PointsBreakdown['breakdown'] }> = {
      'first_workout': { base: 50 },
      'perfect_workout': { base: 100 },
      'week_streak': { base: 150 },
      'month_streak': { base: 500 },
      'series_complete': { base: 200 },
      'drill_master': { base: 75, type: 'flex_points' }
    }

    const config = achievementMap[achievementType] || { base: 10 }
    
    return calculateWorkoutPoints(
      1, // Single achievement
      0, // No perfect drills for achievements
      true, // Always completed
      'solid_start',
      1,
      { ...DEFAULT_POINTS_CONFIG, basePointsPerDrill: config.base }
    )
  }

  return {
    loading,
    error,
    calculateWorkoutPoints,
    fetchUserPoints,
    updateUserPoints,
    getUserStreak,
    calculateTotalPoints,
    getAchievementPoints,
    DEFAULT_POINTS_CONFIG
  }
}

// Hook for real-time points tracking during workout
export function useWorkoutPointsTracker(
  userId: string,
  workoutId: number,
  seriesType: 'solid_start' | 'attack' | 'midfield' | 'defense'
) {
  const [currentPoints, setCurrentPoints] = useState(0)
  const [perfectDrillsCount, setPerfectDrillsCount] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(1)
  
  const { calculateWorkoutPoints, getUserStreak, loading } = usePointsCalculation()

  // Initialize streak on mount
  useEffect(() => {
    getUserStreak(userId).then(setCurrentStreak)
  }, [userId, getUserStreak])

  const addDrillPoints = (isPerfect: boolean = false) => {
    const drillPoints = DEFAULT_POINTS_CONFIG.basePointsPerDrill
    const bonus = isPerfect ? DEFAULT_POINTS_CONFIG.perfectDrillBonus : 0
    
    setCurrentPoints(prev => prev + drillPoints + bonus)
    
    if (isPerfect) {
      setPerfectDrillsCount(prev => prev + 1)
    }
  }

  const calculateFinalPoints = (totalDrills: number, isCompleted: boolean): PointsBreakdown => {
    return calculateWorkoutPoints(
      totalDrills,
      perfectDrillsCount,
      isCompleted,
      seriesType,
      currentStreak
    )
  }

  const resetPoints = () => {
    setCurrentPoints(0)
    setPerfectDrillsCount(0)
  }

  return {
    loading,
    currentPoints,
    perfectDrillsCount,
    currentStreak,
    addDrillPoints,
    calculateFinalPoints,
    resetPoints
  }
}