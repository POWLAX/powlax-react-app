#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugWorkoutFetch() {
  console.log('🔍 Debugging workout 1 fetch...\n');
  
  try {
    // Fetch workout 1
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return;
    }
    
    console.log('Workout 1 data:');
    console.log('  ID:', workout.id);
    console.log('  Name:', workout.workout_name);
    console.log('  Drill IDs:', workout.drill_ids);
    
    if (workout?.drill_ids && workout.drill_ids.length > 0) {
      console.log(`\n✅ Workout has ${workout.drill_ids.length} drill IDs: [${workout.drill_ids.join(', ')}]`);
      
      // Fetch drills using the drill_ids array
      const { data: drills, error: drillsError } = await supabase
        .from('skills_academy_drills')
        .select('id, title, video_url, vimeo_id')
        .in('id', workout.drill_ids);
      
      if (drillsError) {
        console.error('\n❌ Error fetching drills:', drillsError);
      } else if (drills && drills.length > 0) {
        console.log(`\n✅ Found ${drills.length} drill records in database`);
        
        console.log('\nDrills data:');
        drills.forEach(drill => {
          console.log(`  Drill ${drill.id}: "${drill.title}"`);
          console.log(`    video_url: ${drill.video_url}`);
          console.log(`    vimeo_id: ${drill.vimeo_id}`);
        });
        
        // Check if drills are in the correct order
        const orderedDrills = workout.drill_ids.map(id => drills.find(d => d.id === id));
        console.log('\nOrdered drills (as they should appear in workout):');
        orderedDrills.forEach((drill, index) => {
          if (drill) {
            console.log(`  ${index + 1}. ${drill.title} (ID: ${drill.id})`);
          } else {
            console.log(`  ${index + 1}. NOT FOUND (ID: ${workout.drill_ids[index]})`);
          }
        });
      } else {
        console.log('\n⚠️ No drills found in database');
      }
    } else {
      console.log('\n⚠️ Workout has no drill_ids populated');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugWorkoutFetch();