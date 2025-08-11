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

// Tables we're planning to remove
const TABLES_TO_REMOVE = [
  // Staging tables
  'staging_wp_drills',
  'staging_wp_strategies',
  'staging_wp_skills',
  'staging_wp_academy_drills',
  'staging_wp_wall_ball',
  'staging_drill_strategy_map',
  
  // Legacy duplicates
  'drills',
  'strategies_powlax',
  'organizations', // Note: different from clubs
  'user_organization_roles',
  'user_team_roles',
  
  // Unused Wall Ball tables
  'powlax_wall_ball_drills',
  'powlax_wall_ball_workouts',
  'powlax_wall_ball_workout_drills',
  'powlax_wall_ball_drill_library',
  'wall_ball_workout_series',
  'wall_ball_workout_variants',
  
  // Unused Skills Academy tables
  'powlax_skills_academy_workouts',
  'powlax_skills_academy_drills',
  'powlax_skills_academy_questions',
  'powlax_skills_academy_answers',
  'skills_academy_workout_drills',
  
  // Unused gamification
  'user_points_ledger',
  'user_ranks',
  'powlax_badges_catalog',
  'powlax_ranks_catalog',
  'powlax_gamipress_mappings',
  'badges_powlax',
  'powlax_player_ranks',
  'user_points_balance_powlax',
  
  // System tables
  'webhook_processing_log',
  'club_members',
  'migration_log'
];

async function checkTableDependencies() {
  console.log('🔍 Checking Table Dependencies for Safe Removal\n');
  console.log('=' .repeat(80));
  
  // First, check which tables actually exist
  console.log('\n📊 CHECKING WHICH TABLES EXIST:\n');
  const existingTables: string[] = [];
  
  for (const table of TABLES_TO_REMOVE) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(0);
    
    if (!error) {
      existingTables.push(table);
      console.log(`✅ ${table} - EXISTS`);
    } else if (error.message.includes('does not exist')) {
      console.log(`⏭️  ${table} - Already removed or doesn't exist`);
    } else {
      console.log(`⚠️  ${table} - Error: ${error.message}`);
    }
  }
  
  console.log(`\n📋 Found ${existingTables.length} tables that still exist`);
  
  // Check for foreign key dependencies
  console.log('\n' + '=' .repeat(80));
  console.log('\n🔗 CHECKING FOREIGN KEY DEPENDENCIES:\n');
  
  // This query would check foreign key constraints
  // Note: This is a placeholder - actual implementation would need direct DB access
  const foreignKeyCheck = `
    SELECT 
      tc.table_name as dependent_table,
      kcu.column_name as dependent_column,
      ccu.table_name AS referenced_table,
      ccu.column_name AS referenced_column
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND (ccu.table_name = ANY($1) OR tc.table_name = ANY($1))
    ORDER BY tc.table_name;
  `;
  
  console.log('⚠️  Foreign key check requires direct database access');
  console.log('Run this SQL in Supabase SQL Editor to check dependencies:');
  console.log('\n```sql');
  console.log(foreignKeyCheck.replace('$1', `ARRAY[${existingTables.map(t => `'${t}'`).join(', ')}]`));
  console.log('```\n');
  
  // Check for potential references in other tables
  console.log('=' .repeat(80));
  console.log('\n🔍 CHECKING FOR POTENTIAL REFERENCES:\n');
  
  // Tables that might reference our removal targets
  const tablestoCheck = [
    'users',
    'teams',
    'clubs',
    'team_members',
    'practices',
    'practice_templates',
    'team_playbooks',
    'skills_academy_workouts',
    'skills_academy_series',
    'skills_academy_drills',
    'skills_academy_user_progress',
    'powlax_wall_ball_collections',
    'powlax_wall_ball_collection_drills'
  ];
  
  for (const checkTable of tablestoCheck) {
    const { data, error } = await supabase
      .from(checkTable)
      .select('*')
      .limit(1);
    
    if (!error && data) {
      const columns = Object.keys(data[0] || {});
      const suspectColumns = columns.filter(col => 
        col.includes('drill_id') ||
        col.includes('strategy_id') ||
        col.includes('organization_id') ||
        col.includes('skill_id') ||
        col.includes('workout_id') ||
        col.includes('badge_id') ||
        col.includes('rank_id')
      );
      
      if (suspectColumns.length > 0) {
        console.log(`⚠️  ${checkTable} has columns that might reference removed tables:`);
        console.log(`    ${suspectColumns.join(', ')}`);
      }
    }
  }
  
  // Generate safe DROP commands
  console.log('\n' + '=' .repeat(80));
  console.log('\n✅ SAFE DROP COMMANDS (WITHOUT CASCADE):\n');
  console.log('-- Run these commands one by one and check for errors');
  console.log('-- If a DROP fails due to dependencies, investigate before using CASCADE\n');
  
  for (const table of existingTables) {
    console.log(`DROP TABLE IF EXISTS ${table};  -- No CASCADE - will fail if dependencies exist`);
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n⚠️  SAFER APPROACH WITH DEPENDENCY CHECKING:\n');
  console.log('```sql');
  console.log('-- First, check what depends on each table');
  console.log('DO $$');
  console.log('DECLARE');
  console.log('  v_table_name TEXT;');
  console.log('  v_dependency_count INTEGER;');
  console.log('BEGIN');
  
  for (const table of existingTables) {
    console.log(`  -- Check ${table}`);
    console.log(`  SELECT COUNT(*) INTO v_dependency_count`);
    console.log(`  FROM information_schema.table_constraints`);
    console.log(`  WHERE constraint_type = 'FOREIGN KEY'`);
    console.log(`    AND table_name != '${table}'`);
    console.log(`    AND constraint_name IN (`);
    console.log(`      SELECT constraint_name FROM information_schema.constraint_column_usage`);
    console.log(`      WHERE table_name = '${table}'`);
    console.log(`    );`);
    console.log(`  `);
    console.log(`  IF v_dependency_count > 0 THEN`);
    console.log(`    RAISE NOTICE '⚠️  ${table} has % dependent tables', v_dependency_count;`);
    console.log(`  ELSE`);
    console.log(`    RAISE NOTICE '✅ ${table} has no dependencies - safe to drop';`);
    console.log(`    -- DROP TABLE IF EXISTS ${table};`);
    console.log(`  END IF;`);
    console.log('');
  }
  
  console.log('END $$;');
  console.log('```');
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n📋 RECOMMENDATIONS:\n');
  console.log('1. Run the dependency check SQL in Supabase SQL Editor first');
  console.log('2. For tables with no dependencies, use DROP TABLE without CASCADE');
  console.log('3. For tables with dependencies, investigate what depends on them');
  console.log('4. Consider if the dependent tables are also being removed');
  console.log('5. Only use CASCADE if you\'re certain about the impact');
  console.log('6. Take a database backup before running any DROP commands');
  
  console.log('\n✅ Analysis complete!');
}

checkTableDependencies().catch(console.error);