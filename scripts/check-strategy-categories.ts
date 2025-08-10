import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function checkCategories() {
  console.log('Checking strategy_categories in powlax_strategies table...\n')
  
  const { data, error } = await supabase
    .from('powlax_strategies')
    .select('strategy_categories')
    .not('strategy_categories', 'is', null)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  // Get unique categories
  const categories = new Set<string>()
  data?.forEach(row => {
    if (row.strategy_categories) {
      categories.add(row.strategy_categories)
    }
  })
  
  console.log('Unique strategy_categories values:')
  Array.from(categories).sort().forEach(cat => {
    console.log('  -', cat)
  })
  console.log('\nTotal unique categories:', categories.size)
  console.log('Total strategies with categories:', data?.length)
}

checkCategories()