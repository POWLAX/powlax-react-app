#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVideoUrls() {
  console.log('🔗 Checking video_url field in skills_academy_drills...\n');
  
  try {
    const { data: drills, error } = await supabase
      .from('skills_academy_drills')
      .select('id, title, video_url, vimeo_id')
      .limit(10);
    
    if (error) {
      console.error('Error fetching drills:', error);
      return;
    }
    
    console.log('Sample drills with video data:');
    drills?.forEach(drill => {
      console.log(`  - Drill ${drill.id}: "${drill.title}"`);
      console.log(`    video_url: ${drill.video_url || 'NULL'}`);
      console.log(`    vimeo_id: ${drill.vimeo_id || 'NULL'}`);
      console.log('');
    });
    
    // Check workout 1 specifically
    console.log('🏃 Checking workout 1 drill data...');
    const { data: workout } = await supabase
      .from('skills_academy_workouts')
      .select('drill_ids')
      .eq('id', 1)
      .single();
    
    if (workout?.drill_ids?.length) {
      const { data: workoutDrills } = await supabase
        .from('skills_academy_drills')
        .select('id, title, video_url, vimeo_id')
        .in('id', workout.drill_ids.slice(0, 3));
      
      console.log('\nFirst 3 drills in workout 1:');
      workoutDrills?.forEach(drill => {
        console.log(`  - Drill ${drill.id}: "${drill.title}"`);
        console.log(`    video_url: ${drill.video_url || 'NULL'}`);
        console.log(`    vimeo_id: ${drill.vimeo_id || 'NULL'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkVideoUrls();