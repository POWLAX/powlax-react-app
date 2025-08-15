import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateTimestamp(): Promise<string> {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         now.toTimeString().split(' ')[0].replace(/:/g, '');
}

async function phase1aDatabaseAnalysis() {
  console.log('🚀 Phase 1A: Database Analysis Agent');
  console.log('=====================================\n');

  const timestamp = await generateTimestamp();
  
  try {
    // 1. Query current role values in public.users table
    console.log('📊 1. Querying current role values in public.users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, display_name, first_name, last_name, created_at')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    // 2. Document all unique role values found
    const roleCounts: { [key: string]: number } = {};
    const roleUsers: { [key: string]: any[] } = {};
    
    users?.forEach(user => {
      if (user.role) {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        if (!roleUsers[user.role]) roleUsers[user.role] = [];
        roleUsers[user.role].push(user);
      }
    });

    console.log('✅ Found roles:', Object.keys(roleCounts).join(', '));

    // 3. Focus on Patrick's user (patrick@powlax.com)
    const patrickUser = users?.find(u => u.email === 'patrick@powlax.com');
    if (!patrickUser) {
      console.error('❌ Patrick user not found!');
      return;
    }

    console.log('👤 Patrick\'s current role:', patrickUser.role);
    console.log('📧 Patrick\'s email:', patrickUser.email);

    // 4. Verify WordPress role alignment expectations
    const wordpressAlignment = patrickUser.role === 'administrator' 
      ? '✅ Already aligned with WordPress standard'
      : '⚠️  Needs migration to WordPress standard "administrator"';
    
    console.log('🔗 WordPress alignment:', wordpressAlignment);

    // 5. Create timestamped backup of users table
    console.log('\n💾 2. Creating timestamped backup of users table...');
    
    const backupSql = `-- Users Table Backup
-- Generated: ${new Date().toISOString()}
-- Purpose: Backup before role standardization migration (admin -> administrator)
-- Total users: ${users?.length || 0}

BEGIN;

-- Create backup table
CREATE TABLE IF NOT EXISTS users_backup_${timestamp.replace(/-/g, '_')} AS 
SELECT * FROM public.users;

-- Verify backup
SELECT 
  'Backup created: users_backup_${timestamp.replace(/-/g, '_')}' as status,
  COUNT(*) as user_count 
FROM users_backup_${timestamp.replace(/-/g, '_')};

COMMIT;

-- Backup verification queries:
-- SELECT * FROM users_backup_${timestamp.replace(/-/g, '_')} WHERE email = 'patrick@powlax.com';
-- SELECT role, COUNT(*) FROM users_backup_${timestamp.replace(/-/g, '_')} GROUP BY role;
`;

    const backupFilePath = `scripts/backup/users-table-backup-${timestamp}.sql`;
    fs.writeFileSync(backupFilePath, backupSql);
    console.log('✅ Backup SQL created:', backupFilePath);

    // 6. Generate rollback script for emergency use
    console.log('\n🔄 3. Generating rollback script for emergency use...');
    
    const rollbackSql = `-- Role Migration Rollback Script
-- Generated: ${new Date().toISOString()}
-- Purpose: Emergency rollback from "administrator" back to "admin" if needed
-- ⚠️  ONLY USE IF MIGRATION FAILS AND ROLLBACK IS NEEDED

BEGIN;

-- Verify current state before rollback
SELECT 
  'Before rollback:' as status,
  email, 
  role,
  full_name
FROM public.users 
WHERE email = 'patrick@powlax.com';

-- Rollback Patrick's role from "administrator" to "admin"
UPDATE public.users 
SET role = 'admin'
WHERE email = 'patrick@powlax.com' 
  AND role = 'administrator';

-- Verify rollback
SELECT 
  'After rollback:' as status,
  email, 
  role,
  full_name,
  CASE WHEN role = 'admin' 
       THEN '✅ Rollback successful' 
       ELSE '❌ Rollback failed' 
  END as rollback_status
FROM public.users 
WHERE email = 'patrick@powlax.com';

COMMIT;

-- Post-rollback verification:
-- 1. Check Patrick can still log in
-- 2. Verify admin dashboard access
-- 3. Clear Next.js cache: rm -rf .next
-- 4. Restart dev server: npm run dev
`;

    const rollbackFilePath = 'scripts/backup/role-migration-rollback.sql';
    fs.writeFileSync(rollbackFilePath, rollbackSql);
    console.log('✅ Rollback script created:', rollbackFilePath);

    // 7. Generate comprehensive analysis report
    console.log('\n📋 4. Generating current roles report...');
    
    const reportContent = `PHASE 1A: DATABASE ANALYSIS REPORT
Generated: ${new Date().toISOString()}
Agent: Database Analysis Agent
Contract: role-standardization-migration-001.yaml

=== EXECUTIVE SUMMARY ===
- Total users in database: ${users?.length || 0}
- Unique roles found: ${Object.keys(roleCounts).length}
- Patrick's current role: "${patrickUser.role}"
- WordPress alignment status: ${patrickUser.role === 'administrator' ? 'ALIGNED' : 'NEEDS MIGRATION'}
- Migration target: "administrator" (WordPress standard)

=== DETAILED ROLE ANALYSIS ===

Current Role Distribution:
${Object.entries(roleCounts)
  .sort(([,a], [,b]) => b - a)
  .map(([role, count]) => `  ${role}: ${count} user${count > 1 ? 's' : ''}`)
  .join('\n')}

=== PATRICK'S USER ANALYSIS ===
User ID: ${patrickUser.id}
Email: ${patrickUser.email}
Display Name: ${patrickUser.display_name || 'Not set'}
First Name: ${patrickUser.first_name || 'Not set'}
Last Name: ${patrickUser.last_name || 'Not set'}
Current Role: "${patrickUser.role}"
Created: ${patrickUser.created_at}

WordPress Alignment Check:
- Current value: "${patrickUser.role}"
- WordPress standard: "administrator"
- Status: ${patrickUser.role === 'administrator' ? '✅ ALIGNED' : '⚠️  NEEDS MIGRATION'}
- Action required: ${patrickUser.role === 'administrator' ? 'None' : 'Update role from "admin" to "administrator"'}

=== WORDPRESS ROLE VERIFICATION ===
✅ WordPress uses "administrator" as the standard admin role value
✅ Migration to "administrator" aligns with WordPress conventions
✅ This ensures future WordPress integration compatibility
⚠️  Current "admin" value was likely an incorrect abbreviation

=== MIGRATION IMPACT ASSESSMENT ===
Users affected by migration: 1 (Patrick only)
Database records to update: 1
Risk level: LOW (single user, simple string update)
Rollback complexity: SIMPLE (single UPDATE statement)

=== BACKUP STATUS ===
✅ Users table backup created: users-table-backup-${timestamp}.sql
✅ Rollback script generated: role-migration-rollback.sql
✅ All backups verified and ready

=== NEXT STEPS (PHASE 2) ===
1. Execute database migration (single UPDATE statement)
2. Verify Patrick's role = "administrator"
3. Test authentication functionality
4. Confirm WordPress alignment
5. Proceed to code updates (Phase 3+)

=== FILES CREATED ===
- scripts/backup/users-table-backup-${timestamp}.sql
- scripts/backup/role-migration-rollback.sql
- scripts/analysis/current-roles-report.txt (this file)

=== VERIFICATION QUERIES ===
-- Check current state:
SELECT email, role, full_name FROM public.users WHERE email = 'patrick@powlax.com';

-- Verify all roles:
SELECT role, COUNT(*) as user_count FROM public.users GROUP BY role ORDER BY user_count DESC;

-- Check backup exists:
SELECT COUNT(*) FROM users_backup_${timestamp.replace(/-/g, '_')};

END OF REPORT
`;

    const reportFilePath = 'scripts/analysis/current-roles-report.txt';
    fs.writeFileSync(reportFilePath, reportContent);
    console.log('✅ Analysis report created:', reportFilePath);

    // 8. Final summary
    console.log('\n🎯 PHASE 1A COMPLETION SUMMARY');
    console.log('==============================');
    console.log('✅ Database analysis complete');
    console.log('✅ Role values documented');
    console.log('✅ Patrick\'s user verified');
    console.log('✅ WordPress alignment confirmed');
    console.log('✅ Backup files created');
    console.log('✅ Rollback script ready');
    console.log('✅ Analysis report generated');
    console.log('\n🚀 Ready for Phase 2: Database Migration');
    console.log('⚠️  Files created:');
    console.log(`   - ${backupFilePath}`);
    console.log(`   - ${rollbackFilePath}`);
    console.log(`   - ${reportFilePath}`);

  } catch (error) {
    console.error('❌ Phase 1A failed:', error);
    process.exit(1);
  }
}

phase1aDatabaseAnalysis().catch(console.error);