#!/usr/bin/env npx tsx
/**
 * Create a mock session for development testing
 * This simulates a logged-in user without actual authentication
 * 
 * Usage: npx tsx scripts/create-mock-session.ts [email]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createMockSession() {
  const email = process.argv[2] || 'patrick@powlax.com'
  
  console.log(`\n🔐 Creating mock session for: ${email}`)
  
  // Get user from database
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !user) {
    console.error('❌ User not found:', email)
    process.exit(1)
  }
  
  // Create a mock session object
  const mockSession = {
    id: user.id,
    email: user.email,
    full_name: user.full_name || user.display_name,
    role: user.role,
    roles: user.roles || [user.role],
    display_name: user.display_name || user.full_name || user.email,
    wordpress_id: user.wordpress_id,
    avatar_url: user.avatar_url
  }
  
  // Create a localStorage script
  const localStorageScript = `
// Run this in your browser console to set mock session:
localStorage.setItem('supabase_auth_user', '${JSON.stringify(mockSession)}');
localStorage.setItem('supabase_auth_session', '${JSON.stringify({ user: mockSession, expires_at: Date.now() + 86400000 })}');
location.reload();
`
  
  console.log('\n✅ User found:')
  console.log(`   Name: ${user.display_name || user.full_name || 'Not set'}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Roles: ${JSON.stringify(user.roles)}`)
  
  console.log('\n📋 To create a mock session, run this in your browser console:')
  console.log('=' .repeat(60))
  console.log(localStorageScript)
  console.log('=' .repeat(60))
  
  console.log('\n🧹 To clear the session:')
  console.log(`localStorage.clear(); location.reload();`)
}

createMockSession().catch(console.error)