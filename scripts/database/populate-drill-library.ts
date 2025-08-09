import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// List of drills from the SQL implementation plan for Midfield workouts
const MIDFIELD_DRILLS = [
  // M1 drills
  'Shoulder to Shoulder Cradle',
  'Shoulder to Nose Cradle',
  'Strong Hand Wall Ball',
  'Off Hand Wall Ball',
  'Wall Ball (Both Hands)',
  // M2 drills
  'Fake Low Shoot High Drill',
  'Fake High Shoot Low Drill',
  'Catching Over The Shoulder',
  'Time and Room Shooting Drill',
  'Shooting on the Run Drill',
  // M3 drills
  'Quick Stick Drill',
  'Face Dodge and Inside Finishing Drill',
  'Bear Hug Cradle Drill',
  'Inside Roll to Shot Drill',
  'Hockey Finish Drill',
  // M4 drills
  'Approach and Recover Drill',
  'Top Center Drop Step & Run Drill',
  'Defensive Footwork - Slide',
  'Backpedal and Break Drill',
  'Approach Angle Drill',
  // M5 drills
  'Wing Dodge to Shot Drill',
  'Alley Dodge to Shot Drill',
  'Wing Sweep to Shot Drill',
  'Wing to Inside Roll Drill',
  'Speed Dodge from Wing Drill',
  // M6 drills
  'Wind Up Dodge to Time and Room Drill',
  'Time and Room Catch and Shoot Drill',
  'Wind Up to Roll Dodge Drill',
  'Time and Room Release Points Drill',
  // M7 drills
  'Split Dodge and Shoot on the Run Drill',
  'Master Split Dodge Progression Drill',
  'Split to Roll Combination Drill',
  'Shooting on the Run - Multiple Angles Drill',
  // M8 drills
  'Ladder Footwork - In and Out Drill',
  'Creative Dodging - Hesitation Drill',
  'Approach Angles with Ladder Drill',
  'Creative Roll Dodge Drill',
  // M9 drills
  'Inside Finishing - Quick Release Drill',
  'Hesitation to Inside Roll Drill',
  'Roll Dodge Progression Drill',
  'Sell the Shot Roll Dodge Drill',
  // M10 drills
  'Face Dodge Mastery Drill',
  'Inside Finishing - Change Planes Drill',
  'Time and Room Multiple Release Points Drill',
  'Face Dodge to Quick Shot Drill',
  // M11 drills
  'Shooting on the Run - Full Speed Drill',
  'Slide Em Dodge to Shot Drill',
  'Run and Gun Shooting Drill',
  'Slide Em from Multiple Angles Drill',
  // M12 drills
  'Defensive Approach - Top Center Drill',
  'Recovery Footwork Drill',
  'Fast Break Defense Drill',
  'Defensive Slides and Recoveries Drill'
]

async function populateDrillLibrary() {
  console.log('🚀 Populating skills_academy_drill_library with drills')
  
  try {
    // Create drill entries for the library
    const drillEntries = MIDFIELD_DRILLS.map((drillName, index) => ({
      drill_name: drillName,
      drill_category: 'Midfield',
      drill_duration_seconds: 60,
      repetitions: 10,
      difficulty_level: Math.floor((index / 10) + 1), // Increase difficulty every 10 drills
      age_group: '11-14',
      equipment_needed: determineEquipment(drillName),
      both_hands_vimeo_id: '123456789', // Placeholder Vimeo ID
      strong_hand_vimeo_id: '123456790',
      off_hand_vimeo_id: '123456791',
      description: `Practice ${drillName} to improve your lacrosse skills.`,
      coaching_points: ['Focus on form', 'Keep your stick up', 'Quick movements'],
      requires_partner: drillName.includes('Partner'),
      requires_cones: drillName.includes('Cone') || drillName.includes('Ladder'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    console.log(`Inserting ${drillEntries.length} drills into drill library...`)
    
    // Insert drills
    const { data: inserted, error: insertError } = await supabase
      .from('skills_academy_drill_library')
      .insert(drillEntries)
      .select('id, drill_name')
    
    if (insertError) {
      console.error('Error inserting drills:', insertError)
      return false
    }
    
    console.log(`✅ Successfully inserted ${inserted?.length || 0} drills`)
    
    // Display the first few inserted drills
    console.log('\n📋 Sample inserted drills:')
    inserted?.slice(0, 5).forEach(drill => {
      console.log(`  - ${drill.drill_name} (ID: ${drill.id})`)
    })
    
    // Now populate M1 Complete workout with these drills
    console.log('\n🔗 Now linking drills to M1 Complete workout...')
    
    // Get first 15 drills for M1 Complete
    const m1Drills = inserted?.slice(0, 15) || []
    
    if (m1Drills.length > 0) {
      const workoutId = 49 // M1 - Complete Workout
      
      // Create junction table entries
      const junctionEntries = m1Drills.map((drill, index) => ({
        workout_id: workoutId,
        drill_id: drill.id, // Now using UUID from drill_library
        sequence_order: index + 1,
        drill_duration_seconds: 60,
        repetitions: 10
      }))
      
      // Clear existing entries
      await supabase
        .from('skills_academy_workout_drills')
        .delete()
        .eq('workout_id', workoutId)
      
      // Insert new mappings
      const { data: mappings, error: mappingError } = await supabase
        .from('skills_academy_workout_drills')
        .insert(junctionEntries)
        .select()
      
      if (mappingError) {
        console.error('Error creating workout mappings:', mappingError)
      } else {
        console.log(`✅ Linked ${mappings?.length || 0} drills to M1 Complete workout`)
      }
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

function determineEquipment(drillName: string): string[] {
  const equipment = []
  if (drillName.includes('Wall Ball')) equipment.push('wall', 'ball')
  if (drillName.includes('Cone') || drillName.includes('Ladder')) equipment.push('cones')
  if (drillName.includes('Shooting')) equipment.push('goal', 'ball')
  if (drillName.includes('Ground Ball')) equipment.push('ball')
  if (equipment.length === 0) equipment.push('stick', 'ball')
  return equipment
}

// Run the population
populateDrillLibrary().then(success => {
  if (success) {
    console.log('\n🎉 Drill library and M1 Complete workout successfully populated!')
    console.log('\n📱 Test the Skills Academy UI:')
    console.log('  1. Go to Skills Academy page')
    console.log('  2. Find Midfield series')
    console.log('  3. Click on M1 workout')
    console.log('  4. Check if drills appear in preview modal')
  } else {
    console.log('\n❌ Failed to populate drill library.')
  }
  process.exit(success ? 0 : 1)
})