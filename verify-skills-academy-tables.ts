import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyTables() {
  console.log('🔍 Verifying Skills Academy Table Structure...\n')
  
  const tables = [
    'skills_academy_series',
    'skills_academy_workouts', 
    'skills_academy_drills',
    'skills_academy_workout_drills',
    'skills_academy_drill_library'
  ]
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
        
      if (error) {
        console.log(`❌ ${table} - Does not exist (${error.message})`)
      } else {
        console.log(`✅ ${table} - EXISTS with ${count} total records`)
        if (data && data.length > 0) {
          console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    } catch (e) {
      console.log(`❌ ${table} - Error: ${e}`)
    }
  }
  
  console.log('\n📊 Testing Connections...')
  
  // Test workout to drill connection
  console.log('\n🔗 Testing skills_academy_workouts → skills_academy_drills connection...')
  try {
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('*, drills:skills_academy_drills(*)')
      .limit(1)
    
    if (workoutError) {
      console.log('❌ Direct workout→drills join failed:', workoutError.message)
    } else {
      console.log('✅ Direct workout→drills join works!')
      if (workout?.[0]) {
        console.log(`   Workout: ${workout[0].workout_name}`)
        console.log(`   Connected drills: ${workout[0].drills?.length || 0}`)
      }
    }
  } catch (e) {
    console.log('❌ Connection test failed:', e)
  }
}

verifyTables().catch(console.error)