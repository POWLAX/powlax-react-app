import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCurrentFunctionality() {
  console.log('🧪 Testing current functionality before RLS migration...')
  
  // Test custom drill creation (as it works according to contract)
  console.log('\n📝 Testing custom drill creation...')
  try {
    const testDrill = {
      title: 'Test Drill RLS Check',
      duration_minutes: 5,
      content: 'Test content',
      user_id: '00000000-0000-0000-0000-000000000000' // Use a valid UUID format
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
    
    if (error) {
      console.log(`   ❌ Custom drill creation failed: ${error.message}`)
    } else {
      console.log(`   ✅ Custom drill creation works - ID: ${data?.[0]?.id}`)
      
      // Clean up test drill
      if (data?.[0]?.id) {
        await supabase.from('user_drills').delete().eq('id', data[0].id)
        console.log(`   🧹 Test drill cleaned up`)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Custom drill test error: ${err.message}`)
  }
  
  // Test custom strategy creation (as it works according to contract)
  console.log('\n🎯 Testing custom strategy creation...')
  try {
    const testStrategy = {
      strategy_name: 'Test Strategy RLS Check',
      description: 'Test description',
      user_id: '00000000-0000-0000-0000-000000000000'
    }
    
    const { data, error } = await supabase
      .from('user_strategies')
      .insert([testStrategy])
      .select()
    
    if (error) {
      console.log(`   ❌ Custom strategy creation failed: ${error.message}`)
    } else {
      console.log(`   ✅ Custom strategy creation works - ID: ${data?.[0]?.id}`)
      
      // Clean up test strategy
      if (data?.[0]?.id) {
        await supabase.from('user_strategies').delete().eq('id', data[0].id)
        console.log(`   🧹 Test strategy cleaned up`)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Custom strategy test error: ${err.message}`)
  }
  
  // Test favorites (should work according to contract)
  console.log('\n⭐ Testing favorites...')
  try {
    const testFavorite = {
      user_id: '00000000-0000-0000-0000-000000000000',
      item_id: 'test-drill-123',
      item_type: 'drill'
    }
    
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([testFavorite])
      .select()
    
    if (error) {
      console.log(`   ❌ Favorites failed: ${error.message}`)
    } else {
      console.log(`   ✅ Favorites work - ID: ${data?.[0]?.id}`)
      
      // Clean up test favorite
      if (data?.[0]?.id) {
        await supabase.from('user_favorites').delete().eq('id', data[0].id)
        console.log(`   🧹 Test favorite cleaned up`)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Favorites test error: ${err.message}`)
  }
  
  // Test practice plan save (this is the one that should fail)
  console.log('\n💾 Testing practice plan save...')
  try {
    const testPractice = {
      name: 'Test Practice RLS Check',
      duration_minutes: 60,
      coach_id: '00000000-0000-0000-0000-000000000000',
      created_by: '00000000-0000-0000-0000-000000000000'
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
    
    if (error) {
      console.log(`   ❌ Practice plan save failed: ${error.message}`)
      console.log(`   🚨 This is the error we need to fix with the RLS migration!`)
      
      // Check if it's specifically an RLS issue
      if (error.message.includes('row-level security') || error.message.includes('infinite recursion')) {
        console.log(`   🎯 Confirmed: This is an RLS policy issue that the migration will fix`)
      }
    } else {
      console.log(`   ✅ Practice plan save works - ID: ${data?.[0]?.id}`)
      
      // Clean up test practice
      if (data?.[0]?.id) {
        await supabase.from('practices').delete().eq('id', data[0].id)
        console.log(`   🧹 Test practice cleaned up`)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Practice plan test error: ${err.message}`)
  }
  
  console.log('\n📊 Summary:')
  console.log('   ✅ If custom drills/strategies work but practice save fails,')
  console.log('      the RLS migration should be SAFE to apply')
  console.log('   ❌ If everything fails, we need a more targeted approach')
  console.log('')
  console.log('🔒 The RLS migration only adds ANON access permissions,')
  console.log('   it does NOT remove existing authenticated access.')
  console.log('   So working features should continue to work.')
}

testCurrentFunctionality().catch(console.error)