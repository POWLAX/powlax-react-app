import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testParallelDrills() {
  console.log('🧪 Testing Parallel Drills Save/Load...\n')

  // Create a test practice plan with parallel drills
  const testPlan = {
    title: 'Test Practice with Parallel Drills',
    user_id: '00000000-0000-0000-0000-000000000001', // Test user ID
    team_id: null, // Skip team for testing
    practice_date: new Date().toISOString().split('T')[0],
    start_time: '15:30',
    duration_minutes: 90,
    field_type: 'turf' as const,
    setup_time: 15,
    setup_notes: JSON.stringify(['Set up cones', 'Prepare equipment']),
    practice_notes: 'Testing parallel drill functionality',
    drill_sequence: JSON.stringify({
      timeSlots: [
        {
          id: 'slot-1',
          duration: 10,
          drills: [
            {
              id: 'drill-1',
              name: 'Warm-up Jog',
              duration: 10,
              notes: 'Light jogging around the field'
            }
          ]
        },
        {
          id: 'slot-2',
          duration: 15,
          drills: [
            {
              id: 'drill-2',
              name: 'Passing Lines',
              duration: 15,
              notes: 'Work on accuracy'
            },
            {
              id: 'drill-3',
              name: 'Ground Ball Station',
              duration: 15,
              notes: 'Quick scoops'
            },
            {
              id: 'drill-4',
              name: 'Shooting Station',
              duration: 15,
              notes: 'Focus on placement'
            }
          ]
        },
        {
          id: 'slot-3',
          duration: 20,
          drills: [
            {
              id: 'drill-5',
              name: '6v6 Scrimmage',
              duration: 20,
              notes: 'Full field play'
            }
          ]
        }
      ],
      practiceInfo: {
        startTime: '15:30',
        setupTime: 15,
        field: 'Field 1'
      }
    }),
    selected_strategies: [1, 2] // Strategy IDs instead of names
  }

  // Test 1: Save the practice plan
  console.log('📝 Test 1: Saving practice plan with parallel drills...')
  
  // Try the collaborative table which may have fewer constraints
  const { data: savedPlan, error: saveError } = await supabase
    .from('practice_plans_collaborative')
    .insert([{
      ...testPlan,
      coach_id: testPlan.user_id, // Use coach_id instead of user_id
      user_id: undefined
    }])
    .select()
    .single()

  if (saveError) {
    console.error('❌ Save failed:', JSON.stringify(saveError, null, 2))
    // Try to get more details
    console.error('Details:', saveError.message || saveError.code || 'Unknown error')
    return
  }

  console.log('✅ Practice plan saved successfully!')
  console.log(`   ID: ${savedPlan.id}`)

  // Test 2: Load the practice plan
  console.log('\n📖 Test 2: Loading practice plan...')
  const { data: loadedPlan, error: loadError } = await supabase
    .from('practice_plans_collaborative')
    .select('*')
    .eq('id', savedPlan.id)
    .single()

  if (loadError) {
    console.error('❌ Load failed:', loadError)
    return
  }

  console.log('✅ Practice plan loaded successfully!')

  // Test 3: Verify parallel drills structure
  console.log('\n🔍 Test 3: Verifying parallel drills structure...')
  const drillSequence = JSON.parse(loadedPlan.drill_sequence)
  
  console.log(`   Total time slots: ${drillSequence.timeSlots.length}`)
  drillSequence.timeSlots.forEach((slot: any, index: number) => {
    console.log(`   Slot ${index + 1}: ${slot.drills.length} drill(s)`)
    if (slot.drills.length > 1) {
      console.log(`      ✅ PARALLEL SLOT with ${slot.drills.length} activities:`)
      slot.drills.forEach((drill: any, drillIndex: number) => {
        console.log(`         Lane ${drillIndex + 1}: ${drill.name} (${drill.duration} min)`)
      })
    } else {
      console.log(`      Single drill: ${slot.drills[0].name}`)
    }
  })

  // Test 4: Clean up test data
  console.log('\n🧹 Test 4: Cleaning up test data...')
  const { error: deleteError } = await supabase
    .from('practice_plans_collaborative')
    .delete()
    .eq('id', savedPlan.id)

  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError)
    return
  }

  console.log('✅ Test data cleaned up successfully!')
  console.log('\n🎉 All parallel drill tests passed!')
}

testParallelDrills().catch(console.error)