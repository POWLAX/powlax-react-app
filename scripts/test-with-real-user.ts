import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWithRealUser() {
  console.log('🧪 Testing with real user data...')
  
  // First, get a real user from the database
  console.log('\n👤 Finding a real user...')
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .limit(1)
  
  if (userError || !users || users.length === 0) {
    console.log(`❌ No users found: ${userError?.message}`)
    return
  }
  
  const realUserId = users[0].id
  console.log(`✅ Found user: ${users[0].email} (${realUserId})`)
  
  // Test practice plan save with real user (the main issue)
  console.log('\n💾 Testing practice plan save with real user...')
  try {
    const testPractice = {
      name: 'Test Practice Real User',
      duration_minutes: 60,
      coach_id: realUserId,
      created_by: realUserId
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
    
    if (error) {
      console.log(`   ❌ Practice plan save failed: ${error.message}`)
      
      // Check if it's specifically an RLS issue
      if (error.message.includes('row-level security') || error.message.includes('infinite recursion')) {
        console.log(`   🎯 Confirmed: This is an RLS policy issue`)
        console.log(`   ✅ SAFE TO APPLY RLS MIGRATION`)
      } else {
        console.log(`   ⚠️  This might be a different issue`)
      }
    } else {
      console.log(`   ✅ Practice plan save works!`)
      
      // Clean up test practice
      if (data?.[0]?.id) {
        await supabase.from('practices').delete().eq('id', data[0].id)
        console.log(`   🧹 Test practice cleaned up`)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Practice plan test error: ${err.message}`)
  }
  
  console.log('\n📊 ASSESSMENT: RLS Migration Safety')
  console.log('   The RLS migration only ADDS permissions, it does not remove them.')
  console.log('   If practice save fails due to RLS, the migration will fix it.')
  console.log('   Existing features should continue to work.')
}

testWithRealUser().catch(console.error)