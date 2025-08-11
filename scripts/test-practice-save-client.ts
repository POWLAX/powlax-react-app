import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Use anon key like the frontend does
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPracticeSaveAsClient() {
  console.log('=== TESTING PRACTICE SAVE AS CLIENT ===\n')
  
  console.log('1. Checking current auth state...')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('❌ Auth error:', error.message)
      console.log('🔧 Need to authenticate to test client operations')
    } else {
      console.log('✅ User context:', user ? `${user.id} (${user.email})` : 'No authenticated user')
    }
  } catch (err) {
    console.log('❌ Auth exception:', err)
  }
  
  console.log('\n2. Testing read access to practices table...')
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('id, name, coach_id, team_id, created_at')
      .limit(3)
    
    if (error) {
      console.log('❌ Read error:', error.message)
      console.log('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Read successful!')
      console.log(`Records found: ${data?.length || 0}`)
      data?.forEach(record => {
        console.log(`  - ${record.name} (coach: ${record.coach_id?.substring(0, 8)}...)`)
      })
    }
  } catch (err) {
    console.log('❌ Read exception:', err)
  }
  
  console.log('\n3. Testing the exact structure the hook tries to save...')
  
  // This is the exact structure from the hook
  const hookData = {
    name: 'Test Practice from Hook Structure', // Use 'name' instead of 'title'
    team_id: 'test-team-id',
    practice_date: new Date().toISOString().split('T')[0],
    duration_minutes: 90,
    // Remove drill_sequence since it doesn't exist in table
    // drill_sequence: {
    //   timeSlots: [],
    //   practiceInfo: {
    //     startTime: '07:00',
    //     field: 'Test Field'
    //   }
    // },
    notes: 'Test practice notes',
    coach_id: 'test-coach-id',
    updated_at: new Date().toISOString()
  }
  
  try {
    const { data, error } = await supabase
      .from('practices')
      .insert([hookData])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Hook-style save error:', error.message)
      console.log('Error code:', error.code)
      console.log('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Hook-style save successful! Record ID:', data.id)
      
      // Note: Don't clean up if using anon key - might not have delete permissions
      console.log('⚠️  Test record left in database (may not have delete permissions)')
    }
  } catch (err) {
    console.log('❌ Hook-style save exception:', err)
  }
  
  console.log('\n=== END CLIENT TEST ===')
}

testPracticeSaveAsClient().catch(console.error)