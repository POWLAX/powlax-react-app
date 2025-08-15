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

async function setupPatrickAuth() {
  console.log('🔧 Setting up authentication for patrick@powlax.com\n')
  
  const email = 'patrick@powlax.com'
  
  // Step 1: Check if patrick exists in public.users
  console.log('📊 Step 1: Checking public.users table...')
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (publicError) {
    console.log('⚠️ No user found in public.users, creating...')
    const { data: newPublicUser, error: createPublicError } = await supabase
      .from('users')
      .insert({
        email,
        full_name: 'Patrick',
        display_name: 'Patrick',
        role: 'admin',
        roles: ['admin'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createPublicError) {
      console.error('❌ Error creating public user:', createPublicError)
    } else {
      console.log('✅ Created public user:', newPublicUser)
    }
  } else {
    console.log('✅ Found existing public user:', {
      id: publicUser.id,
      email: publicUser.email,
      auth_user_id: publicUser.auth_user_id,
      role: publicUser.role
    })
  }
  
  // Step 2: Try to create auth user
  console.log('\n📊 Step 2: Setting up auth.users entry...')
  
  try {
    // First, try to get user by email (might fail due to trigger issue)
    const { data: existingAuth, error: getError } = await supabase.auth.admin.getUserById(
      publicUser?.auth_user_id || 'dummy-id'
    ).catch(() => ({ data: null, error: 'Not found' }))
    
    if (existingAuth?.user) {
      console.log('✅ Auth user already exists:', {
        id: existingAuth.user.id,
        email: existingAuth.user.email
      })
    } else {
      // Try to create a new auth user
      console.log('📝 Creating new auth user...')
      const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'TempPassword123!', // This won't be used with magic links
        user_metadata: {
          full_name: 'Patrick',
          role: 'admin'
        }
      })
      
      if (createAuthError) {
        console.error('❌ Error creating auth user:', createAuthError)
        console.log('This might be okay if user already exists')
      } else if (newAuthUser?.user) {
        console.log('✅ Created auth user:', {
          id: newAuthUser.user.id,
          email: newAuthUser.user.email
        })
        
        // Update public.users with auth_user_id
        if (publicUser) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ auth_user_id: newAuthUser.user.id })
            .eq('email', email)
          
          if (updateError) {
            console.error('❌ Error updating public user with auth_user_id:', updateError)
          } else {
            console.log('✅ Linked public user to auth user')
          }
        }
      }
    }
  } catch (error) {
    console.error('⚠️ Error in auth user setup:', error)
  }
  
  // Step 3: Generate a magic link token directly
  console.log('\n📊 Step 3: Generating magic link...')
  
  try {
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    })
    
    if (magicLinkError) {
      console.error('❌ Error generating magic link:', magicLinkError)
    } else if (magicLinkData) {
      console.log('✅ Magic link generated!')
      console.log('\n' + '='.repeat(60))
      console.log('🔗 MAGIC LINK URL:')
      console.log('='.repeat(60))
      console.log(magicLinkData.properties.action_link)
      console.log('='.repeat(60))
      console.log('\n📝 Instructions:')
      console.log('1. Copy the URL above')
      console.log('2. Open it in your browser')
      console.log('3. You should be redirected to /auth/callback')
      console.log('4. The callback will establish your session')
      console.log('5. You should then be redirected to /dashboard')
    }
  } catch (error) {
    console.error('❌ Error generating magic link:', error)
  }
}

setupPatrickAuth()