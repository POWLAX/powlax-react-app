#!/usr/bin/env tsx
/**
 * Recreate the first 24 wall ball workouts that were accidentally deleted
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function recreateTopFourWorkouts() {
  console.log('🔧 Recreating Top 4 Wall Ball Series Workouts...\n')
  
  // Get the first 24 variants from wall_ball_workout_variants
  const { data: variants, error: variantsError } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .lte('id', 24)
    .order('id')
  
  if (variantsError || !variants) {
    console.error('Error fetching variants:', variantsError)
    return
  }
  
  console.log(`Found ${variants.length} variants to recreate as workouts\n`)
  
  // Map variants to the correct series
  // Variants 1-6: Master Fundamentals (Series 46)
  // Variants 7-12: Dodging (Series 47)
  // Variants 13-18: Shooting (Series 48)
  // Variants 19-24: Conditioning (Series 49)
  
  const getSeriesId = (variantId: number): number => {
    if (variantId <= 6) return 46
    if (variantId <= 12) return 47
    if (variantId <= 18) return 48
    return 49
  }
  
  const workouts = variants.map((variant, index) => {
    const workoutId = 119 + index
    const seriesId = getSeriesId(variant.id)
    
    // Determine workout size
    let baseSize = 'complete'
    if (variant.variant_name?.includes('5 Min') || variant.duration_minutes <= 5) {
      baseSize = 'mini'
    } else if (variant.variant_name?.includes('10 Min') || variant.duration_minutes <= 10) {
      baseSize = 'more'
    }
    
    // Add coaching suffix if no coaching
    const workoutSize = variant.has_coaching === false 
      ? `${baseSize}_no_coach`
      : baseSize
    
    // Extract Vimeo ID
    const vimeoId = variant.full_workout_vimeo_id || ''
    
    return {
      id: workoutId,
      series_id: seriesId,
      workout_name: variant.variant_name || `Workout ${variant.id}`,
      workout_size: workoutSize,
      drill_count: 0,
      estimated_duration_minutes: variant.duration_minutes || 10,
      drill_ids: [],
      original_json_id: variant.id,
      original_json_name: vimeoId ? `vimeo:${vimeoId}` : variant.variant_name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  console.log('Inserting workouts:')
  const seriesNames = {
    46: 'Master Fundamentals',
    47: 'Dodging',
    48: 'Shooting',
    49: 'Conditioning'
  }
  
  for (const [seriesId, name] of Object.entries(seriesNames)) {
    const seriesWorkouts = workouts.filter(w => w.series_id === Number(seriesId))
    console.log(`  Series ${seriesId} (${name}): ${seriesWorkouts.length} workouts`)
  }
  
  console.log('\nInserting into database...')
  
  const { error: insertError } = await supabase
    .from('skills_academy_workouts')
    .insert(workouts)
  
  if (insertError) {
    console.error('❌ Error inserting workouts:', insertError)
  } else {
    console.log('✅ Successfully recreated 24 workouts!')
  }
  
  // Verify final state
  console.log('\n📊 Final State:')
  const { data: series } = await supabase
    .from('skills_academy_series')
    .select('id, series_name')
    .eq('series_type', 'wall_ball')
    .order('id')
  
  for (const s of series || []) {
    const { count } = await supabase
      .from('skills_academy_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', s.id)
    
    console.log(`  Series ${s.id}: ${s.series_name} - ${count} workouts ${count === 6 ? '✅' : '❌'}`)
  }
}

recreateTopFourWorkouts().catch(console.error)