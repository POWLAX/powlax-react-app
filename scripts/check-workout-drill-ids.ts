import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkoutDrillIds() {
  console.log('🔍 Checking workout drill_ids field...\n');
  
  try {
    // Fetch first 5 workouts
    const { data: workouts, error } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_ids, drill_count')
      .order('id')
      .limit(5);
    
    if (error) {
      console.error('Error fetching workouts:', error);
      return;
    }
    
    console.log('Workouts in database:');
    workouts?.forEach((workout) => {
      console.log(`\nWorkout ${workout.id}: "${workout.workout_name}"`);
      console.log(`  drill_count: ${workout.drill_count}`);
      console.log(`  drill_ids: ${workout.drill_ids ? JSON.stringify(workout.drill_ids) : 'NULL'}`);
      console.log(`  Has drill_ids: ${workout.drill_ids && workout.drill_ids.length > 0 ? '✅ YES' : '❌ NO'}`);
    });
    
    // Count workouts with and without drill_ids
    const { data: allWorkouts } = await supabase
      .from('skills_academy_workouts')
      .select('drill_ids');
    
    const withDrillIds = allWorkouts?.filter((w) => w.drill_ids && w.drill_ids.length > 0).length || 0;
    const withoutDrillIds = (allWorkouts?.length || 0) - withDrillIds;
    
    console.log('\n📊 Summary:');
    console.log(`  Total workouts: ${allWorkouts?.length || 0}`);
    console.log(`  With drill_ids: ${withDrillIds}`);
    console.log(`  Without drill_ids: ${withoutDrillIds}`);
    
    if (withoutDrillIds > 0) {
      console.log('\n⚠️ WARNING: Some workouts are missing drill_ids!');
      console.log('This will cause the app to use fallback data instead of real videos.');
      
      // Try to populate the first workout if it's missing drill_ids
      if (workouts && workouts[0] && (!workouts[0].drill_ids || workouts[0].drill_ids.length === 0)) {
        console.log('\n🔧 Attempting to populate drill_ids for workout 1...');
        
        // Create drill_ids array based on drill_count
        const drillCount = workouts[0].drill_count || 5;
        const drillIds = Array.from({ length: drillCount }, (_, i) => i + 1);
        
        const { error: updateError } = await supabase
          .from('skills_academy_workouts')
          .update({ drill_ids: drillIds })
          .eq('id', workouts[0].id);
        
        if (updateError) {
          console.error('Failed to update drill_ids:', updateError);
        } else {
          console.log(`✅ Updated workout ${workouts[0].id} with drill_ids: [${drillIds.join(', ')}]`);
        }
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkWorkoutDrillIds();