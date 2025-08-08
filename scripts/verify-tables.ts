import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTables() {
  console.log('🔍 POWLAX Database Verification Report\n')
  console.log('=' .repeat(50))
  
  // Check Academy Workout tables (CORRECT NAMES from last night)
  console.log('\n📚 ACADEMY WORKOUT TABLES:')
  const academyTables = [
    'powlax_academy_workout_collections',  // Main workout records
    'powlax_academy_workout_items',        // Individual drill items
    'powlax_academy_workout_item_answers', // Answer options
    'skills_academy_drills'                // Drill library
  ]
  
  for (const table of academyTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND`)
      console.log(`     Error: ${error.message}`)
    } else {
      console.log(`  ✅ ${table}: ${count || 0} records`)
    }
  }
  
  // Check Wall Ball tables (CORRECT NAMES from last night)
  console.log('\n🎾 WALL BALL TABLES:')
  const wallBallTables = [
    'powlax_wall_ball_drill_library',     // Individual drills
    'powlax_wall_ball_collections',       // Complete workout videos
    'powlax_wall_ball_collection_drills'  // Junction table
  ]
  
  for (const table of wallBallTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND`)
      console.log(`     Error: ${error.message}`)
    } else {
      console.log(`  ✅ ${table}: ${count || 0} records`)
    }
  }
  
  // Check User tables
  console.log('\n👤 USER CONTENT TABLES:')
  const userTables = [
    'user_drills',
    'user_strategies',
    'user_favorites'
  ]
  
  for (const table of userTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND`)
      console.log(`     Error: ${error.message}`)
    } else {
      console.log(`  ✅ ${table}: ${count || 0} records`)
    }
  }
  
  // Check main POWLAX tables
  console.log('\n🏃 MAIN POWLAX TABLES:')
  const mainTables = [
    'powlax_drills',
    'powlax_strategies'
  ]
  
  for (const table of mainTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND`)
      console.log(`     Error: ${error.message}`)
    } else {
      console.log(`  ✅ ${table}: ${count || 0} records`)
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  
  // Sample Academy Workout data
  console.log('\n📋 SAMPLE ACADEMY WORKOUT COLLECTIONS:')
  const { data: workouts, error: workoutError } = await supabase
    .from('powlax_academy_workout_collections')
    .select('name, workout_series, series_number, workout_size')
    .limit(5)
  
  if (workoutError) {
    console.log('  Unable to fetch samples:', workoutError.message)
  } else if (workouts && workouts.length > 0) {
    workouts.forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.name}`)
      console.log(`     Series: ${w.workout_series || 'N/A'}, Number: ${w.series_number || 'N/A'}, Size: ${w.workout_size || 'N/A'}`)
    })
  } else {
    console.log('  No workout collections found')
  }
  
  // Sample Wall Ball data
  console.log('\n📋 SAMPLE WALL BALL COLLECTIONS:')
  const { data: wallBall, error: wallBallError } = await supabase
    .from('powlax_wall_ball_collections')
    .select('name, workout_type, duration_minutes, has_coaching')
    .limit(5)
  
  if (wallBallError) {
    console.log('  Unable to fetch samples:', wallBallError.message)
  } else if (wallBall && wallBall.length > 0) {
    wallBall.forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.name}`)
      console.log(`     Type: ${w.workout_type || 'N/A'}, Duration: ${w.duration_minutes} min, Coaching: ${w.has_coaching ? 'Yes' : 'No'}`)
    })
  } else {
    console.log('  No wall ball collections found')
  }
  
  // Check linkage between workout items and drills
  console.log('\n🔗 DRILL LINKAGE VERIFICATION:')
  const { data: linkedItems, error: linkError } = await supabase
    .from('powlax_academy_workout_items')
    .select('drill_title, drill_id')
    .not('drill_id', 'is', null)
    .limit(5)
  
  if (linkError) {
    console.log('  Unable to check linkage:', linkError.message)
  } else if (linkedItems && linkedItems.length > 0) {
    console.log(`  ✅ Found ${linkedItems.length} workout items linked to drills`)
    linkedItems.forEach((item, i) => {
      console.log(`     ${i + 1}. "${item.drill_title}" → Drill ID: ${item.drill_id}`)
    })
  } else {
    console.log('  ⚠️  No workout items linked to drills yet')
    console.log('     Run the link_workout_items_to_drills() function to establish connections')
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ Verification Complete\n')
}

verifyTables().catch(console.error)