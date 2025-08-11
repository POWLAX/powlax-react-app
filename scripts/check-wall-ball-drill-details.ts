import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDrillDetails() {
  console.log('🔍 Checking wall_ball_drill_library details...\n')
  
  const { data: drills, error } = await supabase
    .from('wall_ball_drill_library')
    .select('*')
    .order('id')
  
  if (error) {
    console.error('Error fetching drills:', error)
    return
  }
  
  console.log(`📊 Found ${drills?.length || 0} drills in wall_ball_drill_library:`)
  console.log('=' .repeat(80))
  
  drills?.forEach(drill => {
    console.log(`\nDrill ID: ${drill.id}`)
    console.log(`  Name: "${drill.drill_name}"`)
    console.log(`  Slug: "${drill.drill_slug}"`)
    console.log(`  Difficulty: ${drill.difficulty_level}`)
    console.log(`  Strong Hand Video: ${drill.strong_hand_video_url || 'None'}`)
    console.log(`  Off Hand Video: ${drill.off_hand_video_url || 'None'}`)
    console.log(`  Both Hands Video: ${drill.both_hands_video_url || 'None'}`)
    console.log(`  Description: ${drill.description || 'None'}`)
    console.log(`  Active: ${drill.is_active}`)
  })
  
  console.log('\n' + '=' .repeat(80))
  console.log('✅ Drill details check complete')
}

checkDrillDetails().catch(console.error)
