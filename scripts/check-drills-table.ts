import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDrillsTable() {
  console.log('Checking skills_academy_drills table structure...\n');

  // Get column info
  const { data: columns, error: columnsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(1);

  if (columnsError) {
    console.error('Error:', columnsError);
    return;
  }

  if (columns && columns.length > 0) {
    console.log('Columns in skills_academy_drills:');
    console.log('-'.repeat(50));
    Object.keys(columns[0]).forEach(col => {
      const value = columns[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`- ${col}: ${type}`);
    });
  }

  // Count records
  const { count } = await supabase
    .from('skills_academy_drills')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal drills in table: ${count || 0}`);

  // Get sample drill titles
  const { data: samples } = await supabase
    .from('skills_academy_drills')
    .select('id, title')
    .limit(5);

  if (samples && samples.length > 0) {
    console.log('\nSample drill titles:');
    console.log('-'.repeat(50));
    samples.forEach(s => {
      console.log(`- [${s.id}] ${s.title}`);
    });
  }
}

checkDrillsTable();