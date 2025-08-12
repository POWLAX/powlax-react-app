import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseTeamsAnon() {
  console.log('🔍 TEAMS PAGE DIAGNOSIS (ANON ACCESS)\n')
  console.log('=' .repeat(70))
  
  // 1. Check if we can access clubs table
  console.log('\n📊 1. CLUBS TABLE ACCESS:')
  console.log('-'.repeat(40))
  
  const { data: clubs, error: clubsError, count: clubsCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact' })
  
  if (clubsError) {
    console.log('  ❌ Error:', clubsError.message)
  } else {
    console.log(`  ✅ Can access clubs: ${clubsCount} records`)
    if (clubs && clubs.length > 0) {
      clubs.forEach((club: any) => {
        console.log(`    - ${club.name} (${club.id})`)
      })
    }
  }
  
  // 2. Check if we can access teams table
  console.log('\n📊 2. TEAMS TABLE ACCESS:')
  console.log('-'.repeat(40))
  
  const { data: teams, error: teamsError, count: teamsCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact' })
  
  if (teamsError) {
    console.log('  ❌ Error:', teamsError.message)
  } else {
    console.log(`  ✅ Can access teams: ${teamsCount} records`)
    if (teams && teams.length > 0) {
      // Group by club
      const teamsByClub: Record<string, any[]> = {}
      teams.forEach((team: any) => {
        const clubId = team.club_id || 'No Club'
        if (!teamsByClub[clubId]) teamsByClub[clubId] = []
        teamsByClub[clubId].push(team)
      })
      
      Object.entries(teamsByClub).forEach(([clubId, clubTeams]) => {
        const club = clubs?.find((c: any) => c.id === clubId)
        console.log(`    ${club?.name || clubId}:`)
        clubTeams.forEach((team: any) => {
          console.log(`      - ${team.name}`)
        })
      })
    }
  }
  
  // 3. Check if we can access team_members table
  console.log('\n📊 3. TEAM_MEMBERS TABLE ACCESS:')
  console.log('-'.repeat(40))
  
  const { data: members, error: membersError, count: membersCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' })
  
  if (membersError) {
    console.log('  ❌ Error:', membersError.message)
  } else {
    console.log(`  ✅ Can access team_members: ${membersCount} records`)
  }
  
  // 4. Check if we can access users table
  console.log('\n📊 4. USERS TABLE ACCESS:')
  console.log('-'.repeat(40))
  
  // Try to get a count
  const { count: usersCount, error: usersCountError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  if (usersCountError) {
    console.log('  ❌ Count Error:', usersCountError.message)
  } else {
    console.log(`  Count accessible: ${usersCount} users`)
  }
  
  // Try to select minimal data
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1)
  
  if (usersError) {
    console.log('  ❌ Select Error:', usersError.message)
    console.log('     This is likely the RLS recursion issue!')
  } else {
    console.log(`  ✅ Can select from users (got ${users?.length || 0} records)`)
  }
  
  // 5. Try different select patterns on users
  console.log('\n📊 5. TESTING DIFFERENT USER QUERIES:')
  console.log('-'.repeat(40))
  
  const queries = [
    { desc: 'Select by email', query: supabase.from('users').select('id').eq('email', 'patrick@powlax.com') },
    { desc: 'Select all with limit', query: supabase.from('users').select('id').limit(1) },
    { desc: 'Select with maybeSingle', query: supabase.from('users').select('id').maybeSingle() },
  ]
  
  for (const { desc, query } of queries) {
    const { data, error } = await query
    if (error) {
      console.log(`  ${desc}: ❌ ${error.message}`)
    } else {
      console.log(`  ${desc}: ✅ Success`)
    }
  }
  
  // 6. Test the actual page flow
  console.log('\n📊 6. SIMULATING TEAMS PAGE FLOW:')
  console.log('-'.repeat(40))
  
  // Step 1: Get teams (this should work)
  const { data: pageTeams, error: pageTeamsError } = await supabase
    .from('teams')
    .select(`
      *,
      clubs:club_id (
        id,
        name
      )
    `)
  
  if (pageTeamsError) {
    console.log('  ❌ Teams fetch failed:', pageTeamsError.message)
  } else {
    console.log(`  ✅ Teams fetched: ${pageTeams?.length || 0} teams`)
  }
  
  // Step 2: For each team, try to get members
  if (pageTeams && pageTeams.length > 0) {
    const testTeam = pageTeams[0]
    console.log(`\n  Testing member fetch for: ${testTeam.name}`)
    
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        users!inner(
          id,
          email,
          username,
          display_name,
          role
        )
      `)
      .eq('team_id', testTeam.id)
    
    if (membersError) {
      console.log(`    ❌ Members fetch failed: ${membersError.message}`)
      console.log('       THIS IS THE PROBLEM - users join fails!')
    } else {
      console.log(`    ✅ Members fetched: ${teamMembers?.length || 0} members`)
    }
  }
  
  // 7. Summary and recommendations
  console.log('\n' + '='.repeat(70))
  console.log('📋 DIAGNOSIS SUMMARY:')
  console.log('-'.repeat(40))
  
  const canAccessClubs = !clubsError
  const canAccessTeams = !teamsError
  const canAccessMembers = !membersError
  const canAccessUsers = !usersError
  
  if (!canAccessUsers) {
    console.log('  ❌ MAIN ISSUE: Cannot access users table (RLS recursion)')
    console.log('     SOLUTION: Apply FIX_TEAMS_PAGE_SQL.sql in Supabase Dashboard')
  }
  
  if (canAccessClubs && canAccessTeams && canAccessMembers) {
    console.log('  ✅ Core tables (clubs, teams, team_members) are accessible')
  }
  
  console.log('\n  RECOMMENDED ACTIONS:')
  console.log('  1. Run FIX_TEAMS_PAGE_SQL.sql in Supabase Dashboard')
  console.log('  2. This will fix the RLS recursion on users table')
  console.log('  3. Create/update patrick@powlax.com user')
  console.log('  4. Link Patrick to Your Club OS teams')
  console.log('\n' + '='.repeat(70))
}

diagnoseTeamsAnon().catch(console.error)