#!/usr/bin/env tsx
/**
 * CORRECT WALL BALL MIGRATION - All 48 Variants as Workouts
 * 
 * Understanding:
 * - wall_ball_workout_variants (48 records) = The actual workouts with videos
 * - wall_ball_workout_series (8 records) = Just grouping/categorization
 * - wall_ball_drill_library = Reference drills within the workout videos
 * 
 * Each variant has its own full_workout_video_url that should be played
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

// Starting IDs
const STARTING_WORKOUT_ID = 119  // Next available workout ID

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
  full_workout_video_url: string | null
  full_workout_vimeo_id: string | null
  drill_sequence: any
  drill_ids: number[]
  total_drills: number
}

async function loadWallBallData() {
  console.log('📊 Loading wall ball data...\n')
  
  // Load series for reference
  const { data: series, error: seriesError } = await supabase
    .from('wall_ball_workout_series')
    .select('*')
    .order('id')
  
  if (seriesError) throw new Error(`Failed to load series: ${seriesError.message}`)
  
  // Load ALL 48 variants - these are our workouts
  const { data: variants, error: variantsError } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .order('series_id, id')
  
  if (variantsError) throw new Error(`Failed to load variants: ${variantsError.message}`)
  
  console.log(`✅ Loaded:`)
  console.log(`   - ${series?.length || 0} wall ball series (for grouping)`)
  console.log(`   - ${variants?.length || 0} wall ball variants (actual workouts)\n`)
  
  return { series: series || [], variants: variants || [] }
}

async function checkExistingData() {
  console.log('🔍 Checking for existing wall ball data...\n')
  
  // Check if wall ball series already exist
  const { data: existingSeries } = await supabase
    .from('skills_academy_series')
    .select('id, series_name')
    .or('series_type.eq.wall_ball,series_code.like.WB%')
  
  if (existingSeries && existingSeries.length > 0) {
    console.log('⚠️  Found existing wall ball series:')
    existingSeries.forEach(s => console.log(`   - ${s.id}: ${s.series_name}`))
    console.log('')
  }
  
  // Check for existing wall ball workouts
  const { data: existingWorkouts } = await supabase
    .from('skills_academy_workouts')
    .select('id')
    .gte('id', STARTING_WORKOUT_ID)
  
  if (existingWorkouts && existingWorkouts.length > 0) {
    throw new Error(`Found ${existingWorkouts.length} existing workouts starting from ID ${STARTING_WORKOUT_ID}. Please rollback first.`)
  }
  
  console.log('✅ Ready to migrate\n')
}

async function getOrCreateSeries(series: WallBallSeries[]) {
  console.log('📚 Setting up wall ball series in Skills Academy...\n')
  
  // Check if series already exist
  const { data: existingSeries } = await supabase
    .from('skills_academy_series')
    .select('id, series_name, series_code')
    .or('series_type.eq.wall_ball,series_code.like.WB%')
    .order('id')
  
  if (existingSeries && existingSeries.length >= series.length) {
    console.log('✅ Using existing wall ball series')
    return existingSeries.map(s => s.id)
  }
  
  // Create new series
  const newSeries = series.map((s, index) => ({
    series_name: s.series_name,
    series_slug: `wall-ball-${s.series_slug}`,
    series_type: 'wall_ball',
    series_code: `WB${s.id}`,
    description: s.description || `Wall ball ${s.series_name.toLowerCase()} training`,
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
  
  const { data: insertedSeries, error } = await supabase
    .from('skills_academy_series')
    .insert(newSeries)
    .select('id')
  
  if (error) throw new Error(`Failed to insert series: ${error.message}`)
  
  console.log(`✅ Created ${insertedSeries?.length || 0} series\n`)
  return insertedSeries?.map(s => s.id) || []
}

function extractVimeoId(url: string | null): string {
  if (!url) return ''
  
  // Handle different Vimeo URL formats
  // https://vimeo.com/997146099
  // https://player.vimeo.com/video/997146099
  const match = url.match(/(?:vimeo\.com\/|video\/)(\d+)/)
  return match ? match[1] : ''
}

function convertToStandardVimeoUrl(url: string | null, vimeoId: string | null): string | null {
  // Prefer vimeo_id if available
  if (vimeoId) {
    return `https://vimeo.com/${vimeoId}`
  }
  
  // Extract from URL
  const extractedId = extractVimeoId(url)
  if (extractedId) {
    return `https://vimeo.com/${extractedId}`
  }
  
  return null
}

async function migrateVariantsAsWorkouts(
  variants: WallBallVariant[], 
  series: WallBallSeries[],
  seriesIds: number[]
) {
  console.log('💪 Migrating all 48 variants as individual workouts...\n')
  
  // Create a workout for EACH variant
  const workouts = variants.map((variant, index) => {
    // Find the corresponding series
    const seriesIndex = series.findIndex(s => s.id === variant.series_id)
    const seriesData = series[seriesIndex]
    const skillsAcademySeriesId = seriesIds[seriesIndex]
    
    // Determine workout size - need to handle coaching variants
    // Since we have unique constraint on series_id + workout_size, 
    // we'll append coaching status to make them unique
    let baseSize = 'complete'
    if (variant.variant_name?.includes('5 Min') || variant.duration_minutes <= 5) {
      baseSize = 'mini'
    } else if (variant.variant_name?.includes('10 Min') || variant.duration_minutes <= 10) {
      baseSize = 'more'
    }
    
    // Append coaching status to avoid unique constraint violation
    const workoutSize = variant.has_coaching === false 
      ? `${baseSize}_no_coach`
      : baseSize
    
    // Get the video URL
    const videoUrl = convertToStandardVimeoUrl(
      variant.full_workout_video_url,
      variant.full_workout_vimeo_id
    )
    
    const vimeoId = variant.full_workout_vimeo_id || extractVimeoId(variant.full_workout_video_url)
    
    return {
      id: STARTING_WORKOUT_ID + index,
      series_id: skillsAcademySeriesId,
      workout_name: variant.variant_name || `${seriesData?.series_name} Workout ${variant.id}`,
      workout_size: workoutSize,
      drill_count: variant.total_drills || 0,
      description: `Wall ball ${seriesData?.series_name?.toLowerCase()} workout`,
      estimated_duration_minutes: variant.duration_minutes || 10,
      
      // Empty drill_ids since this is a full workout video
      drill_ids: [],
      
      // Store original variant ID and vimeo ID in available fields
      original_json_id: variant.id,
      // Store vimeo_id in original_json_name as workaround since no video columns exist
      original_json_name: vimeoId ? `vimeo:${vimeoId}` : variant.variant_name,
      
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  console.log(`📋 Creating ${workouts.length} workouts from variants:\n`)
  
  // Group by series for display
  const workoutsBySeries = series.map(s => {
    const seriesWorkouts = workouts.filter(w => {
      const variant = variants.find(v => v.id === w.original_json_id)
      return variant?.series_id === s.id
    })
    
    if (seriesWorkouts.length > 0) {
      console.log(`\n${s.series_name} (${seriesWorkouts.length} workouts):`)
      seriesWorkouts.forEach(w => {
        const vimeoId = w.original_json_name?.startsWith('vimeo:') 
          ? w.original_json_name.replace('vimeo:', '') 
          : null
        const video = vimeoId ? `✓ Video: ${vimeoId}` : '⚠️  No video'
        console.log(`  ${w.id}: ${w.workout_name} - ${video}`)
      })
    }
    
    return seriesWorkouts
  })
  
  console.log('\n' + '─'.repeat(60) + '\n')
  
  // Insert all workouts
  const { error } = await supabase
    .from('skills_academy_workouts')
    .insert(workouts)
  
  if (error) throw new Error(`Failed to insert workouts: ${error.message}`)
  
  console.log(`✅ Successfully created ${workouts.length} workouts from variants\n`)
  return workouts
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n')
  
  // Check workouts grouped by series
  const { data: series } = await supabase
    .from('skills_academy_series')
    .select('id, series_name')
    .eq('series_type', 'wall_ball')
    .order('id')
  
  if (series) {
    for (const s of series) {
      const { data: workouts, count } = await supabase
        .from('skills_academy_workouts')
        .select('id, workout_name, original_json_name', { count: 'exact' })
        .eq('series_id', s.id)
        .order('id')
      
      console.log(`${s.series_name}: ${count} workouts`)
      if (workouts && workouts.length > 0) {
        // Show first 3 as sample
        workouts.slice(0, 3).forEach(w => {
          const hasVideo = w.original_json_name?.startsWith('vimeo:')
          const video = hasVideo ? '✓' : '✗'
          console.log(`  - ${w.workout_name} [Video: ${video}]`)
        })
        if (workouts.length > 3) {
          console.log(`  ... and ${workouts.length - 3} more`)
        }
      }
      console.log('')
    }
  }
  
  // Total count
  const { count: totalCount } = await supabase
    .from('skills_academy_workouts')
    .select('*', { count: 'exact', head: true })
    .gte('id', STARTING_WORKOUT_ID)
  
  console.log(`✅ Total wall ball workouts created: ${totalCount}\n`)
}

async function rollback() {
  console.log('🆘 Rolling back wall ball migration...\n')
  
  try {
    // Delete workouts
    const { error: workoutError, count } = await supabase
      .from('skills_academy_workouts')
      .delete()
      .gte('id', STARTING_WORKOUT_ID)
      .select('*', { count: 'exact', head: true })
    
    if (workoutError) {
      console.error('Failed to delete workouts:', workoutError)
    } else {
      console.log(`✅ Deleted ${count || 0} wall ball workouts`)
    }
    
    // Optionally delete series (only if we created them)
    const { data: series } = await supabase
      .from('skills_academy_series')
      .select('id')
      .eq('series_type', 'wall_ball')
    
    if (series && series.length > 0) {
      console.log(`ℹ️  Found ${series.length} wall ball series (keeping for now)`)
    }
    
    console.log('\n🎯 Rollback completed')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting Wall Ball Migration (48 Variants as Workouts)')
    console.log('=' .repeat(60) + '\n')
    
    // Load data
    const { series, variants } = await loadWallBallData()
    
    if (variants.length !== 48) {
      console.warn(`⚠️  Expected 48 variants, found ${variants.length}`)
    }
    
    // Check for conflicts
    await checkExistingData()
    
    // Get or create series
    const seriesIds = await getOrCreateSeries(series)
    
    // Migrate all variants as workouts
    await migrateVariantsAsWorkouts(variants, series, seriesIds)
    
    // Verify
    await verifyMigration()
    
    console.log('=' .repeat(60))
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('\nAll 48 wall ball workout variants are now available in Skills Academy!')
    console.log('Each workout will play its full workout video when selected.')
    
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
  console.log('Usage: npx tsx scripts/migrate-wall-ball-all-variants.ts [migrate|rollback]')
  console.log('  migrate (default): Run the migration')
  console.log('  rollback: Undo the migration')
}