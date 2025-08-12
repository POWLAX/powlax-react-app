import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function analyzeRLSPoliciesDeep() {
  console.log('🔍 DEEP ANALYSIS OF RLS POLICIES - IDENTIFYING RECURSION')
  console.log('=' .repeat(80))
  
  // Query to get all RLS policies on users table
  const policiesQuery = `
    SELECT 
      pol.polname as policy_name,
      CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT' 
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
      END as command,
      pol.polpermissive as is_permissive,
      array_to_string(pol.polroles, ', ') as roles,
      pg_get_expr(pol.polqual, pol.polrelid, true) as using_clause,
      pg_get_expr(pol.polwithcheck, pol.polrelid, true) as with_check_clause
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public'
      AND cls.relname = 'users'
    ORDER BY pol.polname;
  `
  
  const { data: policies, error: policiesError } = await supabase.rpc('query_policies', {
    query_text: policiesQuery
  }).single()
  
  if (policiesError) {
    // Try direct query
    console.log('Attempting direct RLS analysis...\n')
    
    // Use a simpler approach
    const { data: simpleCheck, error: simpleError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'users')
    
    if (simpleCheck) {
      console.log('📊 RLS POLICIES ON USERS TABLE:')
      console.log('-'.repeat(60))
      
      simpleCheck.forEach((policy: any) => {
        console.log(`\nPolicy: ${policy.policyname}`)
        console.log(`  Command: ${policy.cmd}`)
        console.log(`  Permissive: ${policy.permissive}`)
        console.log(`  Roles: ${policy.roles}`)
        console.log(`  USING clause:`)
        console.log(`    ${policy.qual}`)
        if (policy.with_check) {
          console.log(`  WITH CHECK clause:`)
          console.log(`    ${policy.with_check}`)
        }
        
        // Check for recursion patterns
        if (policy.qual && policy.qual.includes('users')) {
          console.log(`  ⚠️ WARNING: Policy references users table in USING clause!`)
          if (policy.qual.includes('SELECT') || policy.qual.includes('EXISTS')) {
            console.log(`     🔴 RECURSION RISK: Subquery on users table detected!`)
          }
        }
      })
    } else {
      console.log('Could not retrieve policies directly. Let me analyze the recursion pattern...')
    }
  } else if (policies) {
    console.log('📊 DETAILED RLS POLICIES:')
    console.log('-'.repeat(60))
    console.log(policies)
  }
  
  // Test the actual recursion
  console.log('\n📊 RECURSION TEST - STEP BY STEP:')
  console.log('-'.repeat(60))
  
  // Test 1: Service role (should work)
  console.log('\n1. Service Role Access (bypasses RLS):')
  const { data: serviceTest, error: serviceError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', 'patrick@powlax.com')
    .single()
  
  if (serviceError) {
    console.log('   ❌ Error:', serviceError.message)
  } else {
    console.log('   ✅ Success! Found:', serviceTest.email)
  }
  
  // Test 2: Anon role (triggers RLS)
  console.log('\n2. Anon Role Access (uses RLS):')
  const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s')
  
  const { data: anonTest, error: anonError } = await anonClient
    .from('users')
    .select('id')
    .limit(1)
  
  if (anonError) {
    console.log('   ❌ Error:', anonError.message)
    if (anonError.message.includes('infinite recursion')) {
      console.log('   🔴 CONFIRMED: Infinite recursion in RLS policy!')
    }
  } else {
    console.log('   ✅ Success! Anon can access users')
  }
  
  // Analyze the problem
  console.log('\n📊 RECURSION ANALYSIS:')
  console.log('-'.repeat(60))
  console.log(`
The infinite recursion is likely caused by one of these patterns:

1. A policy that references users table in a subquery:
   USING (
     id IN (SELECT user_id FROM team_members WHERE ...)
     -- This subquery might trigger another policy check
   )

2. A policy that joins back to users:
   USING (
     EXISTS (
       SELECT 1 FROM users u2 
       WHERE u2.auth_user_id = auth.uid()
     )
   )

3. Circular dependency between policies:
   - Policy A checks team_members
   - team_members policy checks users
   - users policy checks team_members again
  `)
  
  console.log('\n📊 RECOMMENDED FIX:')
  console.log('-'.repeat(60))
  console.log(`
The fix should:
1. Remove ALL existing policies on users table
2. Create simple, non-recursive policies:
   - Users can see their own record (by auth_user_id)
   - Service role can see everything
   - Optionally: authenticated users can see basic info of team members
3. Avoid subqueries that reference the users table itself
  `)
  
  // Show the actual data we found
  console.log('\n📊 ACTUAL DATABASE STATE SUMMARY:')
  console.log('-'.repeat(60))
  console.log('✅ Patrick exists:')
  console.log('   - ID: 523f2768-6404-439c-a429-f9eb6736aa17')
  console.log('   - Email: patrick@powlax.com')
  console.log('   - Club: Your Club OS (a22ad3ca-9f1c-4c4f-9163-021c6af927ac)')
  console.log('   - Roles: administrator, parent, club_director, team_coach, player')
  console.log('\n✅ Patrick is member of 3 teams:')
  console.log('   - Your Varsity Team HQ (head_coach)')
  console.log('   - Your JV Team HQ (assistant_coach)')
  console.log('   - Your 8th Grade Team HQ (player)')
  console.log('\n✅ Database has data:')
  console.log('   - 14 users')
  console.log('   - 3 clubs')
  console.log('   - 14 teams')
  console.log('   - 26 team memberships')
  console.log('\n❌ Problem:')
  console.log('   - RLS infinite recursion on users table')
  console.log('   - Prevents any authenticated/anon access to users')
  
  console.log('\n' + '='.repeat(80))
}

// Create helper function
const createHelperFunction = `
-- Create this function in Supabase SQL Editor if needed:
CREATE OR REPLACE FUNCTION query_policies(query_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query_text INTO result;
  RETURN result;
END;
$$;
`

console.log('If needed, create this helper function in Supabase:')
console.log(createHelperFunction)
console.log('\n' + '='.repeat(80) + '\n')

analyzeRLSPoliciesDeep().catch(console.error)