// Streak management service for POWLAX gamification
// Phase 1: Anti-Gaming Foundation

import { SupabaseClient } from '@supabase/supabase-js'

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_freeze_count: number
  last_freeze_used: string | null
  total_workouts_completed: number
  streak_milestone_reached: number
}

export interface StreakUpdateResult {
  current_streak: number
  longest_streak: number
  milestone_reached?: number
  freezes_remaining: number
  already_today: boolean
  streak_title: string
}

/**
 * Update user's workout streak
 * This calls the database function which handles all streak logic
 */
export async function updateUserStreak(userId: string, supabase: SupabaseClient): Promise<StreakUpdateResult> {
  
  try {
    // Call the database function to update streak
    const { data, error } = await supabase.rpc('update_user_streak', {
      user_uuid: userId
    })
    
    if (error) {
      console.error('Error updating user streak:', error)
      throw new Error(`Failed to update streak: ${error.message}`)
    }
    
    // Add streak title based on current streak
    const result: StreakUpdateResult = {
      ...data,
      streak_title: getStreakTitle(data.current_streak)
    }
    
    // If milestone reached, award bonus points
    if (result.milestone_reached) {
      await awardMilestoneBonus(userId, result.milestone_reached, supabase)
    }
    
    return result
    
  } catch (error) {
    console.error('Error in updateUserStreak:', error)
    throw error
  }
}

/**
 * Get current streak data for a user
 */
export async function getUserStreakData(userId: string, supabase: SupabaseClient): Promise<StreakData> {
  
  const { data, error } = await supabase
    .from('user_streak_data')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No record found, create one
      return await createUserStreakData(userId, supabase)
    }
    throw new Error(`Failed to get streak data: ${error.message}`)
  }
  
  return data
}

/**
 * Create initial streak data for a user
 */
async function createUserStreakData(userId: string, supabase: SupabaseClient): Promise<StreakData> {
  
  const { data, error } = await supabase
    .from('user_streak_data')
    .insert({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      streak_freeze_count: 2,
      total_workouts_completed: 0,
      streak_milestone_reached: 0
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create streak data: ${error.message}`)
  }
  
  return data
}

/**
 * Get streak title based on streak length
 */
export function getStreakTitle(streak: number): string {
  if (streak >= 100) return 'Century Club 💯'
  if (streak >= 30) return 'Monthly Master 🏆'
  if (streak >= 14) return 'Two Week Warrior ⚔️'
  if (streak >= 7) return 'Weekly Warrior 🔥'
  if (streak >= 3) return 'Building Momentum 📈'
  if (streak >= 1) return 'Getting Started 🚀'
  return 'Ready to Begin 💪'
}

/**
 * Get streak milestone bonus points
 */
function getMilestoneBonus(milestone: number): number {
  switch (milestone) {
    case 7: return 100    // Week bonus
    case 30: return 500   // Month bonus
    case 100: return 2000 // Century bonus
    default: return 0
  }
}

/**
 * Award milestone bonus points
 */
async function awardMilestoneBonus(userId: string, milestone: number, supabase: SupabaseClient): Promise<void> {
  const bonusPoints = getMilestoneBonus(milestone)
  if (bonusPoints === 0) return
  
  // Award Lax Credits for milestone
  const { error } = await supabase.rpc('award_points', {
    user_uuid: userId,
    point_type: 'lax_credit',
    amount: bonusPoints,
    source_type: 'streak_milestone',
    description: `${milestone}-day streak milestone bonus`
  })
  
  if (error) {
    console.error('Error awarding milestone bonus:', error)
  }
}

/**
 * Check if user can use a streak freeze
 */
export function canUseStreakFreeze(
  streakData: StreakData, 
  daysMissed: number
): boolean {
  // Can use freeze if:
  // 1. Has freezes remaining
  // 2. Missed 3 days or less
  // 3. Haven't used freeze in last 7 days
  
  if (streakData.streak_freeze_count <= 0) return false
  if (daysMissed > 3) return false
  
  if (streakData.last_freeze_used) {
    const lastFreezeDate = new Date(streakData.last_freeze_used)
    const daysSinceFreeze = Math.floor(
      (Date.now() - lastFreezeDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceFreeze < 7) return false
  }
  
  return true
}

/**
 * Get streak statistics for a user
 */
export async function getStreakStats(userId: string, supabase: SupabaseClient) {
  
  const { data, error } = await supabase
    .from('user_streak_view')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error getting streak stats:', error)
    return null
  }
  
  return {
    ...data,
    streak_title: getStreakTitle(data.current_streak),
    milestone_progress: getMilestoneProgress(data.current_streak),
    freeze_status: {
      remaining: data.streak_freeze_count,
      can_use: canUseStreakFreeze(data, 1), // Check if can use for 1-day miss
      next_available: data.last_freeze_used ? 
        new Date(Date.parse(data.last_freeze_used) + 7 * 24 * 60 * 60 * 1000) : 
        null
    }
  }
}

/**
 * Get progress toward next milestone
 */
function getMilestoneProgress(currentStreak: number) {
  const milestones = [7, 14, 30, 100]
  const nextMilestone = milestones.find(m => m > currentStreak)
  
  if (!nextMilestone) {
    return {
      next: null,
      progress: 100,
      remaining: 0
    }
  }
  
  const previous = milestones[milestones.indexOf(nextMilestone) - 1] || 0
  const progress = Math.round(((currentStreak - previous) / (nextMilestone - previous)) * 100)
  
  return {
    next: nextMilestone,
    progress: Math.max(0, progress),
    remaining: nextMilestone - currentStreak
  }
}

/**
 * Reset streak (admin function)
 */
export async function resetUserStreak(userId: string, supabase: SupabaseClient): Promise<void> {
  
  const { error } = await supabase
    .from('user_streak_data')
    .update({
      current_streak: 0,
      last_activity_date: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to reset streak: ${error.message}`)
  }
}