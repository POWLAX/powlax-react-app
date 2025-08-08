import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkData() {
  // Check existing workouts
  const { data: workouts, error } = await supabase
    .from('skills_academy_workouts')
    .select('id, name, workout_series, series_number, workout_size')
    .order('name');
  
  console.log('Current skills_academy_workouts (192 rows):');
  console.log('==========================================');
  
  // Group by series
  const grouped: Record<string, string[]> = {};
  workouts?.forEach(w => {
    const series = w.workout_series || 'Unknown';
    if (!grouped[series]) {
      grouped[series] = [];
    }
    grouped[series].push(`  - ${w.name}`);
  });
  
  Object.keys(grouped).sort().forEach(series => {
    console.log(`\n${series}:`);
    grouped[series].slice(0, 5).forEach(name => console.log(name));
    if (grouped[series].length > 5) {
      console.log(`  ... and ${grouped[series].length - 5} more`);
    }
  });
  
  // Check powlax_drills table
  console.log('\n\nChecking powlax_drills table:');
  console.log('==========================================');
  const { count: drillCount } = await supabase
    .from('powlax_drills')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total drills in powlax_drills: ${drillCount}`);
  
  // Sample some drills
  const { data: sampleDrills } = await supabase
    .from('powlax_drills')
    .select('id, title, drill_category, vimeo_url')
    .limit(10);
  
  console.log('\nSample drills from powlax_drills:');
  sampleDrills?.forEach(d => {
    console.log(`  - ${d.title} (category: ${d.drill_category || 'none'}, has video: ${!!d.vimeo_url})`);
  });
  
  process.exit(0);
}

checkData().catch(console.error);