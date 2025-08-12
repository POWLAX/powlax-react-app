import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPatrickTeams() {
  console.log('🔍 Investigating Teams for patrick@powlax.com\n')
  console.log('=' .repeat(60))
  
  // Step 1: Find patrick@powlax.com user
  console.log('\n📧 Step 1: Finding user patrick@powlax.com...')
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'patrick@powlax.com')
  
  if (userError) {
    console.log('❌ Error finding user:', userError.message)
    return
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️ No user found with email patrick@powlax.com')
    console.log('\n📋 All users in database:')
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, username, name')
      .limit(10)
    
    if (allUsers) {
      allUsers.forEach(u => {
        console.log(`  - ${u.email || 'no-email'} (${u.name || u.username || 'no-name'}) [ID: ${u.id}]`)
      })
    }
    return
  }
  
  const patrick = users[0]
  console.log('✅ Found user:')
  console.log(`  ID: ${patrick.id}`)
  console.log(`  Email: ${patrick.email}`)
  console.log(`  Name: ${patrick.name || patrick.username || 'Not set'}`)
  console.log(`  Role: ${patrick.role || 'Not set'}`)
  
  // Step 2: Check team_members table
  console.log('\n👥 Step 2: Checking team_members associations...')
  const { data: teamMemberships, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', patrick.id)
  
  if (memberError) {
    console.log('❌ Error checking team_members:', memberError.message)
  } else if (!teamMemberships || teamMemberships.length === 0) {
    console.log('⚠️ No team memberships found for this user')
    
    // Check if user_id format is the issue
    console.log('\n🔍 Checking team_members table structure...')
    const { data: sampleMembers } = await supabase
      .from('team_members')
      .select('*')
      .limit(5)
    
    if (sampleMembers && sampleMembers.length > 0) {
      console.log('Sample team_members records:')
      sampleMembers.forEach(m => {
        console.log(`  Team ${m.team_id}: User ${m.user_id} (Role: ${m.role})`)
      })
    }
  } else {
    console.log(`✅ Found ${teamMemberships.length} team membership(s):`)
    for (const membership of teamMemberships) {
      console.log(`  Team ID: ${membership.team_id}, Role: ${membership.role}`)
    }
  }
  
  // Step 3: Get all teams
  console.log('\n🏢 Step 3: Fetching all teams...')
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  
  if (teamsError) {
    console.log('❌ Error fetching teams:', teamsError.message)
  } else if (!teams || teams.length === 0) {
    console.log('⚠️ No teams found in database')
  } else {
    console.log(`✅ Found ${teams.length} teams:`)
    teams.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id}, Club: ${team.club_id || 'None'})`)
    })
  }
  
  // Step 4: Check clubs
  console.log('\n🏛️ Step 4: Checking clubs...')
  const { data: clubs, error: clubsError } = await supabase
    .from('clubs')
    .select('*')
  
  if (clubsError) {
    console.log('❌ Error fetching clubs:', clubsError.message)
  } else if (clubs) {
    console.log(`✅ Found ${clubs.length} clubs:`)
    clubs.forEach(club => {
      console.log(`  - ${club.name} (ID: ${club.id})`)
    })
  }
  
  // Step 5: Analyze the problem
  console.log('\n' + '=' .repeat(60))
  console.log('📊 ANALYSIS:')
  console.log('=' .repeat(60))
  
  if (users && users.length > 0) {
    if (!teamMemberships || teamMemberships.length === 0) {
      console.log('\n⚠️ ISSUE FOUND: User exists but has no team associations')
      console.log('\n🔧 SOLUTION: Need to create team_members record linking user to team')
      
      if (teams && teams.length > 0) {
        console.log('\n📝 Sample SQL to add user to first team:')
        const firstTeam = teams[0]
        console.log(`
INSERT INTO team_members (user_id, team_id, role, created_at)
VALUES ('${patrick.id}', ${firstTeam.id}, 'coach', NOW());
        `)
      }
    } else {
      console.log('\n✅ User has team associations')
      console.log('⚠️ ISSUE: Teams page may not be fetching or displaying correctly')
    }
  }
  
  // Step 6: Check current teams page query pattern
  console.log('\n🔍 Step 6: Testing teams query pattern...')
  
  // Simulate what the teams page might be doing
  if (patrick) {
    const { data: userTeams, error: queryError } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('user_id', patrick.id)
    
    if (queryError) {
      console.log('❌ Query pattern error:', queryError.message)
    } else if (userTeams && userTeams.length > 0) {
      console.log('✅ Query pattern works! User teams:')
      userTeams.forEach((tm: any) => {
        if (tm.team) {
          console.log(`  - ${tm.team.name}`)
        }
      })
    } else {
      console.log('⚠️ Query returns no teams')
    }
  }
}

checkPatrickTeams()