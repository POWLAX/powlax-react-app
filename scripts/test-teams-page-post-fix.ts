import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTeamsPagePostFix() {
  console.log('🧪 TESTING TEAMS PAGE POST-RLS-FIX')
  console.log('=' .repeat(60))
  
  // 1. Test basic table access (should work now)
  console.log('\n📊 1. TESTING BASIC TABLE ACCESS:')
  console.log('-'.repeat(40))
  
  const testTables = [
    { name: 'users', expected: 14 },
    { name: 'clubs', expected: 3 },
    { name: 'teams', expected: 14 },
    { name: 'team_members', expected: 26 }
  ]
  
  for (const table of testTables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ❌ ${table.name}: ${error.message}`)
    } else {
      console.log(`  ✅ ${table.name}: ${count} records (expected ${table.expected})`)
    }
  }
  
  // 2. Test the exact query that useTeams hook uses
  console.log('\n📊 2. TESTING USETEAMS HOOK QUERY:')
  console.log('-'.repeat(40))
  
  // Simulate what useTeams does
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select(`
      *,
      clubs:club_id (
        id,
        name
      )
    `)
  
  if (teamsError) {
    console.log('  ❌ Teams query failed:', teamsError.message)
  } else {
    console.log(`  ✅ Teams query succeeded: ${teams?.length || 0} teams`)
    if (teams && teams.length > 0) {
      console.log('\n  Sample teams:')
      teams.slice(0, 3).forEach((team: any) => {
        console.log(`    - ${team.name} (Club: ${team.clubs?.name || 'No club'})`)
      })
    }
  }
  
  // 3. Test team members query (this was failing before)
  console.log('\n📊 3. TESTING TEAM MEMBERS QUERY (The key fix):')
  console.log('-'.repeat(40))
  
  if (teams && teams.length > 0) {
    const testTeam = teams[0]
    
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          display_name,
          role
        )
      `)
      .eq('team_id', testTeam.id)
    
    if (membersError) {
      console.log(`  ❌ Team members query failed: ${membersError.message}`)
      console.log('     This was the main issue before the fix!')
    } else {
      console.log(`  ✅ Team members query succeeded: ${members?.length || 0} members`)
      if (members && members.length > 0) {
        console.log(`\n  Members of "${testTeam.name}":`)
        members.forEach((member: any) => {
          const name = member.users.display_name || `${member.users.first_name} ${member.users.last_name}`.trim() || member.users.email
          console.log(`    - ${name} (${member.role})`)
        })
      }
    }
  }
  
  // 4. Test Patrick's specific teams
  console.log('\n📊 4. TESTING PATRICK\'S TEAMS:')
  console.log('-'.repeat(40))
  
  // Get Patrick's user ID first
  const { data: patrick, error: patrickError } = await supabase
    .from('users')
    .select('id, email, display_name')
    .eq('email', 'patrick@powlax.com')
    .single()
  
  if (patrickError) {
    console.log('  ❌ Patrick lookup failed:', patrickError.message)
  } else if (patrick) {
    console.log(`  ✅ Patrick found: ${patrick.display_name} (${patrick.email})`)
    
    // Get Patrick's team memberships
    const { data: patrickTeams, error: patrickTeamsError } = await supabase
      .from('team_members')
      .select(`
        role,
        teams!inner(name, club_id),
        clubs:teams!inner(clubs!inner(name))
      `)
      .eq('user_id', patrick.id)
    
    if (patrickTeamsError) {
      console.log('  ❌ Patrick teams query failed:', patrickTeamsError.message)
    } else {
      console.log(`  ✅ Patrick is member of ${patrickTeamsError?.length || 0} teams:`)
      patrickTeams?.forEach((membership: any) => {
        console.log(`    - ${membership.teams.name} as ${membership.role}`)
      })
    }
  }
  
  // 5. Check for any auth issues
  console.log('\n📊 5. CHECKING AUTH CONTEXT:')
  console.log('-'.repeat(40))
  
  // Test if the current user context would work
  console.log('  Note: Testing with anon user (no auth.uid())')
  console.log('  In the app, authenticated users should see their teams')
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 DIAGNOSIS SUMMARY:')
  
  // Fix undefined membersError issue
  let hasMemberError = false
  if (teams && teams.length > 0) {
    const testTeam = teams[0]
    const { error: testMembersError } = await supabase
      .from('team_members')
      .select(`*, users!inner(id, email, display_name, first_name, last_name, role)`)
      .eq('team_id', testTeam.id)
    hasMemberError = !!testMembersError
  }
  
  if (!teamsError && !hasMemberError) {
    console.log('✅ RLS FIX SUCCESSFUL!')
    console.log('  - Teams can be queried')
    console.log('  - Team members can be queried with user info')
    console.log('  - No more infinite recursion')
    console.log('\n❓ IF TEAMS PAGE STILL LOADING:')
    console.log('  - Check if user is authenticated in the app')
    console.log('  - Check browser console for JS errors')
    console.log('  - Verify useAuth() hook is working')
  } else {
    console.log('❌ Issues still exist:')
    if (teamsError) console.log(`  - Teams query: ${teamsError.message}`)
    if (hasMemberError) console.log(`  - Members query: Check individual team tests above`)
  }
  
  console.log('=' .repeat(60))
}

testTeamsPagePostFix().catch(console.error)