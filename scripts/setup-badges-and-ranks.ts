#!/usr/bin/env npx tsx

/**
 * Setup Script: Calculate and Assign Badges & Ranks to Existing Users
 * 
 * This script:
 * 1. Applies the gamification migration
 * 2. Calculates current user stats
 * 3. Awards appropriate badges based on achievements
 * 4. Updates user ranks based on points
 * 5. Focuses on Your Club OS users (club_id = 2)
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface UserStats {
  userId: string
  displayName: string
  clubId: number
  totalPoints: number
  workoutCount: number
  currentStreak: number
  categoryWorkouts: {
    attack: number
    defense: number
    midfield: number
    wall_ball: number
  }
}

interface BadgeAward {
  userId: string
  badgeKey: string
  badgeName: string
  reason: string
}

async function main() {
  console.log('🚀 Starting badges and ranks setup...\n')

  // Step 1: Apply migration
  console.log('📊 Step 1: Applying gamification migration...')
  await applyMigration()

  // Step 2: Get Your Club OS users
  console.log('👥 Step 2: Fetching Your Club OS users...')
  const users = await getYourClubOSUsers()
  console.log(`Found ${users.length} Your Club OS users\n`)

  // Step 3: Calculate user stats
  console.log('📈 Step 3: Calculating user statistics...')
  const userStats = await calculateUserStats(users)
  
  // Step 4: Award badges based on achievements
  console.log('🏆 Step 4: Awarding badges...')
  const badgeAwards = await awardBadges(userStats)

  // Step 5: Update ranks based on points
  console.log('🎖️ Step 5: Updating user ranks...')
  const rankUpdates = await updateUserRanks(userStats)

  // Step 6: Summary report
  console.log('\n📋 SETUP COMPLETE - SUMMARY REPORT')
  console.log('================================')
  await generateSummaryReport(userStats, badgeAwards, rankUpdates)
}

/**
 * Apply the gamification migration
 */
