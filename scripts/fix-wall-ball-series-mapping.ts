#!/usr/bin/env tsx
/**
 * Fix wall ball series mapping issue
 * Problem: We have duplicate series and workouts are mapped to wrong series
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixMapping() {
  console.log('🔧 Fixing Wall Ball Series Mapping...\n')
  
  // The correct mapping should be:
  // Series 46 (Master Fundamentals) -> Master Fundamentals workouts (IDs 119-124)
  // Series 47 (Dodging) -> Dodging workouts (IDs 125-130)
  // Series 48 (Shooting) -> Shooting workouts (IDs 131-136)
  // Series 49 (Conditioning) -> Conditioning workouts (IDs 137-142)
  // Series 50 (Faking and Finishing) -> Faking and Finishing workouts (IDs 143-148)
  // Series 51 (Catching Everything) -> Catching Everything workouts (IDs 149-154)
  // Series 52 (Long Pole) -> Long Pole workouts (IDs 155-160)
  // Series 53 (Advanced and Fun) -> Advanced and Fun workouts (IDs 161-166)
  
  const remapping = [
    { workoutIds: [119, 120, 121, 122, 123, 124], newSeriesId: 46 }, // Master Fundamentals
    { workoutIds: [125, 126, 127, 128, 129, 130], newSeriesId: 47 }, // Dodging
    { workoutIds: [131, 132, 133, 134, 135, 136], newSeriesId: 48 }, // Shooting
    { workoutIds: [137, 138, 139, 140, 141, 142], newSeriesId: 49 }, // Conditioning
    { workoutIds: [143, 144, 145, 146, 147, 148], newSeriesId: 50 }, // Faking and Finishing
    { workoutIds: [149, 150, 151, 152, 153, 154], newSeriesId: 51 }, // Catching Everything
    { workoutIds: [155, 156, 157, 158, 159, 160], newSeriesId: 52 }, // Long Pole
    { workoutIds: [161, 162, 163, 164, 165, 166], newSeriesId: 53 }, // Advanced and Fun
  ]
  
  console.log('📝 Remapping workouts to correct series...\n')
  
  for (const mapping of remapping) {
    const { data: series } = await supabase
      .from('skills_academy_series')
      .select('series_name')
      .eq('id', mapping.newSeriesId)
      .single()
    
    console.log(`Updating series ${mapping.newSeriesId}: ${series?.series_name}`)
    
    const { error } = await supabase
      .from('skills_academy_workouts')
      .update({ series_id: mapping.newSeriesId })
      .in('id', mapping.workoutIds)
    
    if (error) {
      console.error(`  ❌ Error updating workouts:`, error.message)
    } else {
      console.log(`  ✅ Updated ${mapping.workoutIds.length} workouts`)
    }
  }
  
  console.log('\n🗑️  Cleaning up duplicate series (42-45)...\n')
  
  // Delete the old duplicate series (42-45) since they have confusing names
  const { error: deleteError } = await supabase
    .from('skills_academy_series')
    .delete()
    .in('id', [42, 43, 44, 45])
  
  if (deleteError) {
    console.error('❌ Error deleting duplicate series:', deleteError.message)
  } else {
    console.log('✅ Deleted duplicate series 42-45')
  }
  
  console.log('\n✅ Wall ball series mapping fixed!')
  console.log('\nFinal mapping:')
  console.log('  Series 46: Master Fundamentals (6 workouts)')
  console.log('  Series 47: Dodging (6 workouts)')
  console.log('  Series 48: Shooting (6 workouts)')
  console.log('  Series 49: Conditioning (6 workouts)')
  console.log('  Series 50: Faking and Finishing (6 workouts)')
  console.log('  Series 51: Catching Everything (6 workouts)')
  console.log('  Series 52: Long Pole (6 workouts)')
  console.log('  Series 53: Advanced and Fun (6 workouts)')
}

fixMapping().catch(console.error)