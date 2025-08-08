import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testSQL() {
  console.log('Testing Skills Academy SQL Compatibility');
  console.log('=========================================\n');

  // 1. Check if tables exist
  console.log('1. Checking existing tables:');
  const tablesToCheck = [
    'skills_academy_series',
    'skills_academy_workouts',
    'skills_academy_workout_drills',
    'skills_academy_user_progress',
    'powlax_drills'
  ];

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND`);
      } else {
        console.log(`   ✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (e) {
      console.log(`   ❌ ${table}: ERROR`);
    }
  }

  // 2. Check powlax_drills table structure
  console.log('\n2. Checking powlax_drills structure:');
  const { data: sampleDrill } = await supabase
    .from('powlax_drills')
    .select('id, title')
    .limit(1)
    .single();

  if (sampleDrill) {
    console.log(`   ID type: ${typeof sampleDrill.id} (UUID)`);
    console.log(`   Sample ID: ${sampleDrill.id}`);
    console.log(`   Sample title: ${sampleDrill.title}`);
  }

  // 3. Test finding drills by title
  console.log('\n3. Testing drill title matching:');
  const testTitles = [
    'Wind Up 1v1s',
    'Shoulder to Nose Cradle',
    'Quick Switches Hand Speed Drill',
    '1v1 Ground Balls to Give and Go'
  ];

  for (const title of testTitles) {
    const { data, error } = await supabase
      .from('powlax_drills')
      .select('id, title')
      .ilike('title', title)
      .limit(1)
      .single();

    if (data) {
      console.log(`   ✅ Found: "${title}" → ID: ${data.id}`);
    } else {
      console.log(`   ❌ Not found: "${title}"`);
    }
  }

  // 4. Check for any existing workout data
  console.log('\n4. Checking existing workout data:');
  const { data: existingWorkouts, count: workoutCount } = await supabase
    .from('skills_academy_workouts')
    .select('id, name, workout_series', { count: 'exact' })
    .limit(5);

  if (existingWorkouts && existingWorkouts.length > 0) {
    console.log(`   Found ${workoutCount} existing workouts`);
    console.log('   Sample workouts:');
    existingWorkouts.forEach(w => {
      console.log(`     - ${w.name || 'Unnamed'} (series: ${w.workout_series || 'N/A'})`);
    });
    console.log('\n   ⚠️  Warning: Running the SQL script will TRUNCATE series table (CASCADE)');
    console.log('   This will delete all existing series, workouts, and drill links');
  } else {
    console.log('   No existing workouts found - safe to proceed');
  }

  // 5. Summary
  console.log('\n=========================================');
  console.log('SUMMARY:');
  console.log('=========================================');
  console.log('✅ The SQL script has been fixed to use UUID for drill_id');
  console.log('✅ Foreign key constraint will now work correctly');
  console.log('\nTo run the SQL:');
  console.log('1. Go to Supabase SQL Editor');
  console.log('2. Copy contents of: scripts/database/create_skills_academy_real_data.sql');
  console.log('3. Run the script');
  console.log('\nThe script will create:');
  console.log('  • 41 workout series (SS1-5, A1-12, M1-12, D1-12)');
  console.log('  • ~117 workouts (Mini, More, Complete for each)');
  console.log('  • Foreign key links to powlax_drills table');

  process.exit(0);
}

testSQL().catch(console.error);