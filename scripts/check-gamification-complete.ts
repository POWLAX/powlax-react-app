import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGamificationTables() {
  console.log('🎮 GAMIFICATION SYSTEM VERIFICATION\n');
  console.log('=' . repeat(50));

  // Define required tables with expected record counts
  const requiredTables = [
    { name: 'badges_powlax', expectedRecords: 54 },
    { name: 'powlax_player_ranks', expectedRecords: 10 },
    { name: 'user_points_wallets', minRecords: 0 },
    { name: 'powlax_points_currencies', expectedRecords: 7 },
    { name: 'points_transactions_powlax', minRecords: 0 },
    { name: 'point_types_powlax', expectedRecords: 9 },
    { name: 'leaderboard', minRecords: 0 },
    { name: 'user_badges', minRecords: 0 },
    { name: 'skills_academy_series', expectedRecords: 49 },
    { name: 'skills_academy_workouts', expectedRecords: 166 },
    { name: 'skills_academy_drills', expectedRecords: 167 },
    { name: 'skills_academy_user_progress', minRecords: 0 }
  ];

  let allTablesExist = true;
  const tableStatuses = [];

  for (const table of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        console.log(`❌ ${table.name}: NOT FOUND`);
        allTablesExist = false;
        tableStatuses.push({ name: table.name, exists: false });
      } else {
        const recordCount = count || 0;
        const expectedCount = table.expectedRecords || table.minRecords || 0;
        const status = table.expectedRecords 
          ? recordCount === expectedCount ? '✅' : '⚠️'
          : recordCount >= expectedCount ? '✅' : '⚠️';
        
        console.log(`${status} ${table.name}: ${recordCount} records${
          table.expectedRecords ? ` (expected ${expectedCount})` : ''
        }`);
        
        tableStatuses.push({ 
          name: table.name, 
          exists: true, 
          count: recordCount,
          expected: expectedCount 
        });
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ERROR - ${err.message}`);
      allTablesExist = false;
      tableStatuses.push({ name: table.name, exists: false, error: err.message });
    }
  }

  console.log('\n' + '=' . repeat(50));
  console.log('\n📊 NEW TABLES NEEDED FOR GAMIFICATION:\n');

  // Tables we need to create
  const newTablesNeeded = [
    'user_badge_progress',
    'user_rank_progress', 
    'badge_series_mapping'
  ];

  for (const tableName of newTablesNeeded) {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log(`🔨 NEEDS CREATION: ${tableName}`);
    } else if (!error) {
      console.log(`✅ ALREADY EXISTS: ${tableName}`);
    }
  }

  console.log('\n' + '=' . repeat(50));
  console.log('\n🔍 CHECKING BADGE-SERIES DATA:\n');

  // Check if we have badge data
  const { data: badges } = await supabase
    .from('badges_powlax')
    .select('id, title, category')
    .order('category', { ascending: true });

  if (badges && badges.length > 0) {
    const categories = {};
    badges.forEach(badge => {
      if (!categories[badge.category]) {
        categories[badge.category] = 0;
      }
      categories[badge.category]++;
    });

    console.log('Badge Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} badges`);
    });
  }

  // Check series data
  const { data: series } = await supabase
    .from('skills_academy_series')
    .select('id, series_name, series_type')
    .order('series_type', { ascending: true });

  if (series && series.length > 0) {
    const seriesTypes = {};
    series.forEach(s => {
      if (!seriesTypes[s.series_type]) {
        seriesTypes[s.series_type] = 0;
      }
      seriesTypes[s.series_type]++;
    });

    console.log('\nSeries Types:');
    Object.entries(seriesTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} series`);
    });
  }

  console.log('\n' + '=' . repeat(50));
  
  if (allTablesExist) {
    console.log('\n✅ All core gamification tables exist!');
  } else {
    console.log('\n⚠️ Some tables are missing or have issues.');
  }

  return tableStatuses;
}

// Run the check
checkGamificationTables()
  .then(() => {
    console.log('\n✅ Gamification verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });