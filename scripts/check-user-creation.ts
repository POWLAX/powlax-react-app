import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.log('Run: source .env.local && SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY npx tsx scripts/check-user-creation.ts')
  process.exit(1)
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkUserCreation() {
  console.log('Checking user creation for Patrick@POWLAX.com...\n')
  
  // Check if user exists in auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
    return
  }
  
  const authUser = authUsers.users.find(u => 
    u.email?.toLowerCase() === 'patrick@powlax.com' || 
    u.email === 'Patrick@POWLAX.com'
  )
  
  if (authUser) {
    console.log('✅ Found in auth.users:')
    console.log('  ID:', authUser.id)
    console.log('  Email:', authUser.email)
    console.log('  Created:', authUser.created_at)
    
    // Check if user exists in public.users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()
    
    if (dbError) {
      console.log('\n❌ NOT found in public.users table')
      console.log('  Error:', dbError.message)
      
      // Try to create the user in public.users
      console.log('\n📝 Attempting to create user in public.users...')
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          role: 'administrator',
          is_admin: true,
          full_name: 'Patrick Chapla',
          display_name: 'Patrick Chapla',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.log('❌ Failed to create user:', createError.message)
        console.log('   Details:', JSON.stringify(createError, null, 2))
      } else {
        console.log('✅ User created successfully!')
        console.log('   User ID:', newUser.id)
      }
    } else {
      console.log('\n✅ Found in public.users table:')
      console.log('  ID:', dbUser.id)
      console.log('  Role:', dbUser.role)
      console.log('  Is Admin:', dbUser.is_admin)
    }
  } else {
    console.log('❌ User not found in auth.users')
    console.log('\n📝 Creating user in Supabase Auth...')
    
    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: 'Patrick@POWLAX.com',
      email_confirm: true,
      user_metadata: {
        full_name: 'Patrick Chapla',
        role: 'administrator'
      }
    })
    
    if (createAuthError) {
      console.log('❌ Failed to create auth user:', createAuthError.message)
    } else {
      console.log('✅ Auth user created!')
      console.log('   ID:', newAuthUser.user?.id)
      console.log('   Email:', newAuthUser.user?.email)
      
      // Now create in public.users
      if (newAuthUser.user) {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .insert({
            auth_user_id: newAuthUser.user.id,
            email: newAuthUser.user.email,
            role: 'administrator',
            is_admin: true,
            full_name: 'Patrick Chapla',
            display_name: 'Patrick Chapla',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (dbError) {
          console.log('\n❌ Failed to create user in public.users:', dbError.message)
        } else {
          console.log('\n✅ User created in public.users!')
          console.log('   User ID:', dbUser.id)
        }
      }
    }
  }
  
  console.log('\n✅ Script complete!')
}

checkUserCreation().catch(console.error)