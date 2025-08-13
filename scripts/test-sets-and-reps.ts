import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testSetsAndReps() {
  console.log('🔍 Testing sets_and_reps field in skills_academy_drills...\n');
  
  // Fetch a few drills to check if sets_and_reps exists
  const { data: drills, error } = await supabase
    .from('skills_academy_drills')
    .select('id, title, sets_and_reps, point_values, duration_minutes')
    .limit(5);
  
  if (error) {
    console.error('❌ Error fetching drills:', error);
    return;
  }
  
  console.log('✅ Found drills with following data:\n');
  drills?.forEach((drill, index) => {
    console.log(`Drill ${index + 1}:`);
    console.log(`  Title: ${drill.title}`);
    console.log(`  Sets & Reps: ${drill.sets_and_reps || '(not set)'}`);
    console.log(`  Duration: ${drill.duration_minutes} minutes`);
    console.log(`  Point Values: ${JSON.stringify(drill.point_values)}`);
    console.log('');
  });
  
  // Count how many drills have sets_and_reps
  const { data: countData } = await supabase
    .from('skills_academy_drills')
    .select('id', { count: 'exact' })
    .not('sets_and_reps', 'is', null);
  
  console.log(`📊 Stats: ${countData?.length || 0} out of 167 drills have sets_and_reps values`);
  
  // Test workout 4 specifically (the one shown in screenshot)
  console.log('\n🎯 Testing Workout ID 4 (Dodging - Mini):\n');
  
  const { data: workout } = await supabase
    .from('skills_academy_workouts')
    .select('*, series:skills_academy_series(*)')
    .eq('id', 4)
    .single();
  
  if (workout?.drill_ids && workout.drill_ids.length > 0) {
    const { data: workoutDrills } = await supabase
      .from('skills_academy_drills')
      .select('id, title, sets_and_reps')
      .in('id', workout.drill_ids);
    
    console.log(`Workout: ${workout.workout_name}`);
    console.log(`Series Type: ${workout.series?.series_type}`);
    console.log(`Drills in workout:`);
    workoutDrills?.forEach((drill, i) => {
      console.log(`  ${i + 1}. ${drill.title}`);
      console.log(`     Sets & Reps: ${drill.sets_and_reps || '(not set)'}`);
    });
  }
  
  process.exit(0);
}

testSetsAndReps().catch(console.error);