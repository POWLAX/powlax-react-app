import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TableInfo {
  name: string
  exists: boolean
  recordCount?: number
  columns?: string[]
  error?: string
}

async function checkTable(tableName: string): Promise<TableInfo> {
  try {
    const { count, data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (error) {
      return { name: tableName, exists: false, error: error.message }
    }
    
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    return { name: tableName, exists: true, recordCount: count || 0, columns }
  } catch (err: any) {
    return { name: tableName, exists: false, error: err.message }
  }
}

async function checkAllTables() {
  console.log('🔍 Checking ALL database tables...\n')

  // Comprehensive list of all possible tables
  const tablesToCheck = [
    // Skills Academy
    'skills_academy_drills',
    'skills_academy_series',
    'skills_academy_workouts',
    'skills_academy_user_progress',
    'wall_ball_drill_library',
    
    // Practice Planning
    'powlax_drills',
    'powlax_strategies',
    'practices',
    'practice_drills',
    'powlax_images',
    'user_drills',
    'user_strategies',
    
    // Team Management
    'clubs',
    'teams',
    'team_members',
    
    // User & Auth
    'users',
    'user_sessions',
    'user_auth_status',
    'magic_links',
    'registration_links',
    'registration_sessions',
    
    // Family Management
    'family_accounts',
    'family_members',
    'parent_child_relationships',
    
    // Gamification
    'powlax_points_currencies',
    'points_transactions_powlax',
    'powlax_player_ranks',
    'user_badges',
    'user_badge_progress_powlax',
    'user_rank_progress_powlax',
    'user_points_wallets',
    'point_types_powlax',
    'leaderboard',
    
    // Membership
    'membership_entitlements',
    'membership_products',
    'user_subscriptions',
    
    // Misc
    'age_bands',
    'drill_point_summary',
    'drill_lab_urls',
    'user_favorites',
    'user_onboarding',
    'user_events',
    'user_activity_log',
    
    // Webhooks
    'webhook_events',
    'webhook_queue',
    'webhook_queue_stats',
    'webhook_recent_failures',
    'wp_sync_log',
    
    // Deprecated/Legacy
    'drill_game_states',
    'drill_lacrosse_lab',
    'game_states',
    'position_drills',
    'powlax_academy_workout_collections',
    'powlax_academy_workout_item_answers',
    'powlax_academy_workout_items',
    'powlax_workout_drill_sequences',
    'workout_drill_mapping',
    'workout_drill_relationships',
    'practice_summary',
    'practice_templates',
    'skills_academy_workouts_backup',
    
    // Tables that might not exist (from the contract)
    'drills',
    'strategies',
    'concepts',
    'skills',
    'drill_strategies',
    'strategy_concepts',
    'concept_skills',
    'practice_plans',
    'practice_plan_drills',
    'powlax_wall_ball_collections',
    'powlax_wall_ball_drill_library',
    'organizations',
    'badges',
    'points_ledger',
    'point_types',
    'player_ranks',
    'user_profiles',
    'skills_academy_workout_drills',
    'drills_powlax',
    'strategies_powlax',
    'team_playbooks',
    'playbook_plays',
    'achievements',
    'quizzes',
    'quiz_questions',
    'quiz_responses'
  ]

  const results: TableInfo[] = []
  
  for (const table of tablesToCheck) {
    const info = await checkTable(table)
    results.push(info)
    if (info.exists) {
      console.log(`✅ ${table}: ${info.recordCount} records`)
    } else {
      console.log(`❌ ${table}: Does not exist`)
    }
  }

  // Summary
  const existing = results.filter(r => r.exists)
  const nonExistent = results.filter(r => !r.exists)
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  console.log(`\n✅ EXISTING TABLES (${existing.length}):\n`)
  existing.forEach(t => {
    console.log(`  ${t.name}: ${t.recordCount} records`)
  })
  
  console.log(`\n❌ NON-EXISTENT TABLES (${nonExistent.length}):\n`)
  nonExistent.forEach(t => {
    console.log(`  ${t.name}`)
  })

  // Check for tables with columns
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 TABLES WITH COLUMNS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  for (const table of existing) {
    if (table.columns && table.columns.length > 0) {
      console.log(`\n${table.name}:`)
      console.log(`  Columns: ${table.columns.join(', ')}`)
    }
  }

  // Save results
  const fs = require('fs')
  const output = {
    timestamp: new Date().toISOString(),
    existingTables: existing.map(t => ({
      name: t.name,
      recordCount: t.recordCount,
      columns: t.columns
    })),
    nonExistentTables: nonExistent.map(t => t.name)
  }
  
  fs.writeFileSync('database-tables-audit.json', JSON.stringify(output, null, 2))
  console.log('\n📄 Results saved to database-tables-audit.json')
}

checkAllTables()