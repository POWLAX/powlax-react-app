import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
  console.log('🔍 Checking role values and constraints...\n');

  // Get distinct role values
  const { data: roles, error: roleError } = await supabase
    .from('users')
    .select('role')
    .not('role', 'is', null);

  if (roleError) {
    console.error('❌ Error fetching roles:', roleError);
    return;
  }

  // Count occurrences
  const roleCounts: { [key: string]: number } = {};
  roles?.forEach(user => {
    if (user.role) {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    }
  });

  console.log('📊 ROLE VALUES IN DATABASE:');
  console.log('=' .repeat(40));
  Object.entries(roleCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });

  // Check table schema for role column
  const { data: schemaData, error: schemaError } = await supabase.rpc('sql', {
    query: `
      SELECT 
        column_name,
        data_type,
        column_default,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name = 'role';
    `
  });

  console.log('\n📋 ROLE COLUMN SCHEMA:');
  console.log('=' .repeat(40));
  if (schemaError) {
    console.error('❌ Error fetching schema:', schemaError);
  } else {
    schemaData?.forEach(col => {
      console.log(`Column: ${col.column_name}`);
      console.log(`Type: ${col.data_type}`);
      console.log(`Default: ${col.column_default || 'null'}`);
      console.log(`Nullable: ${col.is_nullable}`);
      console.log(`Max Length: ${col.character_maximum_length || 'unlimited'}`);
    });
  }

  // Check for any role constraints
  const { data: constraints, error: constraintError } = await supabase.rpc('sql', {
    query: `
      SELECT 
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'public.users'::regclass
        AND contype = 'c'
        AND conname ILIKE '%role%';
    `
  });

  console.log('\n🔒 ROLE CONSTRAINTS:');
  console.log('=' .repeat(40));
  if (constraintError) {
    console.error('❌ Error fetching constraints:', constraintError);
  } else if (constraints && constraints.length > 0) {
    constraints.forEach(c => {
      console.log(`${c.constraint_name}:`);
      console.log(`  ${c.constraint_definition}`);
    });
  } else {
    console.log('No role constraints found (role is free-form text)');
  }

  console.log('\n✅ Role analysis complete!');
}

checkRoles().catch(console.error);