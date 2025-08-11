import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixPracticesRLS() {
  console.log('=== FIXING PRACTICES TABLE RLS POLICIES ===\n')
  
  console.log('1. Dropping existing policies to fix infinite recursion...')
  
  // First, try to drop all existing policies on the practices table
  const dropPoliciesSQL = `
    DO $$
    DECLARE
        policy_record RECORD;
    BEGIN
        -- Get all policies for practices table
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'practices' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON practices', policy_record.policyname);
            RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
        END LOOP;
    END
    $$;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL })
    if (error) {
      console.log('❌ Error dropping policies:', error.message)
      console.log('Manual cleanup needed - run in Supabase SQL editor:')
      console.log('DROP POLICY IF EXISTS practices_select_policy ON practices;')
      console.log('DROP POLICY IF EXISTS practices_insert_policy ON practices;')
      console.log('DROP POLICY IF EXISTS practices_update_policy ON practices;')
      console.log('DROP POLICY IF EXISTS practices_delete_policy ON practices;')
    } else {
      console.log('✅ Existing policies dropped')
    }
  } catch (err) {
    console.log('❌ Exception dropping policies:', err)
  }
  
  console.log('\n2. Creating simple, non-recursive policies...')
  
  // Create simple policies that don't reference the users table to avoid infinite recursion
  const createPoliciesSQL = `
    -- Enable RLS on practices table
    ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
    
    -- Allow authenticated users to read practices they coach
    CREATE POLICY "practices_read_own" 
    ON practices 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid()::text = coach_id);
    
    -- Allow authenticated users to insert practices as coach
    CREATE POLICY "practices_insert_own" 
    ON practices 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid()::text = coach_id);
    
    -- Allow authenticated users to update their own practices
    CREATE POLICY "practices_update_own" 
    ON practices 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid()::text = coach_id)
    WITH CHECK (auth.uid()::text = coach_id);
    
    -- Allow authenticated users to delete their own practices
    CREATE POLICY "practices_delete_own" 
    ON practices 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid()::text = coach_id);
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL })
    if (error) {
      console.log('❌ Error creating policies:', error.message)
      console.log('\nManual SQL to run in Supabase dashboard:')
      console.log(createPoliciesSQL)
    } else {
      console.log('✅ New policies created successfully')
    }
  } catch (err) {
    console.log('❌ Exception creating policies:', err)
  }
  
  console.log('\n3. Testing policy functionality...')
  
  // Test with service role (should work)
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('id, name, coach_id')
      .limit(3)
    
    if (error) {
      console.log('❌ Service role cannot read:', error.message)
    } else {
      console.log('✅ Service role can read practices:', data?.length || 0, 'records')
    }
  } catch (err) {
    console.log('❌ Service role test error:', err)
  }
  
  // Test with anon key (should fail with proper auth error)
  const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  
  try {
    const { data, error } = await anonSupabase
      .from('practices')
      .select('id, name, coach_id')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST301') {
        console.log('✅ Anon correctly blocked - RLS working properly')
      } else {
        console.log('❌ Anon error (may be OK):', error.message)
      }
    } else {
      console.log('⚠️ Anon can read - RLS may be too permissive')
    }
  } catch (err) {
    console.log('❌ Anon test error:', err)
  }
  
  console.log('\n4. Testing save operation structure...')
  
  // Test the exact save operation from the hook (should fail with auth, not infinite recursion)
  const testData = {
    name: 'RLS Test Practice',
    coach_id: 'test-coach-id',
    team_id: null,
    practice_date: new Date().toISOString().split('T')[0],
    duration_minutes: 90,
    field_location: 'Test Field',
    goals: {},
    notes: 'RLS test',
    raw_wp_data: {},
    updated_at: new Date().toISOString()
  }
  
  try {
    const { data, error } = await anonSupabase
      .from('practices')
      .insert([testData])
      .select()
      .single()
    
    if (error) {
      if (error.message.includes('infinite recursion')) {
        console.log('❌ STILL HAVE INFINITE RECURSION:', error.message)
      } else if (error.code === 'PGRST301') {
        console.log('✅ Anon properly blocked from insert - RLS working')
      } else {
        console.log('✅ Different error (not infinite recursion):', error.message)
      }
    } else {
      console.log('⚠️ Anon could insert - check policies')
      // Clean up if successful
      await supabase.from('practices').delete().eq('id', data.id)
    }
  } catch (err) {
    console.log('❌ Save test exception:', err)
  }
  
  console.log('\n=== RLS FIX COMPLETE ===')
  console.log('\n📝 If infinite recursion persists, disable RLS temporarily:')
  console.log('ALTER TABLE practices DISABLE ROW LEVEL SECURITY;')
}

fixPracticesRLS().catch(console.error)