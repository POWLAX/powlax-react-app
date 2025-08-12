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

async function analyzeUserDrillsSchema() {
  console.log('🔍 ULTRA THINK: Analyzing user_drills Table Schema After 119+ Migrations\n')
  console.log('================================================================\n')

  try {
    // Step 1: Check if table exists and get structure
    console.log('1️⃣ Testing table existence and basic structure...')
    
    const { data: testData, error: testError } = await supabase
      .from('user_drills')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Table access error:', testError.message)
      
      // Try to understand the error
      if (testError.message.includes('does not exist')) {
        console.log('🚨 CRITICAL: user_drills table does not exist!')
        return
      }
    }

    console.log('✅ user_drills table is accessible')
    
    // Step 2: Discover ALL columns by attempting a comprehensive insert
    console.log('\n2️⃣ Discovering ALL available columns...')
    
    const testUser = '00000000-0000-0000-0000-000000000000' // UUID format
    
    const comprehensiveTestData = {
      // Basic fields
      user_id: testUser,
      title: 'SCHEMA_TEST_DRILL',
      
      // Standard drill fields
      content: 'Test content',
      duration_minutes: 15,
      category: 'Test Category',
      equipment: 'Test equipment',
      tags: 'test,schema,discovery',
      notes: 'Test notes',
      coach_instructions: 'Test coach instructions',
      
      // Video and media fields
      video_url: 'https://vimeo.com/test',
      drill_lab_url_1: 'https://lacrosselab.com/test1',
      drill_lab_url_2: 'https://lacrosselab.com/test2',
      drill_lab_url_3: 'https://lacrosselab.com/test3',
      drill_lab_url_4: 'https://lacrosselab.com/test4',
      drill_lab_url_5: 'https://lacrosselab.com/test5',
      
      // Array fields (the critical ones!)
      game_states: ['offense', 'defense'],
      team_share: [1, 2, 3],
      club_share: [10, 20],
      
      // Boolean fields
      is_public: false,
      
      // Additional potential fields
      source: 'user',
      difficulty_level: 'beginner',
      player_count_min: 4,
      player_count_max: 12,
      space_requirement: 'half_field',
      
      // Metadata fields
      thumbnail_url: 'https://example.com/thumb.jpg',
      pdf_url: 'https://example.com/drill.pdf'
    }

    console.log('   Attempting comprehensive insert to discover schema...')
    const { data: insertData, error: insertError } = await supabase
      .from('user_drills')
      .insert([comprehensiveTestData])
      .select()

    if (insertError) {
      console.log('📋 Insert error (expected - tells us about schema):')
      console.log('   ', insertError.message)
      
      // Parse error message to understand missing/invalid columns
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        const invalidColumns = insertError.message.match(/column "([^"]+)" of relation/g)
        if (invalidColumns) {
          console.log('\n❌ INVALID COLUMNS (do not exist):')
          invalidColumns.forEach(col => {
            const columnName = col.match(/"([^"]+)"/)?.[1]
            if (columnName) console.log(`   - ${columnName}`)
          })
        }
      }
    } else if (insertData) {
      console.log('✅ Comprehensive insert succeeded!')
      console.log('📊 All fields were accepted by the database')
      console.log('\n💾 Created test record:')
      console.log('   ID:', insertData.id)
      console.log('   All field keys:', Object.keys(insertData))
      
      // Clean up test data
      await supabase
        .from('user_drills')
        .delete()
        .eq('id', insertData.id)
      
      console.log('✅ Test data cleaned up')
    }

    // Step 3: Try a simpler insert to find minimum required fields
    console.log('\n3️⃣ Testing minimal required fields...')
    
    const minimalData = {
      user_id: testUser,
      title: 'MINIMAL_TEST'
    }

    const { data: minimalInsert, error: minimalError } = await supabase
      .from('user_drills')
      .insert([minimalData])
      .select()

    if (minimalError) {
      console.log('❌ Minimal insert failed:', minimalError.message)
    } else if (minimalInsert) {
      console.log('✅ Minimal insert succeeded with just user_id and title')
      console.log('📊 Returned fields:', Object.keys(minimalInsert))
      
      // Clean up
      await supabase
        .from('user_drills')
        .delete()
        .eq('id', minimalInsert.id)
    }

    // Step 4: Check existing user drills to see actual data structure
    console.log('\n4️⃣ Examining existing user drill records...')
    
    const { data: existingDrills, error: existingError } = await supabase
      .from('user_drills')
      .select('*')
      .limit(3)

    if (existingError) {
      console.log('❌ Error fetching existing drills:', existingError.message)
    } else if (existingDrills) {
      console.log(`📊 Found ${existingDrills.length} existing user drills`)
      
      if (existingDrills.length > 0) {
        console.log('\n📋 ACTUAL FIELD STRUCTURE from existing data:')
        const sampleDrill = existingDrills[0]
        Object.keys(sampleDrill).forEach(key => {
          const value = sampleDrill[key]
          const type = Array.isArray(value) ? 'array' : typeof value
          console.log(`   ${key}: ${type} = ${JSON.stringify(value)}`)
        })
        
        // Check for array fields specifically
        console.log('\n🔍 ARRAY FIELD ANALYSIS (Critical for "expected JSON array" error):')
        const arrayFields = ['team_share', 'club_share', 'game_states']
        arrayFields.forEach(field => {
          if (field in sampleDrill) {
            const value = sampleDrill[field]
            const isArray = Array.isArray(value)
            console.log(`   ${field}: ${isArray ? '✅ IS ARRAY' : '❌ NOT ARRAY'} = ${JSON.stringify(value)}`)
          } else {
            console.log(`   ${field}: ❌ FIELD NOT FOUND`)
          }
        })
      }
    }

    // Step 5: Summary and recommendations
    console.log('\n================================================================')
    console.log('📊 SCHEMA ANALYSIS SUMMARY')
    console.log('================================================================')
    
    if (existingDrills && existingDrills.length > 0) {
      const fieldCount = Object.keys(existingDrills[0]).length
      console.log(`✅ user_drills table has ${fieldCount} columns`)
      console.log('✅ Table is functional and contains data')
      
      // Check for array fields
      const hasTeamShare = 'team_share' in existingDrills[0]
      const hasClubShare = 'club_share' in existingDrills[0]
      console.log(`✅ team_share column: ${hasTeamShare ? 'EXISTS' : 'MISSING'}`)
      console.log(`✅ club_share column: ${hasClubShare ? 'EXISTS' : 'MISSING'}`)
      
      if (hasTeamShare || hasClubShare) {
        console.log('\n🎯 KEY INSIGHT: Array columns exist - the "expected JSON array" error')
        console.log('   is likely due to sending booleans instead of arrays!')
      }
    }
    
    console.log('\n🎯 NEXT STEPS:')
    console.log('1. Fix useUserDrills hook to use ALL available columns')
    console.log('2. Fix createUserDrill to save complete field data') 
    console.log('3. Fix updateUserDrill to send arrays (not booleans) for team_share/club_share')
    console.log('4. Ensure modals send complete data structures')

  } catch (error) {
    console.error('💥 Unexpected error during schema analysis:', error)
  }
}

analyzeUserDrillsSchema()