import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testPracticePlannerAfterMigration() {
  console.log('🧪 TESTING PRACTICE PLANNER AFTER MIGRATION 117\n')
  
  let allTestsPassed = true
  
  // Test 1: Check user_favorites structure
  console.log('TEST 1: Checking user_favorites table structure...')
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ FAILED: user_favorites still has issues:', error.message)
      allTestsPassed = false
    } else {
      console.log('✅ PASSED: user_favorites table accessible')
      
      // Try to insert a test favorite
      const testFavorite = {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17', // Patrick's ID
        item_id: 'test-drill-123',
        item_type: 'drill'
      }
      
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert([testFavorite])
      
      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          console.log('✅ PASSED: Favorites insert works (duplicate prevented as expected)')
        } else {
          console.log('❌ FAILED: Cannot insert favorite:', insertError.message)
          allTestsPassed = false
        }
      } else {
        console.log('✅ PASSED: Test favorite inserted successfully')
        
        // Clean up
        await supabase
          .from('user_favorites')
          .delete()
          .eq('item_id', 'test-drill-123')
      }
    }
  } catch (err) {
    console.log('❌ FAILED: Unexpected error:', err)
    allTestsPassed = false
  }
  
  // Test 2: Check user_drills structure
  console.log('\nTEST 2: Checking user_drills table structure...')
  try {
    const testDrill = {
      user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
      title: 'Test Drill After Migration',
      content: 'Test content',
      duration_minutes: 15,
      category: 'Test',
      video_url: 'https://test.com/video',
      drill_lab_url_1: 'https://test.com/lab1',
      equipment: 'cones, balls',
      tags: 'test, migration',
      is_public: false,
      team_share: [],
      club_share: []
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
      .single()
    
    if (error) {
      console.log('❌ FAILED: Cannot insert user_drill:', error.message)
      allTestsPassed = false
    } else {
      console.log('✅ PASSED: Test drill inserted successfully')
      console.log('   Drill ID:', data.id)
      console.log('   Has all expected columns:', 
        data.duration_minutes !== undefined && 
        data.category !== undefined &&
        data.video_url !== undefined
      )
      
      // Clean up
      await supabase
        .from('user_drills')
        .delete()
        .eq('id', data.id)
      console.log('   ✅ Test drill cleaned up')
    }
  } catch (err) {
    console.log('❌ FAILED: Unexpected error:', err)
    allTestsPassed = false
  }
  
  // Test 3: Check practices table
  console.log('\nTEST 3: Checking practices table...')
  try {
    const testPractice = {
      name: 'Test Practice After Migration',
      coach_id: '523f2768-6404-439c-a429-f9eb6736aa17',
      created_by: '523f2768-6404-439c-a429-f9eb6736aa17',
      team_id: null,
      practice_date: new Date().toISOString().split('T')[0],
      duration_minutes: 90,
      field_location: 'Test Field',
      notes: 'Testing after migration 117',
      raw_wp_data: {
        drills: [],
        startTime: '15:00',
        field: 'Test Field'
      }
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
      .single()
    
    if (error) {
      console.log('❌ FAILED: Cannot save practice:', error.message)
      allTestsPassed = false
    } else {
      console.log('✅ PASSED: Test practice saved successfully')
      console.log('   Practice ID:', data.id)
      
      // Test loading
      const { data: loadedPractice, error: loadError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', data.id)
        .single()
      
      if (loadError) {
        console.log('❌ FAILED: Cannot load practice:', loadError.message)
        allTestsPassed = false
      } else {
        console.log('✅ PASSED: Practice loaded successfully')
      }
      
      // Clean up
      await supabase
        .from('practices')
        .delete()
        .eq('id', data.id)
      console.log('   ✅ Test practice cleaned up')
    }
  } catch (err) {
    console.log('❌ FAILED: Unexpected error:', err)
    allTestsPassed = false
  }
  
  // Test 4: Check user_strategies
  console.log('\nTEST 4: Checking user_strategies table...')
  try {
    const testStrategy = {
      user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
      strategy_name: 'Test Strategy After Migration',
      description: 'Test description',
      is_public: false,
      team_share: [],
      club_share: []
    }
    
    const { data, error } = await supabase
      .from('user_strategies')
      .insert([testStrategy])
      .select()
      .single()
    
    if (error) {
      console.log('❌ FAILED: Cannot insert strategy:', error.message)
      allTestsPassed = false
    } else {
      console.log('✅ PASSED: Test strategy inserted successfully')
      console.log('   Strategy ID:', data.id)
      
      // Clean up
      await supabase
        .from('user_strategies')
        .delete()
        .eq('id', data.id)
      console.log('   ✅ Test strategy cleaned up')
    }
  } catch (err) {
    console.log('❌ FAILED: Unexpected error:', err)
    allTestsPassed = false
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED!')
    console.log('\nThe Practice Planner should now be fully functional:')
    console.log('- Favorites can be added/removed')
    console.log('- Custom drills can be created')
    console.log('- Practice plans can be saved/loaded')
    console.log('- Custom strategies can be created')
    console.log('\n🎉 Migration 117 was successful!')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('\nPlease check the errors above.')
    console.log('You may need to:')
    console.log('1. Verify Migration 117 ran completely')
    console.log('2. Check for any error messages in SQL Editor')
    console.log('3. Try running the migration again')
  }
}

testPracticePlannerAfterMigration()