#!/usr/bin/env npx tsx
/**
 * Test Patrick's Role Status - Phase 6B Functional Testing
 * Verifies current role value and admin functionality
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

async function testPatrickRoleStatus() {
  console.log('🔍 Phase 6B: Testing Patrick\'s Role Status')
  console.log('='.repeat(50))
  
  try {
    // 1. Check Patrick's current role value
    console.log('\n1. Checking Patrick\'s role in database...')
    const { data: patrickUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at, updated_at')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (userError) {
      console.error('❌ Error finding Patrick:', userError.message)
      return
    }

    if (!patrickUser) {
      console.log('⚠️  Patrick not found in database')
      return
    }

    console.log('✅ Patrick found in database:')
    console.log(`   - ID: ${patrickUser.id}`)
    console.log(`   - Email: ${patrickUser.email}`)
    console.log(`   - Name: ${patrickUser.full_name}`)
    console.log(`   - Role: "${patrickUser.role}"`)
    
    // 2. Check WordPress alignment
    const isWordPressAligned = patrickUser.role === 'administrator'
    console.log(`   - WordPress aligned: ${isWordPressAligned ? '✅' : '❌'}`)
    
    if (!isWordPressAligned) {
      console.log('   ⚠️  Role needs migration from "admin" to "administrator"')
    }

    // 3. Test role-based queries
    console.log('\n2. Testing role-based access queries...')
    
    // Query for administrators
    const { data: admins, error: adminError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'administrator')

    if (adminError) {
      console.error('❌ Error querying administrators:', adminError.message)
    } else {
      console.log(`✅ Found ${admins?.length || 0} administrators`)
      if (admins && admins.length > 0) {
        admins.forEach(admin => {
          console.log(`   - ${admin.email}: "${admin.role}"`)
        })
      }
    }

    // Query for legacy "admin" role
    const { data: legacyAdmins, error: legacyError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')

    if (legacyError) {
      console.error('❌ Error querying legacy admins:', legacyError.message)
    } else {
      console.log(`📊 Found ${legacyAdmins?.length || 0} users with legacy "admin" role`)
      if (legacyAdmins && legacyAdmins.length > 0) {
        legacyAdmins.forEach(admin => {
          console.log(`   - ${admin.email}: "${admin.role}" (needs migration)`)
        })
      }
    }

    // 4. Test teams Patrick should have access to
    console.log('\n3. Testing team access for administrator...')
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, club_id')
      .limit(5)

    if (teamsError) {
      console.error('❌ Error querying teams:', teamsError.message)
    } else {
      console.log(`✅ Found ${teams?.length || 0} teams (admin should access all)`)
      if (teams && teams.length > 0) {
        teams.forEach(team => {
          console.log(`   - ${team.name} (ID: ${team.id})`)
        })
      }
    }

    // 5. Test clubs access
    console.log('\n4. Testing club access for administrator...')
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .limit(5)

    if (clubsError) {
      console.error('❌ Error querying clubs:', clubsError.message)
    } else {
      console.log(`✅ Found ${clubs?.length || 0} clubs (admin should access all)`)
      if (clubs && clubs.length > 0) {
        clubs.forEach(club => {
          console.log(`   - ${club.name} (ID: ${club.id})`)
        })
      }
    }

    // 6. Summary and recommendations
    console.log('\n' + '='.repeat(50))
    console.log('📋 PHASE 6B TEST SUMMARY')
    console.log('='.repeat(50))
    
    if (patrickUser.role === 'administrator') {
      console.log('✅ Patrick has "administrator" role')
      console.log('✅ WordPress alignment confirmed')
      console.log('✅ Ready for admin functionality testing')
    } else if (patrickUser.role === 'admin') {
      console.log('⚠️  Patrick has legacy "admin" role')
      console.log('❌ WordPress alignment missing')
      console.log('🔧 Database migration needed before full testing')
      console.log('')
      console.log('Migration SQL needed:')
      console.log(`UPDATE users SET role = 'administrator' WHERE email = 'patrick@powlax.com';`)
    } else {
      console.log(`❌ Patrick has unexpected role: "${patrickUser.role}"`)
      console.log('🔧 Manual investigation needed')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  testPatrickRoleStatus().then(() => {
    console.log('\n🎯 Phase 6B database test complete')
    process.exit(0)
  }).catch((error) => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
}

export { testPatrickRoleStatus }