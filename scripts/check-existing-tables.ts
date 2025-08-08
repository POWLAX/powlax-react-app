import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('Checking existing tables in Supabase...\n');

  try {
    // Query to get all table names
    const { data, error } = await supabase.rpc('get_table_names');
    
    if (error) {
      // Fallback: Try direct query
      const result = await supabase
        .from('powlax_skills_academy_workouts')
        .select('id')
        .limit(1);
      
      if (result.error) {
        console.log('Skills Academy Workouts table check:', result.error.message);
      } else {
        console.log('✓ powlax_skills_academy_workouts exists');
      }

      // Check each table individually
      const tablesToCheck = [
        'powlax_skills_academy_workouts',
        'powlax_skills_academy_drills',
        'powlax_skills_academy_questions',
        'powlax_skills_academy_answers',
        'powlax_wall_ball_drills',
        'powlax_wall_ball_workouts',
        'powlax_wall_ball_workout_drills',
        'powlax_workout_completions',
        'powlax_drill_completions',
        'powlax_user_favorite_workouts',
        'skills_academy_workouts',
        'skills_academy_drills',
        'wall_ball_drills',
        'wall_ball_workouts'
      ];

      console.log('\nChecking tables individually:');
      console.log('-'.repeat(50));
      
      for (const table of tablesToCheck) {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (tableError) {
          if (tableError.message.includes('does not exist')) {
            console.log(`✗ ${table} - Does not exist`);
          } else {
            console.log(`? ${table} - ${tableError.message}`);
          }
        } else {
          console.log(`✓ ${table} - Exists`);
        }
      }
    } else {
      console.log('Tables found via RPC:', data);
    }

    // Try to get table list using raw SQL
    const { data: sqlData, error: sqlError } = await supabase.rpc('sql', {
      query: `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (
          tablename LIKE 'powlax%' 
          OR tablename LIKE 'skills%' 
          OR tablename LIKE 'wall%'
        )
        ORDER BY tablename;
      `
    });

    if (!sqlError && sqlData) {
      console.log('\nTables matching our patterns:');
      console.log('-'.repeat(50));
      sqlData.forEach((row: any) => console.log(`- ${row.tablename}`));
    }

  } catch (err) {
    console.error('Error checking tables:', err);
  }
}

checkTables();