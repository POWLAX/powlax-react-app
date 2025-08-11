import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking for team-related tables in Supabase...\n');

  // List of potential team-related table names
  const tableNames = [
    'teams',
    'team',
    'team_members',
    'team_member',
    'organizations',
    'organization',
    'clubs',
    'club',
    'groups',
    'group',
    'user_teams',
    'user_groups',
    'buddyboss_groups',
    'wp_groups'
  ];

  console.log('📊 CHECKING TABLES:');
  console.log('=' .repeat(60));

  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${tableName}: Does not exist`);
        } else {
          console.log(`⚠️  ${tableName}: ${error.message}`);
        }
      } else {
        // Table exists, get count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        console.log(`✅ ${tableName}: EXISTS (${count || 0} records)`);
        
        // Get column info for existing tables
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single();
        
        if (sample) {
          console.log(`   Columns: ${Object.keys(sample).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error checking`);
    }
  }

  // Check for any tables with 'team' in the name
  console.log('\n🔍 SEARCHING FOR ANY TABLE WITH "TEAM" IN NAME:');
  console.log('=' .repeat(60));
  
  // Try to get all table names from information schema
  const { data: allTables, error: schemaError } = await supabase.rpc('get_all_public_tables');
  
  if (!schemaError && allTables) {
    const teamTables = allTables.filter((t: any) => 
      t.table_name?.toLowerCase().includes('team') ||
      t.table_name?.toLowerCase().includes('group') ||
      t.table_name?.toLowerCase().includes('org') ||
      t.table_name?.toLowerCase().includes('club')
    );
    
    if (teamTables.length > 0) {
      console.log('Found these related tables:');
      teamTables.forEach((t: any) => {
        console.log(`  - ${t.table_name}`);
      });
    } else {
      console.log('No tables found with team/group/org/club in the name');
    }
  }

  // Check users table for team-related columns
  console.log('\n📋 CHECKING USERS TABLE FOR TEAM COLUMNS:');
  console.log('=' .repeat(60));
  
  const { data: userSample } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();
  
  if (userSample) {
    const teamColumns = Object.keys(userSample).filter(col => 
      col.includes('team') || 
      col.includes('group') || 
      col.includes('club') ||
      col.includes('org')
    );
    
    if (teamColumns.length > 0) {
      console.log('Found these team-related columns in users table:');
      teamColumns.forEach(col => {
        console.log(`  - ${col}: ${userSample[col] || 'NULL'}`);
      });
    } else {
      console.log('No team-related columns found in users table');
    }
  }

  console.log('\n✅ Analysis complete!');
}

// Create helper RPC function if it doesn't exist
async function createHelperFunction() {
  const getAllTablesFunction = `
    CREATE OR REPLACE FUNCTION get_all_public_tables()
    RETURNS TABLE(table_name text)
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT table_name::text
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    $$;
  `;

  try {
    await supabase.rpc('query', { query: getAllTablesFunction });
  } catch (e) {
    // Function might already exist or we don't have permissions
  }
}

async function main() {
  await createHelperFunction();
  await checkTables();
}

main().catch(console.error);