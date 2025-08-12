import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTableStructure() {
  console.log('🔍 Analyzing Table Structure and Data\n')
  console.log('=' .repeat(70))
  
  // 1. Check users table - try different column names
  console.log('\n📊 Testing users table columns:')
  const possibleColumns = [
    'id, email, role, club_id',
    'id, username, role, club_id',
    'id, display_name, role, club_id',
    'id, created_at',
    '*'
  ]
  
  for (const columns of possibleColumns) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(columns)
        .limit(1)
      
      if (error) {
        console.log(`  Select "${columns}": ${error.message}`)
      } else {
        console.log(`  Select "${columns}": SUCCESS`)
        if (data && data.length > 0) {
          console.log('    Sample data:', Object.keys(data[0]).join(', '))
        }
        break
      }
    } catch (e) {
      console.log(`  Select "${columns}": Failed`)
    }
  }
  
  // 2. Check team members with actual team IDs from screenshot
  console.log('\n📊 Checking team_members for Your Club OS teams:')
  
  // Get Your Club OS teams first
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('club_id', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac')
  
  if (teamsError) {
    console.log('  Error fetching teams:', teamsError.message)
  } else if (teams) {
    console.log(`  Found ${teams.length} Your Club OS teams:`)
    for (const team of teams) {
      console.log(`    - ${team.name} (${team.id})`)
      
      // Check members for this team
      const { data: members, count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', team.id)
      
      console.log(`      Members: ${count || 0}`)
    }
  }
  
  // 3. Try to find patrick in different ways
  console.log('\n📊 Searching for Patrick user:')
  
  // Try by email
  const { data: byEmail, error: emailError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'patrick@powlax.com')
    .maybeSingle()
  
  if (emailError) {
    console.log(`  By email 'patrick@powlax.com': ${emailError.message}`)
  } else if (byEmail) {
    console.log(`  Found by email! User ID: ${byEmail.id}`)
  } else {
    console.log(`  No user with email 'patrick@powlax.com'`)
  }
  
  // 4. Check what coach ID e4388919-ba31-476a-a17d-c52a2d582b2f is
  console.log('\n📊 Checking coach user (from team_members):')
  const coachId = 'e4388919-ba31-476a-a17d-c52a2d582b2f'
  
  const { data: coach, error: coachError } = await supabase
    .from('users')
    .select('*')
    .eq('id', coachId)
    .maybeSingle()
  
  if (coachError) {
    console.log(`  Coach lookup: ${coachError.message}`)
  } else if (coach) {
    console.log(`  Coach found:`)
    console.log(`    Available fields: ${Object.keys(coach).join(', ')}`)
    console.log(`    Email: ${coach.email || 'N/A'}`)
    console.log(`    Role: ${coach.role || 'N/A'}`)
    console.log(`    Club ID: ${coach.club_id || 'N/A'}`)
  }
}

checkTableStructure()