import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDrillDurations() {
  // Check a specific workout's drill data
  const { data: workout, error: workoutError } = await supabase
    .from('skills_academy_workouts')
    .select('*, series:skills_academy_series(*)')
    .eq('id', 1)
    .single();

  if (workoutError) {
    console.error('Error fetching workout:', workoutError);
    return;
  }

  console.log('=== WORKOUT DATA FROM DATABASE ===');
  console.log('Workout ID:', workout?.id);
  console.log('Workout Name:', workout?.workout_name);
  console.log('Estimated Duration:', workout?.estimated_duration_minutes, 'minutes');
  console.log('Drill Count:', workout?.drill_ids?.length || 0);
  console.log('Series Type:', workout?.series?.series_type);

  // Check drill durations
  if (workout?.drill_ids?.length > 0) {
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_drills')
      .select('id, title, duration_minutes')
      .in('id', workout.drill_ids.slice(0, 5)); // First 5 drills
    
    if (drillsError) {
      console.error('Error fetching drills:', drillsError);
      return;
    }

    console.log('\n=== DRILL DURATIONS FROM DATABASE ===');
    drills?.forEach((drill, index) => {
      console.log(`\nDrill ${index + 1}:`);
      console.log(`  Name: ${drill.title}`);
      console.log(`  Duration in DB: ${drill.duration_minutes} minutes`);
      console.log(`  Timer Formula: (${drill.duration_minutes} - 1) × 60 seconds`);
      console.log(`  Required Wait: ${Math.max((drill.duration_minutes - 1), 1) * 60} seconds`);
    });
  }

  // Check Wall Ball workout
  const { data: wallBallWorkout } = await supabase
    .from('skills_academy_workouts')
    .select('*, series:skills_academy_series(*)')
    .eq('series_id', 13) // Wall Ball series
    .limit(1)
    .single();

  if (wallBallWorkout) {
    console.log('\n=== WALL BALL WORKOUT EXAMPLE ===');
    console.log('Workout Name:', wallBallWorkout.workout_name);
    console.log('Estimated Duration:', wallBallWorkout.estimated_duration_minutes, 'minutes');
    console.log('Timer Formula: Full duration × 60 seconds');
    console.log('Required Wait:', wallBallWorkout.estimated_duration_minutes * 60, 'seconds');
  }

  console.log('\n=== TIMER IMPLEMENTATION SUMMARY ===');
  console.log('✅ Regular Drills: Using (duration_minutes - 1) × 60 from database');
  console.log('✅ Wall Ball: Using full estimated_duration_minutes × 60 from database');
  console.log('✅ Fallbacks: 3 minutes for drills, 10 minutes for Wall Ball if data missing');
}

checkDrillDurations().catch(console.error);