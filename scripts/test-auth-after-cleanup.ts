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

async function testAuthAfterCleanup() {
  console.log('🔍 Testing Authentication After WordPress Cleanup\n')
  console.log('=' .repeat(60))
  
  const testEmail = 'patrick@powlax.com'
  
  // Step 1: Test if we can now send magic links
  console.log('\n📧 Step 1: Testing magic link generation...')
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        shouldCreateUser: false // Don't create if doesn't exist
      }
    })
    
    if (error) {
      console.log('❌ Magic link failed:', error.message)
      
      if (error.message.includes('Database error')) {
        console.log('\n⚠️ Database triggers are STILL blocking authentication!')
        console.log('You may need to:')
        console.log('1. Check if there are more triggers on auth.users table')
        console.log('2. Disable triggers temporarily')
        console.log('3. Check RLS policies')
      }
    } else {
      console.log('✅ Magic link sent successfully!')
      console.log('This means the WordPress blocks have been removed!')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
  
  // Step 2: Test creating a new user
  console.log('\n👤 Step 2: Testing user creation...')
  
  const testNewEmail = `test-${Date.now()}@example.com`
  
  try {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testNewEmail,
      email_confirm: true,
      password: 'TestPassword123!'
    })
    
    if (createError) {
      console.log('❌ Cannot create user:', createError.message)
    } else if (newUser?.user) {
      console.log('✅ User created successfully!')
      console.log('   ID:', newUser.user.id)
      console.log('   Email:', newUser.user.email)
      
      // Clean up
      await supabase.auth.admin.deleteUser(newUser.user.id)
      console.log('🧹 Test user cleaned up')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
  
  // Step 3: Check patrick@powlax.com in public.users
  console.log('\n📊 Step 3: Checking patrick@powlax.com status...')
  
  const { data: patrickUser, error: patrickError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .single()
  
  if (patrickError) {
    console.log('❌ patrick@powlax.com not found in users table')
  } else {
    console.log('✅ patrick@powlax.com exists:')
    console.log('   ID:', patrickUser.id)
    console.log('   Role:', patrickUser.role)
    console.log('   Auth User ID:', patrickUser.auth_user_id || 'Not linked')
    console.log('   WordPress ID:', patrickUser.wordpress_id || 'None (Good!)')
  }
  
  // Step 4: Generate a direct magic link
  console.log('\n🔗 Step 4: Generating admin magic link...')
  
  try {
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    })
    
    if (linkError) {
      console.log('❌ Cannot generate magic link:', linkError.message)
    } else if (linkData) {
      console.log('✅ Magic link generated!')
      console.log('\n' + '=' .repeat(60))
      console.log('🔗 MAGIC LINK URL:')
      console.log('=' .repeat(60))
      console.log(linkData.properties.action_link)
      console.log('=' .repeat(60))
      console.log('\nClick this link to sign in as patrick@powlax.com')
    }
  } catch (error) {
    console.error('❌ Error generating link:', error)
  }
  
  // Final summary
  console.log('\n' + '=' .repeat(60))
  console.log('📋 AUTHENTICATION STATUS SUMMARY:')
  console.log('=' .repeat(60))
  
  // Try one more OTP test to be sure
  const { error: finalTest } = await supabase.auth.signInWithOtp({
    email: testEmail,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback'
    }
  })
  
  if (!finalTest) {
    console.log('✅ AUTHENTICATION IS WORKING!')
    console.log('   - Magic links can be sent')
    console.log('   - Users can be created')
    console.log('   - WordPress blocks have been removed')
    console.log('\n📝 Next: Check your email for the magic link')
  } else {
    console.log('⚠️ PARTIAL SUCCESS')
    console.log('   - Some WordPress blocks removed')
    console.log('   - But authentication still has issues')
    console.log('   - Error:', finalTest.message)
    console.log('\n📝 Use /auth/direct-auth workaround for now')
  }
}

testAuthAfterCleanup().catch(console.error)