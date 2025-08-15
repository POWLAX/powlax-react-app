#!/usr/bin/env npx tsx
/**
 * Find Admin Users
 * Search for any users with admin/administrator roles
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function findAdminUsers() {
  console.log('🔍 Searching for Admin Users')
  console.log('='.repeat(40))
  
  try {
    // Check all users and their roles
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, display_name, role, roles, first_name, last_name')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('❌ Error querying all users:', allError.message)
      return
    }

    console.log(`✅ Found ${allUsers?.length || 0} total users`)
    
    if (allUsers && allUsers.length > 0) {
      console.log('\n📋 All users and their roles:')
      allUsers.forEach((user, index) => {
        const fullName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.display_name || 'No name'
        console.log(`${index + 1}. ${fullName} (${user.email})`)
        console.log(`   - Role: "${user.role}"`)
        console.log(`   - Roles: ${JSON.stringify(user.roles)}`)
      })
    }

    // Look for administrator role
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'administrator')

    if (adminError) {
      console.error('❌ Error querying administrators:', adminError.message)
    } else {
      console.log(`\n🔍 Users with "administrator" role: ${adminUsers?.length || 0}`)
      if (adminUsers && adminUsers.length > 0) {
        adminUsers.forEach(user => {
          console.log(`   - ${user.email}: "${user.role}"`)
        })
      }
    }

    // Look for admin role
    const { data: legacyAdminUsers, error: legacyError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')

    if (legacyError) {
      console.error('❌ Error querying legacy admins:', legacyError.message)
    } else {
      console.log(`\n🔍 Users with legacy "admin" role: ${legacyAdminUsers?.length || 0}`)
      if (legacyAdminUsers && legacyAdminUsers.length > 0) {
        legacyAdminUsers.forEach(user => {
          console.log(`   - ${user.email}: "${user.role}"`)
        })
      }
    }

    // Look for any patrick-related emails
    const { data: patrickUsers, error: patrickError } = await supabase
      .from('users')
      .select('*')
      .or('email.ilike.*patrick*,display_name.ilike.*patrick*,first_name.ilike.*patrick*')

    if (patrickError) {
      console.error('❌ Error searching for Patrick:', patrickError.message)
    } else {
      console.log(`\n🔍 Users matching "patrick": ${patrickUsers?.length || 0}`)
      if (patrickUsers && patrickUsers.length > 0) {
        patrickUsers.forEach(user => {
          console.log(`   - ${user.email}: "${user.role}" (${user.display_name})`)
        })
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📋 ADMIN USER SEARCH SUMMARY')
    console.log('='.repeat(50))
    
    const hasAdministrators = adminUsers && adminUsers.length > 0
    const hasLegacyAdmins = legacyAdminUsers && legacyAdminUsers.length > 0
    const hasPatrickUsers = patrickUsers && patrickUsers.length > 0

    if (!hasAdministrators && !hasLegacyAdmins && !hasPatrickUsers) {
      console.log('⚠️  NO ADMIN USERS FOUND')
      console.log('📝 For Phase 6B testing, we need to:')
      console.log('   1. Create a test administrator user')
      console.log('   2. OR test with mock authentication context')
      console.log('   3. OR verify admin UI works with demo user')
    }

    if (hasAdministrators) {
      console.log('✅ Found users with "administrator" role')
    }
    
    if (hasLegacyAdmins) {
      console.log('⚠️  Found users with legacy "admin" role (need migration)')
    }

    if (hasPatrickUsers) {
      console.log('✅ Found Patrick-related users')
    }

  } catch (error) {
    console.error('❌ Search failed:', error)
  }
}

findAdminUsers().then(() => {
  console.log('\n🎯 Admin user search complete')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Search failed:', error)
  process.exit(1)
})