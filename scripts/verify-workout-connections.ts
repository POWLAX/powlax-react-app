#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyWorkoutConnections() {
  console.log('🔗 Verifying workout-drill connections...\n');
  
  try {
    // Test workout ID 1 (same as the component tests)
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .eq('id', 1)
      .single();

    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return;
    }

    console.log(`✅ Found workout: "${workout.workout_name}"`);
    console.log(`   - ID: ${workout.id}`);
    console.log(`   - Drill count: ${workout.drill_count}`);
    console.log(`   - Drill IDs array: ${workout.drill_ids ? `[${workout.drill_ids.slice(0, 3).join(', ')}...]` : 'NULL'}`);

    if (!workout.drill_ids || workout.drill_ids.length === 0) {
      console.log('❌ No drill_ids found in workout');
      return;
    }

    // Test fetching drills using drill_ids
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_drills')
      .select('id, title, vimeo_id')
      .in('id', workout.drill_ids.slice(0, 3)); // Test first 3 drills

    if (drillsError) {
      console.error('Error fetching drills:', drillsError);
      return;
    }

    console.log(`\n🎯 Successfully fetched ${drills?.length || 0} drills:`);
    drills?.forEach((drill, index) => {
      console.log(`   ${index + 1}. "${drill.title}"`);
      console.log(`      - ID: ${drill.id}`);
      console.log(`      - Vimeo ID: ${drill.vimeo_id || 'MISSING'}`);
    });

    // Test the complete flow as useWorkoutSession would do it
    console.log(`\n🧪 Testing complete workflow as useWorkoutSession would:`);
    
    if (workout?.drill_ids && workout.drill_ids.length > 0) {
      console.log(`   ✅ Workout has ${workout.drill_ids.length} drill IDs`);
      
      const { data: allDrills } = await supabase
        .from('skills_academy_drills')
        .select('*')
        .in('id', workout.drill_ids);
      
      console.log(`   ✅ Found ${allDrills?.length || 0} drill records`);
      
      if (allDrills && allDrills.length > 0) {
        console.log(`   ✅ Sample drill data for video extraction:`);
        const sampleDrill = allDrills[0];
        console.log(`      - title: ${sampleDrill.title}`);
        console.log(`      - vimeo_id: ${sampleDrill.vimeo_id}`);
        
        // Test the extractVimeoId logic
        if (sampleDrill.vimeo_id) {
          console.log(`   ✅ Video iframe would be: https://player.vimeo.com/video/${sampleDrill.vimeo_id}`);
        } else {
          console.log(`   ❌ No vimeo_id found in drill`);
        }
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
verifyWorkoutConnections();