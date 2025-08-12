import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkUserFavoritesColumns() {
  console.log('🔍 Checking user_favorites table columns\n')
  
  // Try different column combinations
  const tests = [
    {
      name: 'With drill_id',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        drill_id: 'test-123'
      }
    },
    {
      name: 'With strategy_id',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        strategy_id: 'test-123'
      }
    },
    {
      name: 'With favorite_id',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        favorite_id: 'test-123'
      }
    },
    {
      name: 'Just user_id',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17'
      }
    }
  ]
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`)
    const { error } = await supabase
      .from('user_favorites')
      .insert([test.data])
    
    if (!error) {
      console.log(`   ✅ Works! Columns: ${Object.keys(test.data).join(', ')}`)
      
      // Try to fetch it back to see all columns
      const { data: fetched } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', '523f2768-6404-439c-a429-f9eb6736aa17')
        .limit(1)
        .single()
      
      if (fetched) {
        console.log('   All columns in table:', Object.keys(fetched).join(', '))
        
        // Clean up
        await supabase
          .from('user_favorites')
          .delete()
          .eq('id', fetched.id)
      }
      break
    } else {
      console.log(`   ❌ Failed: ${error.message}`)
    }
  }
}

checkUserFavoritesColumns()