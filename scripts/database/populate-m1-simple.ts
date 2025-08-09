import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function populateM1Workout() {
  console.log('🚀 Populating M1 Complete Workout with drills (simplified)')
  
  try {
    // Get M1 Complete workout (ID 49)
    const workoutId = 49 // M1 - Complete Workout
    
    // Get first 15 drills
    const { data: drills } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .limit(15)
      .order('id')
    
    if (!drills || drills.length === 0) {
      console.error('No drills found')
      return false
    }
    
    console.log(`Found ${drills.length} drills to map`)
    
    // Create junction table entries (without video_type field)
    const junctionEntries = drills.map((drill, index) => ({
      workout_id: workoutId,
      drill_id: drill.id,
      sequence_order: index + 1,
      drill_duration_seconds: 60,
      repetitions: 10
    }))
    
    // Clear existing entries for this workout
    const { error: deleteError } = await supabase
      .from('skills_academy_workout_drills')
      .delete()
      .eq('workout_id', workoutId)
    
    if (deleteError) {
      console.log('No existing entries to delete or error:', deleteError.message)
    }
    
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
        drill_id,
        drill:skills_academy_drills(id, title)
      `)
      .eq('workout_id', workoutId)
      .order('sequence_order')
    
    console.log('\n📋 M1 Complete workout drill sequence:')
    verification?.forEach(item => {
      console.log(`  ${item.sequence_order}. ${item.drill?.title} (ID: ${item.drill_id})`)
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
    console.log('\n🎉 M1 Complete workout successfully populated!')
    console.log('Test the Skills Academy UI to verify drills appear in:')
    console.log('  1. Workout preview modal')
    console.log('  2. Workout runner page')
  } else {
    console.log('\n❌ Failed to populate workout.')
  }
  process.exit(success ? 0 : 1)
})