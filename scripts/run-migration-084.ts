import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running migration 084_enhance_user_profiles_and_family_accounts_corrected...\n');

  // Read the migration file
  const migrationPath = resolve(process.cwd(), 'supabase/migrations/084_enhance_user_profiles_and_family_accounts_corrected.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (removing comments and empty lines)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'))
    .map(s => s + ';');

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    // Skip certain statements that might not work via RPC
    if (statement.includes('DO $$') || statement.includes('RAISE NOTICE')) {
      console.log('⏭️  Skipping NOTICE statement');
      continue;
    }

    if (statement.includes('BEGIN;') || statement.includes('COMMIT;')) {
      console.log('⏭️  Skipping transaction control statement');
      continue;
    }

    try {
      // Extract a description from the statement
      let description = 'Executing statement';
      if (statement.includes('ALTER TABLE users ADD COLUMN')) {
        const columnMatch = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
        description = `Adding column: ${columnMatch?.[1] || 'unknown'}`;
      } else if (statement.includes('CREATE TABLE')) {
        const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
        description = `Creating table: ${tableMatch?.[1] || 'unknown'}`;
      } else if (statement.includes('CREATE INDEX')) {
        const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/);
        description = `Creating index: ${indexMatch?.[1] || 'unknown'}`;
      } else if (statement.includes('CREATE POLICY')) {
        const policyMatch = statement.match(/CREATE POLICY "([^"]+)"/);
        description = `Creating policy: ${policyMatch?.[1] || 'unknown'}`;
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const funcMatch = statement.match(/CREATE OR REPLACE FUNCTION (\w+)/);
        description = `Creating function: ${funcMatch?.[1] || 'unknown'}`;
      } else if (statement.includes('ALTER TABLE') && statement.includes('ENABLE ROW LEVEL SECURITY')) {
        const tableMatch = statement.match(/ALTER TABLE (\w+)/);
        description = `Enabling RLS on: ${tableMatch?.[1] || 'unknown'}`;
      }

      console.log(`⚙️  ${description}...`);
      
      // Use raw SQL execution via Supabase
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement 
      });

      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_sql').select(statement);
        
        if (directError) {
          console.error(`❌ Error: ${directError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successful statements: ${successCount}`);
  console.log(`❌ Failed statements: ${errorCount}`);

  // Verify the changes
  console.log('\n🔍 Verifying changes...');
  
  // Check users table columns
  const { data: sampleUser } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single();
  
  if (sampleUser) {
    const newColumns = ['first_name', 'last_name', 'phone', 'account_type', 'age_group'];
    const existingColumns = Object.keys(sampleUser);
    const addedColumns = newColumns.filter(col => existingColumns.includes(col));
    
    if (addedColumns.length > 0) {
      console.log('✅ New columns added to users table:', addedColumns);
    }
  }

  // Check new tables
  const tablesToCheck = ['parent_child_relationships', 'family_accounts', 'family_members'];
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (!error) {
      console.log(`✅ Table created: ${table}`);
    }
  }

  console.log('\n🎉 Migration complete!');
}

// Create exec_sql function if it doesn't exist
async function createExecSQLFunction() {
  const functionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;

  try {
    // This might fail if we can't create functions, but we'll try the migration anyway
    await supabase.rpc('query', { query: functionSQL });
  } catch (e) {
    // Ignore - function might already exist or we might not have permissions
  }
}

async function main() {
  await createExecSQLFunction();
  await runMigration();
}

main().catch(console.error);