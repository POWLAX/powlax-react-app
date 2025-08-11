#!/usr/bin/env npx tsx

/**
 * Ensure Patrick Admin Access Script
 * Updates Patrick's user record to have administrator role
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

const PATRICK_EMAIL = 'patrick@powlax.com'

async function ensurePatrickAdminAccess() {
  console.log('🔍 Checking Patrick\'s current user record...')
  
  try {
    // First, check if Patrick exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', PATRICK_EMAIL)
      .single()

    if (userError) {
      console.error('❌ Error finding Patrick\'s user record:', userError.message)
      
      if (userError.code === 'PGRST116') { // No rows found
        console.log('📝 Patrick not found in users table. Creating record...')
        
        // Create Patrick's user record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: PATRICK_EMAIL,
            display_name: 'Patrick (POWLAX Admin)',
            full_name: 'Patrick Chapla',
            role: 'administrator',
            roles: ['administrator'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create Patrick\'s user record:', createError)
          return false
        }

        console.log('✅ Created Patrick\'s user record:', {
          email: newUser.email,
          role: newUser.role,
          roles: newUser.roles
        })
        return true
      }
      
      return false
    }

    console.log('📋 Current Patrick user record:')
    console.log({
      id: existingUser.id,
      email: existingUser.email,
      display_name: existingUser.display_name,
      role: existingUser.role,
      roles: existingUser.roles,
      auth_user_id: existingUser.auth_user_id
    })

    // Check if Patrick already has administrator role
    const hasAdministratorRole = existingUser.roles?.includes('administrator') || existingUser.role === 'administrator'
    
    if (hasAdministratorRole) {
      console.log('✅ Patrick already has administrator access!')
      return true
    }

    // Update Patrick to have administrator role
    console.log('🔧 Updating Patrick to have administrator role...')
    
    // Ensure roles array includes 'administrator' and role field is 'administrator'
    const updatedRoles = Array.from(new Set([...(existingUser.roles || []), 'administrator']))
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role: 'administrator',
        roles: updatedRoles,
        updated_at: new Date().toISOString()
      })
      .eq('email', PATRICK_EMAIL)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update Patrick\'s role:', updateError)
      return false
    }

    console.log('✅ Successfully updated Patrick\'s admin access:')
    console.log({
      email: updatedUser.email,
      role: updatedUser.role,
      roles: updatedUser.roles
    })

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

async function checkMagicLinks() {
  console.log('\n🔗 Checking magic_links table for Patrick...')
  
  try {
    const { data: magicLinks, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('email', PATRICK_EMAIL)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error checking magic links:', error)
      return
    }

    if (!magicLinks || magicLinks.length === 0) {
      console.log('📝 No magic links found for Patrick')
      return
    }

    console.log(`📋 Found ${magicLinks.length} magic links for Patrick:`)
    magicLinks.forEach((link, index) => {
      console.log(`  ${index + 1}. Created: ${link.created_at}, Expires: ${link.expires_at}, Supabase ID: ${link.supabase_user_id || 'none'}`)
    })

  } catch (error) {
    console.error('💥 Error checking magic links:', error)
  }
}

async function checkUserSessions() {
  console.log('\n🔐 Checking user_sessions table...')
  
  try {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error checking user sessions:', error)
      return
    }

    console.log(`📋 Found ${sessions?.length || 0} recent sessions`)
    if (sessions && sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`  ${index + 1}. User ID: ${session.user_id}, Created: ${session.created_at}, Expires: ${session.expires_at}`)
      })
    }

  } catch (error) {
    console.error('💥 Error checking user sessions:', error)
  }
}

async function main() {
  console.log('🚀 Patrick Admin Access Verification Script')
  console.log('==========================================')
  
  const success = await ensurePatrickAdminAccess()
  
  if (success) {
    console.log('\n✅ Patrick admin access verification complete!')
    
    // Additional verification checks
    await checkMagicLinks()
    await checkUserSessions()
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Test login at /direct-login with patrick@powlax.com')
    console.log('2. Verify admin navigation items are visible')
    console.log('3. Check admin features work correctly')
    
  } else {
    console.log('\n❌ Failed to ensure Patrick admin access!')
    console.log('Manual intervention required.')
  }
}

// Run the script
main().catch(console.error)