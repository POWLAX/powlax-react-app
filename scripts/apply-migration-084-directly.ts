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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying migration 084 - User Profile Enhancement & Family Accounts\n');

  try {
    // Step 1: Add columns to users table
    console.log('📝 Step 1: Adding columns to users table...');
    
    const userColumns = [
      { name: 'first_name', type: 'TEXT' },
      { name: 'last_name', type: 'TEXT' },
      { name: 'phone', type: 'TEXT' },
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'emergency_contact', type: 'JSONB' },
      { name: 'player_position', type: 'TEXT' },
      { name: 'graduation_year', type: 'INTEGER' },
      { name: 'profile_image_url', type: 'TEXT' },
      { name: 'account_type', type: 'TEXT', default: "'individual'" },
      { name: 'age_group', type: 'TEXT' },
      { name: 'privacy_settings', type: 'JSONB', default: "'{\"profile_visible\": true, \"stats_visible\": true}'" },
      { name: 'notification_preferences', type: 'JSONB', default: "'{\"email\": true, \"push\": true, \"sms\": false}'" }
    ];

    // Check which columns already exist
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleUser) {
      const existingColumns = Object.keys(sampleUser);
      const newColumns = userColumns.filter(col => !existingColumns.includes(col.name));
      
      if (newColumns.length > 0) {
        console.log(`  Need to add ${newColumns.length} new columns: ${newColumns.map(c => c.name).join(', ')}`);
        console.log('  ⚠️  Note: Column addition requires direct database access');
      } else {
        console.log('  ✅ All columns already exist');
      }
    }

    // Step 2: Create parent_child_relationships table
    console.log('\n📝 Step 2: Creating parent_child_relationships table...');
    
    // Check if table exists
    const { error: parentChildError } = await supabase
      .from('parent_child_relationships')
      .select('*')
      .limit(0);
    
    if (parentChildError && parentChildError.message.includes('does not exist')) {
      console.log('  Table needs to be created');
      console.log('  ⚠️  Note: Table creation requires direct database access');
    } else {
      console.log('  ✅ Table already exists');
    }

    // Step 3: Create family_accounts table
    console.log('\n📝 Step 3: Creating family_accounts table...');
    
    const { error: familyAccountsError } = await supabase
      .from('family_accounts')
      .select('*')
      .limit(0);
    
    if (familyAccountsError && familyAccountsError.message.includes('does not exist')) {
      console.log('  Table needs to be created');
      console.log('  ⚠️  Note: Table creation requires direct database access');
    } else {
      console.log('  ✅ Table already exists');
    }

    // Step 4: Create family_members table
    console.log('\n📝 Step 4: Creating family_members table...');
    
    const { error: familyMembersError } = await supabase
      .from('family_members')
      .select('*')
      .limit(0);
    
    if (familyMembersError && familyMembersError.message.includes('does not exist')) {
      console.log('  Table needs to be created');
      console.log('  ⚠️  Note: Table creation requires direct database access');
    } else {
      console.log('  ✅ Table already exists');
    }

    // Display manual migration instructions
    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nThe migration script requires direct database access.');
    console.log('Please run the following in your Supabase SQL Editor:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/bhviqmmtzjvqkyfsddtk/sql/new');
    console.log('2. Copy and paste the contents of:');
    console.log('   supabase/migrations/084_enhance_user_profiles_and_family_accounts_corrected.sql');
    console.log('3. Click "Run" to execute the migration\n');
    console.log('Alternatively, if you have psql installed locally:');
    console.log('PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h db.bhviqmmtzjvqkyfsddtk.supabase.co -U postgres -d postgres -f supabase/migrations/084_enhance_user_profiles_and_family_accounts_corrected.sql\n');
    console.log('='.repeat(60));

    // Verify current state
    console.log('\n📊 Current Database State:');
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log(`  Users table: ${userCount} records`);
    
    // List existing columns
    if (sampleUser) {
      const columns = Object.keys(sampleUser);
      console.log(`  Current columns: ${columns.join(', ')}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

applyMigration().catch(console.error);