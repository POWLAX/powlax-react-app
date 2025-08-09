import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWorkoutTable() {
  console.log('🔍 Checking skills_academy_workouts table...\n')
  
  const { data: workouts, error } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .limit(5)
    
  if (error) {
    console.log('❌ Error:', error.message)
    return
  }
  
  console.log('✅ Found', workouts?.length || 0, 'workouts')
  
  if (workouts && workouts.length > 0) {
    console.log('\n📊 Sample workout data:')
    const workout = workouts[0]
    console.log('ID:', workout.id)
    console.log('Name:', workout.workout_name)
    console.log('Size:', workout.workout_size)
    console.log('Drill Count:', workout.drill_count)
    console.log('Series ID:', workout.series_id)
    console.log('\n📋 All columns:')
    console.log(Object.keys(workout).join(', '))
    
    console.log('\n🔍 Checking for drill library...')
    const { data: drills, error: drillError } = await supabase
      .from('skills_academy_drill_library')
      .select('*')
      .limit(3)
    
    if (drillError) {
      console.log('❌ Drill library error:', drillError.message)
    } else {
      console.log('✅ Drill library found:', drills?.length || 0, 'records')
      if (drills && drills.length > 0) {
        console.log('Sample drill:', drills[0].drill_name)
      }
    }
  }
}

checkWorkoutTable().catch(console.error)