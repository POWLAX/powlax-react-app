import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkUserDrillsTable() {
  console.log('🔍 Checking user_drills table structure...')
  
  try {
    // First, check if table exists by trying to select from it
    const { data, error } = await supabase
      .from('user_drills')
      .select('*')
      .limit(1)
      
    if (error) {
      console.error('❌ Table access error:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      return
    }
    
    if (data.length > 0) {
      console.log('✅ Table exists with data')
      console.log('📋 Available columns:', Object.keys(data[0]))
      console.log('📝 Sample record:', data[0])
    } else {
      console.log('✅ Table exists but is empty')
      
      // Try to get schema info by attempting an insert with invalid data
      const { error: insertError } = await supabase
        .from('user_drills')
        .insert({ invalid_column: 'test' })
        
      if (insertError) {
        console.log('📋 Schema error reveals expected structure:')
        console.log('   Error message:', insertError.message)
        console.log('   Code:', insertError.code)
        console.log('   Details:', insertError.details)
      }
    }
    
    // Also check powlax_drills for comparison
    console.log('\n🔍 Checking powlax_drills for comparison...')
    const { data: powlaxData, error: powlaxError } = await supabase
      .from('powlax_drills')
      .select('*')
      .limit(1)
      
    if (!powlaxError && powlaxData.length > 0) {
      console.log('✅ powlax_drills table structure:')
      console.log('📋 Available columns:', Object.keys(powlaxData[0]))
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err)
  }
}

checkUserDrillsTable()