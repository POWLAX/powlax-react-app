#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample Vimeo IDs for testing
const sampleVimeoIds = [
  '824804225', // Real POWLAX video
  '824804226', 
  '824804227',
  '824804228',
  '824804229',
  '824804230',
  '824804231',
  '824804232',
];

async function populateDrillVideos() {
  console.log('📹 Populating Skills Academy drill videos...\n');
  
  try {
    // First, check the current state
    const { data: drills, error: fetchError } = await supabase
      .from('skills_academy_drills')
      .select('id, title, vimeo_id')
      .order('id');
    
    if (fetchError) {
      console.error('Error fetching drills:', fetchError);
      return;
    }
    
    console.log(`Found ${drills?.length || 0} drills`);
    
    // Count how many already have videos
    const withVideos = drills?.filter(d => d.vimeo_id)?.length || 0;
    console.log(`Currently ${withVideos} drills have videos\n`);
    
    // Update drills with sample Vimeo IDs
    let updated = 0;
    for (const drill of drills || []) {
      if (!drill.vimeo_id) {
        const vimeoId = sampleVimeoIds[updated % sampleVimeoIds.length];
        
        const { error: updateError } = await supabase
          .from('skills_academy_drills')
          .update({ vimeo_id: vimeoId })
          .eq('id', drill.id);
        
        if (updateError) {
          console.error(`Error updating drill ${drill.id}:`, updateError);
        } else {
          console.log(`✅ Updated drill ${drill.id}: "${drill.title}" with Vimeo ID: ${vimeoId}`);
          updated++;
        }
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updated} drills with video IDs`);
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('skills_academy_drills')
      .select('id, vimeo_id')
      .not('vimeo_id', 'is', null)
      .limit(5);
    
    if (!verifyError && verifyData) {
      console.log('\n📊 Sample of updated drills:');
      verifyData.forEach(d => {
        console.log(`  - Drill ${d.id}: Vimeo ID ${d.vimeo_id}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
populateDrillVideos();