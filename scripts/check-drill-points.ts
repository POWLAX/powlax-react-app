// scripts/check-drill-points.ts
// Purpose: Check drill point values for PointExplosion animation

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDrillPoints() {
  console.log('📊 Checking drill point values for real animation...')
  
  try {
    // Check skills_academy_drills
    const { data: drills, error } = await supabase
      .from('skills_academy_drills')
      .select('id, title, point_values')
      .limit(3)
    
    if (error) {
      console.error('❌ Error fetching drill data:', error)
    } else {
      console.log('🎯 Skills Academy Drills sample:')
      drills?.forEach(drill => {
        console.log(`  ID: ${drill.id}`)
        console.log(`  Title: ${drill.title}`)
        console.log(`  Points:`, drill.point_values)
        console.log('  ---')
      })
    }

    // Check wall ball drills too
    const { data: wallBall, error: wbError } = await supabase
      .from('wall_ball_drill_library')
      .select('id, workout_name, point_values')
      .limit(2)
    
    if (wbError) {
      console.error('❌ Error fetching wall ball data:', wbError)
    } else {
      console.log('🏀 Wall Ball Drills sample:')
      wallBall?.forEach(drill => {
        console.log(`  ID: ${drill.id}`)
        console.log(`  Name: ${drill.workout_name}`)
        console.log(`  Points:`, drill.point_values)
        console.log('  ---')
      })
    }

    // Test award_drill_points function
    console.log('🧪 Testing award_drill_points RPC function...')
    const { data: pointsResult, error: rpcError } = await supabase
      .rpc('award_drill_points', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_drill_id: 1,
        p_drill_count: 1,
        p_workout_id: 1
      })
    
    if (rpcError) {
      console.log('⚠️ RPC Test (expected to fail with test UUID):')
      console.log('  Error:', rpcError.message)
    } else {
      console.log('✅ RPC Function Response:')
      console.log('  Points awarded:', pointsResult)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkDrillPoints().catch(console.error)