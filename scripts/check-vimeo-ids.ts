#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVimeoIds() {
  console.log('🎥 Checking Vimeo ID format in database...\n');
  
  try {
    const { data: drills, error } = await supabase
      .from('skills_academy_drills')
      .select('id, title, vimeo_id')
      .limit(10);
    
    if (error) {
      console.error('Error fetching drills:', error);
      return;
    }
    
    console.log('Sample drills with vimeo_id:');
    drills?.forEach(drill => {
      console.log(`  - Drill ${drill.id}: "${drill.title}" → vimeo_id: "${drill.vimeo_id}"`);
    });
    
    // Check a specific workout's drills
    console.log('\n🏃 Checking workout 1 drills...');
    const { data: workout, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_ids')
      .eq('id', 1)
      .single();
    
    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return;
    }
    
    console.log(`Workout 1: "${workout.workout_name}"`);
    console.log(`Drill IDs: [${workout.drill_ids?.join(', ')}]`);
    
    if (workout.drill_ids?.length) {
      const { data: workoutDrills } = await supabase
        .from('skills_academy_drills')
        .select('id, title, vimeo_id')
        .in('id', workout.drill_ids.slice(0, 3));
      
      console.log('\nFirst 3 drills in workout:');
      workoutDrills?.forEach(drill => {
        console.log(`  - Drill ${drill.id}: "${drill.title}" → vimeo_id: "${drill.vimeo_id}"`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkVimeoIds();