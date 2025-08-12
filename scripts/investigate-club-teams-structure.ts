import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigateClubTeamsStructure() {
  console.log('🔍 INVESTIGATING YOUR CLUB OS STRUCTURE\n')
  console.log('=' .repeat(70))
  
  // Step 1: Check for Your Club OS in clubs table
  console.log('\n📊 Step 1: Checking clubs table for "Your Club OS"...')
  const { data: clubs, error: clubsError } = await supabase
    .from('clubs')
    .select('*')
  
  if (clubsError) {
    console.log('❌ Error querying clubs:', clubsError.message)
  } else {
    console.log(`Found ${clubs?.length || 0} clubs total`)
    if (clubs && clubs.length > 0) {
      clubs.forEach(club => {
        console.log(`  - ID: ${club.id} | Name: ${club.name}`)
      })
    } else {
      console.log('  ⚠️ No clubs found in database')
    }
  }
  
  // Step 2: Check teams table
  console.log('\n📊 Step 2: Checking teams table...')
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
  
  if (teamsError) {
    console.log('❌ Error querying teams:', teamsError.message)
  } else {
    console.log(`Found ${teams?.length || 0} teams total`)
    if (teams && teams.length > 0) {
      console.log('\nAll teams in database:')
      teams.forEach(team => {
        console.log(`  - ID: ${team.id} | Name: ${team.name} | Club ID: ${team.club_id || 'None'}`)
      })
      
      // Check for teams mentioned in image
      console.log('\n🎯 Looking for specific teams from image:')
      const targetTeams = ['Your 8th Grade Team HQ', 'Your JV Team HQ', 'Your Varsity Team HQ']
      targetTeams.forEach(teamName => {
        const found = teams.find(t => t.name === teamName || t.name?.includes(teamName.replace(' HQ', '')))
        if (found) {
          console.log(`  ✅ Found: ${found.name} (ID: ${found.id})`)
        } else {
          console.log(`  ❌ Not found: ${teamName}`)
        }
      })
    } else {
      console.log('  ⚠️ No teams found in database')
    }
  }
  
  // Step 3: Check team_members table
  console.log('\n📊 Step 3: Checking team_members table...')
  const { data: teamMembers, error: membersError, count: memberCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' })
  
  if (membersError) {
    console.log('❌ Error querying team_members:', membersError.message)
  } else {
    console.log(`Found ${memberCount} team member associations total`)
    if (teamMembers && teamMembers.length > 0) {
      // Group by team
      const membersByTeam: Record<string, any[]> = {}
      teamMembers.forEach(member => {
        if (!membersByTeam[member.team_id]) {
          membersByTeam[member.team_id] = []
        }
        membersByTeam[member.team_id].push(member)
      })
      
      console.log('\nMembers grouped by team:')
      Object.entries(membersByTeam).forEach(([teamId, members]) => {
        const team = teams?.find(t => t.id.toString() === teamId)
        console.log(`  Team: ${team?.name || `Unknown (ID: ${teamId})`}`)
        console.log(`    - ${members.length} members`)
      })
    } else {
      console.log('  ⚠️ No team members found')
    }
  }
  
  // Step 4: Check for Patrick user
  console.log('\n📊 Step 4: Checking for patrick@powlax.com user...')
  try {
    // Try different approaches to find user
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, username, club_id, role')
      .limit(50)
    
    if (usersError) {
      console.log('⚠️ Cannot query users directly due to RLS:', usersError.message)
    } else if (allUsers) {
      console.log(`Checking ${allUsers.length} users...`)
      const patrick = allUsers.find(u => 
        u.email === 'patrick@powlax.com' || 
        u.email?.includes('patrick') ||
        u.name?.toLowerCase().includes('patrick')
      )
      
      if (patrick) {
        console.log('✅ Found Patrick:')
        console.log(`  ID: ${patrick.id}`)
        console.log(`  Email: ${patrick.email}`)
        console.log(`  Name: ${patrick.name}`)
        console.log(`  Club ID: ${patrick.club_id || 'None'}`)
        console.log(`  Role: ${patrick.role || 'None'}`)
      } else {
        console.log('❌ Patrick user not found in users table')
        console.log('\nSample users for reference:')
        allUsers.slice(0, 5).forEach(u => {
          console.log(`  - ${u.email || u.username || 'Unknown'} (ID: ${u.id})`)
        })
      }
    }
  } catch (err) {
    console.log('Error checking users:', err)
  }
  
  // Step 5: Check existing relationships based on IDs from image
  console.log('\n📊 Step 5: Checking team IDs from image...')
  const imageTeamIds = [
    '044c362a-1501-4e38-aaff-d2ce83381a85',
    '436d2a09-17b6-4813-b9ea-d69a2cd7ad6a', 
    'd6b72e87-8fab-4f4c-9921-260501605ee2'
  ]
  
  console.log('Team IDs visible in image:')
  imageTeamIds.forEach(id => {
    console.log(`  - ${id}`)
  })
  
  console.log('\n🔍 Checking if these team IDs exist in database:')
  for (const teamId of imageTeamIds) {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()
    
    if (team) {
      console.log(`  ✅ Team ${teamId} exists:`)
      console.log(`     Name: ${team.name}`)
      console.log(`     Club ID: ${team.club_id || 'None'}`)
    } else {
      console.log(`  ❌ Team ${teamId} not found`)
    }
  }
  
  // Summary and recommendations
  console.log('\n' + '=' .repeat(70))
  console.log('📋 ANALYSIS SUMMARY')
  console.log('=' .repeat(70))
  
  console.log('\n🏗️ CURRENT DATABASE STATE:')
  console.log(`  - Clubs: ${clubs?.length || 0} records`)
  console.log(`  - Teams: ${teams?.length || 0} records`)
  console.log(`  - Team Members: ${memberCount || 0} associations`)
  
  console.log('\n📝 REQUIRED STRUCTURE:')
  console.log('1. Club: "Your Club OS" should exist in clubs table')
  console.log('2. Director: patrick@powlax.com should be director of Your Club OS')
  console.log('3. Teams that should be connected to Your Club OS:')
  console.log('   - Your 8th Grade Team HQ')
  console.log('   - Your JV Team HQ')
  console.log('   - Your Varsity Team HQ')
  console.log('4. Each team should have multiple players')
  
  console.log('\n🔧 WHAT NEEDS TO BE DONE:')
  if (!clubs || clubs.length === 0 || !clubs.find(c => c.name === 'Your Club OS')) {
    console.log('  1. Create "Your Club OS" in clubs table')
  }
  if (!teams || teams.length === 0) {
    console.log('  2. Create the three teams with proper club_id linking to Your Club OS')
  }
  console.log('  3. Ensure patrick@powlax.com user exists with director role')
  console.log('  4. Create team_members associations for players on each team')
  console.log('  5. Set patrick as club director (club_id on user record)')
}

investigateClubTeamsStructure()