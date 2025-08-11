import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugPracticesTable() {
  console.log('=== DEBUGGING PRACTICES TABLE ===\n')
  
  // Check if practices table exists
  console.log('1. Checking if "practices" table exists...')
  try {
    const { data: practicesData, error: practicesError } = await supabase
      .from('practices')
      .select('*')
      .limit(1)
    
    if (practicesError) {
      console.log('❌ "practices" table error:', practicesError.message)
    } else {
      console.log('✅ "practices" table exists')
      console.log('Records found:', practicesData?.length || 0)
    }
  } catch (err) {
    console.log('❌ Error checking "practices" table:', err)
  }
  
  console.log('\n2. Checking if "practice_plans" table exists...')
  try {
    const { data: plansData, error: plansError } = await supabase
      .from('practice_plans')
      .select('*')
      .limit(1)
    
    if (plansError) {
      console.log('❌ "practice_plans" table error:', plansError.message)
    } else {
      console.log('✅ "practice_plans" table exists')
      console.log('Records found:', plansData?.length || 0)
    }
  } catch (err) {
    console.log('❌ Error checking "practice_plans" table:', err)
  }
  
  // Get all table names that contain "practice"
  console.log('\n3. Checking for any tables containing "practice"...')
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%practice%')
    
    if (error) {
      console.log('❌ Error getting practice tables:', error.message)
    } else {
      console.log('Practice-related tables found:')
      data?.forEach(table => console.log(`  - ${table.table_name}`))
    }
  } catch (err) {
    console.log('❌ Error checking table names:', err)
  }

  // Check RLS policies for practices table
  console.log('\n4. Checking RLS policies for "practices" table...')
  try {
    const { data, error } = await supabase
      .rpc('get_rls_policies', { table_name: 'practices' })
    
    if (error) {
      console.log('❌ Error getting RLS policies:', error.message)
    } else {
      console.log('RLS policies found:', data?.length || 0)
      data?.forEach(policy => console.log(`  - ${policy.policyname}: ${policy.cmd} for ${policy.roles?.join(', ')}`))
    }
  } catch (err) {
    console.log('❌ Error checking RLS policies:', err)
  }
  
  // Test current user context
  console.log('\n5. Testing user context...')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('❌ Auth error:', error.message)
    } else {
      console.log('User context:', user ? `${user.id} (${user.email})` : 'No user')
    }
  } catch (err) {
    console.log('❌ Error checking user:', err)
  }
  
  console.log('\n=== END DEBUG ===')
}

debugPracticesTable().catch(console.error)