import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkTables() {
  // Check skills_academy_drills table structure
  const { data: drills, error: drillsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(1)
    
  if (drillsError) {
    console.log('Error fetching skills_academy_drills:', drillsError)
  } else {
    console.log('\n=== skills_academy_drills table columns ===')
    if (drills && drills.length > 0) {
      console.log('Columns:', Object.keys(drills[0]))
      console.log('\nSample record:')
      console.log(JSON.stringify(drills[0], null, 2))
    }
  }

  // Check skills_academy_drill_library table structure  
  const { data: library, error: libraryError } = await supabase
    .from('skills_academy_drill_library')
    .select('*')
    .limit(1)
    
  if (libraryError) {
    console.log('\nError fetching skills_academy_drill_library:', libraryError)
  } else {
    console.log('\n=== skills_academy_drill_library table columns ===')
    if (library && library.length > 0) {
      console.log('Columns:', Object.keys(library[0]))
      console.log('\nSample record:')
      console.log(JSON.stringify(library[0], null, 2))
    }
  }

  // Check skills_academy_workout_drills table structure
  const { data: workoutDrills, error: wdError } = await supabase
    .from('skills_academy_workout_drills')
    .select('*')
    .limit(1)
    
  if (wdError) {
    console.log('\nError fetching skills_academy_workout_drills:', wdError)
  } else {
    console.log('\n=== skills_academy_workout_drills table columns ===')
    if (workoutDrills && workoutDrills.length > 0) {
      console.log('Columns:', Object.keys(workoutDrills[0]))
      console.log('\nSample record:')
      console.log(JSON.stringify(workoutDrills[0], null, 2))
    }
  }
}

checkTables()