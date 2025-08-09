import { supabase } from './src/lib/supabase'

async function checkWorkoutData() {
  console.log('🔍 Checking Skills Academy workout data...\n')
  
  // Check series
  const { data: series, error: seriesError } = await supabase
    .from('skills_academy_series')
    .select('*')
    .limit(3)
    
  if (seriesError) {
    console.log('❌ Error fetching series:', seriesError)
  } else {
    console.log(`✅ Found ${series?.length || 0} series:`)
    series?.forEach(s => console.log(`  - ${s.series_name} (${s.series_type})`))
  }
  
  // Check workouts
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select(`
      *,
      series:skills_academy_series(series_name)
    `)
    .limit(5)
    
  if (workoutsError) {
    console.log('\n❌ Error fetching workouts:', workoutsError)
  } else {
    console.log(`\n✅ Found ${workouts?.length || 0} workouts:`)
    workouts?.forEach(w => console.log(`  - ID ${w.id}: ${w.workout_name} (${w.workout_size}) - ${w.drill_count} drills`))
  }
  
  // Check workout drills for first workout
  if (workouts && workouts.length > 0) {
    const workoutId = workouts[0].id
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_workout_drills')
      .select(`
        *,
        drill:skills_academy_drill_library(drill_name, description)
      `)
      .eq('workout_id', workoutId)
      
    if (drillsError) {
      console.log(`\n❌ Error fetching drills for workout ${workoutId}:`, drillsError)
    } else {
      console.log(`\n✅ Found ${drills?.length || 0} drills for workout ${workoutId}:`)
      drills?.forEach(d => console.log(`  - ${d.drill?.drill_name || 'Unknown drill'}: ${d.drill?.description || 'No description'}`))
    }
  }
}

checkWorkoutData().catch(console.error)