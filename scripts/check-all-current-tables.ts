import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function getAllTables() {
  // Try a comprehensive list of possible tables
  const possibleTables = [
    // Skills Academy
    'skills_academy_series',
    'skills_academy_workouts', 
    'skills_academy_drills',
    'skills_academy_workout_drills',
    'skills_academy_user_progress',
    
    // Practice Planning
    'drills',
    'strategies', 
    'concepts',
    'skills',
    'drill_strategies',
    'strategy_concepts',
    'concept_skills',
    'practice_plans',
    'practice_plan_drills',
    'practice_templates',
    
    // Wall Ball
    'powlax_wall_ball_collections',
    'powlax_wall_ball_drill_library',
    'powlax_wall_ball_collection_drills',
    
    // User/Team
    'user_profiles',
    'teams',
    'team_members',
    'organizations',
    'team_playbooks',
    'playbook_plays',
    
    // Gamification
    'points_ledger',
    'point_types',
    'badges',
    'user_badges',
    'player_ranks',
    'achievements',
    'user_points_wallets',
    
    // Auth/Registration
    'registration_links',
    'magic_links',
    'family_accounts',
    
    // Assessment
    'quizzes',
    'quiz_questions', 
    'quiz_responses',
    
    // Legacy/Migration
    'drills_powlax',
    'strategies_powlax',
    'concepts_powlax',
    'skills_powlax',
    'wordpress_groups',
    'wordpress_group_members'
  ]
  
  const results = []
  
  for (const table of possibleTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (!error) {
      results.push({ table, exists: true, count: count || 0 })
    } else {
      results.push({ table, exists: false })
    }
  }
  
  // Print results organized by category
  console.log('\n=== SKILLS ACADEMY TABLES ===')
  results.filter(r => r.table.includes('skills_academy')).forEach(r => {
    if (r.exists) {
      console.log(`✅ ${r.table}: ${r.count} records`)
    } else {
      console.log(`❌ ${r.table}: Does not exist`)
    }
  })
  
  console.log('\n=== PRACTICE PLANNING TABLES ===')
  const practiceTables = ['drills', 'strategies', 'concepts', 'skills', 'practice_plans', 'practice_plan_drills', 'drill_strategies', 'strategy_concepts', 'concept_skills']
  results.filter(r => practiceTables.includes(r.table)).forEach(r => {
    if (r.exists) {
      console.log(`✅ ${r.table}: ${r.count} records`)
    } else {
      console.log(`❌ ${r.table}: Does not exist`)
    }
  })
  
  console.log('\n=== WALL BALL TABLES ===')
  results.filter(r => r.table.includes('wall_ball')).forEach(r => {
    if (r.exists) {
      console.log(`✅ ${r.table}: ${r.count} records`)
    } else {
      console.log(`❌ ${r.table}: Does not exist`)
    }
  })
  
  console.log('\n=== USER/TEAM TABLES ===')
  const userTables = ['user_profiles', 'teams', 'team_members', 'organizations']
  results.filter(r => userTables.includes(r.table)).forEach(r => {
    if (r.exists) {
      console.log(`✅ ${r.table}: ${r.count} records`)
    } else {
      console.log(`❌ ${r.table}: Does not exist`)
    }
  })
  
  console.log('\n=== GAMIFICATION TABLES ===')
  const gameTables = ['points_ledger', 'point_types', 'badges', 'user_badges', 'player_ranks', 'achievements', 'user_points_wallets']
  results.filter(r => gameTables.includes(r.table)).forEach(r => {
    if (r.exists) {
      console.log(`✅ ${r.table}: ${r.count} records`)
    } else {
      console.log(`❌ ${r.table}: Does not exist`)
    }
  })
  
  // Summary
  const existing = results.filter(r => r.exists)
  const withData = existing.filter(r => r.count > 0)
  
  console.log('\n=== SUMMARY ===')
  console.log(`Total tables checked: ${results.length}`)
  console.log(`Tables that exist: ${existing.length}`)
  console.log(`Tables with data: ${withData.length}`)
  
  console.log('\n=== TABLES WITH DATA ===')
  withData.sort((a, b) => b.count - a.count).forEach(r => {
    console.log(`  ${r.table}: ${r.count} records`)
  })
}

getAllTables()