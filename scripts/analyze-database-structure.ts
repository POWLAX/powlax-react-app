import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const result = dotenv.config({ path: resolve(process.cwd(), '.env.local') })

if (result.error) {
  console.error('Error loading .env.local:', result.error)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeDatabaseStructure() {
  console.log('🔍 Analyzing complete database structure...\n')

  try {
    // Get all tables from the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (tablesError) {
      // Try alternative approach using raw SQL
      const { data, error } = await supabase.rpc('get_all_tables', {})
      if (error) {
        console.log('Using alternative method to get tables...')
        
        // Get tables by trying to query known tables and discovering others
        const knownTables = [
          'skills_academy_drills',
          'skills_academy_series', 
          'skills_academy_workouts',
          'skills_academy_user_progress',
          'wall_ball_drill_library',
          'powlax_drills',
          'powlax_strategies',
          'practices',
          'practice_drills',
          'powlax_images',
          'user_drills',
          'user_strategies',
          'clubs',
          'teams',
          'team_members',
          'users',
          'user_sessions',
          'user_auth_status',
          'magic_links',
          'registration_links',
          'registration_sessions',
          'family_accounts',
          'family_members',
          'parent_child_relationships',
          'powlax_points_currencies',
          'points_transactions_powlax',
          'powlax_player_ranks',
          'user_badges',
          'user_badge_progress_powlax',
          'user_rank_progress_powlax',
          'user_points_wallets',
          'point_types_powlax',
          'leaderboard',
          'membership_entitlements',
          'membership_products',
          'user_subscriptions',
          'age_bands',
          'drill_point_summary',
          'drill_lab_urls',
          'user_favorites',
          'user_onboarding',
          'user_events',
          'user_activity_log',
          'webhook_events',
          'webhook_queue',
          'webhook_queue_stats',
          'webhook_recent_failures',
          'wp_sync_log',
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
          'skills_academy_workouts_backup'
        ]

        console.log('📊 Checking existence and structure of tables:\n')
        
        const tableInfo: any[] = []
        
        for (const tableName of knownTables) {
          try {
            // Try to get count and a sample record
            const { count, data, error } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: false })
              .limit(1)
            
            if (!error) {
              const columns = data && data.length > 0 ? Object.keys(data[0]) : []
              tableInfo.push({
                table: tableName,
                exists: true,
                recordCount: count || 0,
                columns: columns,
                sampleData: data && data.length > 0 ? data[0] : null
              })
              console.log(`✅ ${tableName}: ${count || 0} records, ${columns.length} columns`)
            } else {
              tableInfo.push({
                table: tableName,
                exists: false,
                error: error.message
              })
              console.log(`❌ ${tableName}: Does not exist or no access`)
            }
          } catch (err: any) {
            tableInfo.push({
              table: tableName,
              exists: false,
              error: err.message
            })
            console.log(`❌ ${tableName}: Error - ${err.message}`)
          }
        }

        // Group tables by status
        console.log('\n📋 SUMMARY:\n')
        
        const existingTables = tableInfo.filter(t => t.exists)
        const nonExistentTables = tableInfo.filter(t => !t.exists)
        
        console.log(`\n✅ EXISTING TABLES (${existingTables.length}):\n`)
        existingTables.forEach(t => {
          console.log(`  ${t.table}: ${t.recordCount} records`)
          if (t.columns.length > 0) {
            console.log(`    Columns: ${t.columns.join(', ')}`)
          }
        })
        
        console.log(`\n❌ NON-EXISTENT TABLES (${nonExistentTables.length}):\n`)
        nonExistentTables.forEach(t => {
          console.log(`  ${t.table}`)
        })

        // Save detailed results to file
        const fs = require('fs')
        const detailedResults = {
          timestamp: new Date().toISOString(),
          existingTables: existingTables.map(t => ({
            name: t.table,
            recordCount: t.recordCount,
            columns: t.columns
          })),
          nonExistentTables: nonExistentTables.map(t => t.table)
        }
        
        fs.writeFileSync(
          'database-analysis-results.json',
          JSON.stringify(detailedResults, null, 2)
        )
        console.log('\n📄 Detailed results saved to database-analysis-results.json')
        
        return
      }
    }

  } catch (error) {
    console.error('❌ Error analyzing database:', error)
  }
}

analyzeDatabaseStructure()