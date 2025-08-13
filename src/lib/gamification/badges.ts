// Badge system for POWLAX Skills Academy
// Manages badge definitions, eligibility checking, and awarding

import { supabase } from '@/lib/supabase'

export interface BadgeDefinition {
  id: number
  badge_key: string
  name: string
  description: string
  category: 'workout_completion' | 'points' | 'streaks' | 'specialist' | 'special'
  requirement_type: 'count' | 'points' | 'streak' | 'achievement'
  requirement_value: number
  requirement_context: string
  icon_url: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_award: number
  is_active: boolean
  sort_order: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: number
  user_id: string
  badge_key: string
  badge_name: string
  awarded_at: string
  source: string
}

export interface BadgeEligibility {
  badge_key: string
  badge_name: string
  description: string
  points_award: number
  requirement_met: boolean
  progress?: {
    current: number
    required: number
    percentage: number
  }
}

/**
 * Get all badge definitions
 */
export async function getBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const { data, error } = await supabase
    .from('badge_definitions_powlax')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching badge definitions:', error)
    return []
  }

  return data || []
}

/**
 * Get badges for a specific user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })

  if (error) {
    console.error('Error fetching user badges:', error)
    return []
  }

  return data || []
}

/**
 * Check badge eligibility for a user
 */
export async function checkBadgeEligibility(userId: string): Promise<BadgeEligibility[]> {
  // Get user's current stats
  const [userStats, definitions, userBadges] = await Promise.all([
    getUserStats(userId),
    getBadgeDefinitions(),
    getUserBadges(userId)
  ])

  const earnedBadgeKeys = new Set(userBadges.map(b => b.badge_key))
  const eligibleBadges: BadgeEligibility[] = []

  for (const badge of definitions) {
    // Skip if already earned
    if (earnedBadgeKeys.has(badge.badge_key)) {
      continue
    }

    const eligibility = checkSingleBadgeEligibility(badge, userStats)
    eligibleBadges.push(eligibility)
  }

  return eligibleBadges
}

/**
 * Check eligibility for a single badge
 */
function checkSingleBadgeEligibility(
  badge: BadgeDefinition, 
  userStats: UserStats
): BadgeEligibility {
  let requirement_met = false
  let progress: BadgeEligibility['progress'] | undefined

  switch (badge.requirement_type) {
    case 'points':
      if (badge.requirement_context === 'academy_points') {
        requirement_met = userStats.totalPoints >= badge.requirement_value
        progress = {
          current: userStats.totalPoints,
          required: badge.requirement_value,
          percentage: Math.min(100, (userStats.totalPoints / badge.requirement_value) * 100)
        }
      }
      break

    case 'count':
      if (badge.requirement_context === 'workouts') {
        requirement_met = userStats.workoutCount >= badge.requirement_value
        progress = {
          current: userStats.workoutCount,
          required: badge.requirement_value,
          percentage: Math.min(100, (userStats.workoutCount / badge.requirement_value) * 100)
        }
      } else if (badge.requirement_context.includes('_workouts')) {
        const categoryCount = userStats.categoryWorkouts[badge.requirement_context] || 0
        requirement_met = categoryCount >= badge.requirement_value
        progress = {
          current: categoryCount,
          required: badge.requirement_value,
          percentage: Math.min(100, (categoryCount / badge.requirement_value) * 100)
        }
      }
      break

    case 'streak':
      if (badge.requirement_context === 'daily_workouts') {
        requirement_met = userStats.currentStreak >= badge.requirement_value
        progress = {
          current: userStats.currentStreak,
          required: badge.requirement_value,
          percentage: Math.min(100, (userStats.currentStreak / badge.requirement_value) * 100)
        }
      }
      break

    case 'achievement':
      // Special achievements require custom logic
      requirement_met = checkSpecialAchievement(badge, userStats)
      break
  }

  return {
    badge_key: badge.badge_key,
    badge_name: badge.name,
    description: badge.description,
    points_award: badge.points_award,
    requirement_met,
    progress
  }
}

/**
 * Check special achievement requirements
 */
