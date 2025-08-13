import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying Gamification Progress Tables Migration (103)\n');
  console.log('=' . repeat(50));

  try {
    // Read the migration file
    const migrationPath = resolve(__dirname, '../supabase/migrations/103_gamification_progress_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements (handling multi-line statements)
    const statements = migrationSQL
      .split(/;\s*$(?=\n)/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Get first line for logging
      const firstLine = statement.split('\n')[0].substring(0, 60);
      
      try {
        // Execute the statement using raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Try direct execution as fallback
          const { error: directError } = await supabase.from('_').select(statement);
          
          if (directError) {
            console.log(`❌ Statement ${i + 1}: ${firstLine}...`);
            console.log(`   Error: ${directError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1}: ${firstLine}...`);
            successCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1}: ${firstLine}...`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1}: ${firstLine}...`);
        console.log(`   Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '=' . repeat(50));
    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    // Verify the tables were created
    console.log('\n🔍 Verifying new tables...\n');

    const newTables = ['user_badge_progress', 'user_rank_progress', 'badge_series_mapping'];
    
    for (const tableName of newTables) {
      const { error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${tableName}: Created successfully (${count || 0} records)`);
      } else {
        console.log(`❌ ${tableName}: ${error.message}`);
      }
    }

    // Check badge-series mappings
    const { data: mappings, error: mappingError } = await supabase
      .from('badge_series_mapping')
      .select('*', { count: 'exact' });

    if (!mappingError && mappings) {
      console.log(`\n📊 Badge-Series Mappings: ${mappings.length} relationships created`);
      
      // Count by type
      const regular = mappings.filter(m => !m.is_combination_badge).length;
      const combination = mappings.filter(m => m.is_combination_badge).length;
      
      console.log(`   - Regular badges: ${regular}`);
      console.log(`   - Combination badges: ${combination}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('\n✅ Migration 103 completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration error:', error);
    process.exit(1);
  });