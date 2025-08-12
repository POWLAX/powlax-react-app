import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function discoverBadgesColumns() {
  console.log('🔍 Discovering badges_powlax table columns...\n')
  
  // Test individual columns
  const possibleColumns = [
    'id',
    'title', 
    'description',
    'category',
    'image_url',
    'featured_image_url',
    'congratulations_text',
    'points_required',
    'points_type_required',
    'earning_mechanism',
    'maximum_earnings',
    'is_hidden',
    'is_sequential',
    'created_at',
    'updated_at',
    'gamipress_id',
    'wp_id',
    'original_id',
    'badge_type',
    'requirements'
  ]
  
  console.log('Testing columns one by one...\n')
  
  const validColumns: string[] = []
  
  for (const column of possibleColumns) {
    try {
      const { data, error } = await supabase
        .from('badges_powlax')
        .select(column)
        .limit(1)
      
      if (!error) {
        validColumns.push(column)
        console.log(`✅ ${column}`)
      } else {
        console.log(`❌ ${column} - ${error.message}`)
      }
    } catch (e) {
      console.log(`❌ ${column} - Error`)
    }
  }
  
  console.log(`\n📋 Valid columns found (${validColumns.length}):`)
  console.log(validColumns.join(', '))
  
  // Now try to create a minimal badge with valid columns
  const minimalBadge: any = {
    title: 'Test Badge Discovery'
  }
  
  // Add other basic columns if they exist
  if (validColumns.includes('description')) minimalBadge.description = 'Test description'
  if (validColumns.includes('category')) minimalBadge.category = 'test'
  if (validColumns.includes('image_url')) minimalBadge.image_url = 'https://test.com/image.png'
  
  console.log('\n🧪 Testing minimal badge insert with valid columns...')
  console.log('Badge data:', minimalBadge)
  
  const { data, error } = await supabase
    .from('badges_powlax')
    .insert([minimalBadge])
    .select()
  
  if (error) {
    console.log('❌ Insert failed:', error.message)
  } else {
    console.log('✅ Insert successful!')
    console.log('📋 Full record structure:', data)
    
    // Clean up
    if (data && data.length > 0) {
      await supabase
        .from('badges_powlax')
        .delete()
        .eq('id', data[0].id)
      console.log('🧹 Cleaned up test record')
    }
  }
}

discoverBadgesColumns()