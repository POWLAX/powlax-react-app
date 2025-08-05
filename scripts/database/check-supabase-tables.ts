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

async function checkSupabaseTables() {
  console.log('🔍 Checking existing tables in Supabase...\n')
  
  // List of tables we're interested in
  const powlaxTables = [
    'strategies_powlax',
    'drills_powlax',
    'skills_academy_powlax',
    'wall_ball_powlax',
    'lessons_powlax',
    'drill_strategy_map_powlax'
  ]
  
  for (const tableName of powlaxTables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${tableName}: Does not exist`)
      } else {
        console.log(`✅ ${tableName}: Exists with ${count} records`)
      }
    } catch (e) {
      console.log(`❌ ${tableName}: Error checking`)
    }
  }
  
  // Also check for any other _powlax tables
  console.log('\n📊 Checking for any other existing tables...')
  
  try {
    // Query information schema for all tables
    const { data: allTables } = await supabase.rpc('get_tables_list', {})
    
    if (allTables) {
      console.log('\nAll tables in database:')
      allTables.forEach((table: any) => {
        if (table.table_name.includes('powlax') || table.table_name.includes('staging')) {
          console.log(`  - ${table.table_name}`)
        }
      })
    }
  } catch (e) {
    // If RPC doesn't work, try a different approach
    console.log('\nChecking for staging tables...')
    const stagingTables = [
      'staging_wp_drills',
      'staging_wp_strategies', 
      'staging_wp_academy_drills',
      'staging_wp_wall_ball',
      'staging_wp_lessons'
    ]
    
    for (const table of stagingTables) {
      const { error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`  - ${table} exists`)
      }
    }
  }
}

checkSupabaseTables().catch(console.error)