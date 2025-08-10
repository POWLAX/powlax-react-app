import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies for skills_academy_drills...\n');
  
  try {
    // Check with service role (bypasses RLS)
    const { data: serviceData, error: serviceError } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .in('id', [1, 2, 3, 4, 5]);
    
    console.log('✅ Service role query (bypasses RLS):');
    console.log(`  Found ${serviceData?.length || 0} drills`);
    if (serviceData && serviceData.length > 0) {
      console.log('  First drill:', serviceData[0]);
    }
    
    // Now check with anon key (subject to RLS)
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: anonData, error: anonError } = await anonSupabase
      .from('skills_academy_drills')
      .select('id, title')
      .in('id', [1, 2, 3, 4, 5]);
    
    console.log('\n🔐 Anon role query (subject to RLS):');
    console.log(`  Found ${anonData?.length || 0} drills`);
    if (anonError) {
      console.log('  Error:', anonError);
    }
    
    const serviceCount = serviceData?.length || 0;
    const anonCount = anonData?.length || 0;
    
    if (serviceCount > 0 && anonCount === 0) {
      console.log('\n⚠️ WARNING: RLS is blocking access to skills_academy_drills!');
      console.log('The table has data but anon users cannot access it.');
      console.log('\n🔧 SOLUTION: Run this SQL in your Supabase dashboard:');
      console.log('\n-- Option 1: Disable RLS (simplest for development)');
      console.log('ALTER TABLE skills_academy_drills DISABLE ROW LEVEL SECURITY;');
      console.log('\n-- Option 2: Create a policy to allow read access');
      console.log('CREATE POLICY "Allow public read access" ON skills_academy_drills');
      console.log('  FOR SELECT USING (true);');
    } else if (anonCount > 0) {
      console.log('\n✅ Anon users CAN access the drills table!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkRLSPolicies();