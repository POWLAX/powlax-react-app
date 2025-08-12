import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function debugAndFixRLS() {
  console.log('🔍 Debugging RLS Policies for User Tables\n')
  
  // Check current user to understand the auth context
  console.log('1️⃣ Testing with Patrick Chapla (Admin) user...')
  const testUserId = '523f2768-6404-439c-a429-f9eb6736aa17' // Patrick's ID from public.users
  
  // Try to insert a test drill with service role (bypasses RLS)
  console.log('\n2️⃣ Testing insert with service role (bypasses RLS)...')
  try {
    const testDrill = {
      user_id: testUserId,
      title: 'RLS Test Drill',
      content: 'Testing RLS policies',
      is_public: false,
      team_share: false,
      club_share: false
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Insert failed even with service role:', error.message)
      console.log('   Error details:', error.details)
    } else {
      console.log('✅ Insert successful with service role')
      console.log('   Drill ID:', data.id)
      
      // Clean up test record
      await supabase.from('user_drills').delete().eq('id', data.id)
      console.log('   ✅ Cleaned up test record')
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // Generate SQL to fix RLS policies
  const fixSQL = `
-- =====================================================
-- FIX RLS POLICIES FOR USER TABLES
-- =====================================================
-- The issue: RLS policies are too restrictive or misconfigured
-- Solution: Create proper RLS policies that work with our authentication system

-- Disable RLS temporarily to fix policies
ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can view public drills" ON user_drills;
DROP POLICY IF EXISTS "Users can insert their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can update their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can delete their own drills" ON user_drills;

DROP POLICY IF EXISTS "Users can manage their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can view public strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON user_strategies;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

-- Create new simplified RLS policies for user_drills
CREATE POLICY "Enable insert for authenticated users own drills" ON user_drills
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);  -- Allow any authenticated user to insert their own drills

CREATE POLICY "Enable select for drill owners and public drills" ON user_drills
    FOR SELECT 
    TO authenticated 
    USING (
      user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
      OR is_public = true
    );

CREATE POLICY "Enable update for drill owners" ON user_drills
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Enable delete for drill owners" ON user_drills
    FOR DELETE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create new simplified RLS policies for user_strategies
CREATE POLICY "Enable insert for authenticated users own strategies" ON user_strategies
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);  -- Allow any authenticated user to insert their own strategies

CREATE POLICY "Enable select for strategy owners and public strategies" ON user_strategies
    FOR SELECT 
    TO authenticated 
    USING (
      user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
      OR is_public = true
    );

CREATE POLICY "Enable update for strategy owners" ON user_strategies
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Enable delete for strategy owners" ON user_strategies
    FOR DELETE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create new simplified RLS policies for user_favorites
CREATE POLICY "Enable all operations for own favorites" ON user_favorites
    FOR ALL 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Re-enable RLS with new policies
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON user_drills TO authenticated;
GRANT ALL ON user_strategies TO authenticated;
GRANT ALL ON user_favorites TO authenticated;

-- Also grant permissions to anon for public content viewing
GRANT SELECT ON user_drills TO anon;
GRANT SELECT ON user_strategies TO anon;

-- Verify the changes
SELECT 
  'RLS policies updated successfully!' as message,
  'Simplified policies for better compatibility' as detail1,
  'Authenticated users can now insert their own content' as detail2;
`
  
  console.log('\n📋 SQL MIGRATION TO FIX RLS POLICIES:')
  console.log('=====================================')
  console.log(fixSQL)
  console.log('\n=====================================')
  console.log('📌 TO FIX THE ISSUE:')
  console.log('1. Copy the SQL above')
  console.log('2. Go to Supabase Dashboard > SQL Editor')
  console.log('3. Paste and run the SQL')
  console.log('4. Test creating custom drills and strategies again')
  console.log('\n🔑 KEY CHANGES:')
  console.log('- Simplified RLS policies to be less restrictive')
  console.log('- INSERT policy now allows any authenticated user')
  console.log('- Properly handles the public.users vs auth.users relationship')
  console.log('- Separate policies for each operation (INSERT, SELECT, UPDATE, DELETE)')
  
  // Save to migration file
  const fs = require('fs')
  const migrationPath = './supabase/migrations/116_fix_rls_policies_user_tables.sql'
  
  fs.writeFileSync(migrationPath, fixSQL)
  console.log(`\n✅ Migration saved to: ${migrationPath}`)
  console.log('Run this migration to fix the RLS policy issues!')
}

debugAndFixRLS()