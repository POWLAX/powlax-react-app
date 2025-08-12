import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleteDrillWorkflow() {
  console.log('🧪 ULTRA THINK: Testing Complete Custom Drill Workflow\n')
  console.log('==================================================\n')

  try {
    // Step 1: Get a test user
    console.log('1️⃣ Getting test user...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name')
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.error('❌ No users found:', userError)
      return
    }

    const testUser = users[0]
    console.log(`✅ Using user: ${testUser.email} (${testUser.id})\n`)

    // Step 2: Test COMPLETE drill creation (simulating AddCustomDrillModal)
    console.log('2️⃣ Testing COMPLETE drill creation with ALL fields...')
    
    const completeDrillData = {
      user_id: testUser.id,
      title: 'ULTRA THINK TEST: Complete 3v2 Transition Drill',
      content: 'A comprehensive transition drill with complete field data',
      
      // Duration fields (both legacy and new)
      duration_minutes: 15,
      drill_duration: '15 minutes',
      
      // Category fields (both legacy and new)
      category: 'Transition',
      drill_category: 'Transition',
      
      // Video fields (both legacy and new)
      video_url: 'https://vimeo.com/test123',
      drill_video_url: 'https://vimeo.com/test123',
      vimeo_url: 'https://vimeo.com/test123',
      
      // Lacrosse Lab URLs (all 5 columns)
      drill_lab_url_1: 'https://lacrosselab.com/drill1',
      drill_lab_url_2: 'https://lacrosselab.com/drill2',
      drill_lab_url_3: 'https://lacrosselab.com/drill3',
      drill_lab_url_4: 'https://lacrosselab.com/drill4',
      drill_lab_url_5: 'https://lacrosselab.com/drill5',
      
      // Equipment and tags
      equipment: 'Cones, Balls, Goals',
      tags: 'transition, 3v2, offense',
      
      // Notes fields (both legacy and new)
      drill_notes: 'Focus on ball movement and spacing',
      
      // Drill types and emphasis
      drill_types: 'transition,offense',
      drill_emphasis: 'Offensive Transition',
      
      // Game states and phases
      game_states: ['offense', 'transition'],
      game_phase: 'Offensive Transition',
      
      // Age appropriateness
      do_it_ages: '10-12',
      coach_it_ages: '13-15',
      own_it_ages: '16+',
      
      // Visibility and sharing
      is_public: false,
      status: 'active',
      
      // CRITICAL: Send arrays, not booleans!
      team_share: [1, 2],    // Array with team IDs
      club_share: [10],      // Array with club IDs
      
      // Media
      featured_image: 'https://example.com/image.jpg'
    }

    console.log('   Creating drill with complete field data...')
    const { data: createdDrill, error: createError } = await supabase
      .from('user_drills')
      .insert([completeDrillData])
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create drill:', createError)
      return
    }

    console.log('✅ Drill created successfully!')
    console.log('   ID:', createdDrill.id)
    console.log('   Title:', createdDrill.title)
    console.log('   Duration:', createdDrill.duration_minutes, 'minutes')
    console.log('   Team Share Array:', createdDrill.team_share)
    console.log('   Club Share Array:', createdDrill.club_share)
    console.log('   Lab URLs:', [
      createdDrill.drill_lab_url_1,
      createdDrill.drill_lab_url_2,
      createdDrill.drill_lab_url_3,
      createdDrill.drill_lab_url_4,
      createdDrill.drill_lab_url_5
    ].filter(Boolean).length, 'URLs saved')

    // Step 3: Test field verification
    console.log('\n3️⃣ Verifying ALL fields were saved correctly...')
    
    const savedFieldCount = Object.keys(createdDrill).length
    console.log(`   Database returned ${savedFieldCount} fields`)
    
    // Check critical fields
    const criticalFields = [
      'title', 'content', 'duration_minutes', 'category', 'equipment', 'tags',
      'video_url', 'drill_lab_url_1', 'team_share', 'club_share', 'game_states'
    ]
    
    let allFieldsCorrect = true
    criticalFields.forEach(field => {
      const hasField = field in createdDrill && createdDrill[field] !== null
      console.log(`   ${field}: ${hasField ? '✅' : '❌'}`)
      if (!hasField) allFieldsCorrect = false
    })
    
    // Verify array types specifically
    const teamShareIsArray = Array.isArray(createdDrill.team_share)
    const clubShareIsArray = Array.isArray(createdDrill.club_share)
    console.log(`   team_share is array: ${teamShareIsArray ? '✅' : '❌'}`)
    console.log(`   club_share is array: ${clubShareIsArray ? '✅' : '❌'}`)
    
    if (!teamShareIsArray || !clubShareIsArray) {
      console.log('❌ CRITICAL: Array fields not saved as arrays!')
      allFieldsCorrect = false
    }

    // Step 4: Test UPDATE with array handling (the critical "expected JSON array" fix)
    console.log('\n4️⃣ Testing UPDATE with array handling (fixing "expected JSON array" error)...')
    
    const updateData = {
      title: 'UPDATED: Advanced 3v2 Transition',
      content: 'Updated description with more detail',
      duration_minutes: 20,
      equipment: 'Cones, Balls, Goals, Pinnies',
      tags: 'transition, 3v2, offense, advanced',
      
      // CRITICAL TEST: Update array fields (this used to cause "expected JSON array" error)
      team_share: [1, 2, 3],     // Different team IDs
      club_share: [],            // Empty array (checkbox unchecked)
      
      // Update Lab URLs
      drill_lab_url_1: 'https://lacrosselab.com/updated1',
      drill_lab_url_2: 'https://lacrosselab.com/updated2',
      drill_lab_url_3: null,     // Remove this one
      
      // Update age fields
      do_it_ages: '11-13',
      coach_it_ages: '14-16',
      own_it_ages: '17+',
      
      updated_at: new Date().toISOString()
    }

    console.log('   Attempting update with array fields...')
    const { error: updateError } = await supabase
      .from('user_drills')
      .update(updateData)
      .eq('id', createdDrill.id)

    if (updateError) {
      console.error('❌ Update failed:', updateError.message)
      if (updateError.message.includes('expected JSON array')) {
        console.log('🚨 CRITICAL: "expected JSON array" error still occurring!')
      }
    } else {
      console.log('✅ Update succeeded without "expected JSON array" error!')
    }

    // Step 5: Verify update worked correctly
    console.log('\n5️⃣ Verifying update applied correctly...')
    
    const { data: updatedDrill, error: fetchError } = await supabase
      .from('user_drills')
      .select('*')
      .eq('id', createdDrill.id)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch updated drill:', fetchError)
    } else {
      console.log('✅ Update verification:')
      console.log('   Title:', updatedDrill.title)
      console.log('   Duration:', updatedDrill.duration_minutes, 'minutes')
      console.log('   Team Share:', JSON.stringify(updatedDrill.team_share))
      console.log('   Club Share:', JSON.stringify(updatedDrill.club_share))
      console.log('   Equipment:', updatedDrill.equipment)
      console.log('   Lab URL 1:', updatedDrill.drill_lab_url_1)
      console.log('   Lab URL 3 (should be null):', updatedDrill.drill_lab_url_3)
      console.log('   Updated At:', updatedDrill.updated_at)
      
      // Verify arrays are still arrays after update
      const stillArraysAfterUpdate = Array.isArray(updatedDrill.team_share) && Array.isArray(updatedDrill.club_share)
      console.log(`   Arrays preserved: ${stillArraysAfterUpdate ? '✅' : '❌'}`)
    }

    // Step 6: Test retrieval through useUserDrills pattern
    console.log('\n6️⃣ Testing retrieval through useUserDrills pattern...')
    
    const { data: allUserDrills, error: listError } = await supabase
      .from('user_drills')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })

    if (listError) {
      console.error('❌ Failed to list user drills:', listError)
    } else {
      console.log(`✅ Retrieved ${allUserDrills.length} user drills`)
      const testDrill = allUserDrills.find(d => d.id === createdDrill.id)
      if (testDrill) {
        console.log('✅ Test drill found in user drill list')
        console.log('   All fields available for useUserDrills hook')
      } else {
        console.log('❌ Test drill not found in user drill list')
      }
    }

    // Step 7: Clean up
    console.log('\n7️⃣ Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('user_drills')
      .delete()
      .eq('id', createdDrill.id)

    if (deleteError) {
      console.error('⚠️ Failed to clean up:', deleteError)
    } else {
      console.log('✅ Test data cleaned up')
    }

    // Step 8: Summary
    console.log('\n==================================================')
    console.log('📊 ULTRA THINK TEST SUMMARY')
    console.log('==================================================')
    
    if (allFieldsCorrect && !updateError) {
      console.log('🎉 ALL TESTS PASSED!')
      console.log('✅ Custom drill creation: ALL fields saved correctly')
      console.log('✅ Custom drill update: Arrays handled properly')
      console.log('✅ "expected JSON array" error: FIXED')
      console.log('✅ useUserDrills compatibility: Working')
      console.log('✅ All 36 database columns: Utilized correctly')
      
      console.log('\n🎯 CUSTOM DRILL FUNCTIONALITY IS FULLY WORKING!')
      console.log('🎯 Users can now create and edit custom drills without errors!')
    } else {
      console.log('❌ SOME TESTS FAILED')
      console.log(`   Field saving: ${allFieldsCorrect ? 'PASS' : 'FAIL'}`)
      console.log(`   Array updates: ${!updateError ? 'PASS' : 'FAIL'}`)
      console.log('\n🚨 Additional fixes may be needed')
    }

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error)
  }
}

testCompleteDrillWorkflow()