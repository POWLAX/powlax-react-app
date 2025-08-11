import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false
    }
  }
);

async function runMigration() {
  console.log('🚀 Creating POWLAX Gamification Tables...\n');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/090_create_gamification_tables_properly.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Remove BEGIN/COMMIT and split into individual statements
    const statements = sqlContent
      .replace(/BEGIN;/gi, '')
      .replace(/COMMIT;/gi, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;
      
      // Get a description of what we're doing
      let description = 'Executing statement';
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (match) description = `Creating table: ${match[1]}`;
      } else if (statement.includes('INSERT INTO')) {
        const match = statement.match(/INSERT INTO (\w+)/i);
        if (match) description = `Inserting data into: ${match[1]}`;
      } else if (statement.includes('CREATE INDEX')) {
        const match = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
        if (match) description = `Creating index: ${match[1]}`;
      } else if (statement.includes('CREATE POLICY')) {
        const match = statement.match(/CREATE POLICY "([^"]+)"/i);
        if (match) description = `Creating policy: ${match[1]}`;
      }
      
      try {
        // Execute the SQL statement using RPC
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        }).single();
        
        if (error) {
          // Try a different approach - direct execution
          const { data, error: directError } = await (supabase as any).sql`${statement}`;
          
          if (directError) {
            console.error(`❌ ${description}`);
            console.error(`   Error: ${directError.message}`);
            errorCount++;
          } else {
            console.log(`✅ ${description}`);
            successCount++;
          }
        } else {
          console.log(`✅ ${description}`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ ${description}`);
        console.error(`   Error: ${err.message || err}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Migration Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');
    
    // Verify the tables were created
    console.log('Verifying tables...\n');
    
    // Check badges_powlax
    const { count: badgeCount, error: badgeError } = await supabase
      .from('badges_powlax')
      .select('*', { count: 'exact', head: true });
    
    if (!badgeError) {
      console.log(`✅ badges_powlax table exists with ${badgeCount} records`);
    } else {
      console.log(`❌ badges_powlax table check failed: ${badgeError.message}`);
    }
    
    // Check powlax_player_ranks
    const { count: rankCount, error: rankError } = await supabase
      .from('powlax_player_ranks')
      .select('*', { count: 'exact', head: true });
    
    if (!rankError) {
      console.log(`✅ powlax_player_ranks table exists with ${rankCount} records`);
    } else {
      console.log(`❌ powlax_player_ranks table check failed: ${rankError.message}`);
    }
    
    console.log('\n🎉 Migration complete!');
    
  } catch (error: any) {
    console.error('Migration failed:', error.message || error);
    process.exit(1);
  }
}

// Note: exec_sql RPC function needs to exist in Supabase
// If it doesn't exist, we'll need to create the tables manually or use a different approach

runMigration().catch(console.error);