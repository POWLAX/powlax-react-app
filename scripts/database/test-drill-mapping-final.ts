import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWorkoutDrillMapping() {
  console.log('🧪 Testing drill mapping for M1 Complete workout')
  
  try {
    // Step 1: Get M1 Complete workout
    const workoutId = 49 // M1 - Complete Workout
    console.log('Target workout ID:', workoutId)
    
    // Step 2: Get drills from skills_academy_drills (integer ID table)
    const { data: drills } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .limit(15)
      .order('id')
    
    console.log(`\nFound ${drills?.length || 0} drills from skills_academy_drills table`)
    
    // Step 3: Since junction table expects UUID but we have integers,
    // let's check if we can use the integer-based approach differently
    // or if there's another way to link them
    
    // Check what the workout preview modal is actually querying
    console.log('\nChecking how the app currently fetches drills...')
    
    // The app uses skills_academy_workout_drills which expects drill_id as UUID
    // But we have skills_academy_drills with integer IDs
    
    // Let's see if there's a relationship or if we need to create UUID entries
    const { data: existingMappings, count } = await supabase
      .from('skills_academy_workout_drills')
      .select('*', { count: 'exact' })
      .eq('workout_id', workoutId)
    
    console.log(`Existing mappings for workout ${workoutId}:`, count || 0)
    
    // Since the junction table expects UUIDs and drill_library is the UUID table,
    // we need to populate drill_library first
    console.log('\n📝 Plan: Need to populate skills_academy_drill_library table with UUID drills')
    console.log('Then link those UUIDs to workouts via skills_academy_workout_drills')
    
    return true
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}

// Run test
testWorkoutDrillMapping().then(success => {
  console.log(success ? '\n✅ Analysis complete' : '\n❌ Analysis failed')
  process.exit(success ? 0 : 1)
})