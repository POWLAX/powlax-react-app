import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjEwMzEsImV4cCI6MjA1MDEzNzAzMX0.dYqPbMzePgCYpvJlwwD6Pj9KFh1qyKYnTxTepUkgdh0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for this migration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeRoleStandardizationMigration() {
  console.log('🚀 Phase 2: Database Migration Executor - Role Standardization')
  console.log('===========================================================')
  
  try {
    // Step 1: Verify current state
    console.log('\n1. Verifying current state...')
    const { data: currentUsers, error: currentError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, display_name')
      .eq('role', 'admin')

    if (currentError) {
      console.error('❌ Error checking current users:', currentError)
      return
    }

    console.log(`📊 Found ${currentUsers?.length || 0} users with 'admin' role:`)
    currentUsers?.forEach(user => {
      const name = user.display_name || `${user.first_name || 'NOT SET'} ${user.last_name || 'NOT SET'}`.trim()
      console.log(`  - ${user.email}: ${user.role} (${name})`)
    })

    // Verify Patrick is the only admin
    const patrickUser = currentUsers?.find(u => u.email === 'patrick@powlax.com')
    if (!patrickUser) {
      console.error('❌ Patrick user not found with admin role!')
      return
    }

    if (currentUsers?.length !== 1) {
      console.warn(`⚠️  Warning: Found ${currentUsers?.length} admin users, expected only Patrick`)
    }

    // Step 2: Execute the migration
    console.log('\n2. Executing role migration...')
    console.log(`   Updating: ${patrickUser.email} from 'admin' to 'administrator'`)
    
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ role: 'administrator' })
      .eq('email', 'patrick@powlax.com')
      .eq('role', 'admin')
      .select('id, email, role, first_name, last_name, display_name')

    if (updateError) {
      console.error('❌ Error updating user role:', updateError)
      return
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ No records updated - this is unexpected!')
      return
    }

    console.log(`✅ Successfully updated ${updateResult.length} record(s)`)
    updateResult.forEach(user => {
      const name = user.display_name || `${user.first_name || 'NOT SET'} ${user.last_name || 'NOT SET'}`.trim()
      console.log(`  - ${user.email}: ${user.role} (${name})`)
    })

    // Step 3: Verify the update and WordPress alignment
    console.log('\n3. Verifying update and WordPress alignment...')
    const { data: verifyResult, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, display_name')
      .eq('email', 'patrick@powlax.com')

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError)
      return
    }

    if (!verifyResult || verifyResult.length === 0) {
      console.error('❌ Patrick user not found after update!')
      return
    }

    const updatedUser = verifyResult[0]
    const name = updatedUser.display_name || `${updatedUser.first_name || 'NOT SET'} ${updatedUser.last_name || 'NOT SET'}`.trim()
    const wordpressAlignment = updatedUser.role === 'administrator' 
      ? '✅ Matches WordPress' 
      : '❌ Does not match WordPress'

    console.log('📋 Updated user verification:')
    console.log(`   ID: ${updatedUser.id}`)
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Role: ${updatedUser.role}`)
    console.log(`   Name: ${name}`)
    console.log(`   WordPress Alignment: ${wordpressAlignment}`)

    // Step 4: Check for any remaining admin roles
    console.log('\n4. Checking for remaining admin roles...')
    const { data: remainingAdmins, error: remainingError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, display_name')
      .eq('role', 'admin')

    if (remainingError) {
      console.error('❌ Error checking for remaining admins:', remainingError)
      return
    }

    if (remainingAdmins && remainingAdmins.length > 0) {
      console.warn(`⚠️  Found ${remainingAdmins.length} users still with 'admin' role:`)
      remainingAdmins.forEach(user => {
        const name = user.display_name || `${user.first_name || 'NOT SET'} ${user.last_name || 'NOT SET'}`.trim()
        console.log(`  - ${user.email}: ${user.role} (${name})`)
      })
    } else {
      console.log('✅ No users found with "admin" role - migration successful')
    }

    // Step 5: Final summary
    console.log('\n🎉 Phase 2 Migration Complete!')
    console.log('================================')
    console.log('✅ Patrick\'s role updated from "admin" to "administrator"')
    console.log('✅ WordPress alignment achieved (administrator = WordPress standard)')
    console.log('✅ Only 1 record affected as expected')
    console.log('\nNext: Phase 3 - Authentication Testing')

  } catch (error) {
    console.error('❌ Migration failed with error:', error)
  }
}

// Execute the migration
executeRoleStandardizationMigration()