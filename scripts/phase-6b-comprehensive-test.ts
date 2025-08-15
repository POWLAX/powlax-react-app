#!/usr/bin/env npx tsx
/**
 * Phase 6B: Comprehensive Administrator Role Testing
 * Complete test suite for role standardization migration validation
 */

import { testAdministratorFunctionality } from './test-administrator-functionality'
import { testAdminUIFunctionality } from './test-admin-ui-functionality'
import { migratePatrickRole } from './migrate-patrick-role'

interface PhaseTestSummary {
  phase: string
  passed: number
  failed: number
  total: number
  status: 'PASS' | 'FAIL'
}

async function runPhase6BComprehensiveTests() {
  console.log('🚀 PHASE 6B: COMPREHENSIVE ADMINISTRATOR TESTING')
  console.log('='.repeat(60))
  console.log('Role Standardization Migration - Functional Testing Phase')
  console.log('')
  console.log('Test Checklist:')
  console.log('□ 1. Patrick can log in (check with actual auth)')
  console.log('□ 2. Admin dashboard loads')
  console.log('□ 3. Team management is accessible')
  console.log('□ 4. User management works')
  console.log('□ 5. Resources management functions')
  console.log('□ 6. All admin routes are accessible')
  console.log('□ 7. Role shows as "administrator" in UI')
  console.log('□ 8. WordPress role would match if reconnected')
  console.log('')

  const phaseSummaries: PhaseTestSummary[] = []

  try {
    // STEP 1: Check if migration is needed
    console.log('🔍 STEP 1: PRE-TEST VALIDATION')
    console.log('='.repeat(40))
    
    const { createClient } = await import('@supabase/supabase-js')
    const dotenv = await import('dotenv')
    dotenv.config({ path: '.env.local' })
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: patrick, error } = await supabase
      .from('users')
      .select('role, email, display_name')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (error || !patrick) {
      console.log('❌ Patrick user not found - cannot run tests')
      console.log('Manual investigation needed')
      return
    }

    console.log(`📊 Patrick's current role: "${patrick.role}"`)
    
    let migrationNeeded = false
    if (patrick.role === 'admin') {
      console.log('⚠️  Migration required: "admin" → "administrator"')
      migrationNeeded = true
      
      console.log('\n🔧 Running automatic migration...')
      await migratePatrickRole()
      console.log('✅ Migration completed')
      
    } else if (patrick.role === 'administrator') {
      console.log('✅ Patrick already has "administrator" role')
    } else {
      console.log(`❌ Unexpected role: "${patrick.role}" - manual check needed`)
      return
    }

    // STEP 2: Database functionality tests
    console.log('\n🗄️ STEP 2: DATABASE FUNCTIONALITY TESTS')
    console.log('='.repeat(45))
    
    const dbTestResult = await testAdministratorFunctionality()
    phaseSummaries.push({
      phase: 'Database Functionality',
      passed: dbTestResult.passCount,
      failed: dbTestResult.failCount,
      total: dbTestResult.totalCount,
      status: dbTestResult.failCount === 0 ? 'PASS' : 'FAIL'
    })

    // STEP 3: UI functionality tests
    console.log('\n🎨 STEP 3: UI FUNCTIONALITY TESTS')
    console.log('='.repeat(35))
    
    const uiTestResult = await testAdminUIFunctionality()
    phaseSummaries.push({
      phase: 'UI Functionality',
      passed: uiTestResult.passCount,
      failed: uiTestResult.failCount,
      total: uiTestResult.totalCount,
      status: uiTestResult.failCount === 0 ? 'PASS' : 'FAIL'
    })

    // STEP 4: Live application testing checklist
    console.log('\n🌐 STEP 4: LIVE APPLICATION TESTING CHECKLIST')
    console.log('='.repeat(50))
    console.log('')
    console.log('Manual testing required - Server should be running on:')
    console.log('http://localhost:3002 (or available port)')
    console.log('')
    console.log('✅ Phase 6B Checklist:')
    console.log('□ 1. Patrick Login: Mock auth context shows administrator')
    console.log('□ 2. Dashboard Access: /dashboard loads successfully')  
    console.log('□ 3. Team Management: Can access team-related pages')
    console.log('□ 4. User Management: Admin user interface is functional')
    console.log('□ 5. Resources: Practice planner and skills academy work')
    console.log('□ 6. Admin Routes: All /admin/* routes are accessible')
    console.log('□ 7. Role Display: UI shows "administrator" not "admin"')
    console.log('□ 8. WordPress Alignment: Role value matches WP standard')
    console.log('')
    console.log('🧪 How to test manually:')
    console.log('1. Open http://localhost:3002')
    console.log('2. Check user context (should show administrator)')
    console.log('3. Navigate to /dashboard')
    console.log('4. Check for admin navigation options')
    console.log('5. Visit /admin routes if they exist')
    console.log('6. Verify no console errors')
    console.log('7. Test team/user management features')

  } catch (error) {
    console.error('❌ Phase 6B test suite crashed:', error)
    phaseSummaries.push({
      phase: 'Test Suite Execution',
      passed: 0,
      failed: 1,
      total: 1,
      status: 'FAIL'
    })
  }

  // FINAL COMPREHENSIVE REPORT
  console.log('\n' + '='.repeat(60))
  console.log('📊 PHASE 6B COMPREHENSIVE TEST SUMMARY')
  console.log('='.repeat(60))

  let totalPassed = 0
  let totalFailed = 0
  let totalTests = 0

  phaseSummaries.forEach(summary => {
    const emoji = summary.status === 'PASS' ? '✅' : '❌'
    console.log(`${emoji} ${summary.phase}: ${summary.passed}/${summary.total} passed`)
    totalPassed += summary.passed
    totalFailed += summary.failed
    totalTests += summary.total
  })

  console.log('')
  console.log(`🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed`)
  
  const overallStatus = totalFailed === 0 ? 'PASS' : 'FAIL'
  if (overallStatus === 'PASS') {
    console.log('')
    console.log('🎉 PHASE 6B FUNCTIONAL TESTING: SUCCESS!')
    console.log('✅ Administrator role standardization is functional')
    console.log('✅ Database migration completed successfully')
    console.log('✅ UI components support "administrator" role')
    console.log('✅ WordPress alignment confirmed')
    console.log('')
    console.log('📋 READY FOR:')
    console.log('• Phase 6C: Final verification agent')
    console.log('• Live application testing')
    console.log('• User acceptance testing')
    console.log('• Production deployment preparation')
    
  } else {
    console.log('')
    console.log('⚠️  PHASE 6B TESTING: ISSUES FOUND')
    console.log(`❌ ${totalFailed} tests failed`)
    console.log('')
    console.log('🔧 REQUIRED ACTIONS:')
    console.log('• Review failed tests above')
    console.log('• Fix identified issues')
    console.log('• Re-run Phase 6B testing')
    console.log('• Do not proceed to Phase 6C until resolved')
  }

  console.log('')
  console.log('📝 TEST ARTIFACTS CREATED:')
  console.log('• scripts/migrate-patrick-role.ts - Database migration')
  console.log('• scripts/test-administrator-functionality.ts - DB tests')
  console.log('• scripts/test-admin-ui-functionality.ts - UI tests')
  console.log('• scripts/phase-6b-comprehensive-test.ts - This suite')

  return {
    overallStatus,
    totalPassed,
    totalFailed,
    totalTests,
    phaseSummaries
  }
}

// Run if called directly
if (require.main === module) {
  runPhase6BComprehensiveTests().then((results) => {
    console.log('\n🎯 Phase 6B comprehensive testing complete')
    process.exit(results.overallStatus === 'PASS' ? 0 : 1)
  }).catch((error) => {
    console.error('❌ Phase 6B test suite failed:', error)
    process.exit(1)
  })
}

export { runPhase6BComprehensiveTests }