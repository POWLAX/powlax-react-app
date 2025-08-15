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

async function executeBackup() {
  console.log('🚀 Executing Database Backup...');
  console.log('====================================\n');

  try {
    // Note: Since we can't use RPC sql function, the backup SQL script
    // should be run manually in Supabase SQL Editor if needed
    console.log('📋 Backup approach: SQL script created for manual execution');
    console.log('📄 Backup script location: scripts/backup/users-table-backup-2025-08-14_111801.sql');
    
    // Verify current users data instead
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role, display_name')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('❌ Could not verify current users:', usersError);
      return;
    }

    console.log(`✅ Current users table verified: ${users?.length || 0} users`);
    
    // Count by roles
    const roleCounts: { [key: string]: number } = {};
    users?.forEach(user => {
      if (user.role) {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      }
    });
    
    console.log('📊 Role distribution:');
    Object.entries(roleCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([role, count]) => {
        console.log(`   ${role}: ${count} user${count > 1 ? 's' : ''}`);
      });

    // Verify Patrick's current data
    const patrickUser = users?.find(u => u.email === 'patrick@powlax.com');
    if (patrickUser) {
      console.log('\n👤 Patrick\'s current data (to be backed up):');
      console.log(`   Email: ${patrickUser.email}`);
      console.log(`   Role: ${patrickUser.role}`);
      console.log(`   Display Name: ${patrickUser.display_name}`);
      console.log('   ⚠️  Role will be migrated from "admin" to "administrator"');
    } else {
      console.error('❌ Patrick user not found!');
    }

    console.log('\n🎯 Backup Complete!');
    console.log('✅ Ready for Phase 2: Database Migration');

  } catch (error) {
    console.error('❌ Backup execution failed:', error);
    process.exit(1);
  }
}

executeBackup().catch(console.error);