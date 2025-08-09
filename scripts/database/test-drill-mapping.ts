import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPhase1() {
  console.log('🧪 Testing Phase 1: Add drill_ids to one workout')
  
  try {
    // Get first workout
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .eq('workout_name', 'Midfield 1')
      .single()
    
    if (workoutError) {
      console.error('Error fetching workout:', workoutError)
      return false
    }
    
    console.log('Found workout:', workout.workout_name, '- ID:', workout.id)
    
    // Get the specific drills for Midfield 1 based on the mapping
    const midfield1Drills = [
      'Shoulder to Shoulder Cradle',
      'Shoulder to Nose Cradle',
      'Strong Hand Wall Ball',
      'Off Hand Wall Ball',
      'Wall Ball (Both Hands)'
    ]
    
    // Find drill IDs
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .in('title', midfield1Drills)
    
    if (drillsError) {
      console.error('Error fetching drills:', drillsError)
      return false
    }
    
    console.log(`Found ${drills?.length || 0} drills:`)
    drills?.forEach(d => console.log(`  - ${d.title} (ID: ${d.id})`))
    
    // Create ordered array of drill IDs
    const drillIds = midfield1Drills.map(drillName => {
      const drill = drills?.find(d => d.title === drillName)
      return drill?.id
    }).filter(id => id !== undefined)
    
    console.log('\nDrill IDs in order:', drillIds)
    
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
testPhase1().then(success => {
  if (success) {
    console.log('\n🎉 Phase 1 test successful! The drill_ids column works correctly.')
    console.log('Ready to proceed with full mapping of all 182 drill-workout relationships.')
  } else {
    console.log('\n❌ Phase 1 test failed. Please check errors above.')
  }
  process.exit(success ? 0 : 1)
})