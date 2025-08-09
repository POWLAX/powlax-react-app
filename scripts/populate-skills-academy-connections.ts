import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function populateWorkoutDrillConnections() {
  console.log('\n=== Populating Skills Academy Workout-Drill Connections ===\n')
  
  // Get all workouts
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .eq('is_active', true)
    .order('id')
  
  if (workoutsError) {
    console.error('Error fetching workouts:', workoutsError)
    return
  }
  
  // Get all drills
  const { data: drills, error: drillsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .order('id')
  
  if (drillsError) {
    console.error('Error fetching drills:', drillsError)
    return
  }
  
  console.log(`Found ${workouts?.length} workouts and ${drills?.length} drills`)
  
  if (!workouts || !drills) return
  
  // Create connections based on workout requirements
  const connections = []
  let drillIndex = 0
  
  for (const workout of workouts) {
    const drillCount = workout.drill_count || 5 // Default to 5 if null
    console.log(`Connecting workout "${workout.workout_name}" (ID: ${workout.id}) to ${drillCount} drills`)
    
    // Assign drills to this workout
    for (let i = 0; i < drillCount && drillIndex < drills.length; i++) {
      const drill = drills[drillIndex % drills.length] // Cycle through drills if we run out
      
      connections.push({
        workout_id: workout.id,
        drill_id: drill.id,
        drill_order: i + 1
      })
      
      drillIndex++
    }
  }
  
  console.log(`Created ${connections.length} workout-drill connections`)
  
  // Insert connections in batches
  const batchSize = 100
  for (let i = 0; i < connections.length; i += batchSize) {
    const batch = connections.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('skills_academy_workout_drills')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} connections)`)
    }
  }
  
  // Verify the results
  const { count } = await supabase
    .from('skills_academy_workout_drills')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Success! Junction table now has ${count} connections`)
  
  // Show sample connections
  const { data: sampleConnections } = await supabase
    .from('skills_academy_workout_drills')
    .select(`
      workout_id,
      drill_id,
      drill_order,
      skills_academy_workouts(workout_name),
      skills_academy_drills(title)
    `)
    .limit(5)
  
  console.log('\nSample connections:')
  sampleConnections?.forEach((conn: any, i) => {
    console.log(`${i + 1}. Workout: "${conn.skills_academy_workouts.workout_name}" → Drill: "${conn.skills_academy_drills.title}" (Order: ${conn.drill_order})`)
  })
}

populateWorkoutDrillConnections().catch(console.error)