import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeRoleConstraintIssue() {
  console.log('🔍 Analyzing role constraint violation...\n')
  
  // Get all users and their roles
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role')
    .order('role')
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  console.log(`📊 Total users: ${users.length}\n`)
  
  // Count role distribution
  const roleCounts: Record<string, number> = {}
  users.forEach(user => {
    if (user.role) {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1
    }
  })
  
  console.log('Current role distribution:')
  Object.entries(roleCounts).sort().forEach(([role, count]) => {
    console.log(`  • "${role}": ${count} user(s)`)
  })
  
  // Check against new constraint
  const newAllowedRoles = ['administrator', 'director', 'coach', 'player', 'parent']
  const currentAllowedRoles = ['admin', 'director', 'coach', 'player', 'parent']
  
  console.log('\n📋 Constraint Analysis:')
  console.log('Current constraint allows:', currentAllowedRoles.join(', '))
  console.log('New constraint would allow:', newAllowedRoles.join(', '))
  
  // Find problematic roles
  const problematicUsers = users.filter(user => 
    user.role && !newAllowedRoles.includes(user.role)
  )
  
  if (problematicUsers.length > 0) {
    console.log(`\n❌ Found ${problematicUsers.length} user(s) with roles that violate new constraint:\n`)
    problematicUsers.forEach(user => {
      const suggestedRole = user.role === 'admin' ? 'administrator' : 
                           user.role === 'administrator' ? 'administrator' : 'player'
      console.log(`  User: ${user.email}`)
      console.log(`    Current role: "${user.role}"`)
      console.log(`    Suggested update: "${suggestedRole}"`)
      console.log('')
    })
    
    console.log('📝 SOLUTION: Update all roles BEFORE changing constraint:\n')
    console.log('-- Step 1: Update all "admin" roles to "administrator"')
    console.log(`UPDATE public.users SET role = 'administrator' WHERE role = 'admin';`)
    console.log('')
    console.log('-- Step 2: Then update the constraint')
    console.log(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;`)
    console.log(`ALTER TABLE public.users ADD CONSTRAINT users_role_check`)
    console.log(`  CHECK (role IN ('administrator', 'director', 'coach', 'player', 'parent'));`)
  } else {
    console.log('\n✅ All current roles are compatible with the new constraint!')
  }
  
  // Show users with admin role specifically
  const adminUsers = users.filter(u => u.role === 'admin')
  if (adminUsers.length > 0) {
    console.log('\n👤 Users with "admin" role that need updating:')
    adminUsers.forEach(user => {
      console.log(`  • ${user.email}`)
    })
  }
}

analyzeRoleConstraintIssue().catch(console.error)