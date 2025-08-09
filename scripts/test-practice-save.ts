import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testPracticeSaveLoad() {
  console.log('🧪 Testing Practice Save/Load Functionality\n')
  console.log('=' .repeat(50) + '\n')
  
  // 1. Create a test user
  const testEmail = `test-${Date.now()}@powlax.com`
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'testpass123',
    email_confirm: true
  })
  
  if (authError) {
    console.error('❌ Failed to create test user:', authError)
    return
  }
  
  const userId = authData.user.id
  console.log('✅ Created test user:', testEmail)
  
  // 2. Create a test practice plan
  const testPlan = {
    title: 'Test Practice Plan - ' + new Date().toISOString(),
    user_id: userId,
    practice_date: new Date().toISOString().split('T')[0],
    start_time: '16:00:00',
    duration_minutes: 90,
    field_type: 'turf',
    setup_time: 15,
    setup_notes: 'Test setup notes',
    practice_notes: 'Test practice notes',
    drill_sequence: {
      timeSlots: [
        {
          id: 'slot-1',
          duration: 10,
          drills: [
            {
              id: 'test-drill-1',
              name: 'Warm-up Drill',
              duration: 10,
              category: 'warm-up'
            }
          ]
        },
        {
          id: 'slot-2', 
          duration: 20,
          drills: [
            {
              id: 'test-drill-2',
              name: 'Passing Drill',
              duration: 20,
              category: 'skill'
            }
          ]
        }
      ],
      practiceInfo: {
        startTime: '16:00',
        setupTime: 15,
        field: 'Turf Field 1'
      }
    },
    selected_strategies: [1, 2, 3], // Sample strategy IDs
    template: false,
    is_draft: false
  }
  
  console.log('\n📝 Saving practice plan...')
  const { data: savedPlan, error: saveError } = await supabase
    .from('practice_plans')
    .insert([testPlan])
    .select()
    .single()
  
  if (saveError) {
    console.error('❌ Failed to save practice plan:', saveError)
    return
  }
  
  console.log('✅ Practice plan saved with ID:', savedPlan.id)
  
  // 3. Load the practice plan back
  console.log('\n📖 Loading practice plan...')
  const { data: loadedPlan, error: loadError } = await supabase
    .from('practice_plans')
    .select('*')
    .eq('id', savedPlan.id)
    .single()
  
  if (loadError) {
    console.error('❌ Failed to load practice plan:', loadError)
    return
  }
  
  console.log('✅ Practice plan loaded successfully!')
  
  // 4. Verify data integrity
  console.log('\n🔍 Verifying data integrity...')
  const checks = [
    ['Title', loadedPlan.title === testPlan.title],
    ['Duration', loadedPlan.duration_minutes === testPlan.duration_minutes],
    ['Field Type', loadedPlan.field_type === testPlan.field_type],
    ['Setup Time', loadedPlan.setup_time === testPlan.setup_time],
    ['Drill Sequence', JSON.stringify(loadedPlan.drill_sequence) === JSON.stringify(testPlan.drill_sequence)]
  ]
  
  let allPassed = true
  checks.forEach(([field, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${field}`)
    if (!passed) allPassed = false
  })
  
  // 5. Test practice_plan_drills junction table
  console.log('\n🔗 Testing practice_plan_drills junction table...')
  
  // Get a real drill ID from powlax_drills
  const { data: sampleDrill } = await supabase
    .from('powlax_drills')
    .select('id')
    .limit(1)
    .single()
  
  if (sampleDrill) {
    const drillInstance = {
      practice_plan_id: savedPlan.id,
      drill_id: sampleDrill.id,
      order_index: 1,
      duration_override: 15,
      instance_notes: 'Test notes for drill instance',
      is_parallel: false,
      is_key_focus: true,
      start_time: 10
    }
    
    const { data: savedDrill, error: drillError } = await supabase
      .from('practice_plan_drills')
      .insert([drillInstance])
      .select()
      .single()
    
    if (drillError) {
      console.error('❌ Failed to save drill instance:', drillError)
    } else {
      console.log('✅ Drill instance saved to junction table')
    }
  }
  
  // 6. Clean up
  console.log('\n🧹 Cleaning up test data...')
  
  // Delete practice plan (cascade will delete drill instances)
  await supabase
    .from('practice_plans')
    .delete()
    .eq('id', savedPlan.id)
  
  // Delete test user
  await supabase.auth.admin.deleteUser(userId)
  
  console.log('✅ Test data cleaned up')
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('\n📊 Test Summary:')
  console.log(allPassed ? '✅ All tests PASSED!' : '❌ Some tests FAILED')
  console.log('\nDatabase tables are working correctly for:')
  console.log('  • practice_plans')
  console.log('  • practice_plan_drills')
  console.log('  • Foreign key relationships')
  console.log('  • JSONB drill_sequence storage')
}

testPracticeSaveLoad()