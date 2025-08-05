#!/usr/bin/env tsx

import { wordpressTeamSync } from '../src/lib/wordpress-team-sync'
import path from 'path'

async function testSync() {
  console.log('🚀 Testing WordPress Team Sync...\n')

  try {
    // Test 1: Sync Organizations
    console.log('1️⃣ Testing Organization Sync...')
    const orgResult = await wordpressTeamSync.syncOrganizationsFromWordPress()
    console.log('Organization Sync Result:', {
      success: orgResult.success,
      created: orgResult.created,
      updated: orgResult.updated,
      errors: orgResult.errors
    })
    console.log()

    // Test 2: Sync Teams from CSV
    console.log('2️⃣ Testing Team Sync from CSV...')
    const csvPath = path.join(
      process.cwd(),
      'docs/Wordpress CSV\'s/Teams-Export-2025-July-31-1922.csv'
    )
    
    const teamResult = await wordpressTeamSync.syncTeamsFromWordPress(csvPath)
    console.log('Team Sync Result:', {
      success: teamResult.success,
      created: teamResult.created,
      updated: teamResult.updated,
      errors: teamResult.errors.slice(0, 5) // Show first 5 errors
    })
    
    if (teamResult.errors.length > 5) {
      console.log(`... and ${teamResult.errors.length - 5} more errors`)
    }
    console.log()

    // Test 3: Sync User Memberships
    console.log('3️⃣ Testing User Membership Sync...')
    const userResult = await wordpressTeamSync.syncUserMemberships(csvPath)
    console.log('User Sync Result:', {
      success: userResult.success,
      created: userResult.created,
      updated: userResult.updated,
      errors: userResult.errors.slice(0, 5) // Show first 5 errors
    })
    
    if (userResult.errors.length > 5) {
      console.log(`... and ${userResult.errors.length - 5} more errors`)
    }
    console.log()

    // Test 4: Get Sync Status
    console.log('4️⃣ Getting Sync Status...')
    const status = await wordpressTeamSync.getSyncStatus(5)
    console.log('Recent Sync Operations:')
    status.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.sync_type} - ${log.status} - ${log.started_at}`)
    })

  } catch (error) {
    console.error('❌ Error during sync test:', error)
  }
}

// Run the test
testSync()