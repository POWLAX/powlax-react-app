#!/usr/bin/env tsx
/**
 * Fix the top 4 wall ball series that lost their workouts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixTopFour() {
  console.log('🔧 Fixing Top 4 Wall Ball Series...\n')
  
  // Map the first 24 workouts to the correct series
  const updates = [
    // Master Fundamentals workouts -> Series 46
    { ids: [119, 120, 121, 122, 123, 124], series_id: 46, name: 'Master Fundamentals' },
    // Dodging workouts -> Series 47
    { ids: [125, 126, 127, 128, 129, 130], series_id: 47, name: 'Dodging' },
    // Shooting workouts -> Series 48
    { ids: [131, 132, 133, 134, 135, 136], series_id: 48, name: 'Shooting' },
    // Conditioning workouts -> Series 49
    { ids: [137, 138, 139, 140, 141, 142], series_id: 49, name: 'Conditioning' },
  ]
  
  for (const update of updates) {
    console.log(`Updating ${update.name} workouts to series ${update.series_id}...`)
    
    const { error } = await supabase
      .from('skills_academy_workouts')
      .update({ series_id: update.series_id })
      .in('id', update.ids)
    
    if (error) {
      console.error(`  ❌ Error:`, error.message)
    } else {
      console.log(`  ✅ Updated 6 workouts`)
    }
  }
  
  console.log('\n✅ Done! Verifying final state...\n')
  
  // Verify all series have workouts
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
    
    console.log(`Series ${s.id}: ${s.series_name} - ${count} workouts ${count === 6 ? '✅' : '❌'}`)
  }
}

fixTopFour().catch(console.error)