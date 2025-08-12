import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFavoritesSchema() {
  console.log('⭐ Checking user_favorites table schema...')
  
  // Try different field combinations to see what's required
  const testCombinations = [
    {
      name: 'item_id + item_type (our current approach)',
      data: {
        user_id: '00000000-0000-0000-0000-000000000000',
        item_id: 'test-123',
        item_type: 'drill'
      }
    },
    {
      name: 'drill_id + strategy_id (alternative)',
      data: {
        user_id: '00000000-0000-0000-0000-000000000000',
        drill_id: 'test-123',
        strategy_id: null
      }
    },
    {
      name: 'drill_id only',
      data: {
        user_id: '00000000-0000-0000-0000-000000000000',
        drill_id: 'test-123'
      }
    }
  ]
  
  for (const combination of testCombinations) {
    console.log(`\n🧪 Testing: ${combination.name}`)
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert([combination.data])
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        console.log(`   💡 This tells us about required fields`)
      } else {
        console.log(`   ✅ Success! This is the correct schema`)
        // Clean up if successful
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000')
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err.message}`)
    }
  }
  
  // Check if we can see the actual table structure
  console.log('\n🔍 Trying to infer schema from existing data...')
  try {
    const { data } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(5)
    
    if (data && data.length > 0) {
      console.log('✅ Found existing favorites data:')
      data.forEach((item, i) => {
        console.log(`   Row ${i + 1}:`, Object.keys(item))
      })
    } else {
      console.log('No existing data found')
    }
  } catch (err: any) {
    console.log(`Schema check error: ${err.message}`)
  }
}

checkFavoritesSchema().catch(console.error)