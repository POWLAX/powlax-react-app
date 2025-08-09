import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkDrills() {
  const { data: drills, error } = await supabase
    .from('powlax_drills')
    .select('id, title, category, game_states')
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Sample drills:')
  drills?.forEach(drill => {
    console.log(`- ${drill.title}: category=${drill.category}, game_states=${drill.game_states}`)
  })
  
  // Get unique categories and game_states
  const { data: allDrills } = await supabase
    .from('powlax_drills')
    .select('category, game_states')
  
  const categories = new Set()
  const gameStates = new Set()
  
  allDrills?.forEach(drill => {
    if (drill.category) categories.add(drill.category)
    if (drill.game_states) gameStates.add(drill.game_states)
  })
  
  console.log('\nUnique categories:', Array.from(categories))
  console.log('Unique game_states:', Array.from(gameStates))
  console.log('\nTotal drills:', allDrills?.length)
}

checkDrills()