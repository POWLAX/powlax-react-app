import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkTables() {
  console.log('Checking for gamification tables...\n');
  
  // Try to query specific tables that animations-demo might be using
  const tables = [
    'badges_powlax',
    'powlax_player_ranks', 
    'powlax_points_currencies',
    'user_badges',
    'user_points_wallets',
    'badges',
    'points_ledger',
    'powlax_badges_catalog',
    'powlax_ranks_catalog',
    'user_ranks'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        console.log(`✅ ${table}: EXISTS (${count} records)`);
      } else {
        console.log(`❌ ${table}: ${error.message}`);
      }
    } catch (e) {
      console.log(`❌ ${table}: Error checking table`);
    }
  }
}

checkTables().catch(console.error);