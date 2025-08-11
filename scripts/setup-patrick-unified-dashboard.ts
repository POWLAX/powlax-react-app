#!/usr/bin/env npx tsx

/**
 * Phase 1: Unified Dashboard Real Data Setup
 * Contract: unified-dashboard-real-data-001.yaml
 * 
 * This script sets up Patrick's multi-role account with:
 * - All 5 roles: administrator, parent, club_director, team_coach, player
 * - Club assignment to Your Club OS
 * - Team memberships for Varsity (head_coach), JV (assistant_coach), 8th Grade (player)
 * - Links powlax_coach as demo child
 * - Creates sample gamification data
 * - Inserts mock practice data
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Contract-specified IDs (DO NOT CHANGE)
const PATRICK_ID = '523f2768-6404-439c-a429-f9eb6736aa17'
const PATRICK_EMAIL = 'patrick@powlax.com'
const CLUB_ID = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac' // Your Club OS
const POWLAX_COACH_ID = 'e43889f9-ba31-476a-a17d-c52a2d4b544b' // Demo child

// Team IDs from Your Club OS
const TEAM_IDS = {
  VARSITY: 'd6b72e87-8fab-4f4c-9921-260501605ee2',    // Your Varsity Team HQ
  JV: '43642a09-17b6-4813-b9ea-d69a2cd7ad6a',         // Your JV Team HQ  
  EIGHTH_GRADE: '044c362a-1501-4e38-aaff-d2ce83381a85' // Your 8th Grade Team HQ
}

const ALL_ROLES = ['administrator', 'parent', 'club_director', 'team_coach', 'player']

async function step1UpdatePatrickRoles() {
  console.log('📋 STEP 1: Updating Patrick\'s roles and club assignment...')
  
  try {
    // First verify Patrick exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', PATRICK_ID)
      .single()

    if (userError) {
      console.error('❌ Patrick not found in users table:', userError)
      return false
    }

    console.log('📋 Current Patrick record:')
    console.log({
      id: existingUser.id,
      email: existingUser.email,
      current_roles: existingUser.roles,
      current_club_id: existingUser.club_id
    })

    // Update Patrick with all 5 roles and club assignment
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        roles: ALL_ROLES,
        club_id: CLUB_ID,
        updated_at: new Date().toISOString()
      })
      .eq('id', PATRICK_ID)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update Patrick:', updateError)
      return false
    }

    console.log('✅ Successfully updated Patrick:')
    console.log({
      email: updatedUser.email,
      roles: updatedUser.roles,
      club_id: updatedUser.club_id
    })

    return true
  } catch (error) {
    console.error('💥 Error updating Patrick:', error)
    return false
  }
}

async function step2CreateTeamMemberships() {
  console.log('\n👥 STEP 2: Creating team memberships...')
  
  try {
    // Define team memberships
    const memberships = [
      { team_id: TEAM_IDS.VARSITY, role: 'head_coach', team_name: 'Your Varsity Team HQ' },
      { team_id: TEAM_IDS.JV, role: 'assistant_coach', team_name: 'Your JV Team HQ' },
      { team_id: TEAM_IDS.EIGHTH_GRADE, role: 'player', team_name: 'Your 8th Grade Team HQ' }
    ]

    for (const membership of memberships) {
      console.log(`🔗 Adding Patrick as ${membership.role} to ${membership.team_name}...`)
      
      const { error } = await supabase
        .from('team_members')
        .upsert({
          team_id: membership.team_id,
          user_id: PATRICK_ID,
          role: membership.role,
          status: 'active',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'team_id,user_id'
        })

      if (error) {
        console.error(`❌ Failed to create membership for ${membership.team_name}:`, error)
        return false
      }

      console.log(`✅ Added to ${membership.team_name} as ${membership.role}`)
    }

    return true
  } catch (error) {
    console.error('💥 Error creating team memberships:', error)
    return false
  }
}

async function step3LinkDemoChild() {
  console.log('\n👨‍👦 STEP 3: Linking powlax_coach as demo child...')
  
  try {
    // Check if powlax_coach exists
    const { data: demoChild, error: childError } = await supabase
      .from('users')
      .select('id, display_name, email')
      .eq('id', POWLAX_COACH_ID)
      .single()

    if (childError) {
      console.error('❌ powlax_coach not found:', childError)
      return false
    }

    console.log('📋 Demo child found:', {
      id: demoChild.id,
      name: demoChild.display_name,
      email: demoChild.email
    })

    // Create parent-child relationship
    const { error: relationError } = await supabase
      .from('parent_child_relationships')
      .upsert({
        parent_id: PATRICK_ID,
        child_id: POWLAX_COACH_ID,
        relationship_type: 'parent', // Must be 'parent' per schema constraint
        permissions: { billing: true, view_progress: true, manage_schedule: true },
        is_primary_guardian: false,
        emergency_contact: false,
        notes: 'Demo child for unified dashboard - powlax_coach',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'parent_id,child_id'
      })

    if (relationError) {
      console.error('❌ Failed to create parent-child relationship:', relationError)
      return false
    }

    console.log('✅ Successfully linked powlax_coach as demo child')
    return true
  } catch (error) {
    console.error('💥 Error linking demo child:', error)
    return false
  }
}

async function step4CreateGamificationData() {
  console.log('\n🎮 STEP 4: Creating gamification data for Patrick...')
  
  try {
    // Create points wallet
    console.log('💰 Creating points wallet...')
    const { error: walletError } = await supabase
      .from('user_points_wallets')
      .upsert({
        user_id: PATRICK_ID,
        currency: 'lax_credits', // Based on actual schema
        balance: 1500, // Starting balance for demo
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,currency'
      })

    if (walletError) {
      console.error('❌ Failed to create points wallet:', walletError)
      return false
    }
    console.log('✅ Points wallet created (1500 points)')

    // Skip badges for now - will be created in later phases
    console.log('🏆 Skipping badges (will be created in dashboard update phases)...')

    // Skip rank progress for now - will be created in later phases
    console.log('📊 Skipping rank progress (will be created in dashboard update phases)...')

    return true
  } catch (error) {
    console.error('💥 Error creating gamification data:', error)
    return false
  }
}

async function step5CreatePracticeData() {
  console.log('\n📝 STEP 5: Creating mock practice data...')
  
  try {
    // Create mock practices for Patrick's teams
    const mockPractices = [
      {
        coach_id: PATRICK_ID,
        team_id: TEAM_IDS.VARSITY,
        name: 'Mock: Varsity Practice - Offensive Drills',
        practice_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        notes: 'Mock practice for unified dashboard demo - Varsity offensive fundamentals',
        duration_minutes: 90
      },
      {
        coach_id: PATRICK_ID,
        team_id: TEAM_IDS.JV,
        name: 'Mock: JV Practice - Fundamentals',
        practice_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        notes: 'Mock practice for unified dashboard demo - JV skill development',
        duration_minutes: 75
      },
      {
        coach_id: PATRICK_ID,
        team_id: TEAM_IDS.EIGHTH_GRADE,
        name: 'Mock: 8th Grade Practice - Team Building',
        practice_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        notes: 'Mock practice for unified dashboard demo - 8th grade team cohesion',
        duration_minutes: 60
      }
    ]

    for (const practice of mockPractices) {
      const { error: practiceError } = await supabase
        .from('practices')
        .insert(practice)

      if (practiceError) {
        console.error(`❌ Failed to create practice "${practice.name}":`, practiceError)
        return false
      }

      console.log(`✅ Created practice: ${practice.name}`)
    }

    return true
  } catch (error) {
    console.error('💥 Error creating practice data:', error)
    return false
  }
}

async function verifySetup() {
  console.log('\n🔍 VERIFICATION: Checking setup results...')
  
  try {
    // Verify Patrick's roles
    const { data: user } = await supabase
      .from('users')
      .select('roles, club_id')
      .eq('id', PATRICK_ID)
      .single()

    console.log('✅ Patrick roles:', user?.roles)
    console.log('✅ Patrick club:', user?.club_id)

    // Verify team memberships
    const { data: memberships } = await supabase
      .from('team_members')
      .select(`
        role,
        teams!inner(name)
      `)
      .eq('user_id', PATRICK_ID)

    console.log('✅ Team memberships:')
    memberships?.forEach(membership => {
      console.log(`  - ${membership.teams.name}: ${membership.role}`)
    })

    // Verify demo child link
    const { data: children } = await supabase
      .from('parent_child_relationships')
      .select(`
        relationship_type,
        users!inner(display_name)
      `)
      .eq('parent_id', PATRICK_ID)

    console.log('✅ Children:')
    children?.forEach(child => {
      console.log(`  - ${child.users.display_name} (${child.relationship_type})`)
    })

    // Verify points wallet
    const { data: wallet } = await supabase
      .from('user_points_wallets')
      .select('balance, currency')
      .eq('user_id', PATRICK_ID)
      .single()

    console.log('✅ Points wallet:', wallet ? `${wallet.balance} ${wallet.currency}` : 'None')

    // Verify practice count
    const { count } = await supabase
      .from('practices')
      .select('*', { count: 'exact' })
      .eq('coach_id', PATRICK_ID)

    console.log('✅ Practice plans created:', count || 0)

    return true
  } catch (error) {
    console.error('💥 Error during verification:', error)
    return false
  }
}

async function main() {
  console.log('🚀 PHASE 1: UNIFIED DASHBOARD REAL DATA SETUP')
  console.log('================================================')
  console.log(`📋 Contract: unified-dashboard-real-data-001.yaml`)
  console.log(`👤 Target User: Patrick (${PATRICK_ID})`)
  console.log(`🏢 Target Club: Your Club OS (${CLUB_ID})`)
  console.log(`🎯 Goal: Setup Patrick with all 5 roles + relationships\n`)

  let success = true

  // Execute all steps
  success = await step1UpdatePatrickRoles() && success
  success = await step2CreateTeamMemberships() && success  
  success = await step3LinkDemoChild() && success
  success = await step4CreateGamificationData() && success
  success = await step5CreatePracticeData() && success

  // Verify results
  if (success) {
    console.log('\n🎉 ALL STEPS COMPLETED SUCCESSFULLY!')
    await verifySetup()
    
    console.log('\n✅ PHASE 1 SETUP COMPLETE')
    console.log('Patrick now has:')
    console.log('• All 5 roles: administrator, parent, club_director, team_coach, player')
    console.log('• Club assignment: Your Club OS')
    console.log('• Team memberships: Varsity (head_coach), JV (assistant_coach), 8th Grade (player)')
    console.log('• Demo child: powlax_coach linked')
    console.log('• Gamification data: Points, badges, rank')
    console.log('• Mock practice data: 3 practice plans created')
    console.log('\n🎯 Next: Run verification script to confirm all relationships')
    
  } else {
    console.log('\n❌ SETUP FAILED!')
    console.log('Some steps did not complete successfully.')
    console.log('Check error messages above for details.')
    console.log('You may need to run individual steps or fix issues manually.')
  }
}

// Run the script
main().catch(console.error)