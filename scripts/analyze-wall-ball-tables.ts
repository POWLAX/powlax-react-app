import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function analyzeWallBallTables() {
  console.log('🏐 Wall Ball Tables Analysis\n')

  // Analyze powlax_wall_ball_collections
  console.log('📊 POWLAX_WALL_BALL_COLLECTIONS:')
  const { data: collections, error: collectionsError } = await supabase
    .from('powlax_wall_ball_collections')
    .select('*')
    .limit(5)

  if (collectionsError) {
    console.error('❌ Error fetching collections:', collectionsError)
  } else {
    console.log(`✅ Found ${collections?.length || 0} records (showing first 5):`)
    collections?.forEach((collection, index) => {
      console.log(`\n  ${index + 1}. Collection:`)
      Object.entries(collection).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  // Get total count
  const { count: collectionsCount } = await supabase
    .from('powlax_wall_ball_collections')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📈 Total Collections: ${collectionsCount}`)

  // Analyze powlax_wall_ball_collection_drills
  console.log('\n📊 POWLAX_WALL_BALL_COLLECTION_DRILLS (Junction Table):')
  const { data: junctionData, error: junctionError } = await supabase
    .from('powlax_wall_ball_collection_drills')
    .select('*')
    .limit(5)

  if (junctionError) {
    console.error('❌ Error fetching junction data:', junctionError)
  } else {
    console.log(`✅ Found ${junctionData?.length || 0} records (showing first 5):`)
    junctionData?.forEach((record, index) => {
      console.log(`\n  ${index + 1}. Junction Record:`)
      Object.entries(record).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  // Get total count
  const { count: junctionCount } = await supabase
    .from('powlax_wall_ball_collection_drills')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📈 Total Junction Records: ${junctionCount}`)

  // Analyze powlax_wall_ball_drill_library
  console.log('\n📊 POWLAX_WALL_BALL_DRILL_LIBRARY:')
  const { data: drillLibrary, error: drillLibraryError } = await supabase
    .from('powlax_wall_ball_drill_library')
    .select('*')
    .limit(5)

  if (drillLibraryError) {
    console.error('❌ Error fetching drill library:', drillLibraryError)
  } else {
    console.log(`✅ Found ${drillLibrary?.length || 0} records (showing first 5):`)
    drillLibrary?.forEach((drill, index) => {
      console.log(`\n  ${index + 1}. Drill:`)
      Object.entries(drill).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  // Get total count
  const { count: drillLibraryCount } = await supabase
    .from('powlax_wall_ball_drill_library')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📈 Total Wall Ball Drills: ${drillLibraryCount}`)

  // Now analyze Skills Academy structure for comparison
  console.log('\n\n🎓 Skills Academy Tables for Comparison:\n')

  // Skills Academy Series
  console.log('📊 SKILLS_ACADEMY_SERIES:')
  const { data: series, error: seriesError } = await supabase
    .from('skills_academy_series')
    .select('*')
    .limit(3)

  if (seriesError) {
    console.error('❌ Error fetching series:', seriesError)
  } else {
    console.log(`✅ Found ${series?.length || 0} records (showing first 3):`)
    series?.forEach((seriesItem, index) => {
      console.log(`\n  ${index + 1}. Series:`)
      Object.entries(seriesItem).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  // Skills Academy Workouts
  console.log('\n📊 SKILLS_ACADEMY_WORKOUTS:')
  const { data: workouts, error: workoutsError } = await supabase
    .from('skills_academy_workouts')
    .select('*')
    .limit(3)

  if (workoutsError) {
    console.error('❌ Error fetching workouts:', workoutsError)
  } else {
    console.log(`✅ Found ${workouts?.length || 0} records (showing first 3):`)
    workouts?.forEach((workout, index) => {
      console.log(`\n  ${index + 1}. Workout:`)
      Object.entries(workout).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  // Skills Academy Drills
  console.log('\n📊 SKILLS_ACADEMY_DRILLS:')
  const { data: sadrills, error: sadillsError } = await supabase
    .from('skills_academy_drills')
    .select('*')
    .limit(3)

  if (sadillsError) {
    console.error('❌ Error fetching skills academy drills:', sadillsError)
  } else {
    console.log(`✅ Found ${sadrills?.length || 0} records (showing first 3):`)
    sadrills?.forEach((drill, index) => {
      console.log(`\n  ${index + 1}. SA Drill:`)
      Object.entries(drill).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`)
      })
    })
  }

  console.log('\n✅ Analysis Complete!')
}

analyzeWallBallTables().catch(console.error)