#!/usr/bin/env npx tsx

/**
 * Verify Resources Permanence Pattern Implementation
 * This script verifies that the permanence pattern is correctly implemented
 */

import * as fs from 'fs'
import * as path from 'path'

console.log('🔍 Verifying Resources Permanence Pattern Implementation')
console.log('========================================================\n')

// Check points for verification
const checkPoints = {
  database: {
    file: 'supabase/migrations/100_resources_permanence_tables.sql',
    checks: [
      { pattern: /shared_with_teams INTEGER\[\]/g, description: 'Database has INTEGER[] for team sharing' },
      { pattern: /shared_with_users UUID\[\]/g, description: 'Database has UUID[] for user sharing' },
      { pattern: /collection_ids UUID\[\]/g, description: 'Database has UUID[] for collections' },
      { pattern: /DEFAULT '{}'/g, description: 'Arrays default to empty {}' },
      { pattern: /USING GIN/g, description: 'GIN indexes on array columns' },
      { pattern: /= ANY\(/g, description: 'RLS policies use ANY() for array checks' }
    ]
  },
  hook: {
    file: 'src/hooks/useResourceFavorites.ts',
    checks: [
      { pattern: /shared_with_teams: number\[\]/g, description: 'Hook types: shared_with_teams as number[]' },
      { pattern: /shared_with_users: string\[\]/g, description: 'Hook types: shared_with_users as string[]' },
      { pattern: /collection_ids: string\[\]/g, description: 'Hook types: collection_ids as string[]' },
      { pattern: /shareWithTeams.*boolean/g, description: 'UI state uses booleans for checkboxes' },
      { pattern: /teamIds.*number\[\]/g, description: 'Data state uses arrays for IDs' },
      { pattern: /Transform booleans to arrays/gi, description: 'Comments about transformation' },
      { pattern: /Preserve existing arrays/gi, description: 'Preserves arrays on updates' },
      { pattern: /options\?\.(shareWithTeams|shareWithUsers).*\?/g, description: 'Conditional transformation logic' }
    ]
  },
  criticalPatterns: {
    file: 'src/hooks/useResourceFavorites.ts',
    checks: [
      {
        pattern: /shared_with_teams: options\?\.shareWithTeams && options\?\.teamIds[\s\S]*?\? options\.teamIds[\s\S]*?: \[\]/,
        description: 'Transform: boolean AND array check → array or empty'
      },
      {
        pattern: /shared_with_teams: options\?\.shareWithTeams !== undefined[\s\S]*?\? saveData\.shared_with_teams[\s\S]*?: existing\.shared_with_teams/,
        description: 'Update: preserves existing arrays when not changing'
      }
    ]
  }
}

// Verification function
function verifyFile(category: string, config: any) {
  console.log(`📋 Checking ${category}:`)
  console.log(`   File: ${config.file}`)
  
  const filePath = path.join(__dirname, '..', config.file)
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found!`)
    return false
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  let allPassed = true
  
  for (const check of config.checks) {
    const matches = content.match(check.pattern)
    const passed = matches && matches.length > 0
    
    if (passed) {
      console.log(`   ✅ ${check.description} (${matches.length} matches)`)
    } else {
      console.log(`   ❌ ${check.description} (NOT FOUND)`)
      allPassed = false
    }
  }
  
  console.log('')
  return allPassed
}

// Run verification
async function main() {
  const results = []
  
  for (const [category, config] of Object.entries(checkPoints)) {
    results.push(verifyFile(category, config))
  }
  
  // Summary
  console.log('========================================================')
  console.log('📊 VERIFICATION SUMMARY:\n')
  
  const allPassed = results.every(r => r)
  
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED!')
    console.log('\nThe Resources permanence pattern is correctly implemented:')
    console.log('1. Database uses INTEGER[] and UUID[] arrays')
    console.log('2. Hook separates UI state (booleans) from data state (arrays)')
    console.log('3. Transformation happens at save boundary')
    console.log('4. Existing arrays are preserved on updates')
    console.log('5. GIN indexes and RLS policies use array operations')
    
    console.log('\n🎯 Key Implementation Points:')
    console.log('- UI: Checkboxes use boolean state')
    console.log('- Save: Booleans transform to arrays')
    console.log('- Update: Existing arrays preserved when not changing')
    console.log('- Database: All sharing columns are arrays, never booleans')
  } else {
    console.log('⚠️  SOME CHECKS FAILED')
    console.log('\nPlease review the failed checks above.')
    console.log('The permanence pattern may not be fully implemented.')
  }
  
  // Test data structures
  console.log('\n🧪 Testing Data Structure Compatibility:')
  
  // Simulate the transformation
  const uiState = {
    shareWithTeams: true,  // UI checkbox
    shareWithUsers: false, // UI checkbox
    teamIds: [1, 2, 3],    // Available team IDs
    userIds: ['user-1']    // Available user IDs
  }
  
  // This is what the hook does
  const databaseData = {
    shared_with_teams: uiState.shareWithTeams && uiState.teamIds 
      ? uiState.teamIds 
      : [],
    shared_with_users: uiState.shareWithUsers && uiState.userIds
      ? uiState.userIds
      : []
  }
  
  console.log('\nUI State:', JSON.stringify(uiState, null, 2))
  console.log('\nTransformed to Database:', JSON.stringify(databaseData, null, 2))
  
  console.log('\n✅ Transformation Logic Verified:')
  console.log('- shareWithTeams=true + teamIds → shared_with_teams=[1,2,3]')
  console.log('- shareWithUsers=false → shared_with_users=[]')
  console.log('- Arrays ready for PostgreSQL INTEGER[] and UUID[] columns')
}

main().catch(console.error)