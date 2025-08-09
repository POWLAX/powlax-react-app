import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function checkStructure() {
  console.log('\n=== Skills Academy Table Structure ===\n')
  
  // Check workouts structure
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .limit(1)
  
  console.log('skills_academy_workouts columns:')
  if (workouts && workouts[0]) {
    console.log(Object.keys(workouts[0]))
    console.log('Sample workout:', workouts[0])
  }
  
  // Check drills structure
  const { data: drills } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(1)
  
  console.log('\nskills_academy_drills columns:')
  if (drills && drills[0]) {
    console.log(Object.keys(drills[0]))
    console.log('Sample drill:', drills[0])
  }
  
  // Check series structure
  const { data: series } = await supabase
    .from('skills_academy_series')
    .select('*')
    .limit(1)
  
  console.log('\nskills_academy_series columns:')
  if (series && series[0]) {
    console.log(Object.keys(series[0]))
    console.log('Sample series:', series[0])
  }
  
  // Check junction table columns (even though empty)
  const { error } = await supabase
    .from('skills_academy_workout_drills')
    .select('workout_id, drill_id, id')
    .limit(1)
    
  if (error) {
    console.log('\nskills_academy_workout_drills error:', error.message)
  } else {
    console.log('\nskills_academy_workout_drills: Table exists but is empty')
  }
}

checkStructure().catch(console.error)