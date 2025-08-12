import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function testPointCounterData() {
  console.log('🧪 Testing Point Counter data flow...')
  
  try {
    // Test 1: Check point types accessibility from client
    console.log('\n📊 Testing point types access...')
    const { data: pointTypes, error: pointTypesError } = await supabase
      .from('point_types_powlax')
      .select('*')
      .eq('is_active', true)
    
    if (pointTypesError) {
      console.error('❌ Point types error:', pointTypesError)
    } else {
      console.log(`✅ Point types accessible: ${pointTypes.length} types`)
      pointTypes.slice(0, 3).forEach(pt => {
        console.log(`  • ${pt.display_name} - Icon: ${pt.icon_url ? '✅' : '❌'}`)
      })
    }
    
    // Test 2: Check workout data for series type mapping
    console.log('\n🏋️ Testing workout data for series mapping...')
    const { data: workouts, error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .select(`
        id, 
        workout_name,
        series:skills_academy_series(series_name, series_type)
      `)
      .eq('id', 1)
      .single()
    
    if (workoutError) {
      console.error('❌ Workout error:', workoutError)
    } else {
      console.log('✅ Workout data:')
      console.log(`  • Name: ${workouts.workout_name}`)
      console.log(`  • Series Type: ${workouts.series?.series_type || 'N/A'}`)
      console.log(`  • Series Name: ${workouts.series?.series_name || 'N/A'}`)
    }
    
    // Test 3: Simulate point counter logic
    console.log('\n🎯 Testing point counter logic...')
    const seriesType = workouts?.series?.series_type
    const mockPoints = {
      lax_credit: 25,
      academy_point: 25,
      attack_token: 10,
      defense_dollar: 15
    }
    
    console.log(`Series type: ${seriesType}`)
    console.log('Mock points:', mockPoints)
    
    // Simulate the point counter filtering logic
    const seriesPointMap: Record<string, string[]> = {
      'attack': ['lax_credit', 'attack_token', 'lax_iq_points'],
      'defense': ['lax_credit', 'defense_dollar', 'rebound_reward'],
      'midfield': ['lax_credit', 'midfield_medal', 'flex_points'],
      'wall_ball': ['lax_credit', 'rebound_reward', 'lax_iq_points'],
    }
    
    const relevantTypes = seriesPointMap[seriesType || ''] || ['lax_credit', 'lax_iq_points']
    console.log(`Relevant point types for ${seriesType}:`, relevantTypes)
    
    // Filter point types to relevant ones
    const relevantPointTypes = pointTypes?.filter(type => 
      relevantTypes.some(relevant => 
        type.name === relevant ||
        type.slug === relevant ||
        (type.display_name && type.display_name.toLowerCase().replace(/\s+/g, '_') === relevant) ||
        (type.display_name && type.display_name.toLowerCase().includes(relevant.replace('_', ' '))) ||
        (relevant === 'lax_credit' && type.display_name && type.display_name.toLowerCase().includes('academy'))
      )
    ) || []
    
    console.log(`Filtered point types (${relevantPointTypes.length}):`)
    relevantPointTypes.slice(0, 3).forEach(pt => {
      const pointValue = mockPoints[pt.name as keyof typeof mockPoints] || 0
      console.log(`  • ${pt.display_name}: ${pointValue} points`)
    })
    
    console.log('\n🎉 Point Counter test complete!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testPointCounterData()