function checkSpecialAchievement(badge: BadgeDefinition, userStats: UserStats): boolean {
  switch (badge.requirement_context) {
    case 'perfect_week':
      // Check if user completed 7 workouts in 7 consecutive days
      return userStats.maxWeeklyWorkouts >= 7
    case 'early_morning':
      return userStats.earlyMorningWorkouts >= badge.requirement_value
    case 'late_evening':
      return userStats.lateEveningWorkouts >= badge.requirement_value
    default:
      return false
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(userId: string, badgeKey: string): Promise<boolean> {
  try {
    // Use the RPC function from the migration
    const { data, error } = await supabase.rpc('award_badge', {
      p_user_id: userId,
      p_badge_key: badgeKey
    })

    if (error) {
      console.error('Error awarding badge:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error awarding badge:', error)
    return false
  }
}

/**
 * Check and award all eligible badges for a user
 */
export async function checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
  const eligibleBadges = await checkBadgeEligibility(userId)
  const newBadges: UserBadge[] = []

  for (const eligible of eligibleBadges) {
    if (eligible.requirement_met) {
      const success = await awardBadge(userId, eligible.badge_key)
      if (success) {
        // Get the newly awarded badge
        const { data } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_key', eligible.badge_key)
          .single()

        if (data) {
          newBadges.push(data)
        }
      }
    }
  }

  return newBadges
}

/**
 * Get user statistics for badge calculations
 */
interface UserStats {
  totalPoints: number
  workoutCount: number
  currentStreak: number
  maxWeeklyWorkouts: number
  earlyMorningWorkouts: number
  lateEveningWorkouts: number
  categoryWorkouts: Record<string, number>
}

async function getUserStats(userId: string): Promise<UserStats> {
  // Get points from wallet
  const { data: wallet } = await supabase
    .from('user_points_wallets')
    .select('balance')
    .eq('user_id', userId)
    .eq('currency', 'academy_points')
    .single()

  // Get workout completions
  const { data: progress } = await supabase
    .from('skills_academy_user_progress')
    .select('*')
    .eq('user_id', userId)

  // Calculate category-specific workout counts
  const categoryWorkouts: Record<string, number> = {
    attack_workouts: 0,
    defense_workouts: 0,
    midfield_workouts: 0,
    wall_ball_workouts: 0
  }

  // This would need more sophisticated querying based on workout series
  // For now, use basic counts from progress table
  const workoutCount = progress?.length || 0

  return {
    totalPoints: wallet?.balance || 0,
    workoutCount,
    currentStreak: 0, // Would need streak calculation
    maxWeeklyWorkouts: 0, // Would need weekly analysis
    earlyMorningWorkouts: 0, // Would need time-based analysis
    lateEveningWorkouts: 0, // Would need time-based analysis
    categoryWorkouts
  }
}

/**
 * Calculate user rank based on points
 */
export async function calculateUserRank(points: number): Promise<{
  rank_title: string
  rank_order: number
  points_needed: number
} | null> {
  const { data, error } = await supabase.rpc('calculate_user_rank', {
    p_user_id: null // Function will use points parameter when user_id is null
  })

  if (error) {
    console.error('Error calculating rank:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Get rank by points (helper function)
 */
export function getRankByPoints(points: number): {
  title: string
  min_points: number
  max_points: number | null
} {
  const ranks = [
    { title: 'Rookie', min_points: 0, max_points: 99 },
    { title: 'Junior Varsity', min_points: 100, max_points: 499 },
    { title: 'Varsity', min_points: 500, max_points: 999 },
    { title: 'All-Conference', min_points: 1000, max_points: 2499 },
    { title: 'All-State', min_points: 2500, max_points: 4999 },
    { title: 'All-American', min_points: 5000, max_points: 9999 },
    { title: 'Elite', min_points: 10000, max_points: 24999 },
    { title: 'Legend', min_points: 25000, max_points: 49999 },
    { title: 'Hall of Fame', min_points: 50000, max_points: 99999 },
    { title: 'GOAT', min_points: 100000, max_points: null }
  ]

  for (let i = ranks.length - 1; i >= 0; i--) {
    const rank = ranks[i]
    if (points >= rank.min_points) {
      return rank
    }
  }

  return ranks[0] // Default to Rookie
}

/**
 * Get badge by category for display
 */
export function groupBadgesByCategory(badges: BadgeDefinition[]): Record<string, BadgeDefinition[]> {
  return badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = []
    }
    acc[badge.category].push(badge)
    return acc
  }, {} as Record<string, BadgeDefinition[]>)
}

/**
 * Get rarity color for badges
 */
export function getRarityColor(rarity: BadgeDefinition['rarity']): string {
  const colors = {
    common: '#6B7280', // Gray
    rare: '#3B82F6', // Blue  
    epic: '#8B5CF6', // Purple
    legendary: '#F59E0B' // Amber
  }
  return colors[rarity]
}

/**
 * Format badge progress as percentage
 */
export function formatBadgeProgress(progress?: BadgeEligibility['progress']): string {
  if (!progress) return ''
  return `${progress.current}/${progress.required} (${Math.round(progress.percentage)}%)`
}