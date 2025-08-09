import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function phase1DatabasePrep() {
  console.log('🚀 PHASE 1: Database Preparation')
  
  try {
    // First, check if drill_ids column exists
    const { data: columns } = await supabase.rpc('get_table_columns', {
      table_name: 'skills_academy_workouts'
    }).single()
    
    console.log('Current columns:', columns)
    
    // Add drill_ids column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE skills_academy_workouts 
        ADD COLUMN IF NOT EXISTS drill_ids INTEGER[] DEFAULT '{}';
      `
    })
    
    if (alterError) {
      console.error('Error adding drill_ids column:', alterError)
    } else {
      console.log('✅ drill_ids column ensured')
    }
    
    // Test by updating one workout with sample drill IDs
    const { data: testWorkout } = await supabase
      .from('skills_academy_workouts')
      .select('id, title, workout_name')
      .limit(1)
      .single()
    
    if (testWorkout) {
      console.log('\n📝 Testing with workout:', testWorkout.title)
      
      // Get first 5 drills from skills_academy_drills
      const { data: sampleDrills } = await supabase
        .from('skills_academy_drills')
        .select('id, title')
        .limit(5)
      
      if (sampleDrills && sampleDrills.length > 0) {
        const drillIds = sampleDrills.map(d => d.id)
        
        // Update the test workout with drill IDs
        const { data: updated, error: updateError } = await supabase
          .from('skills_academy_workouts')
          .update({ drill_ids: drillIds })
          .eq('id', testWorkout.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating workout:', updateError)
        } else {
          console.log('✅ Test workout updated with drill_ids:', updated?.drill_ids)
          console.log('Drill names:', sampleDrills.map(d => d.title))
        }
      }
    }
    
    // Verify the column exists and has data
    const { data: verification } = await supabase
      .from('skills_academy_workouts')
      .select('id, title, drill_ids')
      .not('drill_ids', 'is', null)
      .limit(5)
    
    console.log('\n✅ Phase 1 Complete - Workouts with drill_ids:', verification?.length || 0)
    verification?.forEach(w => {
      console.log(`  - ${w.title}: ${w.drill_ids?.length || 0} drills`)
    })
    
    return true
  } catch (error) {
    console.error('Phase 1 failed:', error)
    return false
  }
}

// Run Phase 1
phase1DatabasePrep().then(success => {
  if (success) {
    console.log('\n🎉 Phase 1 successful! Ready to proceed with full mapping.')
  } else {
    console.log('\n❌ Phase 1 failed. Please check errors above.')
  }
  process.exit(success ? 0 : 1)
})