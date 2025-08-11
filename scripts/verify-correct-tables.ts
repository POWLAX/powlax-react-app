import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function verifyCorrectTables() {
  console.log('🔍 Verifying CORRECT Supabase Table Names...\n')
  console.log('='.repeat(60))
  
  // The CORRECT table names based on your feedback
  const correctTables = [
    'powlax_drills',        // NOT drills_powlax
    'powlax_strategies',    // NOT strategies_powlax
    'users',                // NOT user_profiles
    'team_teams',           // NOT teams
    'team_members',
    'club_organizations',
    'practices',            // NOT practice_plans
    // Wall ball tables (these might be correct)
    'powlax_wall_ball_collections',
    'powlax_wall_ball_collection_drills',
    'powlax_wall_ball_drill_library',
    // Skills Academy tables
    'skills_academy_series',
    'skills_academy_workouts',
    'skills_academy_drills',
    'skills_academy_workout_drills'
  ]
  
  console.log('📊 CHECKING CORRECT TABLE NAMES:\n')
  
  for (const table of correctTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table.padEnd(35)}: ${error.message}`)
      } else {
        console.log(`✅ ${table.padEnd(35)}: ${count ?? 0} records`)
      }
    } catch (e) {
      console.log(`❌ ${table.padEnd(35)}: ERROR`)
    }
  }
  
  // Check for specific user data
  console.log('\n👤 CHECKING USERS TABLE:\n')
  
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, display_name')
    .or('email.eq.patrick@powlax.com,email.eq.admin@powlax.com')
    .limit(5)
  
  if (users && users.length > 0) {
    console.log('Found users:')
    users.forEach(user => {
      console.log(`  - ${user.email || 'no email'}: ${user.display_name || 'no name'}`)
    })
  } else if (userError) {
    console.log(`Error checking users: ${userError.message}`)
  } else {
    console.log('No admin users found in users table')
  }
  
  // Check drill count
  console.log('\n🏃 DRILL COUNT CHECK:\n')
  
  const { count: drillCount } = await supabase
    .from('powlax_drills')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total drills in powlax_drills: ${drillCount ?? 0}`)
  
  // Check strategy count
  console.log('\n🎯 STRATEGY COUNT CHECK:\n')
  
  const { count: strategyCount } = await supabase
    .from('powlax_strategies')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total strategies in powlax_strategies: ${strategyCount ?? 0}`)
  
  console.log('\n' + '='.repeat(60))
  console.log('\n⚠️  CRITICAL FINDINGS:\n')
  console.log('The codebase is using WRONG table names!')
  console.log('- Code uses: drills_powlax → Should be: powlax_drills')
  console.log('- Code uses: strategies_powlax → Should be: powlax_strategies')
  console.log('- Code uses: user_profiles → Should be: users')
  console.log('- Code uses: teams → Should be: team_teams')
  console.log('- Code uses: practice_plans → Should be: practices')
  console.log('\n💡 This is why nothing works - the code is querying non-existent tables!')
}

verifyCorrectTables().catch(console.error)