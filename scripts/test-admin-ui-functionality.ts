#!/usr/bin/env npx tsx
/**
 * Phase 6B: Administrator UI Testing
 * Tests the frontend components with administrator role
 */

import fs from 'fs'
import path from 'path'

interface UITestResult {
  component: string
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  filePath?: string
}

const uiTestResults: UITestResult[] = []

function addUIResult(component: string, test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, filePath?: string) {
  uiTestResults.push({ component, test, status, message, filePath })
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏸️'
  console.log(`${emoji} ${component} - ${test}: ${message}`)
  if (filePath) {
    console.log(`   File: ${filePath}`)
  }
}

async function testAdminUIFunctionality() {
  console.log('🎨 Phase 6B: Administrator UI Testing')
  console.log('='.repeat(50))
  console.log('Checking frontend components for administrator role support')
  console.log('')

  const projectRoot = process.cwd()

  try {
    console.log('1️⃣ AUTHENTICATION CONTEXT TESTS')
    console.log('-'.repeat(35))

    // TEST 1: Check SupabaseAuthContext.tsx
    const authContextPath = path.join(projectRoot, 'src', 'contexts', 'SupabaseAuthContext.tsx')
    if (fs.existsSync(authContextPath)) {
      const authContent = fs.readFileSync(authContextPath, 'utf8')
      
      if (authContent.includes('administrator')) {
        addUIResult('AuthContext', 'Administrator Role Support', 'PASS', 
          'Context includes "administrator" role', authContextPath)
      } else {
        addUIResult('AuthContext', 'Administrator Role Support', 'FAIL',
          'Context missing "administrator" role support', authContextPath)
      }

      // Check if demo user has admin role
      const demoUserMatch = authContent.match(/role:\s*['"`]([^'"`]+)['"`]/);
      if (demoUserMatch) {
        const demoRole = demoUserMatch[1];
        if (demoRole === 'administrator') {
          addUIResult('AuthContext', 'Demo User Role', 'PASS',
            `Demo user has "administrator" role`, authContextPath)
        } else {
          addUIResult('AuthContext', 'Demo User Role', 'FAIL',
            `Demo user has "${demoRole}" role, should be "administrator"`, authContextPath)
        }
      }
    } else {
      addUIResult('AuthContext', 'File Exists', 'FAIL', 'SupabaseAuthContext.tsx not found')
    }

    console.log('\n2️⃣ DASHBOARD COMPONENT TESTS')
    console.log('-'.repeat(35))

    // TEST 2: Check dashboard components
    const dashboardPaths = [
      'src/app/(authenticated)/dashboard/page.tsx',
      'src/components/dashboard/DashboardContent.tsx',
      'src/components/layout/DashboardLayout.tsx'
    ]

    for (const dashPath of dashboardPaths) {
      const fullPath = path.join(projectRoot, dashPath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        
        const hasAdministratorCheck = content.includes('administrator')
        const hasLegacyAdminCheck = content.includes('"admin"') || content.includes("'admin'")
        
        if (hasAdministratorCheck) {
          addUIResult('Dashboard', 'Administrator Role Check', 'PASS',
            'Component checks for "administrator" role', fullPath)
        } else if (hasLegacyAdminCheck) {
          addUIResult('Dashboard', 'Administrator Role Check', 'FAIL',
            'Component still uses legacy "admin" check', fullPath)
        } else {
          addUIResult('Dashboard', 'Administrator Role Check', 'SKIP',
            'No role checks found in component', fullPath)
        }

        // Check for role-based rendering
        const hasRoleBasedUI = content.includes('role ===') || content.includes('role?.') || content.includes('user?.role')
        if (hasRoleBasedUI) {
          addUIResult('Dashboard', 'Role-Based UI', 'PASS',
            'Component has role-based rendering logic', fullPath)
        } else {
          addUIResult('Dashboard', 'Role-Based UI', 'SKIP',
            'No role-based UI logic found', fullPath)
        }
      } else {
        addUIResult('Dashboard', 'File Exists', 'SKIP', `File not found: ${dashPath}`)
      }
    }

    console.log('\n3️⃣ ADMIN-SPECIFIC COMPONENTS')
    console.log('-'.repeat(35))

    // TEST 3: Check for admin-specific components
    const adminComponentDirs = [
      'src/components/admin',
      'src/app/(authenticated)/admin'
    ]

    for (const adminDir of adminComponentDirs) {
      const fullAdminPath = path.join(projectRoot, adminDir)
      if (fs.existsSync(fullAdminPath)) {
        const adminFiles = fs.readdirSync(fullAdminPath, { recursive: true })
          .filter(file => typeof file === 'string' && (file.endsWith('.tsx') || file.endsWith('.ts')))
        
        addUIResult('Admin Components', 'Directory Exists', 'PASS',
          `Found ${adminFiles.length} admin files`, fullAdminPath)

        // Check a few admin files for role checks
        for (const adminFile of adminFiles.slice(0, 3)) {
          const adminFilePath = path.join(fullAdminPath, adminFile as string)
          if (fs.existsSync(adminFilePath)) {
            const adminContent = fs.readFileSync(adminFilePath, 'utf8')
            
            if (adminContent.includes('administrator')) {
              addUIResult('Admin Components', `Role Check - ${adminFile}`, 'PASS',
                'Uses "administrator" role', adminFilePath)
            } else if (adminContent.includes('"admin"') || adminContent.includes("'admin'")) {
              addUIResult('Admin Components', `Role Check - ${adminFile}`, 'FAIL',
                'Uses legacy "admin" role', adminFilePath)
            }
          }
        }
      } else {
        addUIResult('Admin Components', 'Directory Exists', 'SKIP',
          `Admin directory not found: ${adminDir}`)
      }
    }

    console.log('\n4️⃣ NAVIGATION AND LAYOUT TESTS')
    console.log('-'.repeat(35))

    // TEST 4: Check navigation components
    const navPaths = [
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/Navigation.tsx',
      'src/components/layout/Header.tsx',
      'src/components/layout/MainNav.tsx'
    ]

    for (const navPath of navPaths) {
      const fullNavPath = path.join(projectRoot, navPath)
      if (fs.existsSync(fullNavPath)) {
        const navContent = fs.readFileSync(fullNavPath, 'utf8')
        
        const hasAdminNav = navContent.includes('administrator') || navContent.includes('admin')
        if (hasAdminNav) {
          const usesCorrectRole = navContent.includes('administrator')
          addUIResult('Navigation', `Admin Links - ${path.basename(navPath)}`, 
            usesCorrectRole ? 'PASS' : 'FAIL',
            usesCorrectRole ? 'Uses correct "administrator" role' : 'May use legacy "admin" role',
            fullNavPath)
        } else {
          addUIResult('Navigation', `Admin Links - ${path.basename(navPath)}`, 'SKIP',
            'No admin-specific navigation found', fullNavPath)
        }
      }
    }

    console.log('\n5️⃣ HOOKS AND UTILITIES TESTS')
    console.log('-'.repeat(35))

    // TEST 5: Check hooks for role logic
    const hookPaths = [
      'src/hooks/useAuth.ts',
      'src/hooks/useDashboardData.ts',
      'src/hooks/useTeamManagement.ts',
      'src/hooks/useTeamDashboard.ts'
    ]

    for (const hookPath of hookPaths) {
      const fullHookPath = path.join(projectRoot, hookPath)
      if (fs.existsSync(fullHookPath)) {
        const hookContent = fs.readFileSync(fullHookPath, 'utf8')
        
        if (hookContent.includes('administrator')) {
          addUIResult('Hooks', `Role Logic - ${path.basename(hookPath)}`, 'PASS',
            'Uses "administrator" role', fullHookPath)
        } else if (hookContent.includes('"admin"') || hookContent.includes("'admin'")) {
          addUIResult('Hooks', `Role Logic - ${path.basename(hookPath)}`, 'FAIL',
            'Uses legacy "admin" role', fullHookPath)
        } else {
          addUIResult('Hooks', `Role Logic - ${path.basename(hookPath)}`, 'SKIP',
            'No role logic found', fullHookPath)
        }
      }
    }

    console.log('\n6️⃣ TYPE DEFINITIONS TESTS')
    console.log('-'.repeat(35))

    // TEST 6: Check TypeScript types
    const typePaths = [
      'src/types/database.types.ts',
      'src/types/auth.types.ts',
      'src/types/user.types.ts',
      'src/types/index.ts'
    ]

    for (const typePath of typePaths) {
      const fullTypePath = path.join(projectRoot, typePath)
      if (fs.existsSync(fullTypePath)) {
        const typeContent = fs.readFileSync(fullTypePath, 'utf8')
        
        if (typeContent.includes('administrator')) {
          addUIResult('Types', `Role Types - ${path.basename(typePath)}`, 'PASS',
            'Includes "administrator" in type definitions', fullTypePath)
        } else {
          addUIResult('Types', `Role Types - ${path.basename(typePath)}`, 'SKIP',
            'No "administrator" type found', fullTypePath)
        }

        // Check for role enums or unions
        const hasRoleEnum = typeContent.includes('enum') && typeContent.includes('role')
        const hasRoleUnion = typeContent.includes('|') && typeContent.includes('admin')
        
        if (hasRoleEnum || hasRoleUnion) {
          addUIResult('Types', `Role Enum/Union - ${path.basename(typePath)}`, 'PASS',
            'Has role type definitions', fullTypePath)
        }
      }
    }

  } catch (error) {
    addUIResult('Test Suite', 'Execution', 'FAIL', `UI test suite crashed: ${error}`)
  }

  // FINAL UI REPORT
  console.log('\n' + '='.repeat(50))
  console.log('🎨 PHASE 6B UI TEST SUMMARY')
  console.log('='.repeat(50))

  const passCount = uiTestResults.filter(r => r.status === 'PASS').length
  const failCount = uiTestResults.filter(r => r.status === 'FAIL').length
  const skipCount = uiTestResults.filter(r => r.status === 'SKIP').length
  const totalCount = uiTestResults.length

  console.log(`✅ PASSED: ${passCount}/${totalCount}`)
  console.log(`❌ FAILED: ${failCount}/${totalCount}`)
  console.log(`⏸️ SKIPPED: ${skipCount}/${totalCount}`)

  // Group failures by component
  const failures = uiTestResults.filter(r => r.status === 'FAIL')
  if (failures.length > 0) {
    console.log('\n❌ FAILED TESTS:')
    failures.forEach(failure => {
      console.log(`   - ${failure.component}: ${failure.test}`)
      console.log(`     ${failure.message}`)
      if (failure.filePath) {
        console.log(`     File: ${failure.filePath}`)
      }
    })
  }

  console.log('\n📋 UI TESTING CHECKLIST:')
  console.log('□ Mock authentication context shows "administrator" role')
  console.log('□ Dashboard loads without errors')
  console.log('□ Admin navigation items are visible')
  console.log('□ Role-based components render correctly')
  console.log('□ No console errors on admin pages')
  console.log('□ Team/user management forms are accessible')

  return { passCount, failCount, totalCount, results: uiTestResults }
}

// Run if called directly
if (require.main === module) {
  testAdminUIFunctionality().then((summary) => {
    console.log('\n🎯 Phase 6B UI tests complete')
    process.exit(summary.failCount === 0 ? 0 : 1)
  }).catch((error) => {
    console.error('❌ UI test suite failed:', error)
    process.exit(1)
  })
}

export { testAdminUIFunctionality }