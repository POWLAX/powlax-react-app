import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function checkAllDrillTables() {
  console.log('\n=== Checking All Drill-Related Tables ===\n')
  
  const tables = ['drills', 'drills_powlax', 'powlax_drills', 'academy_drills', 'drills_academy']
  
  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (!error) {
      console.log(`✅ Table '${table}' exists with ${count} rows`)
      if (data && data[0]) {
        const columns = Object.keys(data[0])
        console.log(`   Key columns: ${columns.slice(0, 10).join(', ')}...`)
        
        // Check for important fields
        const hasName = columns.includes('name')
        const hasTitle = columns.includes('title')
        const hasDrillTypes = columns.includes('drill_types')
        const hasDrillCategory = columns.includes('drill_category')
        
        console.log(`   - has 'name': ${hasName}`)
        console.log(`   - has 'title': ${hasTitle}`)
        console.log(`   - has 'drill_types': ${hasDrillTypes}`)
        console.log(`   - has 'drill_category': ${hasDrillCategory}`)
      }
    } else {
      console.log(`❌ Table '${table}' not found`)
    }
    console.log('')
  }
}

checkAllDrillTables().catch(console.error)