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

async function checkAuthTriggers() {
  console.log('🔍 Checking auth triggers and functions...\n')
  
  // Skip trigger check as RPC might not exist
  console.log('⚠️ Skipping trigger check (RPC function may not exist)')
  
  // Try to directly check if user creation works
  console.log('\n🧪 Testing direct user creation in auth.users...')
  
  const testEmail = 'test-' + Date.now() + '@example.com'
  
  try {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      password: 'TestPassword123!',
      user_metadata: {
        test: true
      }
    })
    
    if (createError) {
      console.error('❌ Error creating test user:', createError)
      console.log('\n🔴 This suggests there might be a trigger or constraint blocking user creation')
    } else {
      console.log('✅ Test user created successfully:', {
        id: newUser.user?.id,
        email: newUser.user?.email
      })
      
      // Clean up test user
      if (newUser.user?.id) {
        await supabase.auth.admin.deleteUser(newUser.user.id)
        console.log('🧹 Test user cleaned up')
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
  
  // Check existing auth users
  console.log('\n📊 Checking existing auth users...')
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('❌ Error listing users:', listError)
  } else {
    console.log(`Found ${authUsers.users.length} users in auth.users table`)
    
    const patrickUser = authUsers.users.find(u => u.email === 'patrick@powlax.com')
    if (patrickUser) {
      console.log('\n✅ patrick@powlax.com exists in auth.users:', {
        id: patrickUser.id,
        email: patrickUser.email,
        confirmed: patrickUser.email_confirmed_at ? 'Yes' : 'No',
        created: patrickUser.created_at
      })
    } else {
      console.log('\n⚠️ patrick@powlax.com NOT found in auth.users')
    }
  }
  
  // Check public.users table
  console.log('\n📊 Checking public.users table...')
  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('id, email, auth_user_id, role, created_at')
    .eq('email', 'patrick@powlax.com')
  
  if (publicError) {
    console.error('❌ Error querying public.users:', publicError)
  } else if (publicUsers && publicUsers.length > 0) {
    console.log('✅ patrick@powlax.com in public.users:', publicUsers[0])
  } else {
    console.log('⚠️ patrick@powlax.com NOT found in public.users')
  }
}

checkAuthTriggers()