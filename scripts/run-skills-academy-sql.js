const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, 'database', 'create_skills_academy_real_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip pure comment lines
      if (statement.trim().startsWith('--')) continue;
      
      // Get the first few words of the statement for logging
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        // For now, we'll execute directly against the database
        // Note: Supabase doesn't have a direct SQL execution method,
        // so we'll need to use the migration approach
        console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
        
        // This is a placeholder - in production, you'd run this as a migration
        successCount++;
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nExecution complete:`);
    console.log(`✅ Success: ${successCount} statements`);
    console.log(`❌ Errors: ${errorCount} statements`);
    
    // Check if tables were created
    console.log('\nChecking tables...');
    
    const { data: series, error: seriesError } = await supabase
      .from('skills_academy_series')
      .select('count', { count: 'exact', head: true });
    
    if (!seriesError) {
      console.log('✅ skills_academy_series table exists');
    } else {
      console.log('❌ skills_academy_series table not found:', seriesError.message);
    }
    
    const { data: workouts, error: workoutsError } = await supabase
      .from('skills_academy_workouts')
      .select('count', { count: 'exact', head: true });
    
    if (!workoutsError) {
      console.log('✅ skills_academy_workouts table exists');
    } else {
      console.log('❌ skills_academy_workouts table not found:', workoutsError.message);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

console.log('Skills Academy SQL Runner');
console.log('=========================\n');
console.log('Note: This script shows what would be executed.');
console.log('To actually run the SQL, you need to:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Paste the contents of scripts/database/create_skills_academy_real_data.sql');
console.log('4. Click "Run"\n');
console.log('Checking if tables already exist...\n');

runSQL();