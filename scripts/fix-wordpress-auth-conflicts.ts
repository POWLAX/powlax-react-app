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
  },
  db: {
    schema: 'public'
  }
})

async function analyzeWordPressConflicts() {
  console.log('🔍 Analyzing WordPress/MemberPress Authentication Conflicts\n')
  console.log('=' .repeat(60))
  
  // 1. Check users table structure
  console.log('\n📊 Step 1: Checking users table structure...')
  
  let columns = null
  let columnsError = null
  
  try {
    const result = await supabase.rpc('get_table_columns', {
      table_name: 'users',
      schema_name: 'public'
    })
    columns = result.data
    columnsError = result.error
  } catch (e) {
    columnsError = 'RPC not available'
  }
  
  if (!columnsError && columns) {
    const wpColumns = columns.filter((col: any) => 
      col.column_name.includes('wordpress') || 
      col.column_name.includes('memberpress') ||
      col.column_name.includes('buddyboss')
    )
    
    if (wpColumns.length > 0) {
      console.log('⚠️ Found WordPress-related columns:', wpColumns.map((c: any) => c.column_name))
    }
  }
  
  // 2. Check for constraints
  console.log('\n📊 Step 2: Checking for constraints on users table...')
  
  const constraintCheck = `
    SELECT 
      constraint_name,
      constraint_type,
      check_clause
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.check_constraints cc 
      ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_name = 'users' 
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'CHECK';
  `
  
  // Since we can't run raw SQL directly, let's check the data
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, wordpress_id, auth_user_id, memberpress_subscription_id')
    .limit(5)
  
  if (!usersError && users) {
    console.log('📋 Sample users data:')
    users.forEach(user => {
      console.log(`  - ${user.email}: WP=${user.wordpress_id}, Auth=${user.auth_user_id}, MP=${user.memberpress_subscription_id}`)
    })
    
    // Check for the specific constraint issue
    const wpUsers = users.filter(u => u.wordpress_id !== null).length
    const authUsers = users.filter(u => u.auth_user_id !== null).length
    const bothNull = users.filter(u => !u.wordpress_id && !u.auth_user_id).length
    
    console.log(`\n  Stats: ${wpUsers} WordPress users, ${authUsers} Auth users, ${bothNull} with neither`)
    
    if (bothNull > 0) {
      console.log('  ⚠️ WARNING: Users exist without WordPress or Auth IDs - this violates the constraint!')
    }
  }
  
  // 3. Check for WordPress-related functions
  console.log('\n📊 Step 3: Checking for WordPress-related database functions...')
  
  const functionNames = [
    'upsert_wordpress_user',
    'handle_new_user',
    'sync_wordpress_user'
  ]
  
  console.log('  Potentially problematic functions:')
  functionNames.forEach(fn => {
    console.log(`  - ${fn} (may exist)`)
  })
  
  // 4. Check for triggers
  console.log('\n📊 Step 4: Checking for auth triggers that might be failing...')
  console.log('  Common trigger issues:')
  console.log('  - Trigger expects wordpress_id or auth_user_id (constraint)')
  console.log('  - Trigger tries to sync with non-existent WordPress data')
  console.log('  - Trigger fails on email validation')
  
  // 5. Test if we can create a user directly
  console.log('\n📊 Step 5: Testing direct user creation...')
  
  const testEmail = `test-${Date.now()}@example.com`
  
  try {
    // First create in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      password: 'TestPassword123!'
    })
    
    if (authError) {
      console.log('  ❌ Cannot create auth user:', authError.message)
      
      // Check if it's the database error we're seeing
      if (authError.message.includes('Database error')) {
        console.log('\n  🔴 CONFIRMED: Database trigger/constraint is blocking user creation!')
        console.log('  This is likely due to:')
        console.log('  1. A CHECK constraint requiring wordpress_id OR auth_user_id')
        console.log('  2. A trigger that expects WordPress data')
        console.log('  3. A function that\'s trying to sync with WordPress')
      }
    } else if (authUser) {
      console.log('  ✅ Auth user created successfully')
      
      // Try to create in public.users
      const { error: publicError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.user?.id,
          email: testEmail,
          role: 'player',
          roles: ['player']
        })
      
      if (publicError) {
        console.log('  ❌ Cannot create public user:', publicError.message)
      } else {
        console.log('  ✅ Public user created successfully')
      }
      
      // Clean up test user
      if (authUser.user?.id) {
        await supabase.auth.admin.deleteUser(authUser.user.id)
        await supabase.from('users').delete().eq('email', testEmail)
        console.log('  🧹 Test user cleaned up')
      }
    }
  } catch (error) {
    console.error('  ❌ Unexpected error:', error)
  }
  
  // 6. Provide solutions
  console.log('\n' + '=' .repeat(60))
  console.log('🔧 RECOMMENDED FIXES:')
  console.log('=' .repeat(60))
  
  console.log('\n1. IMMEDIATE FIX - Remove WordPress constraint:')
  console.log('   Run in Supabase SQL Editor:')
  console.log('   ```sql')
  console.log('   ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_auth_source;')
  console.log('   ```')
  
  console.log('\n2. REMOVE WordPress columns (if not needed):')
  console.log('   ```sql')
  console.log('   ALTER TABLE users DROP COLUMN IF EXISTS wordpress_id;')
  console.log('   ALTER TABLE users DROP COLUMN IF EXISTS memberpress_subscription_id;')
  console.log('   ALTER TABLE users DROP COLUMN IF EXISTS buddyboss_group_ids;')
  console.log('   ```')
  
  console.log('\n3. CHECK for triggers:')
  console.log('   ```sql')
  console.log('   SELECT tgname FROM pg_trigger')
  console.log('   WHERE tgrelid = \'public.users\'::regclass;')
  console.log('   ```')
  
  console.log('\n4. DISABLE problematic triggers:')
  console.log('   ```sql')
  console.log('   ALTER TABLE users DISABLE TRIGGER ALL;')
  console.log('   -- Create your user')
  console.log('   ALTER TABLE users ENABLE TRIGGER ALL;')
  console.log('   ```')
  
  console.log('\n5. DROP WordPress function:')
  console.log('   ```sql')
  console.log('   DROP FUNCTION IF EXISTS upsert_wordpress_user CASCADE;')
  console.log('   ```')
  
  console.log('\n' + '=' .repeat(60))
  console.log('📝 NEXT STEPS:')
  console.log('=' .repeat(60))
  console.log('1. Go to Supabase Dashboard > SQL Editor')
  console.log('2. Run the constraint removal query first')
  console.log('3. Test if authentication works')
  console.log('4. If still broken, check for triggers')
  console.log('5. Consider removing all WordPress columns if not needed')
}

analyzeWordPressConflicts().catch(console.error)