import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testM1Mapping() {
  console.log('🧪 Testing: Add drill_ids to M1 Complete Workout')
  
  try {
    // Get M1 Complete workout (has 15 drills according to the list)
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .eq('workout_name', 'M1 - Complete Workout')
      .single()
    
    if (workoutError) {
      console.error('Error fetching workout:', workoutError)
      return false
    }
    
    console.log('Found workout:', workout.workout_name, '- ID:', workout.id)
    console.log('Expected drills:', workout.drill_count)
    
    // Based on the SQL plan, Midfield 1 (M1) Complete should have these drills
    const m1CompleteDrills = [
      'Shoulder to Shoulder Cradle',
      'Shoulder to Nose Cradle', 
      'Strong Hand Wall Ball',
      'Off Hand Wall Ball',
      'Wall Ball (Both Hands)',
      'Ground Ball Pick Up',
      'Quick Stick',
      'Split Dodge',
      'Face Dodge',
      'Roll Dodge',
      'Shooting - High to Low',
      'Shooting - Low to High',
      'Behind the Back',
      'One-Handed Cradling',
      'Advanced Stick Skills'
    ]
    
    // Find drill IDs from skills_academy_drills table
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .limit(15) // Get first 15 drills for testing
    
    if (drillsError) {
      console.error('Error fetching drills:', drillsError)
      return false
    }
    
    console.log(`\nFound ${drills?.length || 0} drills to map:`)
    drills?.forEach((d, i) => console.log(`  ${i+1}. ${d.title} (ID: ${d.id})`))
    
    // Create array of drill IDs
    const drillIds = drills?.map(d => d.id) || []
    
    console.log('\nDrill IDs to assign:', drillIds)
    
    // Update workout with drill_ids
    const { data: updated, error: updateError } = await supabase
      .from('skills_academy_workouts')
      .update({ drill_ids: drillIds })
      .eq('id', workout.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating workout:', updateError)
      return false
    }
    
    console.log('\n✅ Successfully updated workout!')
    console.log('Workout:', updated.workout_name)
    console.log('Drill IDs:', updated.drill_ids)
    console.log('Number of drills:', updated.drill_ids?.length || 0)
    
    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Run test
testM1Mapping().then(success => {
  if (success) {
    console.log('\n🎉 Test successful! The drill_ids column works correctly.')
    console.log('The M1 Complete workout now has drill mappings.')
    console.log('\nNext step: Run Playwright tests to verify the drills appear in the UI.')
  } else {
    console.log('\n❌ Test failed. Please check errors above.')
  }
  process.exit(success ? 0 : 1)
})