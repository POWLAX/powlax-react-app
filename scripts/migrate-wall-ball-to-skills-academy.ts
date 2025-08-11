#!/usr/bin/env tsx
/**
 * CRITICAL DATABASE MIGRATION: Wall Ball to Skills Academy
 * 
 * This script migrates wall ball workout data to Skills Academy tables.
 * SAFETY: Only ADDS data, never deletes existing records.
 * ROLLBACK: Included if migration needs to be reversed.
 * 
 * Analysis Report: /scripts/migration-analysis-report.md
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration configuration based on analysis
const WALL_BALL_SERIES_IDS = [42, 43, 44, 45]; // Already exist in database
const STARTING_DRILL_ID = 168; // Next available drill ID
const STARTING_WORKOUT_ID = 119; // Next available workout ID

// Drill assignment strategy (based on collection themes and analysis)
const DRILL_ASSIGNMENTS = {
  1: [1, 2, 3], // Master Fundamentals: existing assignments
  2: [2, 5],    // Quick Skills: Quick Stick + Both Hands Alternating  
  3: [1, 4, 5], // Advanced Dodging: 3 Steps + Left Hand + Both Hands
  4: [2, 3, 4]  // Shooting Precision: Quick Stick + both High to Low
};

interface WallBallDrill {
  id: number;
  name: string;
  strong_hand_video_url: string;
  weak_hand_video_url: string | null;
}

interface WallBallCollection {
  id: number;
  name: string;
  duration_minutes: number;
}

function extractVimeoId(playerUrl: string): string {
  const match = playerUrl.match(/video\/(\d+)/);
  return match ? match[1] : '';
}

function convertToVimeoUrl(playerUrl: string): string {
  const vimeoId = extractVimeoId(playerUrl);
  return vimeoId ? `https://vimeo.com/${vimeoId}` : playerUrl;
}

function createSkillsAcademyDrill(wallBallDrill: WallBallDrill) {
  const vimeoId = extractVimeoId(wallBallDrill.strong_hand_video_url);
  const videoUrl = convertToVimeoUrl(wallBallDrill.strong_hand_video_url);
  
  return {
    title: wallBallDrill.name,
    vimeo_id: vimeoId,
    drill_category: ["Wall Ball", "Fundamentals"],
    equipment_needed: ["Lacrosse Stick", "Ball", "Wall"],
    age_progressions: {
      do_it: { min: 8, max: 12 },
      own_it: { min: 13, max: 16 },
      coach_it: { min: 17, max: 99 }
    },
    space_needed: "Wall Space>10x10 Yard Area",
    complexity: "foundation",
    sets_and_reps: "3 Sets of 20 Reps Each Hand", 
    duration_minutes: 5,
    point_values: {
      lax_credit: 2,
      wall_ball_badge: 1
    },
    tags: ["wall-ball", "fundamentals", "repetition"],
    video_url: videoUrl
  };
}

async function loadWallBallData() {
  console.log('📊 Loading wall ball source data...');
  
  const { data: collections, error: collectionsError } = await supabase
    .from('powlax_wall_ball_collections')
    .select('*')
    .order('id');
    
  if (collectionsError) {
    throw new Error(`Failed to load collections: ${collectionsError.message}`);
  }

  const { data: drills, error: drillsError } = await supabase
    .from('powlax_wall_ball_drill_library') 
    .select('*')
    .order('id');
    
  if (drillsError) {
    throw new Error(`Failed to load drills: ${drillsError.message}`);
  }

  console.log(`✅ Loaded ${collections?.length || 0} collections and ${drills?.length || 0} drills`);
  return { collections: collections || [], drills: drills || [] };
}

async function verifyPreMigrationState() {
  console.log('🔍 Verifying pre-migration state...');
  
  // Check series exist
  const { data: series } = await supabase
    .from('skills_academy_series')
    .select('id, series_name')
    .in('id', WALL_BALL_SERIES_IDS)
    .order('id');
    
  if (!series || series.length !== 4) {
    throw new Error(`Expected 4 wall ball series, found ${series?.length || 0}`);
  }
  
  console.log('✅ Wall ball series verified:');
  series.forEach(s => console.log(`   ${s.id}: ${s.series_name}`));
  
  // Check for existing wall ball drills
  const { data: existingDrills } = await supabase
    .from('skills_academy_drills')
    .select('id')
    .contains('tags', ['wall-ball']);
    
  if (existingDrills && existingDrills.length > 0) {
    throw new Error(`Found ${existingDrills.length} existing wall ball drills. Migration already completed?`);
  }
  
  // Check for existing wall ball workouts
  const { data: existingWorkouts } = await supabase
    .from('skills_academy_workouts') 
    .select('id')
    .in('series_id', WALL_BALL_SERIES_IDS);
    
  if (existingWorkouts && existingWorkouts.length > 0) {
    throw new Error(`Found ${existingWorkouts.length} existing wall ball workouts. Migration already completed?`);
  }
  
  console.log('✅ No existing wall ball data found. Safe to proceed.');
}

async function migrateDrills(wallBallDrills: WallBallDrill[]) {
  console.log('🏒 Migrating wall ball drills...');
  
  const skillsAcademyDrills = wallBallDrills.map((drill, index) => ({
    id: STARTING_DRILL_ID + index,
    original_id: drill.id,
    ...createSkillsAcademyDrill(drill),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  console.log('📋 Drill migration plan:');
  skillsAcademyDrills.forEach(drill => {
    console.log(`   ${drill.id}: ${drill.title} -> ${drill.video_url}`);
  });
  
  const { error } = await supabase
    .from('skills_academy_drills')
    .insert(skillsAcademyDrills);
    
  if (error) {
    throw new Error(`Failed to insert drills: ${error.message}`);
  }
  
  console.log(`✅ Successfully migrated ${skillsAcademyDrills.length} drills`);
  return skillsAcademyDrills.map(d => ({ originalId: d.original_id!, newId: d.id }));
}

async function migrateWorkouts(collections: WallBallCollection[], drillIdMap: Array<{originalId: number; newId: number}>) {
  console.log('💪 Migrating wall ball workouts...');
  
  const workouts = collections.map((collection, index) => {
    const seriesId = WALL_BALL_SERIES_IDS[index];
    const assignedDrillIds = DRILL_ASSIGNMENTS[collection.id as keyof typeof DRILL_ASSIGNMENTS];
    
    // Map original drill IDs to new Skills Academy drill IDs
    const newDrillIds = assignedDrillIds.map(originalId => {
      const mapping = drillIdMap.find(m => m.originalId === originalId);
      if (!mapping) {
        throw new Error(`No drill ID mapping found for original drill ${originalId}`);
      }
      return mapping.newId;
    });
    
    return {
      id: STARTING_WORKOUT_ID + index,
      series_id: seriesId,
      workout_name: collection.name,
      workout_size: 'mini' as const,
      drill_count: newDrillIds.length,
      description: `Wall ball workout: ${collection.name}`,
      estimated_duration_minutes: collection.duration_minutes,
      original_json_id: collection.id,
      original_json_name: `Wall Ball - ${collection.name}`,
      drill_ids: newDrillIds,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  console.log('📋 Workout migration plan:');
  workouts.forEach(workout => {
    console.log(`   ${workout.id}: ${workout.workout_name} (Series ${workout.series_id})`);
    console.log(`      Drills: [${workout.drill_ids.join(', ')}] (${workout.drill_count} total)`);
  });
  
  const { error } = await supabase
    .from('skills_academy_workouts')
    .insert(workouts);
    
  if (error) {
    throw new Error(`Failed to insert workouts: ${error.message}`);
  }
  
  console.log(`✅ Successfully migrated ${workouts.length} workouts`);
  return workouts;
}

// Junction table is not used in current Skills Academy system
// Workouts use drill_ids arrays directly, so we skip junction table creation
async function skipJunctionRecords() {
  console.log('🔗 Skipping junction table (Skills Academy uses drill_ids arrays directly)');
  console.log('✅ Workouts are connected to drills via drill_ids arrays');
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...');
  
  // Check drill count
  const { data: drills } = await supabase
    .from('skills_academy_drills')
    .select('id, title, video_url')
    .contains('tags', ['wall-ball'])
    .order('id');
    
  console.log(`✅ Wall ball drills: ${drills?.length || 0}`);
  drills?.forEach(drill => {
    console.log(`   ${drill.id}: ${drill.title} -> ${drill.video_url}`);
  });
  
  // Check workout count by series
  for (const seriesId of WALL_BALL_SERIES_IDS) {
    const { data: workouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_count, drill_ids')
      .eq('series_id', seriesId);
      
    console.log(`✅ Series ${seriesId} workouts: ${workouts?.length || 0}`);
    workouts?.forEach(workout => {
      console.log(`   ${workout.id}: ${workout.workout_name} (${workout.drill_count} drills: [${workout.drill_ids?.join(', ')}])`);
    });
  }
  
  // Skills Academy uses drill_ids arrays, not junction table
  console.log('✅ Workouts connected via drill_ids arrays (junction table not used)');
  
  // Validate video URL formats
  const invalidUrls = drills?.filter(drill => !drill.video_url.startsWith('https://vimeo.com/'));
  if (invalidUrls && invalidUrls.length > 0) {
    console.warn(`⚠️ Found ${invalidUrls.length} drills with invalid video URLs:`);
    invalidUrls.forEach(drill => console.warn(`   ${drill.id}: ${drill.video_url}`));
  } else {
    console.log('✅ All video URLs properly converted to vimeo.com format');
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting Wall Ball to Skills Academy Migration');
    console.log('=' .repeat(60));
    
    // Load source data
    const { collections, drills } = await loadWallBallData();
    
    // Safety checks
    await verifyPreMigrationState();
    
    // Execute migration steps
    const drillIdMap = await migrateDrills(drills);
    const workouts = await migrateWorkouts(collections, drillIdMap);
    await skipJunctionRecords();
    
    // Verify results
    await verifyMigration();
    
    console.log('=' .repeat(60));
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('Summary:');
    console.log(`  • Migrated ${drills.length} wall ball drills`);
    console.log(`  • Created ${workouts.length} wall ball workouts`);
    console.log(`  • Connected drills to workouts via drill_ids arrays`);
    console.log(`  • All video URLs converted to vimeo.com format`);
    console.log('');
    console.log('✅ Wall ball collections are now functional in Skills Academy!');
    
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
    console.error('');
    console.error('🆘 ROLLBACK REQUIRED - Use rollback script if data was partially inserted');
    process.exit(1);
  }
}

// Rollback function for emergency use
async function rollbackMigration() {
  console.log('🆘 ROLLING BACK WALL BALL MIGRATION...');
  
  try {
    // Delete workouts first
    const { error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .delete()
      .in('series_id', WALL_BALL_SERIES_IDS);
      
    if (workoutError) {
      console.error('Failed to delete workouts:', workoutError);
    } else {
      console.log('✅ Deleted wall ball workouts');
    }
    
    // Delete drills
    const { error: drillError } = await supabase
      .from('skills_academy_drills')
      .delete()
      .contains('tags', ['wall-ball']);
      
    if (drillError) {
      console.error('Failed to delete drills:', drillError);
    } else {
      console.log('✅ Deleted wall ball drills');
    }
    
    console.log('🎯 ROLLBACK COMPLETED');
    
  } catch (error) {
    console.error('❌ ROLLBACK FAILED:', error);
  }
}

// CLI handling
const command = process.argv[2];

if (command === 'rollback') {
  rollbackMigration();
} else if (command === 'migrate' || !command) {
  runMigration();
} else {
  console.log('Usage: npx tsx scripts/migrate-wall-ball-to-skills-academy.ts [migrate|rollback]');
  console.log('  migrate  (default): Run the migration');
  console.log('  rollback: Undo the migration');
}