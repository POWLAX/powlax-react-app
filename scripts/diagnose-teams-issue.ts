import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnoseTeamsIssue() {
  console.log('🔍 COMPREHENSIVE TEAMS PAGE DIAGNOSIS\n')
  console.log('=' .repeat(70))
  
  // 1. Check users table structure
  console.log('\n📊 1. USERS TABLE STRUCTURE:')
  console.log('-'.repeat(40))
  
  const { data: usersSchema, error: schemaError } = await supabase.rpc('get_table_columns', {
    table_name: 'users',
    schema_name: 'public'
  }).select('*')
  
  if (schemaError) {
    // Fallback: try to get a sample record
    const { data: sampleUser, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleUser) {
      console.log('  Available columns:', Object.keys(sampleUser).join(', '))
    } else {
      console.log('  Error getting schema:', schemaError.message)
    }
  } else if (usersSchema) {
    console.log('  Columns:', usersSchema.map((c: any) => c.column_name).join(', '))
  }
  
  // 2. Check if patrick@powlax.com exists
  console.log('\n📊 2. PATRICK USER STATUS:')
  console.log('-'.repeat(40))
  
  const { data: patrick, error: patrickError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'patrick@powlax.com')
    .maybeSingle()
  
  if (patrickError) {
    console.log('  Error finding Patrick:', patrickError.message)
  } else if (patrick) {
    console.log('  ✅ Patrick exists!')
    console.log('    ID:', patrick.id)
    console.log('    Email:', patrick.email)
    console.log('    Display Name:', patrick.display_name || 'Not set')
    console.log('    Username:', patrick.username || 'Not set')
    console.log('    Role:', patrick.role || 'Not set')
    console.log('    Club ID:', patrick.club_id || 'Not set')
    console.log('    Auth User ID:', patrick.auth_user_id || 'Not set')
  } else {
    console.log('  ❌ Patrick not found - needs to be created')
  }
  
  // 3. Check Your Club OS
  console.log('\n📊 3. YOUR CLUB OS STATUS:')
  console.log('-'.repeat(40))
  
  const clubId = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac'
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single()
  
  if (clubError) {
    console.log('  Error finding club:', clubError.message)
  } else if (club) {
    console.log('  ✅ Your Club OS exists!')
    console.log('    Name:', club.name)
    console.log('    ID:', club.id)
  }
  
  // 4. Check teams in Your Club OS
  console.log('\n📊 4. YOUR CLUB OS TEAMS:')
  console.log('-'.repeat(40))
  
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('club_id', clubId)
  
  if (teamsError) {
    console.log('  Error fetching teams:', teamsError.message)
  } else if (teams) {
    console.log(`  Found ${teams.length} teams:`)
    teams.forEach((team: any) => {
      console.log(`    - ${team.name} (${team.id})`)
    })
  }
  
  // 5. Check team memberships
  console.log('\n📊 5. TEAM MEMBERSHIPS:')
  console.log('-'.repeat(40))
  
  if (patrick && teams) {
    for (const team of teams) {
      const { data: membership, error: memError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('user_id', patrick.id)
        .maybeSingle()
      
      if (membership) {
        console.log(`  ✅ Patrick is ${membership.role} of ${team.name}`)
      } else {
        console.log(`  ❌ Patrick NOT member of ${team.name}`)
      }
    }
  } else {
    console.log('  Cannot check - Patrick or teams not found')
  }
  
  // 6. Check auth.users table
  console.log('\n📊 6. AUTH.USERS STATUS:')
  console.log('-'.repeat(40))
  
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
    patrick?.auth_user_id || 'dummy'
  )
  
  if (authError) {
    console.log('  Error checking auth.users:', authError.message)
    console.log('  Patrick may need auth_user_id linked')
  } else if (authUser) {
    console.log('  ✅ Auth user found!')
    console.log('    Email:', authUser.user.email)
    console.log('    Created:', authUser.user.created_at)
  }
  
  // 7. Check RLS policies
  console.log('\n📊 7. RLS POLICY STATUS:')
  console.log('-'.repeat(40))
  
  const { data: policies, error: policiesError } = await supabase.rpc('get_policies', {
    table_name: 'users'
  })
  
  if (policiesError) {
    console.log('  Error getting policies:', policiesError.message)
  } else if (policies) {
    console.log('  Active policies:', policies.length)
    policies.forEach((p: any) => {
      console.log(`    - ${p.policyname}: ${p.cmd}`)
    })
  }
  
  // 8. Recommendation
  console.log('\n📊 8. RECOMMENDED ACTIONS:')
  console.log('-'.repeat(40))
  
  const actions = []
  
  if (!patrick) {
    actions.push('1. Create patrick@powlax.com user')
  } else {
    if (!patrick.club_id) {
      actions.push('1. Set Patrick\'s club_id to Your Club OS')
    }
    if (!patrick.role || patrick.role !== 'director') {
      actions.push('2. Set Patrick\'s role to director')
    }
    if (!patrick.auth_user_id) {
      actions.push('3. Link Patrick to auth.users')
    }
  }
  
  if (teams && teams.length > 0 && patrick) {
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', patrick.id)
    
    const memberOfTeamIds = memberships?.map(m => m.team_id) || []
    const notMemberOf = teams.filter(t => !memberOfTeamIds.includes(t.id))
    
    if (notMemberOf.length > 0) {
      actions.push(`4. Add Patrick to ${notMemberOf.length} teams`)
    }
  }
  
  if (actions.length > 0) {
    console.log('  Actions needed:')
    actions.forEach(action => console.log(`    ${action}`))
  } else {
    console.log('  ✅ Everything looks good!')
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('Run the fix script to apply corrections!')
}

// Helper RPC function definitions (these should be created in Supabase)
const createHelperFunctions = `
-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(table_name text, schema_name text DEFAULT 'public')
RETURNS TABLE(column_name text, data_type text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT column_name::text, data_type::text
  FROM information_schema.columns
  WHERE table_schema = schema_name
    AND table_name = get_table_columns.table_name
  ORDER BY ordinal_position;
$$;

-- Function to get policies
CREATE OR REPLACE FUNCTION get_policies(table_name text)
RETURNS TABLE(policyname name, cmd text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT policyname, cmd::text
  FROM pg_policies
  WHERE tablename = get_policies.table_name;
$$;
`

diagnoseTeamsIssue().catch(console.error)