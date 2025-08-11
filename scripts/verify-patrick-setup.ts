#!/usr/bin/env tsx
/**
 * Verification Script for Patrick's Multi-Role Setup
 * Contract: unified-dashboard-real-data-001.yaml
 * Phase 1: Database Setup Verification
 * 
 * This script verifies:
 * 1. Patrick has all 5 roles
 * 2. Team memberships exist with correct roles
 * 3. Parent-child relationship with powlax_coach exists
 * 4. Gamification data is present
 * 5. Mock practice data exists
 * 6. Reports success/failure with detailed information
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

const EXPECTED_ROLES = ['administrator', 'parent', 'club_director', 'team_coach', 'player']

interface VerificationResult {
  section: string
  passed: boolean
  details: string[]
  errors: string[]
}

async function main() {
  console.log('🔍 Verifying Patrick\'s multi-role account setup...\n')
  
  const results: VerificationResult[] = []
  let overallSuccess = true

  try {
    // 1. Verify Patrick's roles and club assignment
    console.log('1️⃣ Verifying Patrick\'s account...')
    const rolesResult: VerificationResult = {
      section: 'Patrick\'s Account',
      passed: false,
      details: [],
      errors: []
    }

    const { data: patrick, error: patrickError } = await supabase
      .from('users')
      .select('id, email, roles, club_id, display_name')
      .eq('id', PATRICK_ID)
      .single()

    if (patrickError || !patrick) {
      rolesResult.errors.push('Patrick\'s account not found')
      rolesResult.passed = false
    } else {
      rolesResult.details.push(`Email: ${patrick.email}`)
      rolesResult.details.push(`Display Name: ${patrick.display_name || 'Not set'}`)
      
      // Check roles
      const hasAllRoles = EXPECTED_ROLES.every(role => patrick.roles?.includes(role))
      if (hasAllRoles && patrick.roles?.length === 5) {
        rolesResult.details.push(`✅ Roles: ${patrick.roles.join(', ')}`)
      } else {
        rolesResult.errors.push(`❌ Roles mismatch. Expected: ${EXPECTED_ROLES.join(', ')}. Got: ${patrick.roles?.join(', ') || 'none'}`)
      }

      // Check club assignment
      if (patrick.club_id === CLUB_ID) {
        rolesResult.details.push(`✅ Club ID: ${patrick.club_id} (Your Club OS)`)
      } else {
        rolesResult.errors.push(`❌ Club ID mismatch. Expected: ${CLUB_ID}. Got: ${patrick.club_id || 'none'}`)
      }

      rolesResult.passed = hasAllRoles && patrick.roles?.length === 5 && patrick.club_id === CLUB_ID
    }

    results.push(rolesResult)

    // 2. Verify team memberships
    console.log('2️⃣ Verifying team memberships...')
    const teamResult: VerificationResult = {
      section: 'Team Memberships',
      passed: false,
      details: [],
      errors: []
    }

    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        status,
        teams:team_id (
          name
        )
      `)
      .eq('user_id', PATRICK_ID)

    if (membershipError) {
      teamResult.errors.push(`Error fetching memberships: ${membershipError.message}`)
    } else {
      const expectedMemberships = [
        { team_id: TEAMS.VARSITY, role: 'head_coach' },
        { team_id: TEAMS.JV, role: 'assistant_coach' },
        { team_id: TEAMS.EIGHTH_GRADE, role: 'player' }
      ]

      let allMembershipsCorrect = true

      for (const expected of expectedMemberships) {
        const found = memberships?.find(m => m.team_id === expected.team_id && m.role === expected.role)
        if (found) {
          // @ts-ignore - teams relation
          teamResult.details.push(`✅ ${found.role} at ${found.teams?.name || expected.team_id}`)
        } else {
          teamResult.errors.push(`❌ Missing membership: ${expected.role} at team ${expected.team_id}`)
          allMembershipsCorrect = false
        }
      }

      teamResult.passed = allMembershipsCorrect && (memberships?.length === 3)
    }

    results.push(teamResult)

    // 3. Verify parent-child relationship
    console.log('3️⃣ Verifying parent-child relationships...')
    const parentResult: VerificationResult = {
      section: 'Parent-Child Relationships',
      passed: false,
      details: [],
      errors: []
    }

    const { data: relationships, error: relationshipError } = await supabase
      .from('parent_child_relationships')
      .select(`
        child_id,
        relationship_type,
        child:child_id (
          display_name,
          email
        )
      `)
      .eq('parent_id', PATRICK_ID)

    if (relationshipError) {
      parentResult.errors.push(`Error fetching relationships: ${relationshipError.message}`)
    } else {
      const demoChild = relationships?.find(r => r.child_id === POWLAX_COACH_ID)
      if (demoChild) {
        // @ts-ignore - child relation
        parentResult.details.push(`✅ Demo child: ${demoChild.child?.display_name || 'powlax_coach'} (${demoChild.relationship_type})`)
        parentResult.passed = true
      } else {
        parentResult.errors.push('❌ Missing relationship with powlax_coach (demo child)')
      }

      // Show all children
      if (relationships && relationships.length > 0) {
        parentResult.details.push(`Total children: ${relationships.length}`)
      }
    }

    results.push(parentResult)

    // 4. Verify gamification data
    console.log('4️⃣ Verifying gamification data...')
    const gamificationResult: VerificationResult = {
      section: 'Gamification Data',
      passed: false,
      details: [],
      errors: []
    }

    // Check points wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_points_wallets')
      .select('balance, currency')
      .eq('user_id', PATRICK_ID)
      .single()

    if (wallet) {
      gamificationResult.details.push(`✅ Points wallet: ${wallet.balance} ${wallet.currency}`)
    } else {
      gamificationResult.errors.push('❌ Points wallet not found')
    }

    // Check badges
    const { data: badges, error: badgeError } = await supabase
      .from('user_badges')
      .select('badge_key, created_at')
      .eq('user_id', PATRICK_ID)

    if (badges && badges.length > 0) {
      gamificationResult.details.push(`✅ Badges: ${badges.length} earned`)
      badges.forEach(badge => {
        gamificationResult.details.push(`   - ${badge.badge_key}`)
      })
    } else {
      gamificationResult.errors.push('❌ No badges found')
    }

    // Check rank progress
    const { data: rank, error: rankError } = await supabase
      .from('user_rank_progress_powlax')
      .select('rank, current_level, points, total_points')
      .eq('user_id', PATRICK_ID)
      .single()

    if (rank) {
      gamificationResult.details.push(`✅ Rank: ${rank.rank} level ${rank.current_level} (${rank.points}/${rank.total_points})`)
    } else {
      gamificationResult.errors.push('❌ Rank progress not found')
    }

    gamificationResult.passed = !!wallet && badges && badges.length > 0

    results.push(gamificationResult)

    // 5. Verify practice data
    console.log('5️⃣ Verifying practice data...')
    const practiceResult: VerificationResult = {
      section: 'Mock Practice Data',
      passed: false,
      details: [],
      errors: []
    }

    const { data: practices, error: practiceError } = await supabase
      .from('practices')
      .select('name, practice_date, team_id')
      .eq('coach_id', PATRICK_ID)

    if (practiceError) {
      practiceResult.errors.push(`Error fetching practices: ${practiceError.message}`)
    } else if (practices && practices.length > 0) {
      practiceResult.details.push(`✅ ${practices.length} practices found`)
      practices.forEach(practice => {
        practiceResult.details.push(`   - ${practice.name} (Team: ${practice.team_id})`)
      })
      practiceResult.passed = true
    } else {
      practiceResult.errors.push('❌ No practices found')
    }

    results.push(practiceResult)

    // 6. Generate overall stats for Role Management panel
    console.log('6️⃣ Generating dashboard statistics...')
    const statsResult: VerificationResult = {
      section: 'Dashboard Statistics',
      passed: false,
      details: [],
      errors: []
    }

    // Count total users
    const { count: totalUsers, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (totalUsers !== null) {
      statsResult.details.push(`✅ Total users: ${totalUsers}`)
    }

    // Count total teams
    const { count: totalTeams, error: teamCountError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })

    if (totalTeams !== null) {
      statsResult.details.push(`✅ Total teams: ${totalTeams}`)
    }

    // Count Your Club OS teams
    const { count: clubTeams, error: clubTeamCountError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', CLUB_ID)

    if (clubTeams !== null) {
      statsResult.details.push(`✅ Your Club OS teams: ${clubTeams}`)
    }

    // Count drills
    const { count: totalDrills, error: drillCountError } = await supabase
      .from('skills_academy_drills')
      .select('*', { count: 'exact', head: true })

    if (totalDrills !== null) {
      statsResult.details.push(`✅ Skills Academy drills: ${totalDrills}`)
    }

    statsResult.passed = totalUsers !== null && totalTeams !== null

    results.push(statsResult)

    // Display results
    console.log('\n' + '='.repeat(60))
    console.log('📋 VERIFICATION RESULTS')
    console.log('='.repeat(60))

    results.forEach(result => {
      console.log(`\n${result.passed ? '✅' : '❌'} ${result.section}`)
      
      result.details.forEach(detail => {
        console.log(`   ${detail}`)
      })

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`   ${error}`)
        })
        overallSuccess = false
      }
    })

    // Final summary
    console.log('\n' + '='.repeat(60))
    if (overallSuccess && results.every(r => r.passed)) {
      console.log('🎉 OVERALL RESULT: SUCCESS!')
      console.log('Patrick\'s multi-role account is ready for unified dashboard.')
      console.log('\nNext steps:')
      console.log('1. Phase 2: Fix Role Management panel')
      console.log('2. Phase 3: Update dashboard components with real data')
      console.log('3. Phase 4: Connect teams page to real data')
      console.log('4. Phase 5: Add mock indicators to resources page')
    } else {
      console.log('❌ OVERALL RESULT: ISSUES FOUND')
      console.log('Please address the errors above before proceeding.')
      overallSuccess = false
    }

    console.log('='.repeat(60))

    process.exit(overallSuccess ? 0 : 1)

  } catch (error) {
    console.error('\n❌ Verification script failed:', error)
    process.exit(1)
  }
}

main()