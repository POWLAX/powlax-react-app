import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabaseState() {
  console.log('🔍 COMPREHENSIVE DATABASE VERIFICATION\n')
  console.log('=' .repeat(60))
  
  // 1. Check current users table structure
  console.log('\n📊 STEP 1: Analyzing Users Table')
  console.log('-'.repeat(40))
  console.log('ℹ️  Analyzing users table roles...')
  
  // 2. Get all users with their current roles
  console.log('\n📊 STEP 2: Current User Roles')
  console.log('-'.repeat(40))
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: true })
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }
  
  console.log(`Total users: ${users.length}\n`)
  
  // Group users by role
  const roleGroups: Record<string, any[]> = {}
  users.forEach(user => {
    const role = user.role || 'null'
    if (!roleGroups[role]) roleGroups[role] = []
    roleGroups[role].push(user)
  })
  
  // Display role distribution
  Object.entries(roleGroups).sort().forEach(([role, userList]) => {
    console.log(`\nRole: "${role}" (${userList.length} users)`)
    userList.slice(0, 3).forEach(user => {
      console.log(`  • ${user.email}`)
    })
    if (userList.length > 3) {
      console.log(`  ... and ${userList.length - 3} more`)
    }
  })
  
  // 3. Check current constraint (attempt to violate it to see allowed values)
  console.log('\n📊 STEP 3: Current Constraint Analysis')
  console.log('-'.repeat(40))
  
  // Try to update a test user to see what roles are allowed
  const testRoles = ['admin', 'administrator', 'director', 'coach', 'player', 'parent', 'test']
  console.log('Testing which roles are currently allowed by constraint:')
  
  for (const testRole of testRoles) {
    // Use a dry run - try to update but rollback
    const { error } = await supabase
      .from('users')
      .update({ role: testRole })
      .eq('id', 'test-id-that-does-not-exist') // Safe non-existent ID
    
    // If no error, the role is allowed by constraint
    if (!error) {
      console.log(`  ✅ "${testRole}" - Allowed by current constraint`)
    } else if (error.message?.includes('violates check constraint')) {
      console.log(`  ❌ "${testRole}" - Blocked by constraint`)
    } else {
      // Role is technically allowed by constraint
      console.log(`  ✅ "${testRole}" - Allowed (no constraint violation)`)
    }
  }
  
  // 4. Identify users that need migration
  console.log('\n📊 STEP 4: Migration Requirements')
  console.log('-'.repeat(40))
  
  const usersNeedingMigration = users.filter(u => u.role === 'admin')
  const compatibleUsers = users.filter(u => 
    u.role && ['director', 'coach', 'player', 'parent'].includes(u.role)
  )
  
  console.log(`\n✅ Compatible users (no change needed): ${compatibleUsers.length}`)
  console.log(`🔄 Users needing migration: ${usersNeedingMigration.length}`)
  
  if (usersNeedingMigration.length > 0) {
    console.log('\nUsers that need "admin" → "administrator" migration:')
    usersNeedingMigration.forEach(user => {
      console.log(`  • ${user.email} (ID: ${user.id})`)
    })
  }
  
  // 5. Generate exact SQL commands
  console.log('\n📝 STEP 5: Exact SQL Commands for Migration')
  console.log('-'.repeat(40))
  console.log('\n-- Execute these commands IN ORDER in Supabase SQL Editor:\n')
  
  console.log('-- Step 1: Update existing "admin" roles to "administrator"')
  console.log('-- This affects', usersNeedingMigration.length, 'user(s)')
  console.log(`UPDATE public.users`)
  console.log(`SET role = 'administrator'`)
  console.log(`WHERE role = 'admin';`)
  console.log('')
  console.log('-- Verify the update:')
  console.log(`SELECT email, role FROM public.users WHERE email = 'patrick@powlax.com';`)
  console.log('')
  console.log('-- Step 2: Drop existing constraint')
  console.log(`ALTER TABLE public.users`)
  console.log(`DROP CONSTRAINT IF EXISTS users_role_check;`)
  console.log('')
  console.log('-- Step 3: Add new constraint with "administrator" instead of "admin"')
  console.log(`ALTER TABLE public.users`)
  console.log(`ADD CONSTRAINT users_role_check`)
  console.log(`CHECK (role IN ('administrator', 'director', 'coach', 'player', 'parent'));`)
  console.log('')
  console.log('-- Step 4: Verify all users are compliant')
  console.log(`SELECT role, COUNT(*) as count`)
  console.log(`FROM public.users`)
  console.log(`GROUP BY role`)
  console.log(`ORDER BY role;`)
  
  // 6. Rollback SQL if needed
  console.log('\n📝 ROLLBACK SQL (if needed):')
  console.log('-'.repeat(40))
  console.log(`\n-- To rollback the changes:`)
  console.log(`UPDATE public.users SET role = 'admin' WHERE role = 'administrator';`)
  console.log(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;`)
  console.log(`ALTER TABLE public.users ADD CONSTRAINT users_role_check`)
  console.log(`CHECK (role IN ('admin', 'director', 'coach', 'player', 'parent'));`)
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Verification complete. SQL commands are ready for execution.')
}

verifyDatabaseState().catch(console.error)