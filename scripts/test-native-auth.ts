import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testNativeAuth() {
  console.log('🔍 Testing native Supabase authentication flow...\n')
  
  const testEmail = 'patrick@powlax.com'
  
  // Step 1: Send magic link
  console.log('📧 Step 1: Sending magic link to', testEmail)
  const { data, error } = await supabase.auth.signInWithOtp({
    email: testEmail,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback',
      shouldCreateUser: true,
      data: {
        email: testEmail,
        is_admin: true
      }
    }
  })
  
  if (error) {
    console.error('❌ Error sending magic link:', error)
    return
  }
  
  console.log('✅ Magic link sent successfully!')
  console.log('📋 Response:', JSON.stringify(data, null, 2))
  
  // Step 2: Check if auth.users record exists
  console.log('\n🔍 Step 2: Checking auth.users table...')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError)
  } else {
    const patrickAuthUser = authUsers.users.find(u => u.email === testEmail)
    if (patrickAuthUser) {
      console.log('✅ Found auth user:', {
        id: patrickAuthUser.id,
        email: patrickAuthUser.email,
        confirmed: patrickAuthUser.email_confirmed_at ? 'Yes' : 'No',
        created: patrickAuthUser.created_at
      })
    } else {
      console.log('⚠️ Auth user not found yet (may be created on first login)')
    }
  }
  
  // Step 3: Check if public.users record exists
  console.log('\n🔍 Step 3: Checking public.users table...')
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .single()
  
  if (publicError) {
    console.log('⚠️ Public user not found:', publicError.message)
  } else {
    console.log('✅ Found public user:', {
      id: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
      roles: publicUser.roles,
      auth_user_id: publicUser.auth_user_id || 'Not linked yet'
    })
  }
  
  // Step 4: Instructions for manual testing
  console.log('\n' + '='.repeat(60))
  console.log('📝 MANUAL TESTING INSTRUCTIONS:')
  console.log('='.repeat(60))
  console.log('1. Check your email for the magic link from Supabase')
  console.log('2. Click the link in the email')
  console.log('3. You should be redirected to /auth/callback')
  console.log('4. The callback page should extract tokens and establish session')
  console.log('5. You should then be redirected to /dashboard')
  console.log('6. Check browser console for authentication logs')
  console.log('\n🔗 If email doesn\'t arrive, you can manually construct the link:')
  console.log('   http://localhost:3000/auth/callback#access_token=XXX&refresh_token=YYY')
  console.log('   (Get tokens from Supabase dashboard > Authentication > Users)')
}

testNativeAuth()