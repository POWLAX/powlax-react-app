import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function checkBadgesTable() {
  console.log('🏆 Checking Badges Table...');
  console.log('============================');
  
  // Check badges table
  const { data: badges, error, count } = await supabase
    .from('badges')
    .select('*', { count: 'exact' });
    
  if (error) {
    console.log('❌ badges table error:', error.message);
    return;
  }
  
  console.log(`✅ badges table: ${count} records`);
  
  if (badges && badges.length > 0) {
    console.log('📋 Sample badge:');
    console.log(JSON.stringify(badges[0], null, 2));
    
    console.log(`\n📊 All badges:`);
    badges.forEach((badge, index) => {
      console.log(`${index + 1}. ${badge.name} (${badge.category}) - ID: ${badge.id}`);
    });
  }
  
  // Also check if badges_powlax exists
  console.log('\n🔍 Checking badges_powlax table...');
  const { data: badgesPowlax, error: powlaxError, count: powlaxCount } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact' });
    
  if (powlaxError) {
    console.log('❌ badges_powlax table error:', powlaxError.message);
  } else {
    console.log(`✅ badges_powlax table: ${powlaxCount} records`);
    
    if (badgesPowlax && badgesPowlax.length > 0) {
      console.log('📋 Sample badges_powlax:');
      console.log(JSON.stringify(badgesPowlax[0], null, 2));
    }
  }
}

checkBadgesTable().catch(console.error);