import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function fixWorkoutDrillConnections() {
  console.log('\n=== Fixing Skills Academy Workout-Drill Connections ===\n')
  
  // First, let's see what columns exist in the junction table
  const { error: schemaError } = await supabase
    .from('skills_academy_workout_drills')
    .select('workout_id, drill_id')
    .limit(0)
  
  if (schemaError) {
    console.log('Junction table columns might be different. Error:', schemaError.message)
    
    // Try alternate column names
    const { error: altError } = await supabase
      .from('skills_academy_workout_drills')
      .select('*')
      .limit(1)
    
    if (altError) {
      console.error('Could not access junction table:', altError.message)
      return
    }
  }
  
  // Get some workouts to test
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .eq('is_active', true)
    .limit(10)
  
  // Get some drills to test  
  const { data: drills } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(50)
  
  if (!workouts || !drills) {
    console.error('Could not fetch workouts or drills')
    return
  }
  
  console.log(`Creating connections for ${workouts.length} workouts using ${drills.length} drills`)
  
  // Create simple connections without drill_order
  const connections = []
  let drillIndex = 0
  
  for (const workout of workouts) {
    const drillCount = Math.min(workout.drill_count || 5, 10) // Limit to avoid too many connections
    
    for (let i = 0; i < drillCount && drillIndex < drills.length; i++) {
      const drill = drills[drillIndex % drills.length]
      
      connections.push({
        workout_id: workout.id,
        drill_id: drill.id
      })
      
      drillIndex++
    }
  }
  
  console.log(`Attempting to insert ${connections.length} connections...`)
  
  // Insert connections in small batches
  const batchSize = 10
  for (let i = 0; i < connections.length; i += batchSize) {
    const batch = connections.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('skills_academy_workout_drills')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      // Stop if we hit errors
      break
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} connections)`)
    }
  }
  
  // Verify final count
  const { count } = await supabase
    .from('skills_academy_workout_drills')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Junction table now has ${count} connections`)
}

fixWorkoutDrillConnections().catch(console.error)