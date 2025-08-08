import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAllTables() {
  console.log('🔍 Checking all POWLAX tables (most recent activity)...\n')
  
  // Comprehensive list of all potential tables
  const allTables = [
    // Wall Ball V2 Tables
    'powlax_wall_ball_collections',
    'powlax_wall_ball_drill_library', 
    'powlax_wall_ball_collection_drills',
    
    // Skills Academy Tables
    'powlax_skills_academy_workouts',
    'powlax_skills_academy_drills',
    'powlax_skills_academy_questions',
    'powlax_skills_academy_answers',
    
    // Original POWLAX Tables
    'strategies_powlax',
    'drills_powlax',
    'skills_academy_powlax',
    'wall_ball_powlax',
    'lessons_powlax',
    'drill_strategy_map_powlax',
    
    // User & Team Tables
    'user_favorites',
    'user_workout_completions',
    'user_sessions',
    'organizations',
    'teams',
    'user_teams',
    
    // Staging Tables
    'staging_wp_drills',
    'staging_wp_strategies', 
    'staging_wp_academy_drills',
    'staging_wp_wall_ball',
    'staging_wp_lessons',
    
    // Other potential tables
    'powlax_badges',
    'powlax_user_badges',
    'powlax_gamification',
    'powlax_practice_plans'
  ]
  
  const results: Array<{
    table: string
    count: number | string
    status: string
    sample?: any
  }> = []
  
  for (const tableName of allTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        
      if (error) {
        results.push({
          table: tableName,
          count: 'N/A',
          status: '❌ ' + (error.message.includes('does not exist') ? 'Does not exist' : 'Access error')
        })
      } else {
        // Get a sample record if table has data
        let sample = null
        if (count && count > 0) {
          const { data: sampleData } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          sample = sampleData?.[0]
        }
        
        results.push({
          table: tableName,
          count: count || 0,
          status: count > 0 ? '✅ Has Data' : '⭕ Empty',
          sample
        })
      }
    } catch (e) {
      results.push({
        table: tableName,
        count: 'N/A',
        status: '❌ Error'
      })
    }
  }
  
  // Sort by record count (tables with data first, then by count)
  results.sort((a, b) => {
    if (typeof a.count !== 'number') return 1
    if (typeof b.count !== 'number') return -1
    return b.count - a.count
  })
  
  console.log('📊 Top 10 Most Active POWLAX Tables:')
  console.log('====================================\n')
  
  results.slice(0, 10).forEach((table, index) => {
    console.log(`${index + 1}. ${table.table}`)
    console.log(`   Records: ${table.count}`)
    console.log(`   Status: ${table.status}`)
    
    if (table.sample) {
      const keys = Object.keys(table.sample).slice(0, 3)
      const preview = keys.map(key => `${key}: ${table.sample[key]}`).join(', ')
      console.log(`   Sample: ${preview}...`)
    }
    console.log('')
  })
  
  console.log('📈 Summary:')
  const withData = results.filter(r => typeof r.count === 'number' && r.count > 0)
  const empty = results.filter(r => typeof r.count === 'number' && r.count === 0)
  const missing = results.filter(r => typeof r.count !== 'number')
  
  console.log(`- Tables with data: ${withData.length}`)
  console.log(`- Empty tables: ${empty.length}`)
  console.log(`- Missing/No access: ${missing.length}`)
  
  if (withData.length > 0) {
    console.log('\n🎯 Tables with data:')
    withData.forEach(table => {
      console.log(`  - ${table.table}: ${table.count} records`)
    })
  }
}

checkAllTables().catch(console.error)
