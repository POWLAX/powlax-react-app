import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (\!supabaseUrl || \!supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('Checking Skills Academy tables...\n')
  
  // Check series
  const { data: series, error: seriesError } = await supabase
    .from('skills_academy_series')
    .select('*')
    .limit(5)
    
  if (seriesError) {
    console.error('Series error:', seriesError.message)
  } else {
    console.log('✅ Series found:', series?.length || 0, 'records')
    if (series && series.length > 0) {
      console.log('Sample:', series[0].series_name)
    }
  }
  
  // Check workouts
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .limit(5)
    
  if (workoutsError) {
    console.error('Workouts error:', workoutsError.message)
  } else {
    console.log('✅ Workouts found:', workouts?.length || 0, 'records')
    if (workouts && workouts.length > 0) {
      console.log('Sample:', workouts[0].workout_name)
    }
  }
  
  // Check workout drills
  const { data: drills, error: drillsError } = await supabase
    .from('skills_academy_workout_drills')
    .select('*')
    .limit(5)
    
  if (drillsError) {
    console.error('Workout drills error:', drillsError.message)
  } else {
    console.log('✅ Workout drills found:', drills?.length || 0, 'records')
  }
  
  // Get counts
  const { count: seriesCount } = await supabase
    .from('skills_academy_series')
    .select('*', { count: 'exact', head: true })
    
  const { count: workoutCount } = await supabase
    .from('skills_academy_workouts')
    .select('*', { count: 'exact', head: true })
    
  const { count: drillCount } = await supabase
    .from('skills_academy_workout_drills')
    .select('*', { count: 'exact', head: true })
    
  console.log('\n📊 Total counts:')
  console.log('- Series:', seriesCount || 0)
  console.log('- Workouts:', workoutCount || 0)
  console.log('- Workout drills:', drillCount || 0)
  
  process.exit(0)
}

checkTables().catch(console.error)
