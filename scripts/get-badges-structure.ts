import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function getBadgesStructure() {
  console.log('🔍 Getting badges_powlax table structure...\n')
  
  try {
    // Try to insert a test record to see what columns are expected
    const { error: insertError } = await supabase
      .from('badges_powlax')
      .insert([{
        title: 'TEST_STRUCTURE_CHECK'
      }])
    
    if (insertError) {
      console.log('💡 Insert error reveals table structure:', insertError.message)
      console.log('💡 Error details:', insertError.details)
      console.log('💡 Error hint:', insertError.hint)
    } else {
      console.log('✅ Test insert successful - title column exists')
      
      // Delete the test record
      await supabase
        .from('badges_powlax')
        .delete()
        .eq('title', 'TEST_STRUCTURE_CHECK')
    }
    
    // Try more comprehensive insert to discover all columns
    const testBadge = {
      title: 'Test Badge',
      description: 'Test description', 
      category: 'test',
      image_url: 'https://test.com/image.png',
      featured_image_url: 'https://test.com/featured.png',
      congratulations_text: 'Congratulations!',
      points_required: 5,
      points_type_required: 'test_point',
      earning_mechanism: 'Test earning',
      maximum_earnings: 1,
      is_hidden: false,
      is_sequential: false
    }
    
    console.log('\n🧪 Testing comprehensive badge insert...')
    const { data, error: fullError } = await supabase
      .from('badges_powlax')
      .insert([testBadge])
      .select()
    
    if (fullError) {
      console.log('💡 Full insert error:', fullError.message)
    } else {
      console.log('✅ Full insert successful!')
      console.log('📋 Returned data structure:', data)
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('badges_powlax')
          .delete()
          .eq('id', data[0].id)
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

getBadgesStructure()