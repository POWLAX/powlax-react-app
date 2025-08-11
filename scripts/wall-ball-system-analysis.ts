import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeWallBallSystem() {
  console.log('🔍 WALL BALL SYSTEM ULTRA-THINK ANALYSIS');
  console.log('==========================================\n');
  
  // 1. Check skills_academy_workouts for wall ball content
  console.log('1. SKILLS ACADEMY WORKOUTS (Wall Ball):');
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .or('title.ilike.%wall ball%,description.ilike.%wall ball%,category.ilike.%wall ball%');
  
  console.log(`   Count: ${workouts?.length || 0}`);
  if (workoutsError) {
    console.log(`   Error: ${workoutsError.message}`);
  }
  if (workouts && workouts.length > 0) {
    console.log('   Sample records:');
    workouts.slice(0, 3).forEach((workout, i) => {
      console.log(`     ${i+1}. ID: ${workout.id}, Title: "${workout.title}"`);
      console.log(`        Category: ${workout.category}, Video: ${workout.video_url ? 'Yes' : 'No'}`);
    });
  }
  console.log('');
  
  // 2. Check wall_ball_drill_library
  console.log('2. WALL_BALL_DRILL_LIBRARY:');
  const { data: drillLibrary, error: drillError } = await supabase
    .from('wall_ball_drill_library')
    .select('*');
  
  console.log(`   Count: ${drillLibrary?.length || 0}`);
  if (drillError) {
    console.log(`   Error: ${drillError.message}`);
  }
  if (drillLibrary && drillLibrary.length > 0) {
    console.log('   Sample records:');
    drillLibrary.slice(0, 3).forEach((drill, i) => {
      console.log(`     ${i+1}. ID: ${drill.id}, Title: "${drill.title}"`);
    });
  }
  console.log('');
  
  // 3. Check wall_ball_workout_variants
  console.log('3. WALL_BALL_WORKOUT_VARIANTS:');
  const { data: variants, error: variantsError } = await supabase
    .from('wall_ball_workout_variants')
    .select('*');
  
  console.log(`   Count: ${variants?.length || 0}`);
  if (variantsError) {
    console.log(`   Error: ${variantsError.message}`);
  }
  if (variants && variants.length > 0) {
    console.log('   Sample records with drill_ids:');
    variants.slice(0, 3).forEach((variant, i) => {
      console.log(`     ${i+1}. ID: ${variant.id}, Title: "${variant.title}"`);
      console.log(`        Drill IDs: ${JSON.stringify(variant.drill_ids)}`);
      console.log(`        Video: ${variant.video_url ? 'Yes' : 'No'}`);
    });
  }
  console.log('');
  
  // 4. Check skills_academy_drills for wall ball content
  console.log('4. SKILLS_ACADEMY_DRILLS (Wall Ball):');
  const { data: skillsDrills, error: skillsDrillsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .or('title.ilike.%wall ball%,description.ilike.%wall ball%,category.ilike.%wall ball%');
  
  console.log(`   Count: ${skillsDrills?.length || 0}`);
  if (skillsDrillsError) {
    console.log(`   Error: ${skillsDrillsError.message}`);
  }
  if (skillsDrills && skillsDrills.length > 0) {
    console.log('   Sample records:');
    skillsDrills.slice(0, 3).forEach((drill, i) => {
      console.log(`     ${i+1}. ID: ${drill.id}, Title: "${drill.title}"`);
    });
  }
  console.log('');
  
  // 5. Check total counts for context
  console.log('5. TOTAL COUNTS FOR CONTEXT:');
  
  const { count: totalWorkouts } = await supabase
    .from('skills_academy_workouts')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalDrills } = await supabase
    .from('skills_academy_drills')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Total skills_academy_workouts: ${totalWorkouts || 0}`);
  console.log(`   Total skills_academy_drills: ${totalDrills || 0}`);
  console.log('');
  
  console.log('🎯 KEY FINDINGS SUMMARY:');
  console.log('========================');
  console.log(`• Wall ball workouts in skills_academy_workouts: ${workouts?.length || 0}`);
  console.log(`• Individual drills in wall_ball_drill_library: ${drillLibrary?.length || 0}`);
  console.log(`• Workout variants with drill_ids arrays: ${variants?.length || 0}`);
  console.log(`• Wall ball drills in skills_academy_drills: ${skillsDrills?.length || 0}`);
  
  if (variants && variants.length > 0) {
    const variantsWithDrills = variants.filter(v => v.drill_ids && v.drill_ids.length > 0);
    console.log(`• Variants with populated drill_ids: ${variantsWithDrills.length}/${variants.length}`);
  }
}

analyzeWallBallSystem().catch(console.error);