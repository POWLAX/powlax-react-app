#!/usr/bin/env npx tsx
/**
 * Create an authenticated session for Patrick
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAuthSession() {
  console.log('🔐 Creating auth session for Patrick...\n')

  const PATRICK_ID = '523f2768-6404-439c-a429-f9eb6736aa17'

  // Get Patrick's user data
  const { data: patrick, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', PATRICK_ID)
    .single()

  if (userError || !patrick) {
    console.error('❌ Could not find Patrick\'s account:', userError)
    process.exit(1)
  }

  console.log('✅ Found Patrick\'s account:')
  console.log('  Email:', patrick.email)
  console.log('  Roles:', patrick.roles?.join(', '))
  console.log('  Club:', patrick.club_id)

  // Create a session
  const { data: session, error: sessionError } = await supabase
    .from('user_sessions')
    .insert({
      user_id: PATRICK_ID,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Session creation error:', sessionError)
  } else {
    console.log('\n✅ Session created!')
  }

  console.log('\n🚀 To authenticate in the app:')
  console.log('1. Visit: http://localhost:3000/direct-login')
  console.log('2. Click: "Login as patrick@powlax.com"')
  console.log('3. You will be redirected to the dashboard')
  console.log('\nAlternatively, you can use the authentication method already built into the app.')
  
  console.log('\n📝 If you\'re seeing the public page, it means you need to log in first.')
}

// Run
createAuthSession()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })