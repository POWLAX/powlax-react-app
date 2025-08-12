import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPointTypesSchema() {
  console.log('🔍 Checking point_types_powlax table schema...')
  
  try {
    // Try to get some data to see what columns exist
    const { data, error } = await supabase
      .from('point_types_powlax')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing table:', error.message)
      
      // Let's check if it's named differently
      const possibleTables = ['point_types', 'powlax_point_types', 'user_point_types']
      
      for (const tableName of possibleTables) {
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (!testError && testData) {
            console.log(`✅ Found table: ${tableName}`)
            console.log('Columns:', Object.keys(testData[0] || {}))
            console.log('Sample data:', testData[0])
          }
        } catch (e) {
          // Silent fail
        }
      }
    } else {
      console.log('✅ Table accessible')
      console.log('Data count:', data.length)
      if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]))
        console.log('Sample data:', data[0])
      } else {
        console.log('Table is empty')
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkPointTypesSchema()