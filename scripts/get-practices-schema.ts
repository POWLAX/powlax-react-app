import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getPracticesSchema() {
  console.log('=== GETTING PRACTICES TABLE SCHEMA ===\n')
  
  // Get sample record and list all its keys/structure
  console.log('1. Analyzing table structure from sample record...')
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else if (data && data.length > 0) {
      const record = data[0]
      console.log('✅ Table columns found:')
      Object.keys(record).forEach(key => {
        const value = record[key]
        const type = Array.isArray(value) ? 'array' : typeof value
        const preview = type === 'object' && value !== null ? 
          `{${Object.keys(value).slice(0, 3).join(', ')}${Object.keys(value).length > 3 ? '...' : ''}}` :
          type === 'string' && value.length > 50 ? 
          `"${value.substring(0, 47)}..."` : 
          JSON.stringify(value)
        
        console.log(`  ${key}: ${type} = ${preview}`)
      })
      
      // Check what drill data structure looks like
      if (record.raw_wp_data && record.raw_wp_data.drills) {
        console.log('\n✅ Drill structure in raw_wp_data:')
        const drill = record.raw_wp_data.drills[0]
        Object.keys(drill).forEach(key => {
          console.log(`  drill.${key}: ${typeof drill[key]} = ${JSON.stringify(drill[key])}`)
        })
      }
    } else {
      console.log('❌ No records found')
    }
  } catch (err) {
    console.log('❌ Exception:', err)
  }
  
  // Test what columns we can actually insert
  console.log('\n2. Testing minimal insert to discover required columns...')
  try {
    const minimalRecord = {
      name: 'Test Minimal'
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([minimalRecord])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Minimal insert error:', error.message)
      
      // Try with coach_id
      console.log('Trying with coach_id...')
      const withCoachId = {
        name: 'Test With Coach',
        coach_id: '523f2768-6404-439c-a429-f9eb6736aa17' // Use existing coach_id from sample
      }
      
      const { data: data2, error: error2 } = await supabase
        .from('practices')
        .insert([withCoachId])
        .select()
        .single()
        
      if (error2) {
        console.log('❌ With coach_id error:', error2.message)
      } else {
        console.log('✅ With coach_id success! Record ID:', data2.id)
        
        // Clean up
        await supabase.from('practices').delete().eq('id', data2.id)
        console.log('✅ Test record cleaned up')
      }
    } else {
      console.log('✅ Minimal insert success! Record ID:', data.id)
      
      // Clean up
      await supabase.from('practices').delete().eq('id', data.id)
      console.log('✅ Test record cleaned up')
    }
  } catch (err) {
    console.log('❌ Insert exception:', err)
  }
  
  console.log('\n=== END SCHEMA ANALYSIS ===')
}

getPracticesSchema().catch(console.error)