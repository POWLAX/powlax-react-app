#!/usr/bin/env npx tsx

/**
 * Verify Gamification Setup
 * Check current state of badges and ranks tables
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with browser credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Verifying gamification setup...\n')

  // Check badge_definitions_powlax table
  console.log('📊 Checking badge_definitions_powlax table...')
  try {
    const { data: badgeDefinitions, error: badgeError } = await supabase
      .from('badge_definitions_powlax')
      .select('*')
      .limit(5)

    if (badgeError) {
      console.log('❌ badge_definitions_powlax table does not exist yet')
      console.log('   Error:', badgeError.message)
    } else {
      console.log(`✅ badge_definitions_powlax exists with ${badgeDefinitions?.length || 0} sample records`)
      if (badgeDefinitions && badgeDefinitions.length > 0) {
        console.log('   Sample badge:', badgeDefinitions[0].name)
      }
    }
  } catch (error) {
    console.log('❌ Error checking badge_definitions_powlax:', error)
  }

  // Check existing powlax_player_ranks table
  console.log('\n🎖️ Checking powlax_player_ranks table...')
  try {
    const { data: ranks, error: rankError } = await supabase
      .from('powlax_player_ranks')
      .select('*')
      .order('rank_order')

    if (rankError) {
      console.log('❌ powlax_player_ranks table error:', rankError.message)
    } else {
      console.log(`✅ powlax_player_ranks exists with ${ranks?.length || 0} ranks`)
      if (ranks && ranks.length > 0) {
        console.log('   Sample ranks:')
        ranks.slice(0, 3).forEach(rank => {
          console.log(`     ${rank.rank_order}. ${rank.title} (${rank.lax_credits_required}+ points)`)
        })
      }
    }
  } catch (error) {
    console.log('❌ Error checking powlax_player_ranks:', error)
  }

  // Check user_badges table
  console.log('\n🏆 Checking user_badges table...')
  try {
    const { data: userBadges, error: userBadgeError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(5)

    if (userBadgeError) {
      console.log('❌ user_badges table error:', userBadgeError.message)
    } else {
      console.log(`✅ user_badges exists with ${userBadges?.length || 0} awarded badges`)
      if (userBadges && userBadges.length > 0) {
        console.log('   Sample badges:')
        userBadges.forEach(badge => {
          console.log(`     ${badge.badge_name} awarded to user ${badge.user_id}`)
        })
      }
    }
  } catch (error) {
    console.log('❌ Error checking user_badges:', error)
  }

  // Check user_points_wallets for academy points
  console.log('\n💰 Checking user_points_wallets for academy points...')
  try {
    const { data: wallets, error: walletError } = await supabase
      .from('user_points_wallets')
      .select('*')
      .eq('currency', 'academy_points')

    if (walletError) {
      console.log('❌ user_points_wallets error:', walletError.message)
    } else {
      console.log(`✅ Found ${wallets?.length || 0} academy point wallets`)
      if (wallets && wallets.length > 0) {
        const totalPoints = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
        console.log(`   Total academy points across all users: ${totalPoints}`)
        console.log('   Top wallets:')
        wallets
          .sort((a, b) => (b.balance || 0) - (a.balance || 0))
          .slice(0, 3)
          .forEach(wallet => {
            console.log(`     User ${wallet.user_id}: ${wallet.balance} points`)
          })
      }
    }
  } catch (error) {
    console.log('❌ Error checking user_points_wallets:', error)
  }

  // Check Your Club OS users specifically
  console.log('\n👥 Checking Your Club OS users...')
  try {
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, display_name, club_id')
      .eq('club_id', 2)

    if (userError) {
      console.log('❌ Error fetching users:', userError.message)
    } else {
      console.log(`✅ Found ${users?.length || 0} Your Club OS users`)
      if (users && users.length > 0) {
        console.log('   Users:')
        users.forEach(user => {
          console.log(`     ${user.display_name || 'Unknown'} (${user.id})`)
        })
      }
    }
  } catch (error) {
    console.log('❌ Error checking users:', error)
  }

  // Check skills academy progress
  console.log('\n📚 Checking Skills Academy progress...')
  try {
    const { data: progress, error: progressError } = await supabase
      .from('skills_academy_user_progress')
      .select('user_id, workout_id')

    if (progressError) {
      console.log('❌ Error fetching progress:', progressError.message)
    } else {
      console.log(`✅ Found ${progress?.length || 0} workout completions`)
      
      // Group by user
      const userProgress: Record<string, number> = {}
      progress?.forEach(p => {
        userProgress[p.user_id] = (userProgress[p.user_id] || 0) + 1
      })

      if (Object.keys(userProgress).length > 0) {
        console.log('   Workout completions by user:')
        Object.entries(userProgress)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([userId, count]) => {
            console.log(`     User ${userId}: ${count} workouts`)
          })
      }
    }
  } catch (error) {
    console.log('❌ Error checking progress:', error)
  }

  console.log('\n📋 SUMMARY')
  console.log('===========')
  console.log('Badge system status:')
  console.log('  - badge_definitions_powlax: Need to check if migration applied')
  console.log('  - user_badges: Ready for badge awards')
  console.log('  - powlax_player_ranks: Ready for rank calculations')
  console.log('  - user_points_wallets: Contains academy points data')
  console.log('  - skills_academy_user_progress: Contains workout completion data')
  console.log('\nNext steps:')
  console.log('  1. Apply migration file to create badge_definitions_powlax')
  console.log('  2. Run setup script to calculate and award badges/ranks')
  console.log('  3. Test gamification hooks in the frontend')
}

main().catch(console.error)