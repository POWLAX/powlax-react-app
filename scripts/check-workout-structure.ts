import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkoutStructure() {
  console.log('🔍 Checking skills_academy_workouts table structure...\n');

  try {
    // Get a sample workout to see the structure
    const { data: workouts, error } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching workouts:', error);
      return;
    }

    console.log('📊 Sample workouts structure:');
    console.log('================================');
    
    workouts?.forEach((workout, index) => {
      console.log(`\nWorkout ${index + 1}:`);
      console.log(`  ID: ${workout.id}`);
      console.log(`  Series ID: ${workout.series_id}`);
      console.log(`  Workout Size: ${workout.workout_size}`);
      console.log(`  Drill IDs: ${JSON.stringify(workout.drill_ids)}`);
      console.log(`  Drill Count: ${workout.drill_ids?.length || 0}`);
      
      // Show all other fields
      Object.keys(workout).forEach(key => {
        if (!['id', 'series_id', 'workout_size', 'drill_ids'].includes(key)) {
          console.log(`  ${key}: ${JSON.stringify(workout[key])}`);
        }
      });
    });

    // Check if drill_ids contain actual data
    console.log('\n📈 Drill IDs Analysis:');
    console.log('======================');
    
    const { data: allWorkouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, drill_ids, workout_size');

    let emptyCount = 0;
    let populatedCount = 0;
    
    allWorkouts?.forEach(w => {
      if (!w.drill_ids || w.drill_ids.length === 0) {
        emptyCount++;
      } else {
        populatedCount++;
      }
    });

    console.log(`✅ Workouts with drill_ids: ${populatedCount}`);
    console.log(`❌ Workouts without drill_ids: ${emptyCount}`);
    console.log(`📊 Total workouts: ${allWorkouts?.length}`);

    // Check a specific workout with drill_ids
    const { data: populatedWorkout } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .not('drill_ids', 'is', null)
      .limit(1)
      .single();

    if (populatedWorkout && populatedWorkout.drill_ids?.length > 0) {
      console.log('\n🎯 Example populated workout:');
      console.log(`  Workout ID: ${populatedWorkout.id}`);
      console.log(`  Drill IDs: ${JSON.stringify(populatedWorkout.drill_ids)}`);
      
      // Fetch the actual drills to verify they exist
      const { data: drills } = await supabase
        .from('skills_academy_drills')
        .select('id, title, vimeo_id')
        .in('id', populatedWorkout.drill_ids);

      console.log(`\n  Connected Drills (${drills?.length || 0}):`);
      drills?.forEach(drill => {
        console.log(`    - Drill ${drill.id}: ${drill.title} (Vimeo: ${drill.vimeo_id})`);
      });
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the check
checkWorkoutStructure();