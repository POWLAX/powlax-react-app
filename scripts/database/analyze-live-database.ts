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

async function analyzeLiveDatabase() {
  console.log('🔍 ANALYZING LIVE SUPABASE DATABASE\n')
  console.log('=' .repeat(60))
  
  try {
    // 1. Get all tables with their row counts
    console.log('\n📊 ALL TABLES WITH ROW COUNTS:')
    console.log('-'.repeat(40))
    
    const { data: tablesData } = await supabase.rpc('get_all_tables_with_counts')
    
    if (!tablesData) {
      // Fallback: Get table list manually
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')
      
      console.log('Found tables:', tables?.map(t => t.table_name) || 'Could not fetch')
    }

    // 2. Check specific POWLAX tables
    const powlaxTables = [
      'powlax_badges_catalog',
      'powlax_drill_completions', 
      'powlax_drills',
      'powlax_gamipress_mappings',
      'powlax_images',
      'powlax_points_currencies',
      'powlax_ranks_catalog',
      'powlax_skills_academy_answers',
      'powlax_skills_academy_drills',
      'powlax_skills_academy_questions',
      'powlax_skills_academy_workouts',
      'powlax_strategies',
      'powlax_user_favorite_workouts',
      'powlax_wall_ball_collection_drills',
      'powlax_wall_ball_collections',
      'powlax_wall_ball_drill_library',
      
      // Legacy naming
      'strategies_powlax',
      'drills_powlax',
      'skills_academy_powlax',
      'wall_ball_powlax',
      'lessons_powlax',
      'drill_strategy_map_powlax'
    ]

    console.log('\n🎯 POWLAX TABLES STATUS:')
    console.log('-'.repeat(40))
    
    const tableResults = []
    
    for (const tableName of powlaxTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          
        if (error) {
          tableResults.push({
            table: tableName,
            status: '❌ Does not exist',
            count: 'N/A',
            error: error.message
          })
        } else {
          tableResults.push({
            table: tableName,
            status: count > 0 ? '✅ Has data' : '⭕ Empty',
            count: count || 0,
            error: null
          })
        }
      } catch (e) {
        tableResults.push({
          table: tableName,
          status: '❌ Error',
          count: 'N/A',
          error: e.message
        })
      }
    }

    // Sort by status and count
    tableResults.sort((a, b) => {
      if (a.status.includes('✅') && !b.status.includes('✅')) return -1
      if (!a.status.includes('✅') && b.status.includes('✅')) return 1
      if (typeof a.count === 'number' && typeof b.count === 'number') {
        return b.count - a.count
      }
      return a.table.localeCompare(b.table)
    })

    tableResults.forEach(result => {
      console.log(`${result.status} ${result.table} (${result.count} records)`)
      if (result.error && !result.error.includes('does not exist')) {
        console.log(`   Error: ${result.error}`)
      }
    })

    // 3. Check foreign key relationships
    console.log('\n🔗 FOREIGN KEY RELATIONSHIPS:')
    console.log('-'.repeat(40))
    
    try {
      const { data: fkData } = await supabase.rpc('get_foreign_keys')
      if (fkData) {
        fkData.forEach(fk => {
          console.log(`${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
        })
      } else {
        console.log('Could not fetch foreign key relationships via RPC')
      }
    } catch (e) {
      console.log('Foreign key check failed:', e.message)
    }

    // 4. Check RLS status
    console.log('\n🔒 ROW LEVEL SECURITY STATUS:')
    console.log('-'.repeat(40))
    
    const tablesWithData = tableResults.filter(t => t.status.includes('✅') || t.status.includes('⭕'))
    
    for (const table of tablesWithData) {
      try {
        // This is a simplified check - in a real scenario you'd query pg_tables
        console.log(`${table.table}: RLS status unknown (requires admin query)`)
      } catch (e) {
        console.log(`${table.table}: Could not check RLS`)
      }
    }

    // 5. Summary
    console.log('\n📋 SUMMARY:')
    console.log('-'.repeat(40))
    
    const withData = tableResults.filter(r => r.status.includes('✅'))
    const empty = tableResults.filter(r => r.status.includes('⭕'))
    const missing = tableResults.filter(r => r.status.includes('❌'))
    
    console.log(`Tables with data: ${withData.length}`)
    console.log(`Empty tables: ${empty.length}`)
    console.log(`Missing tables: ${missing.length}`)
    
    if (withData.length > 0) {
      console.log('\n🎯 TABLES WITH DATA (these have relationships):')
      withData.forEach(table => {
        console.log(`  ✅ ${table.table}: ${table.count} records`)
      })
    }
    
    if (empty.length > 0) {
      console.log('\n⭕ EMPTY TABLES (safe to delete if no dependencies):')
      empty.forEach(table => {
        console.log(`  ⭕ ${table.table}`)
      })
    }

    // 6. Naming convention analysis
    console.log('\n🏷️  NAMING CONVENTION ANALYSIS:')
    console.log('-'.repeat(40))
    
    const newNaming = tableResults.filter(t => t.table.startsWith('powlax_'))
    const oldNaming = tableResults.filter(t => t.table.endsWith('_powlax'))
    
    console.log(`New naming (powlax_*): ${newNaming.length} tables`)
    console.log(`Old naming (*_powlax): ${oldNaming.length} tables`)
    
    if (newNaming.length > 0) {
      console.log('\nNew naming convention tables:')
      newNaming.forEach(t => console.log(`  ${t.status} ${t.table}`))
    }
    
    if (oldNaming.length > 0) {
      console.log('\nOld naming convention tables:')
      oldNaming.forEach(t => console.log(`  ${t.status} ${t.table}`))
    }

  } catch (error) {
    console.error('❌ Error analyzing database:', error)
  }
}

analyzeLiveDatabase().catch(console.error)
