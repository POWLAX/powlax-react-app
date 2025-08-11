import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActualWallBallTables() {
  console.log('🔍 Checking which wall ball tables actually exist and have data...\n')
  
  const tablesToCheck = [
    'wall_ball_drill_library',
    'wall_ball_workout_series', 
    'wall_ball_workout_variants',
    'powlax_wall_ball_drill_library',
    'powlax_wall_ball_collections',
    'powlax_wall_ball_collection_drills'
  ]
  
  for (const tableName of tablesToCheck) {
    console.log(`📊 Checking ${tableName}:`)
    console.log('-'.repeat(60))
    
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`  ❌ Table does not exist or error: ${error.message}`)
      } else {
        console.log(`  ✅ Table exists with ${count} records`)
        
        if (count && count > 0) {
          // Get sample data to see structure
          const { data, error: dataError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3)
          
          if (!dataError && data && data.length > 0) {
            console.log(`  📋 Columns: ${Object.keys(data[0]).join(', ')}`)
            console.log(`  📝 Sample data:`)
            data.forEach((row, index) => {
              const identifier = row.name || row.drill_name || row.variant_name || row.series_name || `Record ${row.id}`
              console.log(`    ${index + 1}. ${identifier}`)
            })
          }
        }
      }
    } catch (err) {
      console.log(`  ❌ Error checking table: ${err}`)
    }
    
    console.log('')
  }
  
  // Check what the frontend hooks are actually querying
  console.log('🔍 Frontend Table Usage Analysis:')
  console.log('=' .repeat(80))
  console.log('Based on useWallBallWorkouts.ts:')
  console.log('  - useWallBallSeries() queries: wall_ball_workout_series')
  console.log('  - useWallBallVariants() queries: wall_ball_workout_variants')  
  console.log('  - useWallBallVariant() queries: powlax_wall_ball_collections + powlax_wall_ball_collection_drills')
  console.log('')
  console.log('⚠️  INCONSISTENCY DETECTED: Frontend uses mixed table structures!')
  console.log('   - Series/Variants: wall_ball_* tables')
  console.log('   - Individual workouts: powlax_* tables')
}

checkActualWallBallTables().catch(console.error)
