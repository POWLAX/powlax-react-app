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
  console.log('🔍 Checking actual Supabase tables for migration 084...\n');

  // Check users table structure
  console.log('📊 USERS TABLE COLUMNS:');
  const { data: usersColumns, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(0);
  
  if (usersError) {
    console.error('❌ Error checking users table:', usersError);
  } else {
    const sampleUser = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleUser.data) {
      console.log('Existing columns:', Object.keys(sampleUser.data));
    }
  }

  // Check if parent_child_relationships exists
  console.log('\n📊 PARENT_CHILD_RELATIONSHIPS TABLE:');
  const { data: parentChildData, error: parentChildError } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .limit(0);
  
  if (parentChildError) {
    console.error('❌ Table might not exist:', parentChildError.message);
  } else {
    const sampleRelation = await supabase
      .from('parent_child_relationships')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleRelation.data) {
      console.log('✅ Table exists with columns:', Object.keys(sampleRelation.data));
    } else {
      console.log('✅ Table exists but is empty');
      // Try to get column info directly
      const { data: tableInfo } = await supabase.rpc('get_table_columns', {
        table_name: 'parent_child_relationships'
      }).single();
      
      if (tableInfo) {
        console.log('Columns from RPC:', tableInfo);
      }
    }
  }

  // Check if family_accounts already exists
  console.log('\n📊 FAMILY_ACCOUNTS TABLE:');
  const { error: familyError } = await supabase
    .from('family_accounts')
    .select('*')
    .limit(0);
  
  if (familyError) {
    console.log('❌ Table does not exist (will be created)');
  } else {
    console.log('✅ Table already exists');
  }

  // Check if family_members already exists
  console.log('\n📊 FAMILY_MEMBERS TABLE:');
  const { error: membersError } = await supabase
    .from('family_members')
    .select('*')
    .limit(0);
  
  if (membersError) {
    console.log('❌ Table does not exist (will be created)');
  } else {
    console.log('✅ Table already exists');
  }

  // Get actual table list from database
  console.log('\n📋 ALL TABLES IN DATABASE:');
  const { data: tables } = await supabase.rpc('get_all_tables');
  
  if (tables) {
    const relevantTables = tables.filter((t: any) => 
      t.table_name === 'users' || 
      t.table_name === 'parent_child_relationships' ||
      t.table_name === 'family_accounts' ||
      t.table_name === 'family_members'
    );
    console.log('Relevant tables:', relevantTables.map((t: any) => t.table_name));
  }

  // Check user_profiles vs users confusion
  console.log('\n🔍 CHECKING USER_PROFILES VS USERS:');
  const { error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);
  
  if (!profilesError) {
    console.log('⚠️  user_profiles table exists - might be the actual user table');
    const { data: profileSample } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (profileSample) {
      console.log('user_profiles columns:', Object.keys(profileSample));
    }
  }

  console.log('\n✅ Analysis complete!');
}

// Add RPC function if it doesn't exist
async function createHelperFunctions() {
  const getAllTablesFunction = `
    CREATE OR REPLACE FUNCTION get_all_tables()
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

  const getTableColumnsFunction = `
    CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
    RETURNS json
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT json_agg(column_name)
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1;
    $$;
  `;

  try {
    await supabase.rpc('query', { query: getAllTablesFunction });
    await supabase.rpc('query', { query: getTableColumnsFunction });
  } catch (e) {
    // Functions might already exist
  }
}

checkTables().catch(console.error);