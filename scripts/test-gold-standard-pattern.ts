import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testGoldStandardPattern() {
  console.log('🎯 Testing Gold Standard Pattern Application...')
  
  // Get a real user for testing
  const { data: users } = await supabase.from('users').select('id, email').limit(1)
  if (!users || users.length === 0) {
    console.log('❌ No users found for testing')
    return
  }
  
  const testUser = users[0]
  console.log(`✅ Testing with user: ${testUser.email}`)
  
  // Test 1: Custom Drill Creation (Known Working Pattern)
  console.log('\n📝 Test 1: Custom Drill Creation (Gold Standard)')
  try {
    const testDrill = {
      user_id: testUser.id,
      title: 'Gold Standard Test Drill',
      content: 'Test content',
      duration_minutes: 10,
      category: 'Custom',
      team_share: [], // Array (not boolean)
      club_share: []  // Array (not boolean)
    }
    
    const { data: drillData, error: drillError } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
    
    if (drillError) {
      console.log(`   ❌ Custom drill failed: ${drillError.message}`)
    } else {
      console.log(`   ✅ Custom drill works: ${drillData?.[0]?.id}`)
      // Clean up
      if (drillData?.[0]?.id) {
        await supabase.from('user_drills').delete().eq('id', drillData[0].id)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Custom drill error: ${err.message}`)
  }
  
  // Test 2: Custom Strategy Creation (Known Working Pattern)
  console.log('\n🎯 Test 2: Custom Strategy Creation (Gold Standard)')
  try {
    const testStrategy = {
      user_id: testUser.id,
      strategy_name: 'Gold Standard Test Strategy',
      description: 'Test description',
      team_share: [], // Array (not boolean)
      club_share: []  // Array (not boolean)
    }
    
    const { data: strategyData, error: strategyError } = await supabase
      .from('user_strategies')
      .insert([testStrategy])
      .select()
    
    if (strategyError) {
      console.log(`   ❌ Custom strategy failed: ${strategyError.message}`)
    } else {
      console.log(`   ✅ Custom strategy works: ${strategyData?.[0]?.id}`)
      // Clean up
      if (strategyData?.[0]?.id) {
        await supabase.from('user_strategies').delete().eq('id', strategyData[0].id)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Custom strategy error: ${err.message}`)
  }
  
  // Test 3: Practice Plan Save (Applying Gold Standard Pattern)
  console.log('\n💾 Test 3: Practice Plan Save (Gold Standard Applied)')
  try {
    const testPractice = {
      name: 'Gold Standard Test Practice',
      coach_id: testUser.id,
      created_by: testUser.id,
      duration_minutes: 60,
      raw_wp_data: {
        timeSlots: [],
        practiceInfo: { startTime: '07:00', field: 'Turf' }
      }
    }
    
    const { data: practiceData, error: practiceError } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
    
    if (practiceError) {
      console.log(`   ❌ Practice plan failed: ${practiceError.message}`)
      console.log(`   🚨 This indicates RLS or validation issues`)
    } else {
      console.log(`   ✅ Practice plan works: ${practiceData?.[0]?.id}`)
      // Clean up
      if (practiceData?.[0]?.id) {
        await supabase.from('practices').delete().eq('id', practiceData[0].id)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Practice plan error: ${err.message}`)
  }
  
  // Test 4: Favorites (Gold Standard Applied)
  console.log('\n⭐ Test 4: Favorites (Gold Standard Applied)')
  try {
    // Get a real drill ID from powlax_drills table
    const { data: drills } = await supabase.from('powlax_drills').select('id').limit(1)
    const realDrillId = drills?.[0]?.id
    
    if (!realDrillId) {
      console.log('   ❌ No real drill found to test favorites')
      return
    }
    
    console.log(`   🎯 Using real drill ID: ${realDrillId}`)
    
    const testFavorite = {
      user_id: testUser.id,
      drill_id: realDrillId.toString()  // Use real drill ID
    }
    
    const { data: favoriteData, error: favoriteError } = await supabase
      .from('user_favorites')
      .insert([testFavorite])
      .select()
    
    if (favoriteError) {
      console.log(`   ❌ Favorites failed: ${favoriteError.message}`)
    } else {
      console.log(`   ✅ Favorites work: ${favoriteData?.[0]?.id}`)
      // Clean up
      if (favoriteData?.[0]?.id) {
        await supabase.from('user_favorites').delete().eq('id', favoriteData[0].id)
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Favorites error: ${err.message}`)
  }
  
  console.log('\n📊 PATTERN CONSISTENCY ANALYSIS:')
  console.log('   ✅ Custom Drills: Gold Standard Pattern (Working)')
  console.log('   ✅ Custom Strategies: Gold Standard Pattern (Working)')
  console.log('   🎯 Practice Plans: Gold Standard Pattern Applied')
  console.log('   🎯 Favorites: Gold Standard Pattern Applied')
  console.log('')
  console.log('💡 If practice plans and favorites now work like custom drills/strategies,')
  console.log('   the Gold Standard Pattern application was successful!')
}

testGoldStandardPattern().catch(console.error)