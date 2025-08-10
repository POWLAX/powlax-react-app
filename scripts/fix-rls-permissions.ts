import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function fixRLSPermissions() {
  console.log('🔧 Fixing RLS permissions for Skills Academy tables...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' }
  });
  
  const tables = [
    'skills_academy_drills',
    'skills_academy_workouts',
    'skills_academy_series'
  ];
  
  for (const table of tables) {
    console.log(`📋 Processing table: ${table}`);
    
    try {
      // First, create a read policy
      const policyName = `allow_public_read_${table}`;
      const createPolicySQL = `
        CREATE POLICY IF NOT EXISTS "${policyName}"
        ON ${table}
        FOR SELECT
        USING (true);
      `;
      
      // Try to create the policy first
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: createPolicySQL
      }).single();
      
      if (policyError) {
        console.log(`  ⚠️ Could not create policy via RPC: ${policyError.message}`);
        
        // Try to disable RLS instead
        const disableRLSSQL = `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`;
        const { error: disableError } = await supabase.rpc('exec_sql', {
          sql: disableRLSSQL
        }).single();
        
        if (disableError) {
          console.log(`  ❌ Could not disable RLS: ${disableError.message}`);
        } else {
          console.log(`  ✅ RLS disabled successfully`);
        }
      } else {
        console.log(`  ✅ Read policy created successfully`);
      }
      
      // Test if anon can now read
      const anonSupabase = createClient(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await anonSupabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ Anon still cannot read: ${error.message}`);
      } else {
        console.log(`  ✅ Anon can now read the table!`);
      }
      
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('\n📝 If the above didn\'t work, please run this SQL in your Supabase dashboard:\n');
  console.log('-- Disable RLS on all Skills Academy tables');
  for (const table of tables) {
    console.log(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
  }
  console.log('\n-- OR create read policies:');
  for (const table of tables) {
    console.log(`CREATE POLICY "Allow public read" ON ${table} FOR SELECT USING (true);`);
  }
}

fixRLSPermissions().catch(console.error);