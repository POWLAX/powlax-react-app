import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function checkDrillTables() {
  console.log('\n=== Checking Drill Tables ===\n')
  
  // Check powlax_drills table
  const { data: drills, error, count } = await supabase
    .from('powlax_drills')
    .select('*', { count: 'exact' })
    .limit(3)
  
  if (error) {
    console.log('❌ Error accessing powlax_drills:', error.message)
    console.log('Full error:', error)
  } else {
    console.log(`✅ powlax_drills table found with ${count} rows`)
    
    if (drills && drills.length > 0) {
      console.log('\nColumn names in powlax_drills:')
      console.log(Object.keys(drills[0]))
      
      console.log('\nFirst drill sample:')
      const sample = drills[0]
      console.log('- id:', sample.id)
      console.log('- name:', sample.name)
      console.log('- title:', sample.title)
      console.log('- drill_types:', sample.drill_types)
      console.log('- drill_category:', sample.drill_category)
      console.log('- drill_duration:', sample.drill_duration)
    }
  }
  
  // Also check user_drills
  const { data: userDrills, error: userError } = await supabase
    .from('user_drills')
    .select('*', { count: 'exact' })
    .limit(1)
  
  if (userError) {
    console.log('\n❌ Error accessing user_drills:', userError.message)
  } else {
    console.log('\n✅ user_drills table found')
    if (userDrills && userDrills.length > 0) {
      console.log('User drills columns:', Object.keys(userDrills[0]))
    }
  }
  
  process.exit(0)
}

checkDrillTables().catch(console.error)