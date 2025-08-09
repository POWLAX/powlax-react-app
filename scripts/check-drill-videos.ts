import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDrillVideos() {
  console.log('🎥 Checking Skills Academy drill videos...\n')

  // 1. Check if drills exist
  const { data: drills, error: drillsError } = await supabase
    .from('skills_academy_drills')
    .select('id, drill_name, video_link, file_url')
    .limit(10)

  if (drillsError) {
    console.error('Error fetching drills:', drillsError)
    return
  }

  console.log(`Found ${drills?.length || 0} drills in skills_academy_drills table:\n`)

  drills?.forEach((drill, index) => {
    console.log(`Drill ${index + 1}: ${drill.drill_name}`)
    console.log(`  - ID: ${drill.id}`)
    console.log(`  - Video Link: ${drill.video_link || 'NO VIDEO'}`)
    console.log(`  - File URL: ${drill.file_url || 'NO FILE'}`)
    console.log()
  })

  // 2. Check workouts and their drill_ids
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select('id, workout_name, drill_ids')
    .eq('id', 1)
    .single()

  if (workoutsError) {
    console.error('Error fetching workout:', workoutsError)
    return
  }

  console.log('📋 Checking Workout ID 1:')
  console.log(`  - Name: ${workouts.workout_name}`)
  console.log(`  - Drill IDs: ${JSON.stringify(workouts.drill_ids)}`)
  console.log()

  // 3. Get drills for this workout
  if (workouts.drill_ids && workouts.drill_ids.length > 0) {
    const { data: workoutDrills, error: workoutDrillsError } = await supabase
      .from('skills_academy_drills')
      .select('id, drill_name, video_link, file_url')
      .in('id', workouts.drill_ids)

    if (workoutDrillsError) {
      console.error('Error fetching workout drills:', workoutDrillsError)
      return
    }

    console.log(`🎯 Found ${workoutDrills?.length || 0} drills for this workout:\n`)

    workoutDrills?.forEach((drill, index) => {
      console.log(`${index + 1}. ${drill.drill_name}`)
      if (drill.video_link) {
        console.log(`   ✅ Has video: ${drill.video_link}`)
      } else {
        console.log(`   ❌ No video link`)
      }
    })
  } else {
    console.log('❌ No drill_ids found for this workout')
  }

  // 4. Check how many drills have videos
  const { data: drillsWithVideos, error: videoCountError } = await supabase
    .from('skills_academy_drills')
    .select('id', { count: 'exact' })
    .not('video_link', 'is', null)

  const { data: totalDrills, error: totalCountError } = await supabase
    .from('skills_academy_drills')
    .select('id', { count: 'exact' })

  console.log('\n📊 Video Coverage Statistics:')
  console.log(`  - Total drills: ${totalDrills?.length || 0}`)
  console.log(`  - Drills with videos: ${drillsWithVideos?.length || 0}`)
  console.log(`  - Coverage: ${((drillsWithVideos?.length || 0) / (totalDrills?.length || 1) * 100).toFixed(1)}%`)
}

checkDrillVideos().catch(console.error)