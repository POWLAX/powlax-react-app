import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDrillVideos() {
  console.log('🎥 Checking Skills Academy drill videos...\n')

  // 1. Check drill table structure
  const { data: drills, error: drillsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(5)

  if (drillsError) {
    console.error('Error fetching drills:', drillsError)
    return
  }

  if (drills && drills.length > 0) {
    console.log('Sample drill structure:')
    console.log('Columns:', Object.keys(drills[0]))
    console.log('\nFirst drill:', JSON.stringify(drills[0], null, 2))
  }

  // 2. Check workout with drill_ids
  const { data: workout, error: workoutError } = await supabase
    .from('skills_academy_workouts')
    .select('id, workout_name, drill_ids')
    .eq('id', 1)
    .single()

  if (workoutError) {
    console.error('Error fetching workout:', workoutError)
    return
  }

  console.log('\n📋 Workout ID 1:')
  console.log(`  Name: ${workout.workout_name}`)
  console.log(`  Drill IDs: ${JSON.stringify(workout.drill_ids)}`)
  
  // 3. Get drills for this workout
  if (workout.drill_ids && workout.drill_ids.length > 0) {
    const { data: workoutDrills, error: workoutDrillsError } = await supabase
      .from('skills_academy_drills')  
      .select('*')
      .in('id', workout.drill_ids)

    if (workoutDrillsError) {
      console.error('Error fetching workout drills:', workoutDrillsError)
      return
    }

    console.log(`\n🎯 Found ${workoutDrills?.length || 0} drills for this workout`)
    
    workoutDrills?.forEach((drill: any, index: number) => {
      console.log(`\n${index + 1}. Drill ID ${drill.id}:`)
      console.log(`   Title: ${drill.title || 'No title'}`)
      console.log(`   Name: ${drill.name || 'No name'}`)
      console.log(`   Vimeo ID: ${drill.vimeo_id || 'NO VIMEO ID'}`)
      console.log(`   Video URL: ${drill.video_url || 'NO VIDEO URL'}`)
      console.log(`   Video Link: ${drill.video_link || 'NO VIDEO LINK'}`)
    })
  }
}

checkDrillVideos().catch(console.error)