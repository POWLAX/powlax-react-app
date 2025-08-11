#!/usr/bin/env npx tsx

/**
 * Phase 1 Verification Script
 * Contract: unified-dashboard-real-data-001.yaml
 * 
 * Verifies that Patrick's multi-role setup is complete and correct:
 * - All 5 roles assigned
 * - Club assignment correct
 * - Team memberships created
 * - Demo child relationship exists
 * - Gamification data present
 * - Practice data created
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

const REQUIRED_ROLES = ['administrator', 'parent', 'club_director', 'team_coach', 'player']
const EXPECTED_MEMBERSHIPS = [
  { team_id: TEAM_IDS.VARSITY, role: 'head_coach', team_name: 'Your Varsity Team HQ' },
  { team_id: TEAM_IDS.JV, role: 'assistant_coach', team_name: 'Your JV Team HQ' },
  { team_id: TEAM_IDS.EIGHTH_GRADE, role: 'player', team_name: 'Your 8th Grade Team HQ' }
]

interface VerificationResult {
  section: string
  passed: boolean
  details: string
  data?: any
}

const results: VerificationResult[] = []

function addResult(section: string, passed: boolean, details: string, data?: any) {
  results.push({ section, passed, details, data })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${section}: ${details}`)
  if (data && !passed) {
    console.log('   Data:', JSON.stringify(data, null, 2))
  }
}

async function verifyPatrickUser() {
  console.log('📋 1. VERIFYING PATRICK\'S USER RECORD')
  console.log('=====================================')
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, display_name, roles, club_id, account_type')
      .eq('id', PATRICK_ID)
      .single()

    if (error) {
      addResult('User Exists', false, `Patrick not found: ${error.message}`)
      return
    }

    addResult('User Exists', true, `Found Patrick: ${user.email}`)
    
    // Check roles
    const hasAllRoles = REQUIRED_ROLES.every(role => user.roles?.includes(role))
    const missingRoles = REQUIRED_ROLES.filter(role => !user.roles?.includes(role))
    
    if (hasAllRoles) {
      addResult('All Roles Present', true, `All 5 roles assigned: ${user.roles.join(', ')}`)
    } else {
      addResult('All Roles Present', false, `Missing roles: ${missingRoles.join(', ')}`, {
        current_roles: user.roles,
        missing_roles: missingRoles
      })
    }

    // Check club assignment
    if (user.club_id === CLUB_ID) {
      addResult('Club Assignment', true, `Correctly assigned to Your Club OS`)
    } else {
      addResult('Club Assignment', false, `Wrong club ID: ${user.club_id}`, {
        expected: CLUB_ID,
        actual: user.club_id
      })
    }

  } catch (error) {
    addResult('User Verification', false, `Error checking user: ${error}`)
  }
}

async function verifyTeamMemberships() {
  console.log('\n👥 2. VERIFYING TEAM MEMBERSHIPS')
  console.log('=================================')
  
  try {
    const { data: memberships, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        status,
        teams!inner(name, id)
      `)
      .eq('user_id', PATRICK_ID)

    if (error) {
      addResult('Team Memberships Query', false, `Error fetching memberships: ${error.message}`)
      return
    }

    addResult('Team Memberships Query', true, `Found ${memberships?.length || 0} memberships`)

    // Check each expected membership
    for (const expected of EXPECTED_MEMBERSHIPS) {
      const found = memberships?.find(m => 
        m.team_id === expected.team_id && m.role === expected.role
      )

      if (found) {
        addResult(
          `${expected.team_name} Membership`,
          true,
          `Patrick is ${expected.role} of ${found.teams.name}`
        )
      } else {
        addResult(
          `${expected.team_name} Membership`,
          false,
          `Missing ${expected.role} role for ${expected.team_name}`,
          { expected, available_memberships: memberships }
        )
      }
    }

  } catch (error) {
    addResult('Team Memberships', false, `Error verifying memberships: ${error}`)
  }
}

async function verifyParentChildRelationship() {
  console.log('\n👨‍👦 3. VERIFYING PARENT-CHILD RELATIONSHIP')
  console.log('============================================')
  
  try {
    const { data: relationships, error } = await supabase
      .from('parent_child_relationships')
      .select(`
        parent_id,
        child_id,
        relationship_type,
        notes,
        users!parent_child_relationships_child_id_fkey(display_name, email)
      `)
      .eq('parent_id', PATRICK_ID)

    if (error) {
      addResult('Parent-Child Query', false, `Error fetching relationships: ${error.message}`)
      return
    }

    addResult('Parent-Child Query', true, `Found ${relationships?.length || 0} children`)

    // Check for powlax_coach specifically
    const demoChild = relationships?.find(r => r.child_id === POWLAX_COACH_ID)

    if (demoChild) {
      addResult(
        'Demo Child Link',
        true,
        `powlax_coach linked as ${demoChild.relationship_type}: ${demoChild.users.display_name}`
      )
    } else {
      addResult(
        'Demo Child Link',
        false,
        `powlax_coach not found in parent-child relationships`,
        { 
          expected_child_id: POWLAX_COACH_ID,
          available_relationships: relationships 
        }
      )
    }

    // List all children
    if (relationships && relationships.length > 0) {
      console.log('   All children:')
      relationships.forEach(rel => {
        console.log(`   - ${rel.users.display_name} (${rel.relationship_type})`)
      })
    }

  } catch (error) {
    addResult('Parent-Child Verification', false, `Error verifying relationships: ${error}`)
  }
}

async function verifyGamificationData() {
  console.log('\n🎮 4. VERIFYING GAMIFICATION DATA')
  console.log('==================================')
  
  try {
    // Check points wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_points_wallets')
      .select('user_id, currency, balance, updated_at')
      .eq('user_id', PATRICK_ID)
      .single()

    if (walletError) {
      addResult('Points Wallet', false, `No points wallet found: ${walletError.message}`)
    } else {
      addResult(
        'Points Wallet',
        true,
        `Wallet created with ${wallet.balance} ${wallet.currency}`
      )
    }

    // Note: Badges and ranks skipped in Phase 1
    addResult('Badges', true, 'Skipped in Phase 1 (to be created in dashboard phases)')
    addResult('Ranks', true, 'Skipped in Phase 1 (to be created in dashboard phases)')

  } catch (error) {
    addResult('Gamification Data', false, `Error verifying gamification: ${error}`)
  }
}

async function verifyPracticeData() {
  console.log('\n📝 5. VERIFYING PRACTICE DATA')
  console.log('==============================')
  
  try {
    const { data: practices, error } = await supabase
      .from('practices')
      .select('id, name, team_id, practice_date, duration_minutes, notes')
      .eq('coach_id', PATRICK_ID)
      .order('practice_date', { ascending: true })

    if (error) {
      addResult('Practice Data Query', false, `Error fetching practices: ${error.message}`)
      return
    }

    // Filter to only mock practices created by our script
    const mockPractices = practices?.filter(p => p.name?.includes('Mock:')) || []

    addResult('Practice Data Query', true, `Found ${practices?.length || 0} total practices`)
    addResult('Mock Practice Count', mockPractices.length >= 3, 
      `Found ${mockPractices.length} mock practices (expected 3+)`
    )

    // Check specific mock practices
    const expectedPracticeNames = [
      'Mock: Varsity Practice - Offensive Drills',
      'Mock: JV Practice - Fundamentals', 
      'Mock: 8th Grade Practice - Team Building'
    ]

    for (const expectedName of expectedPracticeNames) {
      const found = mockPractices.find(p => p.name === expectedName)
      if (found) {
        addResult(
          `Practice: ${expectedName}`,
          true,
          `Created successfully - ${found.duration_minutes} minutes`
        )
      } else {
        addResult(
          `Practice: ${expectedName}`,
          false,
          'Mock practice not found',
          { available_practices: mockPractices.map(p => p.name) }
        )
      }
    }

  } catch (error) {
    addResult('Practice Data', false, `Error verifying practices: ${error}`)
  }
}

async function verifyDatabaseCounts() {
  console.log('\n📊 6. VERIFYING OVERALL DATABASE COUNTS')
  console.log('========================================')
  
  try {
    // Total users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })

    addResult('Total Users', userCount! >= 14, 
      `${userCount} users in database (expected 14+)`
    )

    // Total teams
    const { count: teamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact' })

    addResult('Total Teams', teamCount! >= 10, 
      `${teamCount} teams in database (expected 10+)`
    )

    // Skills Academy drills
    const { count: drillCount } = await supabase
      .from('skills_academy_drills')
      .select('*', { count: 'exact' })

    addResult('Skills Academy Drills', drillCount! >= 167, 
      `${drillCount} drills in database (expected 167)`
    )

    // Your Club OS teams
    const { count: clubTeamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact' })
      .eq('club_id', CLUB_ID)

    addResult('Your Club OS Teams', clubTeamCount! >= 3, 
      `${clubTeamCount} teams in Your Club OS (expected 3+)`
    )

  } catch (error) {
    addResult('Database Counts', false, `Error verifying counts: ${error}`)
  }
}

function generateSummaryReport() {
  console.log('\n🎯 VERIFICATION SUMMARY')
  console.log('=======================')
  
  const totalChecks = results.length
  const passedChecks = results.filter(r => r.passed).length
  const failedChecks = totalChecks - passedChecks

  console.log(`Total Checks: ${totalChecks}`)
  console.log(`✅ Passed: ${passedChecks}`)
  console.log(`❌ Failed: ${failedChecks}`)
  console.log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`)

  if (failedChecks > 0) {
    console.log('\n❌ FAILED CHECKS:')
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   - ${result.section}: ${result.details}`)
    })
  }

  const isPhase1Complete = failedChecks === 0

  if (isPhase1Complete) {
    console.log('\n🎉 PHASE 1 VERIFICATION: COMPLETE ✅')
    console.log('====================================')
    console.log('Patrick is now ready for unified dashboard with:')
    console.log('• All 5 roles: administrator, parent, club_director, team_coach, player')
    console.log('• Club assignment: Your Club OS')
    console.log('• Team memberships: 3 teams with appropriate roles')
    console.log('• Demo child relationship: powlax_coach linked')
    console.log('• Gamification foundation: Points wallet created')
    console.log('• Practice data: Mock practices for all teams')
    console.log('\n✅ Ready for Phase 2: Dashboard component updates')
    
  } else {
    console.log('\n❌ PHASE 1 VERIFICATION: INCOMPLETE')
    console.log('====================================')
    console.log('Issues found that need to be resolved before proceeding.')
    console.log('Check the failed items above and re-run setup if needed.')
    console.log('\n🔧 Recommended Actions:')
    
    if (results.some(r => !r.passed && r.section.includes('Role'))) {
      console.log('1. Re-run Patrick role update portion of setup script')
    }
    if (results.some(r => !r.passed && r.section.includes('Team'))) {
      console.log('2. Check team membership creation in setup script')
    }
    if (results.some(r => !r.passed && r.section.includes('Child'))) {
      console.log('3. Verify parent-child relationship creation')
    }
    if (results.some(r => !r.passed && r.section.includes('Practice'))) {
      console.log('4. Check practice data insertion')
    }
  }

  return isPhase1Complete
}

async function main() {
  console.log('🔍 PHASE 1 VERIFICATION: UNIFIED DASHBOARD REAL DATA')
  console.log('=====================================================')
  console.log(`📋 Contract: unified-dashboard-real-data-001.yaml`)
  console.log(`👤 Verifying: Patrick (${PATRICK_ID})`)
  console.log(`🏢 Expected Club: Your Club OS (${CLUB_ID})`)
  console.log(`🎯 Goal: Confirm all Phase 1 requirements are met\n`)

  // Run all verification steps
  await verifyPatrickUser()
  await verifyTeamMemberships()
  await verifyParentChildRelationship()
  await verifyGamificationData()
  await verifyPracticeData()
  await verifyDatabaseCounts()

  // Generate summary
  const isComplete = generateSummaryReport()

  return isComplete
}

// Run the verification
main()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Verification script failed:', error)
    process.exit(1)
  })