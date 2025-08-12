import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkUserDrillsStructure() {
  console.log('🔍 Checking user_drills Table Structure\n')
  
  // 1. Try to fetch a sample record to see actual columns
  console.log('1️⃣ Fetching user_drills table structure...')
  try {
    const { data: sample, error } = await supabase
      .from('user_drills')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing user_drills:', error.message)
      console.log('   Error code:', error.code)
      console.log('   Error details:', error.details)
    } else {
      if (sample && sample.length > 0) {
        const columns = Object.keys(sample[0])
        console.log('✅ Found user_drills columns:', columns.join(', '))
        console.log('\n📊 Sample record structure:')
        Object.entries(sample[0]).forEach(([key, value]) => {
          console.log(`   ${key}: ${typeof value} (${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value === 'object' ? 'object' : value})`)
        })
      } else {
        console.log('   No records in user_drills table yet')
        console.log('   Attempting to check structure via insert test...')
      }
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 2. Check what the AddCustomDrillModal is trying to save
  console.log('\n2️⃣ What AddCustomDrillModal is trying to save:')
  console.log('   From useUserDrills.ts createUserDrill():')
  console.log('   - user_id (string)')
  console.log('   - title (string)')
  console.log('   - content (string) - contains all form data')
  console.log('   - is_public (boolean)')
  console.log('   - team_share (boolean)')
  console.log('   - club_share (boolean)')
  
  // 3. Check user_strategies structure too
  console.log('\n3️⃣ Checking user_strategies table structure...')
  try {
    const { data: stratSample, error } = await supabase
      .from('user_strategies')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing user_strategies:', error.message)
    } else {
      if (stratSample && stratSample.length > 0) {
        const columns = Object.keys(stratSample[0])
        console.log('✅ Found user_strategies columns:', columns.join(', '))
      } else {
        console.log('   No records in user_strategies table yet')
      }
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 4. Test if game_states is an array or JSON
  console.log('\n4️⃣ Checking game_states column type...')
  try {
    // Try to insert with array value
    const testDrill = {
      user_id: '523f2768-6404-439c-a429-f9eb6736aa17', // Patrick's ID
      title: 'Array Test Drill',
      content: 'Testing array vs JSON',
      game_states: ['settled_offense', 'transition'], // Try as array
      is_public: false,
      team_share: false,
      club_share: false
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert([testDrill])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Array format failed:', error.message)
      
      // Try as JSON string
      const testDrillJSON = {
        ...testDrill,
        game_states: JSON.stringify(['settled_offense', 'transition'])
      }
      
      const { data: jsonData, error: jsonError } = await supabase
        .from('user_drills')
        .insert([testDrillJSON])
        .select()
        .single()
      
      if (jsonError) {
        console.log('❌ JSON string format also failed:', jsonError.message)
        
        // Try without game_states
        const { game_states, ...testDrillNoStates } = testDrill
        const { data: noStatesData, error: noStatesError } = await supabase
          .from('user_drills')
          .insert([testDrillNoStates])
          .select()
          .single()
        
        if (noStatesError) {
          console.log('❌ Even without game_states failed:', noStatesError.message)
        } else {
          console.log('✅ Insert works WITHOUT game_states field')
          if (noStatesData) {
            await supabase.from('user_drills').delete().eq('id', noStatesData.id)
          }
        }
      } else {
        console.log('✅ game_states accepts JSON string format')
        if (jsonData) {
          await supabase.from('user_drills').delete().eq('id', jsonData.id)
        }
      }
    } else {
      console.log('✅ game_states accepts array format directly')
      if (data) {
        await supabase.from('user_drills').delete().eq('id', data.id)
      }
    }
  } catch (err) {
    console.error('   Test error:', err)
  }
  
  // 5. Check current user authentication
  console.log('\n5️⃣ Checking authentication context...')
  console.log('   Patrick Chapla ID: 523f2768-6404-439c-a429-f9eb6736aa17')
  console.log('   This is from public.users table')
  console.log('   auth.uid() would return the auth.users ID (if it existed)')
  console.log('   Since we use public.users, RLS policies need adjustment')
  
  console.log('\n📋 SUMMARY:')
  console.log('================================')
  console.log('The issue is likely one of:')
  console.log('1. RLS policies expecting auth.uid() but we use public.users IDs')
  console.log('2. game_states column type mismatch (array vs JSON)')
  console.log('3. Missing columns that the form is trying to save')
  console.log('\nNext step: Review actual error and adjust code or migration accordingly')
}

checkUserDrillsStructure()