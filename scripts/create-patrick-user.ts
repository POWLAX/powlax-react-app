import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.log('Run: source .env.local && SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY npx tsx scripts/create-patrick-user.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createPatrickUser() {
  console.log('🔧 Creating Patrick user manually...\n')
  
  try {
    // Step 1: Create in auth.users without triggering database functions
    console.log('Step 1: Creating Supabase Auth user...')
    
    // First check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let authUser = existingUsers?.users.find(u => 
      u.email?.toLowerCase() === 'patrick@powlax.com'
    )
    
    if (!authUser) {
      // Use inviteUserByEmail which bypasses some triggers
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail('patrick@powlax.com', {
        data: {
          full_name: 'Patrick Chapla',
          role: 'administrator'
        }
      })
      
      if (inviteError) {
        console.error('❌ Invite failed:', inviteError.message)
        
        // Try alternative: generateLink
        console.log('\nTrying alternative method...')
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'invite',
          email: 'patrick@powlax.com',
          options: {
            data: {
              full_name: 'Patrick Chapla',
              role: 'administrator'
            }
          }
        })
        
        if (linkError) {
          console.error('❌ Generate link failed:', linkError.message)
        } else {
          console.log('✅ Invite link generated!')
          console.log('📧 Link:', linkData.properties?.action_link)
          authUser = linkData.user
        }
      } else {
        console.log('✅ Invite sent to patrick@powlax.com')
        authUser = inviteData.user
      }
    } else {
      console.log('✅ Auth user already exists:', authUser.id)
    }
    
    if (!authUser) {
      console.log('❌ Could not create auth user')
      return
    }
    
    // Step 2: Manually create in users table
    console.log('\nStep 2: Creating record in users table...')
    
    // Check if already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()
    
    if (existingUser) {
      console.log('✅ User already exists in users table')
      console.log('   ID:', existingUser.id)
      console.log('   Email:', existingUser.email)
    } else {
      // Get column information first
      const { data: sampleUser } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single()
      
      if (sampleUser) {
        console.log('📋 Users table columns:', Object.keys(sampleUser))
      }
      
      // Create user with minimal required fields
      const userData: any = {
        auth_user_id: authUser.id,
        email: authUser.email || 'patrick@powlax.com'
      }
      
      // Add optional fields if they exist in the table
      if (sampleUser?.hasOwnProperty('role')) {
        userData.role = 'administrator'
      }
      if (sampleUser?.hasOwnProperty('is_admin')) {
        userData.is_admin = true
      }
      if (sampleUser?.hasOwnProperty('full_name')) {
        userData.full_name = 'Patrick Chapla'
      }
      if (sampleUser?.hasOwnProperty('display_name')) {
        userData.display_name = 'Patrick Chapla'
      }
      if (sampleUser?.hasOwnProperty('created_at')) {
        userData.created_at = new Date().toISOString()
      }
      if (sampleUser?.hasOwnProperty('updated_at')) {
        userData.updated_at = new Date().toISOString()
      }
      
      console.log('📝 Inserting user with data:', userData)
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ Failed to insert:', insertError.message)
        console.log('   Code:', insertError.code)
        console.log('   Details:', insertError.details)
      } else {
        console.log('✅ User created in users table!')
        console.log('   ID:', newUser.id)
      }
    }
    
    console.log('\n✅ Setup complete!')
    console.log('📧 You can now use:')
    console.log('   - /auth/login with patrick@powlax.com')
    console.log('   - /direct-login for quick access')
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

createPatrickUser().catch(console.error)