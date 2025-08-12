/**
 * Test Custom Drill Creation Database Structure
 * Tests the user_drills table and drill creation functionality
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testUserDrillsTable() {
  console.log('🔍 Testing user_drills table structure and functionality...\n')

  try {
    // Test 1: Check table structure
    console.log('1️⃣ Checking user_drills table structure...')
    const { data: columns, error: structureError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_drills' })

    if (structureError) {
      console.log('❌ Error getting table structure:', structureError.message)
      console.log('ℹ️  Attempting to query table directly...')
      
      // Alternative: Try to get a sample record to see structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_drills')
        .select('*')
        .limit(1)

      if (sampleError) {
        console.log('❌ Table query error:', sampleError.message)
      } else {
        console.log('✅ Table exists. Sample record structure:', Object.keys(sampleData?.[0] || {}))
      }
    } else {
      console.log('✅ Table structure:', columns)
    }

    // Test 2: Create a test drill with all fields
    console.log('\n2️⃣ Testing drill creation with all fields...')
    
    const testDrill = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
      title: 'Test Custom Drill',
      content: 'This is a test custom drill for verification\nStep 1: Set up cones\nStep 2: Practice passing\nStep 3: Increase speed',
      duration_minutes: 5,
      equipment: 'Lacrosse stick, ball, cones',
      category: 'passing',
      tags: 'custom,test,passing',
      video_url: 'https://example.com/drill-video',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select('*')
      .single()

    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      console.log('💡 Error details:', insertError.details)
      console.log('💡 Error hint:', insertError.hint)
    } else {
      console.log('✅ Successfully created drill:', insertData.id)
      console.log('📋 Created drill data:', {
        id: insertData.id,
        title: insertData.title,
        duration_minutes: insertData.duration_minutes,
        equipment: insertData.equipment,
        category: insertData.category
      })

      // Test 3: Retrieve the drill
      console.log('\n3️⃣ Testing drill retrieval...')
      const { data: retrieveData, error: retrieveError } = await supabase
        .from('user_drills')
        .select('*')
        .eq('id', insertData.id)
        .single()

      if (retrieveError) {
        console.log('❌ Retrieve error:', retrieveError.message)
      } else {
        console.log('✅ Successfully retrieved drill')
        console.log('📋 All fields present:', Object.keys(retrieveData))
        
        // Verify all fields were saved correctly
        const fieldsToCheck = ['title', 'content', 'duration_minutes', 'equipment', 'category']
        const missingFields = fieldsToCheck.filter(field => !retrieveData[field])
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields saved successfully')
        } else {
          console.log('⚠️  Missing fields:', missingFields)
        }
      }

      // Test 4: Update the drill
      console.log('\n4️⃣ Testing drill update...')
      const updateData = {
        title: 'Updated Test Drill',
        duration_minutes: 7,
        updated_at: new Date().toISOString()
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('user_drills')
        .update(updateData)
        .eq('id', insertData.id)
        .select('*')
        .single()

      if (updateError) {
        console.log('❌ Update error:', updateError.message)
      } else {
        console.log('✅ Successfully updated drill')
        console.log('📋 Updated data:', {
          title: updatedData.title,
          duration_minutes: updatedData.duration_minutes
        })
      }

      // Cleanup: Delete the test drill
      console.log('\n5️⃣ Cleaning up test data...')
      const { error: deleteError } = await supabase
        .from('user_drills')
        .delete()
        .eq('id', insertData.id)

      if (deleteError) {
        console.log('❌ Delete error:', deleteError.message)
        console.log('⚠️  Test drill may still exist in database')
      } else {
        console.log('✅ Test drill cleaned up successfully')
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }

  console.log('\n🎉 Database structure test completed!')
}

// Run the test
testUserDrillsTable().catch(console.error)
