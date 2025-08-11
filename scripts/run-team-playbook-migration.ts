import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Running team playbooks migration...')

  try {
    // Test database connection first
    console.log('🔗 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return
    }

    console.log('✅ Database connection successful!')

    // Check if table already exists
    console.log('🔍 Checking if team_playbooks table exists...')
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('team_playbooks')
      .select('*')
      .limit(1)

    if (!tableCheckError) {
      console.log('✅ team_playbooks table already exists!')
      return
    }

    // Create the table manually using individual statements
    console.log('📝 Creating team_playbooks table...')
    
    // Create table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS team_playbooks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        strategy_id TEXT NOT NULL,
        strategy_source TEXT DEFAULT 'powlax' CHECK (strategy_source IN ('powlax', 'user')),
        custom_name TEXT,
        team_notes TEXT,
        added_by UUID REFERENCES user_profiles(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Since we can't use rpc, let's try to insert a test record to see if table exists
    // If it fails, we know the table doesn't exist
    console.log('🏗️ Table does not exist, attempting to use existing database functions...')

    // Try to check what tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'team_playbooks')

    console.log('📋 Table check result:', { tablesData, tablesError })

    // Since direct SQL execution isn't available, let's just try to create a record
    // and let the application handle the migration through Supabase dashboard
    console.log('⚠️ Direct SQL execution not available.')
    console.log('📋 Please run this SQL in your Supabase dashboard:')
    console.log(`
-- Team Playbooks Migration
BEGIN;

CREATE TABLE IF NOT EXISTS team_playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    strategy_id TEXT NOT NULL,
    strategy_source TEXT DEFAULT 'powlax' CHECK (strategy_source IN ('powlax', 'user')),
    custom_name TEXT,
    team_notes TEXT,
    added_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_team_playbooks_team_id ON team_playbooks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_playbooks_strategy_id ON team_playbooks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_team_playbooks_added_by ON team_playbooks(added_by);

-- Enable RLS
ALTER TABLE team_playbooks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read team playbooks for their teams" ON team_playbooks
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add to team playbooks for their teams" ON team_playbooks
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
        AND added_by = auth.uid()
    );

CREATE POLICY "Users can update team playbooks they added" ON team_playbooks
    FOR UPDATE USING (
        added_by = auth.uid()
        AND team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete team playbooks they added" ON team_playbooks
    FOR DELETE USING (
        added_by = auth.uid()
        AND team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

COMMIT;
    `)

    console.log('🎉 Migration SQL printed above. Please execute in Supabase dashboard.')

  } catch (err) {
    console.error('❌ Migration error:', err)
  }
}

runMigration()