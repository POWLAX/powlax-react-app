// Rank system for POWLAX Skills Academy
// Manages player ranks based on academy points

import { supabase } from '@/lib/supabase'

export interface PlayerRank {
  id: number
  title: string
  description: string
  icon_url: string
  rank_order: number
  lax_credits_required: number
  gender: string
  metadata: {
    color?: string
    min_points?: number
    max_points?: number | null
  }
  created_at: string
  updated_at: string
}

export interface UserRankInfo {
  rank_title: string
  rank_order: number
  points_needed_for_next: number
  total_points: number
  progress_percentage: number
  next_rank?: PlayerRank
}

/**
 * Get all rank definitions
 */
export async function getRankDefinitions(): Promise<PlayerRank[]> {
  const { data, error } = await supabase
    .from('powlax_player_ranks')
    .select('*')
    .order('rank_order')

  if (error) {
    console.error('Error fetching rank definitions:', error)
    return []
  }

  return data || []
}

/**
 * Get user's current rank information
 */
export async function getUserRankInfo(userId: string): Promise<UserRankInfo | null> {
  try {
    // Use the RPC function from migration
    const { data, error } = await supabase.rpc('get_user_gamification_status', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error getting user rank info:', error)
      return null
    }

    const result = data?.[0]
    if (!result) return null

    // Get next rank info
    const nextRank = await getNextRank(result.rank_order)

    // Calculate progress percentage
    const currentRankPoints = await getRankMinPoints(result.rank_order)
    const nextRankPoints = nextRank?.lax_credits_required || result.total_points
    const progressInCurrentRank = result.total_points - currentRankPoints
    const pointsNeededForCurrentRank = nextRankPoints - currentRankPoints
    const progress_percentage = pointsNeededForCurrentRank > 0 
      ? Math.min(100, (progressInCurrentRank / pointsNeededForCurrentRank) * 100)
      : 100

    return {
      rank_title: result.rank_title,
      rank_order: result.rank_order,
      points_needed_for_next: result.points_needed_for_next,
      total_points: result.total_points,
      progress_percentage: Math.round(progress_percentage),
      next_rank: nextRank
    }
  } catch (error) {
    console.error('Error getting user rank info:', error)
    return null
  }
}

/**
 * Get minimum points required for a specific rank
 */
async function getRankMinPoints(rankOrder: number): Promise<number> {
  const { data } = await supabase
    .from('powlax_player_ranks')
    .select('lax_credits_required')
    .eq('rank_order', rankOrder)
    .single()

  return data?.lax_credits_required || 0
}

/**
 * Get next rank after current rank order
 */
async function getNextRank(currentRankOrder: number): Promise<PlayerRank | null> {
  const { data, error } = await supabase
    .from('powlax_player_ranks')
    .select('*')
    .eq('rank_order', currentRankOrder + 1)
    .single()

  if (error) return null
  return data
}

/**
 * Calculate rank based on points (client-side calculation)
 */
