import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkTableSchemas() {
  console.log('📊 CHECKING ACTUAL TABLE SCHEMAS...\n')
  console.log('='.repeat(60))

  // Check powlax_drills columns
  console.log('\n🎯 POWLAX_DRILLS TABLE:')
  const { data: drills, error: drillsError } = await supabase
    .from('powlax_drills')
    .select('*')
    .limit(1)
  
  if (drills && drills[0]) {
    console.log('Columns:', Object.keys(drills[0]).join(', '))
    console.log('Sample data:', JSON.stringify(drills[0], null, 2).substring(0, 500))
  }

  // Check powlax_strategies columns
  console.log('\n🎯 POWLAX_STRATEGIES TABLE:')
  const { data: strategies, error: strategiesError } = await supabase
    .from('powlax_strategies')
    .select('*')
    .limit(1)
  
  if (strategies && strategies[0]) {
    console.log('Columns:', Object.keys(strategies[0]).join(', '))
    console.log('Sample data:', JSON.stringify(strategies[0], null, 2).substring(0, 500))
  }

  // Check users table columns
  console.log('\n👤 USERS TABLE:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'patrick@powlax.com')
    .limit(1)
  
  if (users && users[0]) {
    console.log('Columns:', Object.keys(users[0]).join(', '))
    console.log('Sample patrick@powlax.com:', JSON.stringify(users[0], null, 2).substring(0, 500))
  }

  // Check team_teams columns
  console.log('\n🏆 TEAM_TEAMS TABLE:')
  const { data: teams, error: teamsError } = await supabase
    .from('team_teams')
    .select('*')
    .limit(1)
  
  if (teams && teams[0]) {
    console.log('Columns:', Object.keys(teams[0]).join(', '))
    console.log('Sample data:', JSON.stringify(teams[0], null, 2).substring(0, 500))
  }

  // Check practices columns
  console.log('\n📅 PRACTICES TABLE:')
  const { data: practices, error: practicesError } = await supabase
    .from('practices')
    .select('*')
    .limit(1)
  
  if (practices && practices[0]) {
    console.log('Columns:', Object.keys(practices[0]).join(', '))
    console.log('Sample data:', JSON.stringify(practices[0], null, 2).substring(0, 500))
  }

  // Check team_members columns
  console.log('\n👥 TEAM_MEMBERS TABLE:')
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .limit(1)
  
  if (members && members[0]) {
    console.log('Columns:', Object.keys(members[0]).join(', '))
    console.log('Sample data:', JSON.stringify(members[0], null, 2).substring(0, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Schema check complete!')
}

checkTableSchemas().catch(console.error)