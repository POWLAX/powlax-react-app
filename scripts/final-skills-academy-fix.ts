import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function finalSkillsAcademyFix() {
  console.log('\n=== Final Skills Academy Fix with UUIDs ===\n')
  
  // Get workouts with their actual UUID IDs
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('id, workout_name, drill_count')
    .eq('is_active', true)
    .limit(5) // Start with just 5 workouts to test
  
  // Get drills with their actual UUID IDs  
  const { data: drills } = await supabase
    .from('skills_academy_drills')
    .select('id, title')
    .limit(25)
  
  if (!workouts || !drills) {
    console.error('Could not fetch data')
    return
  }
  
  console.log('Sample workout ID:', workouts[0]?.id, 'type:', typeof workouts[0]?.id)
  console.log('Sample drill ID:', drills[0]?.id, 'type:', typeof drills[0]?.id)
  
  // Create connections using actual UUIDs
  const connections = []
  let drillIndex = 0
  
  for (const workout of workouts) {
    const drillCount = Math.min(workout.drill_count || 3, 5) // Small test
    console.log(`Connecting workout "${workout.workout_name}" to ${drillCount} drills`)
    
    for (let i = 0; i < drillCount && drillIndex < drills.length; i++) {
      const drill = drills[drillIndex % drills.length]
      
      connections.push({
        workout_id: workout.id, // These should be UUIDs
        drill_id: drill.id      // These should be UUIDs
      })
      
      drillIndex++
    }
  }
  
  console.log(`Inserting ${connections.length} test connections...`)
  console.log('First connection:', connections[0])
  
  // Insert one at a time to see which ones fail
  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i]
    
    const { error } = await supabase
      .from('skills_academy_workout_drills')
      .insert([connection])
    
    if (error) {
      console.error(`Error inserting connection ${i + 1}:`, error.message)
      console.error('Connection data:', connection)
      break // Stop on first error
    } else {
      console.log(`✅ Inserted connection ${i + 1}`)
    }
  }
  
  // Check final count
  const { count } = await supabase
    .from('skills_academy_workout_drills')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\nFinal count: ${count} connections`)
  
  // If we have connections, show a sample
  if (count && count > 0) {
    const { data: sample } = await supabase
      .from('skills_academy_workout_drills')
      .select(`
        workout_id,
        drill_id,
        skills_academy_workouts(workout_name),
        skills_academy_drills(title)
      `)
      .limit(3)
    
    console.log('\nSample connections:')
    sample?.forEach((conn: any, i) => {
      console.log(`${i + 1}. ${conn.skills_academy_workouts?.workout_name} → ${conn.skills_academy_drills?.title}`)
    })
  }
}

finalSkillsAcademyFix().catch(console.error)