export function calculateRankByPoints(points: number): {
  title: string
  rank_order: number
  min_points: number
  max_points: number | null
  color: string
} {
  const ranks = [
    { title: 'Rookie', rank_order: 1, min_points: 0, max_points: 99, color: '#8B4513' },
    { title: 'Junior Varsity', rank_order: 2, min_points: 100, max_points: 499, color: '#4682B4' },
    { title: 'Varsity', rank_order: 3, min_points: 500, max_points: 999, color: '#32CD32' },
    { title: 'All-Conference', rank_order: 4, min_points: 1000, max_points: 2499, color: '#FF6347' },
    { title: 'All-State', rank_order: 5, min_points: 2500, max_points: 4999, color: '#4169E1' },
    { title: 'All-American', rank_order: 6, min_points: 5000, max_points: 9999, color: '#8A2BE2' },
    { title: 'Elite', rank_order: 7, min_points: 10000, max_points: 24999, color: '#FFD700' },
    { title: 'Legend', rank_order: 8, min_points: 25000, max_points: 49999, color: '#FF4500' },
    { title: 'Hall of Fame', rank_order: 9, min_points: 50000, max_points: 99999, color: '#DC143C' },
    { title: 'GOAT', rank_order: 10, min_points: 100000, max_points: null, color: '#000000' }
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
 * Get rank progress information
 */
export function getRankProgress(
  currentPoints: number, 
  currentRank: PlayerRank,
  nextRank?: PlayerRank
): {
  current_rank_points: number
  next_rank_points: number
  points_in_current_rank: number
  points_needed: number
  percentage: number
} {
  const current_rank_points = currentRank.lax_credits_required
  const next_rank_points = nextRank?.lax_credits_required || currentPoints
  const points_in_current_rank = currentPoints - current_rank_points
  const points_needed = Math.max(0, next_rank_points - currentPoints)
  const rank_span = next_rank_points - current_rank_points
  const percentage = rank_span > 0 ? Math.min(100, (points_in_current_rank / rank_span) * 100) : 100

  return {
    current_rank_points,
    next_rank_points,
    points_in_current_rank,
    points_needed,
    percentage: Math.round(percentage)
  }
}

/**
 * Update user's rank based on their current points
 */
export async function updateUserRank(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('update_user_rank', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error updating user rank:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating user rank:', error)
    return false
  }
}

/**
 * Get leaderboard with rank information
 */
export async function getRankLeaderboard(limit: number = 50): Promise<Array<{
  user_id: string
  display_name: string
  total_points: number
  rank_title: string
  rank_order: number
  rank_color: string
}>> {
  const { data: leaderboardData, error } = await supabase
    .from('leaderboard')
    .select('user_id, display_name, total_points')
    .order('total_points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }

  // Enhance with rank information
  const enhancedLeaderboard = leaderboardData.map(user => {
    const rank = calculateRankByPoints(user.total_points)
    return {
      ...user,
      rank_title: rank.title,
      rank_order: rank.rank_order,
      rank_color: rank.color
    }
  })

  return enhancedLeaderboard
}

/**
 * Get rank distribution across all users
 */
export async function getRankDistribution(): Promise<Array<{
  rank_title: string
  rank_order: number
  user_count: number
  percentage: number
}>> {
  const { data: leaderboardData, error } = await supabase
    .from('leaderboard')
    .select('total_points')

  if (error) {
    console.error('Error fetching rank distribution:', error)
    return []
  }

  const totalUsers = leaderboardData.length
  if (totalUsers === 0) return []

  // Count users by rank
  const rankCounts: Record<string, { rank_order: number; count: number }> = {}

  leaderboardData.forEach(user => {
    const rank = calculateRankByPoints(user.total_points)
    if (!rankCounts[rank.title]) {
      rankCounts[rank.title] = { rank_order: rank.rank_order, count: 0 }
    }
    rankCounts[rank.title].count++
  })

  // Convert to array with percentages
  return Object.entries(rankCounts).map(([title, data]) => ({
    rank_title: title,
    rank_order: data.rank_order,
    user_count: data.count,
    percentage: Math.round((data.count / totalUsers) * 100)
  })).sort((a, b) => a.rank_order - b.rank_order)
}

/**
 * Get rank color based on title
 */
export function getRankColor(rankTitle: string): string {
  const rank = calculateRankByPoints(0) // Get rank structure
  const colors: Record<string, string> = {
    'Rookie': '#8B4513',
    'Junior Varsity': '#4682B4',
    'Varsity': '#32CD32',
    'All-Conference': '#FF6347',
    'All-State': '#4169E1',
    'All-American': '#8A2BE2',
    'Elite': '#FFD700',
    'Legend': '#FF4500',
    'Hall of Fame': '#DC143C',
    'GOAT': '#000000'
  }
  
  return colors[rankTitle] || '#6B7280'
}

/**
 * Format rank for display
 */
export function formatRankDisplay(rank: PlayerRank): string {
  return `${rank.title} (${rank.lax_credits_required}+ points)`
}

/**
 * Check if user should rank up
 */
export async function checkForRankUp(userId: string, newPoints: number): Promise<{
  ranked_up: boolean
  old_rank?: PlayerRank
  new_rank?: PlayerRank
}> {
  // Get current rank info
  const currentRankInfo = await getUserRankInfo(userId)
  if (!currentRankInfo) {
    return { ranked_up: false }
  }

  // Calculate new rank based on new points
  const newRank = calculateRankByPoints(newPoints)
  const oldRankOrder = currentRankInfo.rank_order

  if (newRank.rank_order > oldRankOrder) {
    // User ranked up!
    const ranks = await getRankDefinitions()
    const oldRankData = ranks.find(r => r.rank_order === oldRankOrder)
    const newRankData = ranks.find(r => r.rank_order === newRank.rank_order)

    return {
      ranked_up: true,
      old_rank: oldRankData,
      new_rank: newRankData
    }
  }

  return { ranked_up: false }
}