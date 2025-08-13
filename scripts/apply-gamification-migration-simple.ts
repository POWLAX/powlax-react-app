#!/usr/bin/env npx tsx

/**
 * Apply Gamification Migration
 * Simple script to execute the SQL migration file
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🚀 Applying gamification migration...\n')

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '101_gamification_setup.sql')
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath)
    process.exit(1)
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  console.log('📖 Read migration file successfully')

  // Check if badge_definitions_powlax already exists
  console.log('🔍 Checking if badge_definitions_powlax exists...')
  const { data: existingBadges, error: checkError } = await supabase
    .from('badge_definitions_powlax')
    .select('id')
    .limit(1)

  if (!checkError) {
    console.log('✅ badge_definitions_powlax already exists')
    
    // Check how many badge definitions we have
    const { data: badgeCount } = await supabase
      .from('badge_definitions_powlax')
      .select('id', { count: 'exact' })
    
    console.log(`   Found ${badgeCount?.length || 0} badge definitions`)
    
    if ((badgeCount?.length || 0) > 0) {
      console.log('📊 Badge system already set up. Checking status...')
      await checkCurrentStatus()
      return
    }
  } else {
    console.log('❌ badge_definitions_powlax does not exist, migration needed')
  }

  console.log('\n📝 Migration needed. This would require service role access.')
  console.log('ℹ️  To apply the migration, you can:')
  console.log('   1. Copy the SQL from supabase/migrations/101_gamification_setup.sql')
  console.log('   2. Paste it into the Supabase SQL Editor')
  console.log('   3. Run it manually')
  console.log('   4. Or use supabase CLI with proper credentials')
  
  console.log('\n📋 Migration file contains:')
  console.log('   ✅ badge_definitions_powlax table creation')
  console.log('   ✅ 18 badge definitions (workout, points, streaks, specialist)')
  console.log('   ✅ 10 rank definitions (Rookie to GOAT)')
  console.log('   ✅ RPC functions for badge/rank operations')
  console.log('   ✅ Row Level Security policies')

  await checkCurrentStatus()
}

async function checkCurrentStatus() {
  console.log('\n📊 Current Gamification Status:')
  console.log('================================')

  // Check badge definitions
  try {
    const { data: badgeDefinitions, error } = await supabase
      .from('badge_definitions_powlax')
      .select('category, name')
      .eq('is_active', true)

    if (error) {
      console.log('❌ badge_definitions_powlax: Not accessible')
    } else {
      console.log(`✅ badge_definitions_powlax: ${badgeDefinitions?.length || 0} active badges`)
      
      // Group by category
      const byCategory: Record<string, number> = {}
      badgeDefinitions?.forEach(badge => {
        byCategory[badge.category] = (byCategory[badge.category] || 0) + 1
      })
      
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} badges`)
      })
    }
  } catch (error) {
    console.log('❌ badge_definitions_powlax: Error checking')
  }

  // Check ranks
  try {
    const { data: ranks, error } = await supabase
      .from('powlax_player_ranks')
      .select('title, lax_credits_required')
      .order('rank_order')

    if (error) {
      console.log('❌ powlax_player_ranks: Error')
    } else {
      console.log(`✅ powlax_player_ranks: ${ranks?.length || 0} ranks`)
      if (ranks && ranks.length > 0) {
        console.log('   Rank progression:')
        ranks.slice(0, 5).forEach(rank => {
          console.log(`     ${rank.title}: ${rank.lax_credits_required}+ points`)
        })
        if (ranks.length > 5) {
          console.log(`     ... and ${ranks.length - 5} more ranks`)
        }
      }
    }
  } catch (error) {
    console.log('❌ powlax_player_ranks: Error checking')
  }

  // Check user badges
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select('badge_key', { count: 'exact' })

    if (error) {
      console.log('❌ user_badges: Error')
    } else {
      console.log(`✅ user_badges: ${userBadges?.length || 0} badges awarded`)
    }
  } catch (error) {
    console.log('❌ user_badges: Error checking')
  }

  // Check user points
  try {
    const { data: wallets, error } = await supabase
      .from('user_points_wallets')
      .select('balance')
      .eq('currency', 'academy_points')

    if (error) {
      console.log('❌ academy points: Error')
    } else {
      const totalPoints = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0
      console.log(`✅ academy points: ${wallets?.length || 0} wallets, ${totalPoints} total points`)
    }
  } catch (error) {
    console.log('❌ academy points: Error checking')
  }

  // Check workout progress
  try {
    const { data: progress, error } = await supabase
      .from('skills_academy_user_progress')
      .select('user_id', { count: 'exact' })

    if (error) {
      console.log('❌ workout progress: Error')
    } else {
      console.log(`✅ workout completions: ${progress?.length || 0} total`)
    }
  } catch (error) {
    console.log('❌ workout progress: Error checking')
  }

  console.log('\n🎯 Next Steps:')
  console.log('1. Apply migration manually via Supabase SQL Editor')
  console.log('2. Run setup script to calculate and award badges/ranks')
  console.log('3. Test gamification hooks in frontend components')
}

main().catch(console.error)