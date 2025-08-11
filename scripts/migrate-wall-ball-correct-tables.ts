#!/usr/bin/env tsx
/**
 * CORRECTED WALL BALL MIGRATION
 * Using the correct tables:
 * - wall_ball_workout_series
 * - wall_ball_workout_variants  
 * - wall_ball_drill_library
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Starting IDs for new records
const STARTING_DRILL_ID = 168  // Next available drill ID
const STARTING_WORKOUT_ID = 119  // Next available workout ID

// Since drill_ids are empty in variants, we'll create intelligent assignments
// Based on workout duration and difficulty
const DRILL_ASSIGNMENTS = {
  '5min': [1, 2],           // 2 drills for 5-minute workouts
  '10min': [1, 2, 3, 4],    // 4 drills for 10-minute workouts  
  '15min': [1, 2, 3, 4, 5, 6], // 6 drills for 15-minute workouts
  'conditioning': [7, 8, 9]  // Advanced drills for conditioning
}

interface WallBallSeries {
  id: number
  series_name: string
  series_slug: string
  description: string
  difficulty_level: number
  skill_focus: string
}

interface WallBallVariant {
  id: number
  series_id: number
  variant_name: string
  duration_minutes: number
  has_coaching: boolean
  drill_ids: number[]
  full_workout_vimeo_id: string | null
}

interface WallBallDrill {
  id: number
  drill_name: string
  drill_slug: string
  strong_hand_vimeo_id: string | null
  off_hand_vimeo_id: string | null
  both_hands_vimeo_id: string | null
  description: string
  difficulty_level: number
  skill_focus: string
}

async function loadWallBallData() {
  console.log('📊 Loading wall ball data from CORRECT tables...\n')
  
  // Load series
  const { data: series, error: seriesError } = await supabase
    .from('wall_ball_workout_series')
    .select('*')
    .order('id')
  
  if (seriesError) throw new Error(`Failed to load series: ${seriesError.message}`)
  
  // Load variants
  const { data: variants, error: variantsError } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .order('id')
  
  if (variantsError) throw new Error(`Failed to load variants: ${variantsError.message}`)
  
  // Load drills
  const { data: drills, error: drillsError } = await supabase
    .from('wall_ball_drill_library')
    .select('*')
    .order('id')
  
  if (drillsError) throw new Error(`Failed to load drills: ${drillsError.message}`)
  
  console.log(`✅ Loaded:`)
  console.log(`   - ${series?.length || 0} wall ball series`)
  console.log(`   - ${variants?.length || 0} wall ball variants`)
  console.log(`   - ${drills?.length || 0} wall ball drills\n`)
  
  return { series: series || [], variants: variants || [], drills: drills || [] }
}

async function checkExistingWallBallData() {
  console.log('🔍 Checking for existing wall ball data in Skills Academy...\n')
  
  // Check if wall ball series already exist
  const { data: existingSeries } = await supabase
    .from('skills_academy_series')
    .select('id, series_name')
    .or('series_type.eq.wall_ball,series_name.ilike.%wall%')
  
  if (existingSeries && existingSeries.length > 0) {
    console.log('⚠️  Found existing wall ball series in Skills Academy:')
    existingSeries.forEach(s => console.log(`   - ${s.id}: ${s.series_name}`))
    console.log('')
  }
  
  // Check for existing wall ball drills
  const { data: existingDrills } = await supabase
    .from('skills_academy_drills')
    .select('id, title')
    .contains('tags', ['wall-ball'])
  
  if (existingDrills && existingDrills.length > 0) {
    throw new Error(`Found ${existingDrills.length} existing wall ball drills. Please rollback first.`)
  }
  
  console.log('✅ No conflicting wall ball drills found\n')
}

function assignDrillsToVariant(variant: WallBallVariant, series: WallBallSeries): number[] {
  // If variant already has drill_ids, use them
  if (variant.drill_ids && variant.drill_ids.length > 0) {
    return variant.drill_ids
  }
  
  // Otherwise, assign based on duration and series
  const duration = variant.duration_minutes
  
  if (series.series_name.includes('Conditioning')) {
    return DRILL_ASSIGNMENTS.conditioning
  } else if (duration <= 5) {
    return DRILL_ASSIGNMENTS['5min']
  } else if (duration <= 10) {
    return DRILL_ASSIGNMENTS['10min']
  } else {
    return DRILL_ASSIGNMENTS['15min']
  }
}

async function migrateDrills(drills: WallBallDrill[]) {
  console.log('🏒 Migrating wall ball drills to Skills Academy...\n')
  
  const skillsAcademyDrills = drills.map((drill, index) => {
    // Use the first available vimeo ID
    const vimeoId = drill.strong_hand_vimeo_id || 
                    drill.off_hand_vimeo_id || 
                    drill.both_hands_vimeo_id || 
                    ''
    
    return {
      id: STARTING_DRILL_ID + index,
      title: drill.drill_name || `Wall Ball Drill ${drill.id}`,
      vimeo_id: vimeoId,
      video_url: vimeoId ? `https://vimeo.com/${vimeoId}` : null,
      drill_category: ['Wall Ball', 'Fundamentals'],
      equipment_needed: ['Lacrosse Stick', 'Ball', 'Wall'],
      age_progressions: {
        do_it: { min: 8, max: 12 },
        own_it: { min: 13, max: 16 },
        coach_it: { min: 17, max: 99 }
      },
      space_needed: 'Wall Space>10x10 Yard Area',
      complexity: 'advanced', // All skills academy drills use 'advanced'
      sets_and_reps: '3 Sets of 20 Reps',
      duration_minutes: 5,
      point_values: {
        lax_credit: 2,
        wall_ball_badge: 1
      },
      tags: ['wall-ball', 'fundamentals', drill.skill_focus || 'general'].filter(Boolean),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  console.log('📋 Drill migration plan:')
  skillsAcademyDrills.forEach(drill => {
    console.log(`   ${drill.id}: ${drill.title}`)
    if (drill.vimeo_id) {
      console.log(`      → Vimeo: ${drill.vimeo_id}`)
    }
  })
  console.log('')
  
  const { error } = await supabase
    .from('skills_academy_drills')
    .insert(skillsAcademyDrills)
  
  if (error) throw new Error(`Failed to insert drills: ${error.message}`)
  
  console.log(`✅ Successfully migrated ${skillsAcademyDrills.length} drills\n`)
  
  // Return mapping of original ID to new ID
  return drills.map((drill, index) => ({
    originalId: drill.id,
    newId: STARTING_DRILL_ID + index
  }))
}

async function migrateSeries(series: WallBallSeries[]) {
  console.log('📚 Checking/Creating wall ball series in Skills Academy...\n')
  
  // Check if series already exist (from previous attempts)
  const { data: existingSeries } = await supabase
    .from('skills_academy_series')
    .select('id, series_name, series_code')
    .or('series_type.eq.wall_ball,series_code.like.WB%')
  
  if (existingSeries && existingSeries.length > 0) {
    console.log('✅ Using existing wall ball series:')
    existingSeries.forEach(s => console.log(`   ${s.id}: ${s.series_name}`))
    console.log('')
    return existingSeries.map(s => s.id)
  }
  
  // Create new series if they don't exist
  const newSeries = series.slice(0, 4).map((s, index) => ({
    series_name: `Wall Ball - ${s.series_name}`,
    series_slug: `wall-ball-${s.series_slug}`,
    series_type: 'wall_ball',
    series_code: `WB${s.id}`,
    description: s.description || `Wall ball training focused on ${s.series_name.toLowerCase()}`,
    position_focus: 'wall_ball',
    difficulty_level: s.difficulty_level,
    color_scheme: 'orange',
    display_order: 50 + index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  console.log('📋 Creating new series:')
  newSeries.forEach(s => console.log(`   ${s.series_code}: ${s.series_name}`))
  console.log('')
  
  const { data: insertedSeries, error } = await supabase
    .from('skills_academy_series')
    .insert(newSeries)
    .select('id')
  
  if (error) throw new Error(`Failed to insert series: ${error.message}`)
  
  console.log(`✅ Created ${insertedSeries?.length || 0} series\n`)
  return insertedSeries?.map(s => s.id) || []
}

async function migrateWorkouts(
  variants: WallBallVariant[], 
  series: WallBallSeries[],
  seriesIds: number[],
  drillIdMap: Array<{originalId: number; newId: number}>
) {
  console.log('💪 Creating wall ball workouts in Skills Academy...\n')
  
  // We'll create workouts for the main variants (not duplicating coaching/no-coaching)
  // Group variants by series and select representative ones
  const selectedVariants: WallBallVariant[] = []
  
  for (let i = 0; i < 4; i++) {
    const seriesVariants = variants.filter(v => v.series_id === (i + 1))
    
    // Select one of each duration (prefer with coaching)
    const durations = [...new Set(seriesVariants.map(v => v.duration_minutes))]
    
    durations.forEach(duration => {
      const variant = seriesVariants.find(v => 
        v.duration_minutes === duration && 
        (v.has_coaching || v.has_coaching === null)
      ) || seriesVariants.find(v => v.duration_minutes === duration)
      
      if (variant) selectedVariants.push(variant)
    })
  }
  
  const workouts = selectedVariants.map((variant, index) => {
    const seriesIndex = variant.series_id - 1
    const seriesData = series[seriesIndex]
    const skillsAcademySeriesId = seriesIds[seriesIndex]
    
    // Assign drills intelligently
    const originalDrillIds = assignDrillsToVariant(variant, seriesData)
    
    // Map to new drill IDs
    const newDrillIds = originalDrillIds.map(originalId => {
      const mapping = drillIdMap.find(m => m.originalId === originalId)
      return mapping ? mapping.newId : STARTING_DRILL_ID // Fallback to first drill
    })
    
    // Determine workout size based on duration
    const workoutSize = variant.duration_minutes <= 5 ? 'mini' :
                       variant.duration_minutes <= 10 ? 'more' : 'complete'
    
    return {
      id: STARTING_WORKOUT_ID + index,
      series_id: skillsAcademySeriesId,
      workout_name: variant.variant_name || `${seriesData.series_name} - ${variant.duration_minutes} Minutes`,
      workout_size: workoutSize,
      drill_count: newDrillIds.length,
      description: `Wall ball workout focusing on ${seriesData.skill_focus || 'fundamentals'}`,
      estimated_duration_minutes: variant.duration_minutes,
      drill_ids: newDrillIds,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  console.log('📋 Workout creation plan:')
  workouts.forEach(workout => {
    console.log(`   ${workout.id}: ${workout.workout_name}`)
    console.log(`      Series: ${workout.series_id}, Size: ${workout.workout_size}`)
    console.log(`      Drills: [${workout.drill_ids.join(', ')}] (${workout.drill_count} total)`)
  })
  console.log('')
  
  const { error } = await supabase
    .from('skills_academy_workouts')
    .insert(workouts)
  
  if (error) throw new Error(`Failed to insert workouts: ${error.message}`)
  
  console.log(`✅ Successfully created ${workouts.length} workouts\n`)
  return workouts
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n')
  
  // Check drills
  const { data: drills, count: drillCount } = await supabase
    .from('skills_academy_drills')
    .select('id, title, vimeo_id', { count: 'exact' })
    .contains('tags', ['wall-ball'])
  
  console.log(`✅ Wall ball drills: ${drillCount}`)
  if (drills && drills.length > 0) {
    console.log('   Sample drills:')
    drills.slice(0, 3).forEach(d => {
      console.log(`   - ${d.id}: ${d.title} (Vimeo: ${d.vimeo_id || 'none'})`)
    })
  }
  
  // Check workouts
  const { data: workouts, count: workoutCount } = await supabase
    .from('skills_academy_workouts')
    .select('id, workout_name, drill_ids, series_id', { count: 'exact' })
    .gte('id', STARTING_WORKOUT_ID)
  
  console.log(`\n✅ Wall ball workouts: ${workoutCount}`)
  if (workouts && workouts.length > 0) {
    console.log('   Sample workouts:')
    workouts.slice(0, 3).forEach(w => {
      console.log(`   - ${w.id}: ${w.workout_name}`)
      console.log(`     Drills: [${w.drill_ids?.join(', ') || 'none'}]`)
    })
  }
  
  console.log('\n✅ Migration verification complete!')
}

async function rollback() {
  console.log('🆘 Rolling back wall ball migration...\n')
  
  try {
    // Delete workouts
    const { error: workoutError } = await supabase
      .from('skills_academy_workouts')
      .delete()
      .gte('id', STARTING_WORKOUT_ID)
    
    if (workoutError) {
      console.error('Failed to delete workouts:', workoutError)
    } else {
      console.log('✅ Deleted wall ball workouts')
    }
    
    // Delete drills
    const { error: drillError } = await supabase
      .from('skills_academy_drills')
      .delete()
      .contains('tags', ['wall-ball'])
    
    if (drillError) {
      console.error('Failed to delete drills:', drillError)
    } else {
      console.log('✅ Deleted wall ball drills')
    }
    
    console.log('\n🎯 Rollback completed')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting CORRECTED Wall Ball to Skills Academy Migration')
    console.log('=' .repeat(60) + '\n')
    
    // Load data from correct tables
    const { series, variants, drills } = await loadWallBallData()
    
    // Check for conflicts
    await checkExistingWallBallData()
    
    // Migrate in order
    const drillIdMap = await migrateDrills(drills)
    const seriesIds = await migrateSeries(series)
    await migrateWorkouts(variants, series, seriesIds, drillIdMap)
    
    // Verify
    await verifyMigration()
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('\nWall ball workouts are now available in Skills Academy!')
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error)
    console.error('\nUse "rollback" command to undo partial migration')
    process.exit(1)
  }
}

// CLI handling
const command = process.argv[2]

if (command === 'rollback') {
  rollback()
} else if (command === 'migrate' || !command) {
  runMigration()
} else {
  console.log('Usage: npx tsx scripts/migrate-wall-ball-correct-tables.ts [migrate|rollback]')
  console.log('  migrate (default): Run the migration')
  console.log('  rollback: Undo the migration')
}