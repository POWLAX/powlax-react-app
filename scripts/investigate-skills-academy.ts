import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function investigateSkillsAcademy() {
  console.log('\n=== Skills Academy Database Investigation ===\n')
  
  // Check each table
  const tables = ['skills_academy_series', 'skills_academy_workouts', 'skills_academy_drills', 'skills_academy_workout_drills']
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: ${count} records`)
    }
  }
  
  // Sample a workout to see its structure
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .limit(3)
  
  console.log('\nSample workouts:')
  if (workouts) {
    workouts.forEach((workout, i) => {
      console.log(`Workout ${i + 1}:`)
      console.log(`  - id: ${workout.id}`)
      console.log(`  - name: ${workout.name}`)
      console.log(`  - drill_count: ${workout.drill_count}`)
      console.log(`  - series_id: ${workout.series_id}`)
      console.log('')
    })
  }
  
  // Check junction table structure
  console.log('Junction table structure check:')
  const { data: junctionSample } = await supabase
    .from('skills_academy_workout_drills')
    .select('*')
    .limit(1)
    
  console.log('Junction table sample:', junctionSample)
  
  // Check drill structure
  console.log('\nSample drills:')
  const { data: drills } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(3)
    
  if (drills) {
    drills.forEach((drill, i) => {
      console.log(`Drill ${i + 1}:`)
      console.log(`  - id: ${drill.id}`)
      console.log(`  - name: ${drill.name}`)
      console.log(`  - category: ${drill.category}`)
      console.log(`  - workout_id: ${drill.workout_id}`)
      console.log('')
    })
  }
}

investigateSkillsAcademy().catch(console.error)