async function applyMigration(): Promise<void> {
  try {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '101_gamification_setup.sql')
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file not found')
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute migration in chunks to avoid timeout
    const chunks = migrationSQL.split('-- ===============================')
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim()
      if (chunk) {
        console.log(`   Executing migration chunk ${i + 1}/${chunks.length}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: chunk })
        if (error) {
          console.error(`   Error in chunk ${i + 1}:`, error)
        }
      }
    }
    
    console.log('✅ Migration applied successfully\n')
  } catch (error) {
    console.error('❌ Error applying migration:', error)
    // Don't exit - migration might already be applied
  }
}

/**
 * Get all Your Club OS users
 */
async function getYourClubOSUsers(): Promise<Array<{ user_id: string; display_name: string; club_id: number }>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, club_id')
    .eq('club_id', 2) // Your Club OS

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data?.map(user => ({
    user_id: user.id,
    display_name: user.display_name || 'Unknown User',
    club_id: user.club_id
  })) || []
}

/**
 * Calculate comprehensive stats for each user
 */
async function calculateUserStats(users: Array<{ user_id: string; display_name: string; club_id: number }>): Promise<UserStats[]> {
  const userStats: UserStats[] = []

  for (const user of users) {
    console.log(`   Calculating stats for ${user.display_name}...`)

    // Get user's academy points
    const { data: wallet } = await supabase
      .from('user_points_wallets')
      .select('balance')
      .eq('user_id', user.user_id)
      .eq('currency', 'academy_points')
      .single()

    // Get workout completion count
    const { data: progress } = await supabase
      .from('skills_academy_user_progress')
      .select('*')
      .eq('user_id', user.user_id)

    // Get workout details for category analysis
    const workoutIds = progress?.map(p => p.workout_id) || []
    let categoryWorkouts = { attack: 0, defense: 0, midfield: 0, wall_ball: 0 }

    if (workoutIds.length > 0) {
      const { data: workouts } = await supabase
        .from('skills_academy_workouts')
        .select('id, title, series_id, skills_academy_series(title)')
        .in('id', workoutIds)

      // Categorize workouts based on series titles
      workouts?.forEach(workout => {
        const seriesTitle = workout.skills_academy_series?.title?.toLowerCase() || ''
        if (seriesTitle.includes('attack') || seriesTitle.includes('offense')) {
          categoryWorkouts.attack++
        } else if (seriesTitle.includes('defense')) {
          categoryWorkouts.defense++
        } else if (seriesTitle.includes('midfield') || seriesTitle.includes('transition')) {
          categoryWorkouts.midfield++
        } else if (seriesTitle.includes('wall ball')) {
          categoryWorkouts.wall_ball++
        }
      })
    }

    userStats.push({
      userId: user.user_id,
      displayName: user.display_name,
      clubId: user.club_id,
      totalPoints: wallet?.balance || 0,
      workoutCount: progress?.length || 0,
      currentStreak: 0, // Would need more complex calculation
      categoryWorkouts
    })
  }

  return userStats
}

/**
 * Award badges based on user achievements
 */
async function awardBadges(userStats: UserStats[]): Promise<BadgeAward[]> {
  const badgeAwards: BadgeAward[] = []

  // Badge eligibility rules
  const badgeRules = [
    { key: 'first_workout', name: 'First Steps', requirement: (stats: UserStats) => stats.workoutCount >= 1 },
    { key: 'five_workouts', name: 'Getting Started', requirement: (stats: UserStats) => stats.workoutCount >= 5 },
    { key: 'ten_workouts', name: 'Committed', requirement: (stats: UserStats) => stats.workoutCount >= 10 },
    { key: 'twenty_five_workouts', name: 'Dedicated', requirement: (stats: UserStats) => stats.workoutCount >= 25 },
    { key: 'fifty_workouts', name: 'Grinder', requirement: (stats: UserStats) => stats.workoutCount >= 50 },
    { key: 'points_100', name: 'Point Getter', requirement: (stats: UserStats) => stats.totalPoints >= 100 },
    { key: 'points_500', name: 'Point Collector', requirement: (stats: UserStats) => stats.totalPoints >= 500 },
    { key: 'points_1000', name: 'Point Master', requirement: (stats: UserStats) => stats.totalPoints >= 1000 },
    { key: 'points_5000', name: 'Point Champion', requirement: (stats: UserStats) => stats.totalPoints >= 5000 },
    { key: 'points_10000', name: 'Point Legend', requirement: (stats: UserStats) => stats.totalPoints >= 10000 },
    { key: 'attack_master', name: 'Attack Master', requirement: (stats: UserStats) => stats.categoryWorkouts.attack >= 10 },
    { key: 'defense_expert', name: 'Defense Expert', requirement: (stats: UserStats) => stats.categoryWorkouts.defense >= 10 },
    { key: 'midfield_champion', name: 'Midfield Champion', requirement: (stats: UserStats) => stats.categoryWorkouts.midfield >= 10 },
    { key: 'wall_ball_warrior', name: 'Wall Ball Warrior', requirement: (stats: UserStats) => stats.categoryWorkouts.wall_ball >= 10 }
  ]

  for (const stats of userStats) {
    console.log(`   Checking badges for ${stats.displayName}...`)

    for (const rule of badgeRules) {
      if (rule.requirement(stats)) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', stats.userId)
          .eq('badge_key', rule.key)
          .single()

        if (!existingBadge) {
          // Award the badge using RPC function
          const { data: success, error } = await supabase.rpc('award_badge', {
            p_user_id: stats.userId,
            p_badge_key: rule.key
          })

          if (success && !error) {
            badgeAwards.push({
              userId: stats.userId,
              badgeKey: rule.key,
              badgeName: rule.name,
              reason: getBadgeReason(rule.key, stats)
            })
            console.log(`     ✅ Awarded: ${rule.name}`)
          }
        }
      }
    }
  }

  return badgeAwards
}

/**
 * Update user ranks based on current points
 */
async function updateUserRanks(userStats: UserStats[]): Promise<Array<{ userId: string; displayName: string; rank: string; points: number }>> {
  const rankUpdates: Array<{ userId: string; displayName: string; rank: string; points: number }> = []

  for (const stats of userStats) {
    console.log(`   Updating rank for ${stats.displayName} (${stats.totalPoints} points)...`)

    // Use RPC function to update rank
    const { error } = await supabase.rpc('update_user_rank', {
      p_user_id: stats.userId
    })

    if (!error) {
      const rank = calculateRankTitle(stats.totalPoints)
      rankUpdates.push({
        userId: stats.userId,
        displayName: stats.displayName,
        rank,
        points: stats.totalPoints
      })
      console.log(`     ✅ Rank: ${rank}`)
    }
  }

  return rankUpdates
}

/**
 * Generate summary report
 */
async function generateSummaryReport(
  userStats: UserStats[], 
  badgeAwards: BadgeAward[], 
  rankUpdates: Array<{ userId: string; displayName: string; rank: string; points: number }>
): Promise<void> {
  console.log(`👥 Total Users Processed: ${userStats.length}`)
  console.log(`🏆 Total Badges Awarded: ${badgeAwards.length}`)
  console.log(`🎖️ Total Ranks Updated: ${rankUpdates.length}`)
  
  // Badge breakdown
  const badgeBreakdown: Record<string, number> = {}
  badgeAwards.forEach(award => {
    badgeBreakdown[award.badgeName] = (badgeBreakdown[award.badgeName] || 0) + 1
  })

  console.log('\n🏆 Badge Distribution:')
  Object.entries(badgeBreakdown).forEach(([badge, count]) => {
    console.log(`   ${badge}: ${count} users`)
  })

  // Rank distribution
  const rankBreakdown: Record<string, number> = {}
  rankUpdates.forEach(update => {
    rankBreakdown[update.rank] = (rankBreakdown[update.rank] || 0) + 1
  })

  console.log('\n🎖️ Rank Distribution:')
  Object.entries(rankBreakdown).forEach(([rank, count]) => {
    console.log(`   ${rank}: ${count} users`)
  })

  // Top point earners
  const topUsers = userStats
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5)

  console.log('\n🏅 Top Point Earners:')
  topUsers.forEach((user, index) => {
    const rank = calculateRankTitle(user.totalPoints)
    console.log(`   ${index + 1}. ${user.displayName}: ${user.totalPoints} points (${rank})`)
  })

  // Verification queries
  console.log('\n🔍 Verification:')
  
  const { data: badgeCount } = await supabase
    .from('badge_definitions_powlax')
    .select('id', { count: 'exact' })
  console.log(`   Badge Definitions: ${badgeCount?.length || 0}`)

  const { data: rankCount } = await supabase
    .from('powlax_player_ranks')
    .select('id', { count: 'exact' })
  console.log(`   Rank Definitions: ${rankCount?.length || 0}`)

  const { data: userBadgeCount } = await supabase
    .from('user_badges')
    .select('id', { count: 'exact' })
  console.log(`   Total User Badges: ${userBadgeCount?.length || 0}`)

  console.log('\n✅ Setup completed successfully!')
}

/**
 * Helper functions
 */
function getBadgeReason(badgeKey: string, stats: UserStats): string {
  const reasons: Record<string, string> = {
    'first_workout': `Completed first workout`,
    'five_workouts': `Completed ${stats.workoutCount} workouts`,
    'ten_workouts': `Completed ${stats.workoutCount} workouts`,
    'twenty_five_workouts': `Completed ${stats.workoutCount} workouts`,
    'fifty_workouts': `Completed ${stats.workoutCount} workouts`,
    'points_100': `Earned ${stats.totalPoints} academy points`,
    'points_500': `Earned ${stats.totalPoints} academy points`,
    'points_1000': `Earned ${stats.totalPoints} academy points`,
    'points_5000': `Earned ${stats.totalPoints} academy points`,
    'points_10000': `Earned ${stats.totalPoints} academy points`,
    'attack_master': `Completed ${stats.categoryWorkouts.attack} attack workouts`,
    'defense_expert': `Completed ${stats.categoryWorkouts.defense} defense workouts`,
    'midfield_champion': `Completed ${stats.categoryWorkouts.midfield} midfield workouts`,
    'wall_ball_warrior': `Completed ${stats.categoryWorkouts.wall_ball} wall ball workouts`
  }
  
  return reasons[badgeKey] || 'Achievement unlocked'
}

function calculateRankTitle(points: number): string {
  if (points >= 100000) return 'GOAT'
  if (points >= 50000) return 'Hall of Fame'
  if (points >= 25000) return 'Legend'
  if (points >= 10000) return 'Elite'
  if (points >= 5000) return 'All-American'
  if (points >= 2500) return 'All-State'
  if (points >= 1000) return 'All-Conference'
  if (points >= 500) return 'Varsity'
  if (points >= 100) return 'Junior Varsity'
  return 'Rookie'
}

// Run the script
main().catch(console.error)