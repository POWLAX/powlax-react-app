import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function analyzeActualTables() {
  console.log('🔍 ANALYZING ACTUAL SUPABASE TABLES - LIVE DATABASE STATE')
  console.log('=' .repeat(80))
  console.log('Using Service Role Key for FULL ACCESS\n')
  
  // 1. Get actual users table schema
  console.log('\n📊 1. USERS TABLE - ACTUAL SCHEMA:')
  console.log('-'.repeat(60))
  
  try {
    // Get table columns using information_schema
    const { data: userColumns, error: schemaError } = await supabase
      .rpc('get_table_schema', {
        table_name: 'users'
      })
    
    if (schemaError) {
      // Fallback: get a sample record to see columns
      const { data: sampleUser, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single()
      
      if (sampleUser) {
        console.log('  ACTUAL COLUMNS:', Object.keys(sampleUser).join(', '))
        console.log('\n  Sample data types:')
        Object.entries(sampleUser).forEach(([key, value]) => {
          console.log(`    ${key}: ${typeof value} (${value === null ? 'NULL' : Array.isArray(value) ? 'array' : typeof value})`)
        })
      } else if (sampleError) {
        console.log('  Error getting sample:', sampleError.message)
      }
    } else if (userColumns) {
      console.log('  Columns from schema:')
      userColumns.forEach((col: any) => {
        console.log(`    ${col.column_name}: ${col.data_type}`)
      })
    }
    
    // Count users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n  Total users in table: ${userCount}`)
    
  } catch (error) {
    console.log('  Error analyzing users table:', error)
  }
  
  // 2. Get actual RLS policies on users table
  console.log('\n📊 2. USERS TABLE - CURRENT RLS POLICIES:')
  console.log('-'.repeat(60))
  
  try {
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', {
        table_name: 'users'
      })
    
    if (policiesError) {
      // Try alternative query
      const { data: altPolicies } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'users')
      
      if (altPolicies && altPolicies.length > 0) {
        console.log('  Found policies:')
        altPolicies.forEach((policy: any) => {
          console.log(`\n  Policy: ${policy.policyname}`)
          console.log(`    Command: ${policy.cmd}`)
          console.log(`    Roles: ${policy.roles}`)
          console.log(`    USING: ${policy.qual}`)
          console.log(`    WITH CHECK: ${policy.with_check}`)
        })
      } else {
        console.log('  Could not retrieve policies (may need different permissions)')
      }
    } else if (policies) {
      console.log('  Active RLS Policies:')
      policies.forEach((policy: any) => {
        console.log(`\n  Policy: ${policy.policyname}`)
        console.log(`    Command: ${policy.cmd}`)
        console.log(`    Definition: ${policy.definition}`)
      })
    }
  } catch (error) {
    console.log('  Error getting policies:', error)
  }
  
  // 3. Check clubs table
  console.log('\n📊 3. CLUBS TABLE - ACTUAL STATE:')
  console.log('-'.repeat(60))
  
  const { data: clubs, error: clubsError, count: clubsCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact' })
  
  if (clubsError) {
    console.log('  Error:', clubsError.message)
  } else {
    console.log(`  Total clubs: ${clubsCount}`)
    if (clubs && clubs.length > 0) {
      console.log('  Actual clubs:')
      clubs.forEach((club: any) => {
        console.log(`    - ${club.name} (ID: ${club.id})`)
      })
      console.log('\n  Club columns:', Object.keys(clubs[0]).join(', '))
    }
  }
  
  // 4. Check teams table
  console.log('\n📊 4. TEAMS TABLE - ACTUAL STATE:')
  console.log('-'.repeat(60))
  
  const { data: teams, error: teamsError, count: teamsCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact' })
  
  if (teamsError) {
    console.log('  Error:', teamsError.message)
  } else {
    console.log(`  Total teams: ${teamsCount}`)
    if (teams && teams.length > 0) {
      console.log('\n  Team columns:', Object.keys(teams[0]).join(', '))
      
      // Group by club
      const teamsByClub: Record<string, any[]> = {}
      teams.forEach((team: any) => {
        const clubId = team.club_id || 'No Club'
        if (!teamsByClub[clubId]) teamsByClub[clubId] = []
        teamsByClub[clubId].push(team)
      })
      
      console.log('\n  Teams by club:')
      Object.entries(teamsByClub).forEach(([clubId, clubTeams]) => {
        const club = clubs?.find((c: any) => c.id === clubId)
        console.log(`\n    ${club?.name || `Club ${clubId}`}:`)
        clubTeams.forEach((team: any) => {
          console.log(`      - ${team.name} (ID: ${team.id})`)
        })
      })
    }
  }
  
  // 5. Check team_members table
  console.log('\n📊 5. TEAM_MEMBERS TABLE - ACTUAL STATE:')
  console.log('-'.repeat(60))
  
  const { data: members, error: membersError, count: membersCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' })
  
  if (membersError) {
    console.log('  Error:', membersError.message)
  } else {
    console.log(`  Total team members: ${membersCount}`)
    if (members && members.length > 0) {
      console.log('  Team member columns:', Object.keys(members[0]).join(', '))
      
      // Sample some memberships
      console.log('\n  Sample memberships (first 5):')
      members.slice(0, 5).forEach((member: any) => {
        console.log(`    User ${member.user_id.substring(0, 8)}... → Team ${member.team_id.substring(0, 8)}... (${member.role})`)
      })
    }
  }
  
  // 6. Check for patrick@powlax.com
  console.log('\n📊 6. PATRICK@POWLAX.COM USER STATUS:')
  console.log('-'.repeat(60))
  
  const { data: patrick, error: patrickError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'patrick@powlax.com')
    .maybeSingle()
  
  if (patrickError) {
    console.log('  Error finding Patrick:', patrickError.message)
  } else if (patrick) {
    console.log('  ✅ Patrick exists in users table!')
    console.log('  Patrick\'s data:')
    Object.entries(patrick).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        console.log(`    ${key}: ${Array.isArray(value) ? JSON.stringify(value) : value}`)
      }
    })
    
    // Check Patrick's team memberships
    const { data: patrickTeams, error: teamsError } = await supabase
      .from('team_members')
      .select('*, teams!inner(name)')
      .eq('user_id', patrick.id)
    
    if (patrickTeams && patrickTeams.length > 0) {
      console.log(`\n  Patrick is member of ${patrickTeams.length} teams:`)
      patrickTeams.forEach((tm: any) => {
        console.log(`    - ${tm.teams.name} as ${tm.role}`)
      })
    } else {
      console.log('\n  Patrick is NOT a member of any teams')
    }
  } else {
    console.log('  ❌ Patrick does not exist in users table')
  }
  
  // 7. Test RLS recursion issue
  console.log('\n📊 7. TESTING RLS RECURSION ISSUE:')
  console.log('-'.repeat(60))
  
  // Create an anon client to test RLS
  const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s')
  
  const { data: anonTest, error: anonError } = await anonClient
    .from('users')
    .select('id')
    .limit(1)
  
  if (anonError) {
    console.log('  ❌ Anon access error:', anonError.message)
    if (anonError.message.includes('infinite recursion')) {
      console.log('     ⚠️ CONFIRMED: RLS infinite recursion detected!')
    }
  } else {
    console.log('  ✅ Anon can access users table (no recursion)')
  }
  
  // 8. Summary and recommendations
  console.log('\n' + '='.repeat(80))
  console.log('📋 ANALYSIS SUMMARY:')
  console.log('-'.repeat(60))
  
  console.log('\nKEY FINDINGS:')
  console.log(`  - Users table has ${userCount || 0} records`)
  console.log(`  - Clubs table has ${clubsCount || 0} records`)
  console.log(`  - Teams table has ${teamsCount || 0} records`)
  console.log(`  - Team members table has ${membersCount || 0} records`)
  console.log(`  - Patrick@powlax.com: ${patrick ? 'EXISTS' : 'DOES NOT EXIST'}`)
  console.log(`  - RLS recursion: ${anonError?.message.includes('infinite recursion') ? 'CONFIRMED' : 'NOT DETECTED'}`)
  
  console.log('\n' + '='.repeat(80))
}

// Create helper functions (these should be added to Supabase)
const helperFunctions = `
-- Function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    column_name::text,
    data_type::text,
    is_nullable::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = get_table_schema.table_name
  ORDER BY ordinal_position;
$$;

-- Function to get RLS policies
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE(
  policyname name,
  cmd text,
  definition text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    pol.polname as policyname,
    CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END as cmd,
    pg_get_expr(pol.polqual, pol.polrelid) || 
    CASE 
      WHEN pol.polwithcheck IS NOT NULL 
      THEN ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid) || ')'
      ELSE ''
    END as definition
  FROM pg_policy pol
  JOIN pg_class cls ON pol.polrelid = cls.oid
  JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
  WHERE nsp.nspname = 'public'
    AND cls.relname = get_table_policies.table_name;
$$;
`

console.log('Helper functions to create in Supabase (if needed):')
console.log(helperFunctions)
console.log('\n' + '='.repeat(80) + '\n')

analyzeActualTables().catch(console.error)