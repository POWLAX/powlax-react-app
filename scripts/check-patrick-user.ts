import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPatrickUser() {
  console.log('🔍 Checking for patrick@powlax.com user\n')
  console.log('=' .repeat(60))
  
  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .or('email.eq.patrick@powlax.com,email.ilike.%patrick%')
  
  if (usersError) {
    console.log('❌ Error checking users:', usersError.message)
  } else {
    console.log('\n📊 Users with "patrick" in email:')
    if (users && users.length > 0) {
      users.forEach(user => {
        console.log(`  - Email: ${user.email}`)
        console.log(`    ID: ${user.id}`)
        console.log(`    Name: ${user.name || 'Not set'}`)
        console.log(`    Username: ${user.username || 'Not set'}`)
        console.log(`    Role: ${user.role || 'Not set'}`)
        console.log(`    Club ID: ${user.club_id || 'Not set'}`)
        console.log(`    Auth User ID: ${user.auth_user_id || 'Not set'}`)
        console.log('')
      })
    } else {
      console.log('  No users found with "patrick" in email')
    }
  }
  
  // Check team_members for any user associations
  console.log('\n📊 Checking team_members table:')
  const { data: teamMembers, count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' })
  
  console.log(`Total team member records: ${count || 0}`)
  
  // Check if Your Club OS teams have any members
  console.log('\n📊 Checking Your Club OS teams membership:')
  const { data: yourClubTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('club_id', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac')
  
  if (yourClubTeams) {
    for (const team of yourClubTeams) {
      const { data: members, count: memberCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', team.id)
      
      console.log(`  ${team.name}: ${memberCount || 0} members`)
    }
  }
}

checkPatrickUser()