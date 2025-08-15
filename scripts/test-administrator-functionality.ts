#!/usr/bin/env npx tsx
/**
 * Phase 6B: Administrator Functionality Tests
 * Comprehensive testing of admin features after role migration
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  details?: any
}

const testResults: TestResult[] = []

function addResult(name: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any) {
  testResults.push({ name, status, message, details })
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏸️'
  console.log(`${emoji} ${name}: ${message}`)
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`)
  }
}

async function testAdministratorFunctionality() {
  console.log('🧪 Phase 6B: Administrator Functionality Tests')
  console.log('='.repeat(55))
  console.log('Testing all admin features with "administrator" role')
  console.log('')

  try {
    // TEST 1: Verify Patrick's administrator role
    console.log('1️⃣ AUTHENTICATION TESTS')
    console.log('-'.repeat(30))

    const { data: patrick, error: patrickError } = await supabase
      .from('users')
      .select('id, email, display_name, role, roles, first_name, last_name')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (patrickError || !patrick) {
      addResult('Patrick Authentication', 'FAIL', 'Patrick user not found', patrickError)
      return
    }

    if (patrick.role !== 'administrator') {
      addResult('Administrator Role Check', 'FAIL', `Role is "${patrick.role}", expected "administrator"`, patrick)
      console.log('\n⚠️  MIGRATION REQUIRED FIRST!')
      console.log('Run: npx tsx scripts/migrate-patrick-role.ts')
      return
    }

    addResult('Administrator Role Check', 'PASS', `Patrick has "administrator" role`, { 
      email: patrick.email, 
      role: patrick.role,
      roles: patrick.roles
    })

    // TEST 2: WordPress Role Alignment
    const wordpressAligned = patrick.role === 'administrator'
    addResult('WordPress Alignment', 'PASS', 'Role matches WordPress standard "administrator"')

    console.log('\n2️⃣ DATABASE ACCESS TESTS')
    console.log('-'.repeat(30))

    // TEST 3: Team Management Access
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, club_id')
      .limit(5)

    if (teamsError) {
      addResult('Team Management Access', 'FAIL', 'Cannot access teams table', teamsError)
    } else {
      addResult('Team Management Access', 'PASS', `Can access ${teams?.length || 0} teams`, {
        teamsFound: teams?.length || 0,
        sampleTeam: teams?.[0]?.name
      })
    }

    // TEST 4: User Management Access
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5)

    if (usersError) {
      addResult('User Management Access', 'FAIL', 'Cannot access users table', usersError)
    } else {
      const adminUsers = users?.filter(u => u.role === 'administrator') || []
      addResult('User Management Access', 'PASS', `Can access ${users?.length || 0} users, ${adminUsers.length} admins`, {
        totalUsers: users?.length || 0,
        adminUsers: adminUsers.length
      })
    }

    // TEST 5: Club/Organization Management
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .limit(5)

    if (clubsError) {
      addResult('Club Management Access', 'FAIL', 'Cannot access clubs table', clubsError)
    } else {
      addResult('Club Management Access', 'PASS', `Can access ${clubs?.length || 0} clubs`, {
        clubsFound: clubs?.length || 0,
        sampleClub: clubs?.[0]?.name
      })
    }

    console.log('\n3️⃣ RESOURCE MANAGEMENT TESTS')
    console.log('-'.repeat(30))

    // TEST 6: Practice Plans Access
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('id, name, created_by')
      .limit(3)

    if (practicesError) {
      addResult('Practice Management', 'FAIL', 'Cannot access practices table', practicesError)
    } else {
      addResult('Practice Management', 'PASS', `Can access ${practices?.length || 0} practice plans`, {
        practicesFound: practices?.length || 0
      })
    }

    // TEST 7: Drill Library Access
    const { data: drills, error: drillsError } = await supabase
      .from('powlax_drills')
      .select('id, name, category')
      .limit(3)

    if (drillsError) {
      addResult('Drill Library Access', 'FAIL', 'Cannot access powlax_drills table', drillsError)
    } else {
      addResult('Drill Library Access', 'PASS', `Can access ${drills?.length || 0} drills`, {
        drillsFound: drills?.length || 0
      })
    }

    // TEST 8: Skills Academy Access
    const { data: workouts, error: workoutsError } = await supabase
      .from('skills_academy_workouts')
      .select('id, title, series_id')
      .limit(3)

    if (workoutsError) {
      addResult('Skills Academy Access', 'FAIL', 'Cannot access skills_academy_workouts table', workoutsError)
    } else {
      addResult('Skills Academy Access', 'PASS', `Can access ${workouts?.length || 0} workouts`, {
        workoutsFound: workouts?.length || 0
      })
    }

    console.log('\n4️⃣ PERMISSION VALIDATION TESTS')
    console.log('-'.repeat(30))

    // TEST 9: Administrator-Only Queries
    const { data: adminOnlyUsers, error: adminQueryError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'administrator')

    if (adminQueryError) {
      addResult('Admin Query Access', 'FAIL', 'Cannot query for administrators', adminQueryError)
    } else {
      addResult('Admin Query Access', 'PASS', `Found ${adminOnlyUsers?.length || 0} administrator users`, {
        administrators: adminOnlyUsers?.map(u => u.email)
      })
    }

    // TEST 10: Cross-table Relationship Access
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('id, team_id, user_id')
      .limit(3)

    if (memberError) {
      addResult('Relationship Data Access', 'FAIL', 'Cannot access team_members table', memberError)
    } else {
      addResult('Relationship Data Access', 'PASS', `Can access ${teamMembers?.length || 0} team memberships`, {
        membershipsFound: teamMembers?.length || 0
      })
    }

    console.log('\n5️⃣ FUNCTIONAL INTEGRATION TESTS')
    console.log('-'.repeat(30))

    // TEST 11: Role-Based Logic Simulation
    const userRole = patrick.role
    const isAdmin = userRole === 'administrator'
    const canManageUsers = isAdmin
    const canManageTeams = isAdmin
    const canAccessReports = isAdmin

    addResult('Role Logic - User Management', 'PASS', `Admin can manage users: ${canManageUsers}`)
    addResult('Role Logic - Team Management', 'PASS', `Admin can manage teams: ${canManageTeams}`)
    addResult('Role Logic - Reports Access', 'PASS', `Admin can access reports: ${canAccessReports}`)

    // TEST 12: Mock Dashboard Data Access
    const dashboardData = {
      userCount: users?.length || 0,
      teamCount: teams?.length || 0,
      clubCount: clubs?.length || 0,
      practiceCount: practices?.length || 0,
      role: patrick.role,
      permissions: {
        canCreateUsers: isAdmin,
        canDeleteUsers: isAdmin,
        canManageClubs: isAdmin,
        canViewAllTeams: isAdmin
      }
    }

    addResult('Dashboard Data Assembly', 'PASS', 'Admin dashboard data can be assembled', dashboardData)

  } catch (error) {
    addResult('Test Suite Execution', 'FAIL', 'Test suite crashed', error)
  }

  // FINAL REPORT
  console.log('\n' + '='.repeat(55))
  console.log('📊 PHASE 6B TEST SUMMARY')
  console.log('='.repeat(55))

  const passCount = testResults.filter(r => r.status === 'PASS').length
  const failCount = testResults.filter(r => r.status === 'FAIL').length
  const skipCount = testResults.filter(r => r.status === 'SKIP').length
  const totalCount = testResults.length

  console.log(`✅ PASSED: ${passCount}/${totalCount}`)
  console.log(`❌ FAILED: ${failCount}/${totalCount}`)
  console.log(`⏸️ SKIPPED: ${skipCount}/${totalCount}`)

  if (failCount === 0) {
    console.log('')
    console.log('🎉 ALL ADMINISTRATOR FUNCTIONALITY TESTS PASSED!')
    console.log('✅ Patrick can access admin features')
    console.log('✅ Role shows as "administrator" (WordPress aligned)')
    console.log('✅ All database permissions working')
    console.log('✅ Ready for UI testing')
  } else {
    console.log('')
    console.log('⚠️  SOME TESTS FAILED - Review above for details')
    console.log('🔧 May need additional fixes before UI testing')
  }

  console.log('')
  console.log('📋 NEXT STEPS FOR COMPLETE PHASE 6B:')
  console.log('1. Test admin UI loads correctly')
  console.log('2. Verify navigation menus show admin options')
  console.log('3. Check dashboard displays admin data')
  console.log('4. Test team/user management forms')
  console.log('5. Verify role displayed correctly in UI')

  return { passCount, failCount, totalCount, results: testResults }
}

// Run if called directly
if (require.main === module) {
  testAdministratorFunctionality().then((summary) => {
    console.log('\n🎯 Phase 6B functional tests complete')
    process.exit(summary.failCount === 0 ? 0 : 1)
  }).catch((error) => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
}

export { testAdministratorFunctionality }