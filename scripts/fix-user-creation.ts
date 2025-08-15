import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  console.log('Run with: source .env.local && npx tsx scripts/fix-user-creation.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixUserCreation() {
  console.log('🔧 Fixing user creation for patrick@powlax.com...\n')
  
  try {
    // Step 1: Check if user exists in auth.users (Supabase Auth)
    console.log('Step 1: Checking Supabase Auth (auth.users)...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }
    
    let authUser = authUsers.users.find(u => 
      u.email?.toLowerCase() === 'patrick@powlax.com'
    )
    
    if (!authUser) {
      console.log('📝 User not found in Supabase Auth. Creating...')
      
      // Create the auth user
      const { data: newAuthData, error: createAuthError } = await supabase.auth.admin.createUser({
        email: 'patrick@powlax.com',
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: 'Patrick Chapla',
          role: 'administrator'
        }
      })
      
      if (createAuthError) {
        console.error('❌ Failed to create auth user:', createAuthError.message)
        
        // If it's a database error, try to diagnose
        if (createAuthError.message.includes('Database error')) {
          console.log('\n🔍 This error usually means:')
          console.log('  1. The users table has a trigger that\'s failing')
          console.log('  2. Required fields are missing in the users table')
          console.log('  3. RLS policies are blocking the insert')
          console.log('\nTrying alternative approach...')
          
          // Try using signInWithOtp instead
          console.log('\n📧 Sending magic link instead...')
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: 'patrick@powlax.com',
            options: {
              shouldCreateUser: false // Don't try to create user
            }
          })
          
          if (otpError) {
            console.error('❌ Magic link also failed:', otpError.message)
          } else {
            console.log('✅ Magic link sent! Check your email.')
          }
        }
        return
      }
      
      authUser = newAuthData.user
      console.log('✅ Auth user created:', authUser?.id)
    } else {
      console.log('✅ Found auth user:', authUser.id)
    }
    
    // Step 2: Check if user exists in users table
    console.log('\nStep 2: Checking users table...')
    
    if (!authUser) {
      console.log('❌ No auth user to check against')
      return
    }
    
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()
    
    if (dbError && dbError.code === 'PGRST116') {
      // User doesn't exist in users table
      console.log('📝 User not found in users table. Creating...')
      
      const newUserData = {
        auth_user_id: authUser.id,
        email: authUser.email,
        role: 'administrator',
        is_admin: true,
        full_name: 'Patrick Chapla',
        display_name: 'Patrick Chapla',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Inserting with data:', JSON.stringify(newUserData, null, 2))
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create user in users table:', createError.message)
        console.log('Error details:', JSON.stringify(createError, null, 2))
        
        // Check what columns exist in the users table
        console.log('\n🔍 Checking users table structure...')
        const { data: tableInfo, error: infoError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
        
        if (!infoError && tableInfo && tableInfo.length > 0) {
          console.log('Users table columns:', Object.keys(tableInfo[0]))
        }
      } else {
        console.log('✅ User created in users table!')
        console.log('  ID:', newUser?.id)
      }
    } else if (dbError) {
      console.error('❌ Error checking users table:', dbError.message)
    } else {
      console.log('✅ User already exists in users table')
      console.log('  ID:', dbUser.id)
      console.log('  Email:', dbUser.email)
      console.log('  Role:', dbUser.role)
      console.log('  Is Admin:', dbUser.is_admin)
    }
    
    // Step 3: Test magic link
    console.log('\n📧 You can now use /direct-login or /auth/login')
    console.log('Email: patrick@powlax.com')
    
  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message)
    console.log('Stack:', error.stack)
  }
}

// Run the fix
fixUserCreation().then(() => {
  console.log('\n✅ Script complete!')
}).catch(console.error)