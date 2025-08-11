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

async function checkUsers() {
  console.log('🔍 Checking actual users in database...\n');

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  console.log('📊 ALL USERS IN DATABASE:');
  console.log('=' .repeat(80));
  
  users?.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.display_name || 'NO DISPLAY NAME'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Account Type: ${user.account_type || 'NOT SET'}`);
    console.log(`   First Name: ${user.first_name || 'NOT SET'}`);
    console.log(`   Last Name: ${user.last_name || 'NOT SET'}`);
    console.log(`   WordPress ID: ${user.wordpress_id || 'NONE'}`);
    console.log(`   Auth User ID: ${user.auth_user_id || 'NONE'}`);
    
    // Identify likely real accounts
    if (user.display_name?.toLowerCase().includes('player 1') ||
        user.display_name?.toLowerCase().includes('player1') ||
        user.email?.includes('player1')) {
      console.log('   ⭐ LIKELY PLAYER 1 ACCOUNT');
    }
    if (user.display_name?.toLowerCase().includes('patrick') ||
        user.email?.includes('patrick')) {
      console.log('   ⭐ LIKELY PATRICK ACCOUNT');
    }
    if (user.display_name?.toLowerCase().includes('coach') &&
        !user.display_name?.toLowerCase().includes('test')) {
      console.log('   ⭐ LIKELY COACH ACCOUNT');
    }
  });

  console.log('\n' + '=' .repeat(80));
  console.log('📋 SUMMARY:');
  console.log(`Total Users: ${users?.length}`);
  
  // Check family relationships
  console.log('\n🏠 CHECKING FAMILY RELATIONSHIPS:');
  const { data: families, error: familyError } = await supabase
    .from('family_accounts')
    .select('*');
  
  if (familyError) {
    console.log('❌ Error checking families:', familyError.message);
  } else {
    console.log(`Family Accounts: ${families?.length || 0}`);
  }

  const { data: relationships, error: relError } = await supabase
    .from('parent_child_relationships')
    .select('*');
  
  if (relError) {
    console.log('❌ Error checking relationships:', relError.message);
  } else {
    console.log(`Parent-Child Relationships: ${relationships?.length || 0}`);
  }

  // Identify accounts that need to be real
  console.log('\n🎯 ACCOUNTS TO MARK AS REAL:');
  const player1 = users?.find(u => 
    u.display_name?.toLowerCase().includes('player 1') ||
    u.display_name?.toLowerCase().includes('player1')
  );
  const patrick = users?.find(u => 
    u.display_name?.toLowerCase().includes('patrick') ||
    u.email?.includes('patrick')
  );
  const coach = users?.find(u => 
    u.display_name?.toLowerCase().includes('coach') &&
    !u.display_name?.toLowerCase().includes('test')
  );

  if (player1) console.log(`Player 1: ${player1.email} (ID: ${player1.id})`);
  if (patrick) console.log(`Patrick: ${patrick.email} (ID: ${patrick.id})`);
  if (coach) console.log(`Coach: ${coach.email} (ID: ${coach.id})`);

  console.log('\n✅ Analysis complete!');
}

checkUsers().catch(console.error);