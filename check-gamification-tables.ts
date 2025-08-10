import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function checkGamificationTables() {
  console.log('🎮 Checking Gamification Tables Status...');
  console.log('==========================================');
  
  const gamificationTables = [
    'powlax_points_currencies',
    'badges', 
    'user_points_wallets',
    'user_badges',
    'user_ranks',
    'points_ledger',
    'gamipress_sync_log'
  ];
  
  for (const table of gamificationTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Table does not exist or no access`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (err: any) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
  
  // Check user_profiles for wordpress_id field
  console.log('\n👥 Checking WordPress User Migration Status...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, wordpress_id, email')
      .not('wordpress_id', 'is', null);
      
    if (error) {
      console.log(`❌ user_profiles: ${error.message}`);
    } else {
      console.log(`✅ Users with wordpress_id: ${data?.length || 0}`);
      if (data && data.length > 0) {
        console.log('   Sample:', data.slice(0, 3).map(u => ({ id: u.id.slice(0,8), wordpress_id: u.wordpress_id })));
      }
    }
  } catch (err: any) {
    console.log(`❌ user_profiles check failed: ${err.message}`);
  }
}

checkGamificationTables().catch(console.error);