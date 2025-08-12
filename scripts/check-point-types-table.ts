import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPointTypesTable() {
  try {
    console.log('🔍 Checking point_types_powlax table structure...')
    
    // Try to get data from the table
    const { data, error } = await supabase
      .from('point_types_powlax')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing table:', error)
      
      // Check if maybe it's called something else
      console.log('\n🔍 Checking for other point-related tables...')
      
      const possibleTables = [
        'point_types',
        'points_types',
        'powlax_point_types',
        'powlax_points_types',
        'point_types_powlax'
      ]
      
      for (const tableName of possibleTables) {
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!testError) {
          console.log(`✅ Found table: ${tableName}`)
          console.log('Structure:', testData)
        }
      }
    } else {
      console.log('✅ Table accessible')
      console.log('Data:', data)
      console.log('Structure:', Object.keys(data[0] || {}))
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkPointTypesTable()