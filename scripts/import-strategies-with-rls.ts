import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For RLS operations, we might need service role key
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupRLSAndImport() {
  console.log('🔐 Setting up RLS-aware import for strategies...\n')
  
  // SQL to handle RLS
  const rlsSetupSQL = `
-- First, check if table exists and create if needed
CREATE TABLE IF NOT EXISTS wp_strategies (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER,
  reference_id INTEGER,
  strategy_categories TEXT,
  strategy_name TEXT NOT NULL,
  lacrosse_lab_links JSONB,
  description TEXT,
  embed_codes JSONB,
  see_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT false,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id BIGINT,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wp_strategies ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous read access
CREATE POLICY "Allow anonymous read access" ON wp_strategies
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Allow authenticated users full access" ON wp_strategies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access" ON wp_strategies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
  `
  
  console.log('📋 RLS Setup Instructions:\n')
  console.log('Since RLS is enabled, you have two options:\n')
  
  console.log('Option 1: Run this SQL in Supabase Dashboard (as postgres user):')
  console.log('================================================')
  console.log(rlsSetupSQL)
  console.log('================================================\n')
  
  console.log('Option 2: Temporarily disable RLS for import:')
  console.log('================================================')
  console.log('-- Run in SQL Editor:')
  console.log('ALTER TABLE wp_strategies DISABLE ROW LEVEL SECURITY;')
  console.log('-- Import data using the SQL file')
  console.log('-- Then re-enable RLS:')
  console.log('ALTER TABLE wp_strategies ENABLE ROW LEVEL SECURITY;')
  console.log('================================================\n')
  
  // Try to check current RLS status
  const { data: tableInfo, error: tableError } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', 'wp_strategies')
    .single()
  
  if (!tableError && tableInfo) {
    console.log(`Current RLS status for wp_strategies: ${tableInfo.rowsecurity ? 'ENABLED' : 'DISABLED'}`)
  }
  
  // Generate alternative: Service account approach
  const serviceAccountSQL = `
-- Alternative: Create a service account for imports
-- This allows bypassing RLS for data imports

-- 1. Create import user (run as superuser)
CREATE USER powlax_importer WITH PASSWORD 'secure_password_here';
GRANT ALL ON ALL TABLES IN SCHEMA public TO powlax_importer;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO powlax_importer;

-- 2. Create RLS policy for import user
CREATE POLICY "Import user has full access" ON wp_strategies
  FOR ALL
  TO powlax_importer
  USING (true)
  WITH CHECK (true);
  `
  
  console.log('\nOption 3: Create Import User (Most Secure):')
  console.log('================================================')
  console.log(serviceAccountSQL)
  console.log('================================================\n')
  
  // Create a SQL file that includes RLS handling
  const sqlPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_insert.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
  
  const rlsAwareSql = `
-- POWLAX Strategies Import with RLS Handling
-- Generated on ${new Date().toISOString()}

-- Temporarily disable RLS for import (re-enable after)
ALTER TABLE wp_strategies DISABLE ROW LEVEL SECURITY;

${sqlContent}

-- Re-enable RLS after import
ALTER TABLE wp_strategies ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist
DO $$
BEGIN
  -- Check if policies exist before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wp_strategies' 
    AND policyname = 'Allow anonymous read access'
  ) THEN
    CREATE POLICY "Allow anonymous read access" ON wp_strategies
      FOR SELECT TO anon USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wp_strategies' 
    AND policyname = 'Allow authenticated users full access'
  ) THEN
    CREATE POLICY "Allow authenticated users full access" ON wp_strategies
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END$$;
`
  
  const rlsSqlPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_with_rls.sql')
  fs.writeFileSync(rlsSqlPath, rlsAwareSql)
  
  console.log(`✅ Created RLS-aware SQL file: strategies_with_rls.sql`)
  console.log('\n🚀 To import with RLS handling:')
  console.log('1. Go to Supabase SQL Editor')
  console.log('2. Paste the contents of strategies_with_rls.sql')
  console.log('3. Run the query\n')
  
  // Test if we can read from the table
  const { data: testRead, error: readError } = await supabase
    .from('wp_strategies')
    .select('id, strategy_name')
    .limit(1)
  
  if (readError) {
    console.log('❌ Cannot read from table:', readError.message)
    console.log('This confirms RLS is blocking access.')
  } else {
    console.log('✅ Can read from table. Found', testRead?.length || 0, 'records')
  }
}

// Run the setup
setupRLSAndImport().catch(console.error)