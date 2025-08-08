import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface TableInfo {
  name: string;
  count: number;
  hasData: boolean;
  columns?: any[];
  relationships?: string[];
}

async function analyzeAllTables() {
  console.log('🔍 Analyzing all POWLAX Supabase tables...\n');
  
  // Get all tables
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_names');
  
  if (tablesError) {
    // Fallback to direct query
    const knownTables = [
      // Practice Planning System
      'drills',
      'strategies', 
      'concepts',
      'skills',
      'practice_plans',
      'practice_plan_segments',
      'practice_plan_drills',
      
      // Skills Academy
      'academy_drills',
      'workouts',
      'workout_drills',
      'powlax_wall_ball_drill_library',
      'powlax_wall_ball_collections',
      'powlax_wall_ball_collection_drills',
      'powlax_skills_academy_workouts',
      'powlax_skills_academy_drills',
      'powlax_skills_academy_questions',
      'powlax_skills_academy_answers',
      
      // User Management
      'user_profiles',
      'teams',
      'team_members',
      'team_invitations',
      
      // Gamification
      'points_ledger',
      'badges',
      'user_badges',
      'achievements',
      
      // Assessments
      'quizzes',
      'quiz_questions',
      'quiz_responses',
      
      // Relationships/Junction Tables
      'drill_strategies',
      'strategy_concepts',
      'concept_skills',
      
      // Legacy/Migration
      'drills_powlax',
      'strategies_powlax',
      'skills_academy_powlax',
      
      // WordPress Migration
      'wordpress_groups',
      'wordpress_group_members',
      
      // Authentication & Registration
      'registration_links',
      'webhook_events'
    ];
    
    await analyzeKnownTables(knownTables);
  }
}

async function analyzeKnownTables(tableNames: string[]) {
  const tableAnalysis: Record<string, TableInfo> = {};
  
  // Categorize tables
  const categories = {
    'Practice Planning': [
      'drills',
      'strategies', 
      'concepts',
      'skills',
      'practice_plans',
      'practice_plan_segments',
      'practice_plan_drills'
    ],
    'Skills Academy': [
      'academy_drills',
      'workouts',
      'workout_drills',
      'powlax_wall_ball_drill_library',
      'powlax_wall_ball_collections',
      'powlax_wall_ball_collection_drills',
      'powlax_skills_academy_workouts',
      'powlax_skills_academy_drills',
      'powlax_skills_academy_questions',
      'powlax_skills_academy_answers'
    ],
    'User Management': [
      'user_profiles',
      'teams',
      'team_members',
      'team_invitations'
    ],
    'Gamification': [
      'points_ledger',
      'badges',
      'user_badges',
      'achievements'
    ],
    'Assessments': [
      'quizzes',
      'quiz_questions',
      'quiz_responses'
    ],
    'Taxonomy Relationships': [
      'drill_strategies',
      'strategy_concepts',
      'concept_skills'
    ],
    'Legacy/Migration': [
      'drills_powlax',
      'strategies_powlax',
      'skills_academy_powlax',
      'wordpress_groups',
      'wordpress_group_members'
    ],
    'Authentication': [
      'registration_links',
      'webhook_events'
    ]
  };
  
  // Analyze each category
  for (const [category, tables] of Object.entries(categories)) {
    console.log(`\n📂 ${category}`);
    console.log('=' .repeat(50));
    
    for (const tableName of tables) {
      try {
        // Get count
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`  ❌ ${tableName}: Table not accessible or doesn't exist`);
          continue;
        }
        
        // Get sample data if exists
        let sampleData = null;
        let columns: string[] = [];
        if (count && count > 0) {
          const { data } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (data && data.length > 0) {
            sampleData = data[0];
            columns = Object.keys(sampleData);
          }
        }
        
        const status = count === 0 ? '⭕ Empty' : `✅ ${count} records`;
        console.log(`  ${status} - ${tableName}`);
        
        if (columns.length > 0) {
          console.log(`    Columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);
        }
        
        tableAnalysis[tableName] = {
          name: tableName,
          count: count || 0,
          hasData: (count || 0) > 0,
          columns
        };
      } catch (err) {
        console.log(`  ⚠️ ${tableName}: Error accessing table`);
      }
    }
  }
  
  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('=' .repeat(50));
  
  const tablesWithData = Object.values(tableAnalysis).filter(t => t.hasData);
  const emptyTables = Object.values(tableAnalysis).filter(t => !t.hasData);
  
  console.log(`\n✅ Tables with data (${tablesWithData.length}):`);
  tablesWithData.forEach(t => {
    console.log(`  - ${t.name}: ${t.count} records`);
  });
  
  console.log(`\n⭕ Empty tables (${emptyTables.length}):`);
  emptyTables.forEach(t => {
    console.log(`  - ${t.name}`);
  });
  
  // Usage mapping
  console.log('\n\n📋 TABLE USAGE MAPPING');
  console.log('=' .repeat(50));
  
  console.log('\n🎯 ACTIVELY USED:');
  console.log('  Wall Ball System (Working):');
  console.log('    - powlax_wall_ball_drill_library: Individual wall ball drills');
  console.log('    - powlax_wall_ball_collections: Workout collections');
  console.log('    - powlax_wall_ball_collection_drills: Links drills to collections');
  
  console.log('\n🚧 PREPARED BUT NOT YET POPULATED:');
  console.log('  Practice Planning (Main System):');
  console.log('    - drills: Main drill library for practice planning');
  console.log('    - strategies: Team strategies and plays');
  console.log('    - concepts: Lacrosse concepts');
  console.log('    - skills: Individual player skills');
  console.log('    - practice_plans: Saved practice plans');
  console.log('    - practice_plan_segments: Time segments in plans');
  console.log('    - practice_plan_drills: Drills assigned to segments');
  
  console.log('\n  Skills Academy (Future):');
  console.log('    - academy_drills: Skills academy specific drills');
  console.log('    - workouts: Structured workout plans');
  console.log('    - workout_drills: Drills within workouts');
  console.log('    - powlax_skills_academy_*: New academy structure');
  
  console.log('\n  User System (Ready):');
  console.log('    - user_profiles: User profile data');
  console.log('    - teams: Team information');
  console.log('    - team_members: Team membership');
  
  console.log('\n  Gamification (Ready):');
  console.log('    - points_ledger: Point transactions');
  console.log('    - badges: Available badges');
  console.log('    - user_badges: Earned badges');
  
  console.log('\n🔄 MIGRATION/LEGACY:');
  console.log('    - *_powlax tables: Legacy data from WordPress');
  console.log('    - wordpress_* tables: WordPress user/group data');
  
  console.log('\n\n✨ RECOMMENDATIONS:');
  console.log('1. Focus on populating practice planning tables (drills, strategies, etc.)');
  console.log('2. Continue using wall ball tables as the working example');
  console.log('3. Migrate data from _powlax legacy tables to main tables');
  console.log('4. Implement user profiles and team management next');
}

analyzeAllTables().catch(console.error);