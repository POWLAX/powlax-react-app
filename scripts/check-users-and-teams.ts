import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsersAndTeams() {
  console.log('🔍 Checking Users and Team Relationships\n')
  console.log('=' .repeat(70))
  
  // Check specific user IDs from team_members screenshot
  const userIds = [
    '4a02493b-3691-45d7-bf8f-8a2dd5ab3cf1', // From screenshot
    'e4388919-ba31-476a-a17d-c52a2d582b2f', // Coach ID from screenshot
    '70134da3-5f92-4699-9efb-a037d88c6bc0'  // Assistant coach from screenshot
  ]
  
  console.log('\n📊 Checking specific users from team_members:')
  for (const userId of userIds) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, username, role, club_id')
      .eq('id', userId)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') {
      console.log(`  User ${userId}: Error - ${error.message}`)
    } else if (user) {
      console.log(`  User: ${user.email || 'No email'}`)
      console.log(`    Name: ${user.name || 'No name'}`)
      console.log(`    Role: ${user.role || 'No role'}`)
      console.log(`    Club ID: ${user.club_id || 'No club'}`)
    } else {
      console.log(`  User ${userId}: Not found or no access`)
    }
    console.log('')
  }
  
  // Try to get count of users without triggering RLS
  console.log('\n📊 Attempting to count users:')
  const { count: userCount, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.log(`  Error counting users: ${countError.message}`)
  } else {
    console.log(`  Total users in table: ${userCount}`)
  }
  
  // Check team associations for Your Club OS teams
  console.log('\n📊 Team Members for Your Club OS teams:')
  const teamIds = [
    'd6b72e87-8fab-4f4c-9921-260501605ee2', // Your Varsity Team HQ
    '43642a09-17b6-4813-b9ea-d69a2cd7ad6a', // Your JV Team HQ  
    '044c362a-1501-4e38-aaff-d2ce83381a85'  // Your 8th Grade Team HQ
  ]
  
  const teamNames = {
    'd6b72e87-8fab-4f4c-9921-260501605ee2': 'Your Varsity Team HQ',
    '43642a09-17b6-4813-b9ea-d69a2cd7ad6a': 'Your JV Team HQ',
    '044c362a-1501-4e38-aaff-d2ce83381a85': 'Your 8th Grade Team HQ'
  }
  
  for (const teamId of teamIds) {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('team_id', teamId)
    
    if (error) {
      console.log(`  ${teamNames[teamId]}: Error - ${error.message}`)
    } else {
      console.log(`  ${teamNames[teamId]}: ${members?.length || 0} members`)
      if (members && members.length > 0) {
        members.forEach(m => {
          console.log(`    - User ${m.user_id.substring(0, 8)}... as ${m.role}`)
        })
      }
    }
  }
  
  // Check if we can find any user with email containing 'patrick'
  console.log('\n📊 Looking for patrick@powlax.com:')
  console.log('  Note: May fail due to RLS policies')
  
  // Check auth.users if accessible
  console.log('\n📊 Checking Supabase Auth for patrick@powlax.com:')
  console.log('  Note: This requires admin access to auth.users')
}

checkUsersAndTeams()