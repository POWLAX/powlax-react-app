import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function verifyActualTableStructures() {
  console.log('🔍 Verifying Actual Table Structures\n')
  
  // Test minimal inserts to discover what columns exist
  console.log('1️⃣ Testing user_drills table...')
  
  // Try different combinations to find what works
  const drillTests = [
    {
      name: 'Minimal test',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        title: 'Test Drill'
      }
    },
    {
      name: 'With name instead of title',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        name: 'Test Drill'
      }
    },
    {
      name: 'With drill_name',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        drill_name: 'Test Drill'
      }
    }
  ]
  
  for (const test of drillTests) {
    const { error } = await supabase
      .from('user_drills')
      .insert([test.data])
    
    if (!error) {
      console.log(`   ✅ ${test.name} works!`)
      console.log(`      Required fields: ${Object.keys(test.data).join(', ')}`)
      
      // Clean up test data
      const { data: inserted } = await supabase
        .from('user_drills')
        .select('id')
        .or(`title.eq.Test Drill,name.eq.Test Drill,drill_name.eq.Test Drill`)
        .single()
      
      if (inserted) {
        await supabase.from('user_drills').delete().eq('id', inserted.id)
      }
      break
    } else {
      console.log(`   ❌ ${test.name} failed: ${error.message}`)
    }
  }
  
  console.log('\n2️⃣ Testing user_strategies table...')
  
  const strategyTests = [
    {
      name: 'With content column',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        strategy_name: 'Test Strategy',
        content: 'Test content'
      }
    },
    {
      name: 'Without content column',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        strategy_name: 'Test Strategy'
      }
    },
    {
      name: 'With description',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        strategy_name: 'Test Strategy',
        description: 'Test description'
      }
    },
    {
      name: 'With name instead of strategy_name',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        name: 'Test Strategy'
      }
    }
  ]
  
  for (const test of strategyTests) {
    const { error } = await supabase
      .from('user_strategies')
      .insert([test.data])
    
    if (!error) {
      console.log(`   ✅ ${test.name} works!`)
      console.log(`      Required fields: ${Object.keys(test.data).join(', ')}`)
      
      // Clean up test data
      const { data: inserted } = await supabase
        .from('user_strategies')
        .select('id')
        .or(`strategy_name.eq.Test Strategy,name.eq.Test Strategy`)
        .single()
      
      if (inserted) {
        await supabase.from('user_strategies').delete().eq('id', inserted.id)
      }
      break
    } else {
      console.log(`   ❌ ${test.name} failed: ${error.message}`)
    }
  }
  
  console.log('\n3️⃣ Testing user_favorites table...')
  
  const favoriteTests = [
    {
      name: 'Standard format',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        item_id: 'test-123',
        item_type: 'drill'
      }
    },
    {
      name: 'With favorite_type',
      data: {
        user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
        item_id: 'test-123',
        favorite_type: 'drill'
      }
    }
  ]
  
  for (const test of favoriteTests) {
    const { error } = await supabase
      .from('user_favorites')
      .insert([test.data])
    
    if (!error) {
      console.log(`   ✅ ${test.name} works!`)
      console.log(`      Required fields: ${Object.keys(test.data).join(', ')}`)
      
      // Clean up test data
      await supabase
        .from('user_favorites')
        .delete()
        .eq('item_id', 'test-123')
      break
    } else {
      console.log(`   ❌ ${test.name} failed: ${error.message}`)
    }
  }
  
  console.log('\n📋 SUMMARY:')
  console.log('================================')
  console.log('Based on the tests above, update the hooks to use the correct column names')
  console.log('that actually work with the database tables.')
}

verifyActualTableStructures()