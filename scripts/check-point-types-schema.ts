// scripts/check-point-types-schema.ts
// Purpose: Check actual schema of point_types_powlax table

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking point_types_powlax table schema...')
  
  try {
    // Try to get some raw data to see structure
    console.log('📊 Checking actual data structure...')
    const { data: rawData, error: dataError } = await supabase
      .from('point_types_powlax')
      .select('*')
      .limit(3)

    if (dataError) {
      console.error('❌ Error fetching data:', dataError)
    } else {
      console.log('📝 Raw data sample:')
      if (rawData && rawData.length > 0) {
        rawData.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, JSON.stringify(row, null, 2))
        })
        
        // Show what keys are actually available
        console.log('\n🔑 Available keys in first row:', Object.keys(rawData[0]))
      } else {
        console.log('⚠️  No data found in table')
      }
    }

    // Check if we can select specific columns
    console.log('\n🎯 Testing specific column access...')
    const { data: specificData, error: specificError } = await supabase
      .from('point_types_powlax')
      .select('id, title, image_url, slug, series_type')
      .limit(1)

    if (specificError) {
      console.error('❌ Error with specific columns:', specificError)
    } else {
      console.log('✅ Specific columns accessible:')
      if (specificData && specificData.length > 0) {
        console.log(JSON.stringify(specificData[0], null, 2))
      }
    }

  } catch (error) {
    console.error('💥 Schema check failed:', error)
  }
}

checkSchema()
  .then(() => {
    console.log('\n🎯 Schema check complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })