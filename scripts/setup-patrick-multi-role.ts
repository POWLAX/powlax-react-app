#!/usr/bin/env tsx
/**
 * Database Setup Script for Patrick's Multi-Role Account
 * Contract: unified-dashboard-real-data-001.yaml
 * Phase 1: Database Setup Agent
 * 
 * This script:
 * 1. Updates Patrick's roles to ALL 5: administrator, parent, club_director, team_coach, player
 * 2. Sets Patrick's club_id to Your Club OS
 * 3. Creates team_members entries for 3 teams with different roles
 * 4. Links powlax_coach as Patrick's demo child
 * 5. Creates sample gamification data for Patrick
 * 6. Inserts mock practice data
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Constants from contract
const PATRICK_ID = '523f2768-6404-439c-a429-f9eb6736aa17'
const CLUB_ID = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac' // Your Club OS
const POWLAX_COACH_ID = 'e43889f9-ba31-476a-a17d-c52a2d4b544b' // Demo child

// Team IDs from Your Club OS
const TEAMS = {
  VARSITY: 'd6b72e87-8fab-4f4c-9921-260501605ee2', // head_coach
  JV: '43642a09-17b6-4813-b9ea-d69a2cd7ad6a',     // assistant_coach
  EIGHTH_GRADE: '044c362a-1501-4e38-aaff-d2ce83381a85' // player
}

const ALL_ROLES = ['administrator', 'parent', 'club_director', 'team_coach', 'player']

async function main() {
  console.log('🚀 Setting up Patrick\'s multi-role account...\n')
  
  try {
    // Step 1: Update Patrick's account with all roles and club
    console.log('1️⃣ Updating Patrick\'s roles and club assignment...')
    const { data: userUpdate, error: userError } = await supabase
      .from('users')
      .update({
        roles: ALL_ROLES,
        club_id: CLUB_ID
      })
      .eq('id', PATRICK_ID)
      .select()

    if (userError) {
      console.error('❌ Error updating Patrick\'s account:', userError)
      throw userError
    }

    console.log('✅ Patrick\'s account updated with all 5 roles')
    console.log(`   Roles: ${ALL_ROLES.join(', ')}`)
    console.log(`   Club ID: ${CLUB_ID} (Your Club OS)\n`)

    // Step 2: Create team memberships
    console.log('2️⃣ Creating team memberships...')
    
    const teamMemberships = [
      { team_id: TEAMS.VARSITY, user_id: PATRICK_ID, role: 'head_coach', status: 'active' },
      { team_id: TEAMS.JV, user_id: PATRICK_ID, role: 'assistant_coach', status: 'active' },
      { team_id: TEAMS.EIGHTH_GRADE, user_id: PATRICK_ID, role: 'player', status: 'active' }
    ]

    for (const membership of teamMemberships) {
      const { error } = await supabase
        .from('team_members')
        .upsert(membership, {
          onConflict: 'team_id,user_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error(`❌ Error creating team membership for ${membership.role}:`, error)
        throw error
      }

      // Get team name for logging
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', membership.team_id)
        .single()

      console.log(`✅ Added as ${membership.role} to: ${team?.name || membership.team_id}`)
    }

    console.log()

    // Step 3: Link powlax_coach as Patrick's demo child
    console.log('3️⃣ Creating parent-child relationship with powlax_coach...')
    
    const { error: parentChildError } = await supabase
      .from('parent_child_relationships')
      .upsert({
        parent_id: PATRICK_ID,
        child_id: POWLAX_COACH_ID,
        relationship_type: 'parent'
      }, {
        onConflict: 'parent_id,child_id',
        ignoreDuplicates: false
      })

    if (parentChildError) {
      console.error('❌ Error creating parent-child relationship:', parentChildError)
      throw parentChildError
    }

    console.log('✅ powlax_coach linked as Patrick\'s demo child\n')

    // Step 4: Create or update Patrick's points wallet
    console.log('4️⃣ Setting up Patrick\'s gamification data...')
    
    // Check if wallet exists
    const { data: existingWallet } = await supabase
      .from('user_points_wallets')
      .select('*')
      .eq('user_id', PATRICK_ID)
      .single()

    if (!existingWallet) {
      const { error: walletError } = await supabase
        .from('user_points_wallets')
        .insert({
          user_id: PATRICK_ID,
          currency: 'lax_credits',
          balance: 1250
        })

      if (walletError) {
        console.error('❌ Error creating points wallet:', walletError)
        throw walletError
      }

      console.log('✅ Points wallet created with 1,250 points')
    } else {
      console.log('✅ Points wallet already exists')
    }

    // Add some sample badges
    const sampleBadges = [
      { user_id: PATRICK_ID, badge_key: 'first_login' },
      { user_id: PATRICK_ID, badge_key: 'practice_planner' },
      { user_id: PATRICK_ID, badge_key: 'skills_academy_starter' }
    ]

    for (const badge of sampleBadges) {
      const { error: badgeError } = await supabase
        .from('user_badges')
        .upsert(badge, {
          onConflict: 'user_id,badge_key',
          ignoreDuplicates: true
        })

      if (badgeError && !badgeError.message.includes('duplicate')) {
        console.error('❌ Error creating badge:', badgeError)
        // Don't throw - badges are nice to have
      }
    }

    console.log('✅ Sample badges added')

    // Step 5: Create sample rank progress
    const { error: rankError } = await supabase
      .from('user_rank_progress_powlax')
      .upsert({
        user_id: PATRICK_ID,
        rank: 'bronze_3',
        current_level: 3,
        points: 250,
        total_points: 1250,
        level_progress: 25
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })

    if (rankError) {
      console.error('❌ Error creating rank progress:', rankError)
      // Don't throw - ranks are nice to have
    } else {
      console.log('✅ Rank progress set to Bronze III')
    }

    console.log()

    // Step 6: Insert mock practice data
    console.log('5️⃣ Creating mock practice data...')
    
    const mockPractices = [
      {
        coach_id: PATRICK_ID,
        team_id: TEAMS.VARSITY,
        name: 'Mock: Varsity Practice - Offensive Drills',
        practice_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: 'Mock practice for unified dashboard demo - focusing on offensive fundamentals'
      },
      {
        coach_id: PATRICK_ID,
        team_id: TEAMS.JV,
        name: 'Mock: JV Practice - Defensive Fundamentals',
        practice_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        notes: 'Mock practice for unified dashboard demo - defensive positioning and communication'
      }
    ]

    for (const practice of mockPractices) {
      const { error: practiceError } = await supabase
        .from('practices')
        .insert(practice)

      if (practiceError) {
        console.error('❌ Error creating mock practice:', practiceError)
        throw practiceError
      }
    }

    console.log('✅ Mock practice data created for Varsity and JV teams\n')

    // Success summary
    console.log('🎉 SUCCESS! Patrick\'s multi-role account is now set up:')
    console.log('   ✅ Roles: administrator, parent, club_director, team_coach, player')
    console.log('   ✅ Club: Your Club OS')
    console.log('   ✅ Teams: Varsity (head_coach), JV (assistant_coach), 8th Grade (player)')
    console.log('   ✅ Demo child: powlax_coach linked')
    console.log('   ✅ Gamification: Points wallet, badges, rank')
    console.log('   ✅ Mock practices: 2 scheduled practices')
    console.log()
    console.log('🔍 Run verification script: npx tsx scripts/verify-patrick-setup.ts')

  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()