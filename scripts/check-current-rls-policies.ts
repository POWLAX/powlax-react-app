import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCurrentRLSPolicies() {
  console.log('🔍 Checking current RLS policies...')
  
  const tables = ['practices', 'user_drills', 'user_strategies', 'user_favorites']
  
  for (const table of tables) {
    console.log(`\n📋 Table: ${table}`)
    
    try {
      // Check if RLS is enabled
      const { data: rlsStatus, error: rlsError } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT relrowsecurity FROM pg_class WHERE relname = '${table}';`
        })
      
      if (rlsError) {
        console.error(`❌ Error checking RLS status: ${rlsError.message}`)
        continue
      }
      
      console.log(`   RLS Enabled: ${rlsStatus?.[0]?.relrowsecurity || 'unknown'}`)
      
      // Get current policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT policyname, permissive, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename = '${table}';
          `
        })
      
      if (policiesError) {
        console.error(`❌ Error checking policies: ${policiesError.message}`)
        continue
      }
      
      if (policies && policies.length > 0) {
        console.log(`   Policies (${policies.length}):`)
        policies.forEach((policy: any) => {
          console.log(`     - ${policy.policyname} (${policy.cmd}) for roles: ${policy.roles}`)
        })
      } else {
        console.log(`   No policies found`)
      }
      
      // Test basic access
      const { data: testData, error: testError } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (testError) {
        console.log(`   ❌ Access test failed: ${testError.message}`)
      } else {
        console.log(`   ✅ Access test passed (${testData?.length || 0} records)`)
      }
      
    } catch (err) {
      console.error(`❌ Error checking ${table}:`, err)
    }
  }
}

async function testCurrentFunctionality() {
  console.log('\n🧪 Testing current functionality...')
  
  // Test custom drill creation
  console.log('\n📝 Testing custom drill creation...')
  try {
    const testDrill = {
      title: 'Test Drill RLS Check',
      duration_minutes: 5,
      content: 'Test content',
      created_by: 'test-user-id'
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
    
    if (error) {
      console.log(`   ❌ Custom drill creation failed: ${error.message}`)
    } else {
      console.log(`   ✅ Custom drill creation works`)
      
      // Clean up test drill
      if (data?.[0]?.id) {
        await supabase.from('user_drills').delete().eq('id', data[0].id)
        console.log(`   🧹 Test drill cleaned up`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Custom drill test error:`, err)
  }
  
  // Test custom strategy creation
  console.log('\n🎯 Testing custom strategy creation...')
  try {
    const testStrategy = {
      strategy_name: 'Test Strategy RLS Check',
      description: 'Test description',
      created_by: 'test-user-id'
    }
    
    const { data, error } = await supabase
      .from('user_strategies')
      .insert([testStrategy])
      .select()
    
    if (error) {
      console.log(`   ❌ Custom strategy creation failed: ${error.message}`)
    } else {
      console.log(`   ✅ Custom strategy creation works`)
      
      // Clean up test strategy
      if (data?.[0]?.id) {
        await supabase.from('user_strategies').delete().eq('id', data[0].id)
        console.log(`   🧹 Test strategy cleaned up`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Custom strategy test error:`, err)
  }
  
  // Test practice plan save
  console.log('\n💾 Testing practice plan save...')
  try {
    const testPractice = {
      name: 'Test Practice RLS Check',
      duration_minutes: 60,
      created_by: 'test-user-id'
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
    
    if (error) {
      console.log(`   ❌ Practice plan save failed: ${error.message}`)
      console.log(`   🚨 This is the error we need to fix!`)
    } else {
      console.log(`   ✅ Practice plan save works`)
      
      // Clean up test practice
      if (data?.[0]?.id) {
        await supabase.from('practices').delete().eq('id', data[0].id)
        console.log(`   🧹 Test practice cleaned up`)
      }
    }
  } catch (err) {
    console.log(`   ❌ Practice plan test error:`, err)
  }
  
  console.log('\n📊 Summary:')
  console.log('   - If custom drills/strategies work but practice save fails,')
  console.log('     the migration should be safe to apply')
  console.log('   - If everything fails, we may need a more targeted fix')
}

async function main() {
  await checkCurrentRLSPolicies()
  await testCurrentFunctionality()
}

main().catch(console.error)