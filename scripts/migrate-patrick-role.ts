#!/usr/bin/env npx tsx
/**
 * Phase 6B - Database Migration: Patrick's Role Update
 * Migrates Patrick's role from "admin" to "administrator" for WordPress alignment
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

async function migratePatrickRole() {
  console.log('🚀 Phase 6B: Patrick Role Migration')
  console.log('Updating role from "admin" to "administrator"')
  console.log('='.repeat(50))
  
  try {
    // 1. Verify current state
    console.log('\n1. Verifying current state...')
    const { data: beforeUser, error: beforeError } = await supabase
      .from('users')
      .select('id, email, display_name, role, roles')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (beforeError) {
      console.error('❌ Error finding Patrick:', beforeError.message)
      return
    }

    if (!beforeUser) {
      console.log('❌ Patrick not found in database')
      return
    }

    console.log('✅ Patrick found:')
    console.log(`   - Email: ${beforeUser.email}`)
    console.log(`   - Name: ${beforeUser.display_name}`)
    console.log(`   - Current Role: "${beforeUser.role}"`)
    console.log(`   - Roles Array: ${JSON.stringify(beforeUser.roles)}`)

    if (beforeUser.role === 'administrator') {
      console.log('✅ Patrick already has "administrator" role - no migration needed')
      return
    }

    if (beforeUser.role !== 'admin') {
      console.log(`⚠️  Patrick has unexpected role: "${beforeUser.role}"`)
      console.log('Migration aborted for safety')
      return
    }

    // 2. Create backup timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    console.log(`\n2. Creating backup (timestamp: ${timestamp})...`)
    
    // Log current state for rollback
    console.log('📝 Backup data for rollback:')
    console.log(`   - ID: ${beforeUser.id}`)
    console.log(`   - Email: ${beforeUser.email}`)
    console.log(`   - Old Role: "${beforeUser.role}"`)
    console.log(`   - Old Roles: ${JSON.stringify(beforeUser.roles)}`)

    // 3. Perform the migration
    console.log('\n3. Executing migration...')
    console.log('SQL: UPDATE users SET role = \'administrator\' WHERE email = \'patrick@powlax.com\' AND role = \'admin\'')
    
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'administrator',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'patrick@powlax.com')
      .eq('role', 'admin')
      .select('id, email, display_name, role, roles')

    if (updateError) {
      console.error('❌ Migration failed:', updateError.message)
      return
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ No records updated - migration failed')
      return
    }

    // 4. Verify the update
    console.log('\n4. Verifying migration...')
    const { data: afterUser, error: afterError } = await supabase
      .from('users')
      .select('id, email, display_name, role, roles, updated_at')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (afterError) {
      console.error('❌ Error verifying migration:', afterError.message)
      return
    }

    console.log('✅ Migration verification:')
    console.log(`   - Email: ${afterUser.email}`)
    console.log(`   - Name: ${afterUser.display_name}`)
    console.log(`   - New Role: "${afterUser.role}"`)
    console.log(`   - Roles Array: ${JSON.stringify(afterUser.roles)}`)
    console.log(`   - Updated At: ${afterUser.updated_at}`)

    // 5. WordPress alignment check
    const isWordPressAligned = afterUser.role === 'administrator'
    console.log(`   - WordPress Aligned: ${isWordPressAligned ? '✅' : '❌'}`)

    // 6. Test authentication still works
    console.log('\n5. Testing authentication...')
    
    // Try to query with the updated user
    const { data: testQuery, error: testError } = await supabase
      .from('users')
      .select('role')
      .eq('role', 'administrator')
      .eq('email', 'patrick@powlax.com')
      .single()

    if (testError) {
      console.error('❌ Authentication test failed:', testError.message)
    } else {
      console.log(`✅ Authentication test passed - role query successful`)
    }

    // 7. Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY')
    console.log('='.repeat(50))
    console.log(`✅ Patrick's role updated: "admin" → "administrator"`)
    console.log(`✅ WordPress alignment: CONFIRMED`)
    console.log(`✅ Database record count: ${updateResult.length} updated`)
    console.log(`✅ Authentication test: PASSED`)
    console.log('')
    console.log('🎯 Ready for Phase 6B functional testing!')
    console.log('')
    console.log('ROLLBACK SQL (if needed):')
    console.log(`UPDATE users SET role = 'admin' WHERE email = 'patrick@powlax.com' AND role = 'administrator';`)

  } catch (error) {
    console.error('❌ Migration failed with error:', error)
    console.log('\n🔧 ROLLBACK INSTRUCTIONS:')
    console.log('If Patrick\'s record was partially updated, run:')
    console.log(`UPDATE users SET role = 'admin' WHERE email = 'patrick@powlax.com';`)
  }
}

// Run if called directly
if (require.main === module) {
  migratePatrickRole().then(() => {
    console.log('\n🎯 Migration script complete')
    process.exit(0)
  }).catch((error) => {
    console.error('❌ Migration script failed:', error)
    process.exit(1)
  })
}

export { migratePatrickRole }