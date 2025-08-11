import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkAllGamificationTables() {
  console.log('=== GAMIFICATION TABLES ANALYSIS ===\n');
  
  // Check all tables that might be related to gamification
  const tablesToCheck = [
    // Tables that definitely exist (from earlier check)
    'badges_powlax',
    'powlax_player_ranks',
    'powlax_points_currencies',
    'user_badges',
    'user_points_wallets',
    'badges',
    'points_ledger',
    'powlax_badges_catalog',
    'powlax_ranks_catalog',
    'user_ranks',
    // Additional tables to check
    'user_points_ledger',
    'powlax_gamipress_mappings',
    'user_points_balance_powlax',
    'badges_test',
    'badge_requirements',
    'point_types_powlax',
    'achievements_powlax',
    'ranks_powlax'
  ];
  
  console.log('Checking tables existence and data:\n');
  
  for (const table of tablesToCheck) {
    try {
      const { count, data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (!error) {
        console.log(`✅ ${table.padEnd(30)} - EXISTS (${count || 0} records)`);
        
        // For key tables, show sample data structure
        if (data && data.length > 0 && ['badges_powlax', 'powlax_player_ranks', 'powlax_points_currencies'].includes(table)) {
          console.log(`   Sample fields: ${Object.keys(data[0]).slice(0, 5).join(', ')}...`);
        }
      } else {
        console.log(`❌ ${table.padEnd(30)} - NOT FOUND`);
      }
    } catch (e) {
      console.log(`❌ ${table.padEnd(30)} - ERROR`);
    }
  }
  
  console.log('\n=== DETAILED ANALYSIS OF KEY TABLES ===\n');
  
  // Check badges_powlax structure
  try {
    const { data: badges } = await supabase
      .from('badges_powlax')
      .select('*')
      .limit(3);
    
    if (badges && badges.length > 0) {
      console.log('📛 badges_powlax sample:');
      badges.forEach(badge => {
        console.log(`  - ${badge.title || badge.name} (${badge.badge_type || badge.category})`);
        if (badge.icon_url) console.log(`    Icon: ${badge.icon_url.substring(0, 50)}...`);
      });
    }
  } catch (e) {
    console.log('Could not fetch badges_powlax details');
  }
  
  // Check powlax_player_ranks structure
  try {
    const { data: ranks } = await supabase
      .from('powlax_player_ranks')
      .select('*')
      .order('rank_order')
      .limit(3);
    
    if (ranks && ranks.length > 0) {
      console.log('\n🏆 powlax_player_ranks sample:');
      ranks.forEach(rank => {
        console.log(`  - ${rank.title} (Order: ${rank.rank_order}, Credits: ${rank.lax_credits_required})`);
        if (rank.icon_url) console.log(`    Icon: ${rank.icon_url.substring(0, 50)}...`);
      });
    }
  } catch (e) {
    console.log('Could not fetch powlax_player_ranks details');
  }
  
  // Check powlax_points_currencies structure
  try {
    const { data: currencies } = await supabase
      .from('powlax_points_currencies')
      .select('*')
      .limit(5);
    
    if (currencies && currencies.length > 0) {
      console.log('\n💰 powlax_points_currencies:');
      currencies.forEach(curr => {
        console.log(`  - ${curr.display_name || curr.currency} (${curr.currency || curr.key})`);
      });
    }
  } catch (e) {
    console.log('Could not fetch powlax_points_currencies details');
  }
}

checkAllGamificationTables().catch(console.error);