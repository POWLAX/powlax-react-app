import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Workout {
  id: number;
  series_id: number;
  workout_size: string;
  series: {
    series_type: string;
  };
}

interface Drill {
  id: number;
  title: string;
  category: string;
  difficulty: number;
  vimeo_id: string;
}

async function populateWorkoutDrillsJunction() {
  console.log('🚀 Starting workout-drills junction table population...');

  try {
    // First, clear existing data in junction table
    console.log('🧹 Clearing existing junction table data...');
    const { error: clearError } = await supabase
      .from('skills_academy_workout_drills')
      .delete()
      .neq('id', 0);

    if (clearError) {
      console.error('❌ Error clearing junction table:', clearError);
      return;
    }

    // Fetch all workouts with their series information
    console.log('📚 Fetching workouts...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('skills_academy_workouts')
      .select(`
        id,
        series_id,
        workout_size,
        skills_academy_series!inner (
          series_type
        )
      `);

    if (workoutsError || !workouts) {
      console.error('❌ Error fetching workouts:', workoutsError);
      return;
    }

    // Fetch all drills
    console.log('🎯 Fetching drills...');
    const { data: drills, error: drillsError } = await supabase
      .from('skills_academy_drills')
      .select('*');

    if (drillsError || !drills) {
      console.error('❌ Error fetching drills:', drillsError);
      return;
    }

    console.log(`📊 Found ${workouts.length} workouts and ${drills.length} drills`);

    // Create mapping logic
    const junctionRecords = [];

    for (const workout of workouts) {
      const seriesType = workout.skills_academy_series.series_type;
      const workoutSize = workout.workout_size;

      // Determine drill count based on workout size
      let drillCount;
      switch (workoutSize) {
        case 'mini':
          drillCount = 5;
          break;
        case 'more':
          drillCount = 8;
          break;
        case 'complete':
          drillCount = 12;
          break;
        default:
          drillCount = 6;
      }

      // Filter drills based on series type
      let suitableDrills = drills.filter(drill => {
        const category = drill.category?.toLowerCase() || '';
        const title = drill.title?.toLowerCase() || '';

        switch (seriesType) {
          case 'solid_start':
            // For solid start, include basic drills from all categories
            return drill.difficulty <= 2;
          
          case 'attack':
            return category.includes('shoot') || 
                   category.includes('attack') || 
                   title.includes('shoot') || 
                   title.includes('score') ||
                   title.includes('dodge');
          
          case 'midfield':
            return category.includes('pass') || 
                   category.includes('midfield') || 
                   category.includes('ground') ||
                   title.includes('pass') ||
                   title.includes('transition') ||
                   title.includes('ground');
          
          case 'defense':
            return category.includes('defense') || 
                   category.includes('check') || 
                   title.includes('defense') ||
                   title.includes('check') ||
                   title.includes('clear');
          
          default:
            return true;
        }
      });

      // If not enough suitable drills, include more general ones
      if (suitableDrills.length < drillCount) {
        const generalDrills = drills.filter(drill => 
          !suitableDrills.includes(drill) && drill.difficulty <= 3
        );
        suitableDrills = [...suitableDrills, ...generalDrills];
      }

      // Randomize and select the required number of drills
      const selectedDrills = suitableDrills
        .sort(() => 0.5 - Math.random())
        .slice(0, drillCount);

      // Create junction records
      selectedDrills.forEach((drill, index) => {
        junctionRecords.push({
          workout_id: workout.id,
          drill_id: drill.id,
          order_position: index + 1,
          duration_seconds: workoutSize === 'mini' ? 30 : workoutSize === 'more' ? 45 : 60
        });
      });

      console.log(`✅ Mapped ${selectedDrills.length} drills to workout ${workout.id} (${seriesType} - ${workoutSize})`);
    }

    // Insert all junction records in batches
    console.log(`💾 Inserting ${junctionRecords.length} junction records...`);
    
    const batchSize = 100;
    for (let i = 0; i < junctionRecords.length; i += batchSize) {
      const batch = junctionRecords.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('skills_academy_workout_drills')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        return;
      }

      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(junctionRecords.length / batchSize)}`);
    }

    // Verify the population
    console.log('🔍 Verifying population...');
    const { data: verification, error: verifyError } = await supabase
      .from('skills_academy_workout_drills')
      .select('*', { count: 'exact' });

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }

    console.log(`🎉 SUCCESS! Populated ${verification?.length || 0} workout-drill connections`);

    // Show sample data
    const { data: sample } = await supabase
      .from('skills_academy_workout_drills')
      .select(`
        workout_id,
        drill_id,
        order_position,
        skills_academy_workouts (id, workout_size),
        skills_academy_drills (id, title)
      `)
      .limit(5);

    console.log('📋 Sample connections:', JSON.stringify(sample, null, 2));

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the population script
populateWorkoutDrillsJunction();