import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateM1Workout() {
  console.log('🚀 Populating M1 Complete Workout with drills')
  
  try {
    // Get M1 Complete workout
    const { data: workout } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .eq('workout_name', 'M1 - Complete Workout')
      .single()
    
    if (!workout) {
      console.error('M1 Complete workout not found')
      return false
    }
    
    console.log('Found workout:', workout.workout_name, '- ID:', workout.id)
    
    // Get first 15 drills from skills_academy_drills table
    const { data: drills } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .limit(15)
      .order('id')
    
    if (!drills || drills.length === 0) {
      console.error('No drills found')
      return false
    }
    
    console.log(`\nMapping ${drills.length} drills to workout:`)
    
    // Create junction table entries
    const junctionEntries = drills.map((drill, index) => ({
      workout_id: workout.id,
      drill_id: drill.id,
      sequence_order: index + 1,
      drill_duration_seconds: 60, // Default 60 seconds per drill
      repetitions: 10, // Default 10 reps
      video_type: 'both_hands' // Default video type
    }))
    
    // Delete any existing entries for this workout
    await supabase
      .from('skills_academy_workout_drills')
      .delete()
      .eq('workout_id', workout.id)
    
    // Insert new entries
    const { data: inserted, error: insertError } = await supabase
      .from('skills_academy_workout_drills')
      .insert(junctionEntries)
      .select()
    
    if (insertError) {
      console.error('Error inserting drill mappings:', insertError)
      return false
    }
    
    console.log(`✅ Successfully inserted ${inserted?.length || 0} drill mappings`)
    
    // Verify the mappings
    const { data: verification } = await supabase
      .from('skills_academy_workout_drills')
      .select(`
        sequence_order,
        drill:skills_academy_drills(id, title)
      `)
      .eq('workout_id', workout.id)
      .order('sequence_order')
    
    console.log('\n📋 Workout drill sequence:')
    verification?.forEach(item => {
      console.log(`  ${item.sequence_order}. ${item.drill?.title} (ID: ${item.drill?.id})`)
    })
    
    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Run the population
populateM1Workout().then(success => {
  if (success) {
    console.log('\n🎉 M1 Complete workout successfully populated with drills!')
    console.log('Now test the Skills Academy UI to see if drills appear.')
  } else {
    console.log('\n❌ Failed to populate workout. Check errors above.')
  }
  process.exit(success ? 0 : 1)
})