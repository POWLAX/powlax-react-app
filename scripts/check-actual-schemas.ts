import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkActualSchemas() {
  console.log('🔍 Checking actual database schemas...')
  
  // Check practices table schema
  console.log('\n📋 Practices Table Schema:')
  try {
    const { data, error } = await supabase.from('practices').select('*').limit(1)
    if (error) {
      console.log(`❌ Practices error: ${error.message}`)
    } else {
      console.log('✅ Practices table exists')
      if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]))
      } else {
        console.log('No data, trying to get schema from insert...')
        // Try a test insert to see what columns exist
        const testData = {
          name: 'schema-test',
          coach_id: '00000000-0000-0000-0000-000000000000'
        }
        const { error: insertError } = await supabase.from('practices').insert([testData])
        console.log('Insert error (shows available columns):', insertError?.message)
      }
    }
  } catch (err: any) {
    console.log(`❌ Practices check error: ${err.message}`)
  }
  
  // Check user_favorites table schema
  console.log('\n⭐ User Favorites Table Schema:')
  try {
    const { data, error } = await supabase.from('user_favorites').select('*').limit(1)
    if (error) {
      console.log(`❌ User favorites error: ${error.message}`)
    } else {
      console.log('✅ User favorites table exists')
      if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]))
      } else {
        console.log('No data, trying to get schema from insert...')
        // Try a test insert to see what columns exist
        const testData = {
          user_id: '00000000-0000-0000-0000-000000000000',
          item_id: 'test',
          item_type: 'drill'
        }
        const { error: insertError } = await supabase.from('user_favorites').insert([testData])
        console.log('Insert error (shows available columns):', insertError?.message)
      }
    }
  } catch (err: any) {
    console.log(`❌ User favorites check error: ${err.message}`)
  }
  
  // Check working tables for comparison
  console.log('\n📝 User Drills (Working) Schema:')
  try {
    const { data } = await supabase.from('user_drills').select('*').limit(1)
    if (data && data.length > 0) {
      console.log('✅ User drills columns:', Object.keys(data[0]).slice(0, 10), '...') // First 10 columns
    }
  } catch (err: any) {
    console.log(`❌ User drills error: ${err.message}`)
  }
  
  console.log('\n🎯 User Strategies (Working) Schema:')
  try {
    const { data } = await supabase.from('user_strategies').select('*').limit(1)
    if (data && data.length > 0) {
      console.log('✅ User strategies columns:', Object.keys(data[0]).slice(0, 10), '...') // First 10 columns
    }
  } catch (err: any) {
    console.log(`❌ User strategies error: ${err.message}`)
  }
}

checkActualSchemas().catch(console.error)