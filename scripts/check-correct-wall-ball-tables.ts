import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCorrectTables() {
  console.log('🔍 Checking CORRECT wall ball tables...\n')
  console.log('=' .repeat(60))
  
  // Check wall_ball_workout_series
  const { data: series, count: seriesCount } = await supabase
    .from('wall_ball_workout_series')
    .select('*', { count: 'exact' })
  
  console.log('\n📊 wall_ball_workout_series:')
  console.log('  Total records:', seriesCount)
  if (series && series.length > 0) {
    console.log('  Columns:', Object.keys(series[0]))
    console.log('  Sample records:')
    series.slice(0, 3).forEach(s => {
      console.log(`    - ${s.id}: ${s.series_name || s.name || 'Unknown'}`)
    })
  }
  
  // Check wall_ball_workout_variants
  const { data: variants, count: variantsCount } = await supabase
    .from('wall_ball_workout_variants')
    .select('*', { count: 'exact' })
  
  console.log('\n📊 wall_ball_workout_variants:')
  console.log('  Total records:', variantsCount)
  if (variants && variants.length > 0) {
    console.log('  Columns:', Object.keys(variants[0]))
    console.log('  Sample records:')
    variants.slice(0, 3).forEach(v => {
      console.log(`    - ${v.id}: Series ${v.series_id}, Size: ${v.workout_size}`)
      if (v.drill_ids) {
        console.log(`      Drill IDs: [${v.drill_ids.join(', ')}]`)
      }
    })
  }
  
  // Check wall_ball_drill_library
  const { data: drills, count: drillsCount } = await supabase
    .from('wall_ball_drill_library')
    .select('*', { count: 'exact' })
  
  console.log('\n📊 wall_ball_drill_library:')
  console.log('  Total records:', drillsCount)
  if (drills && drills.length > 0) {
    console.log('  Columns:', Object.keys(drills[0]))
    console.log('  Sample drills:')
    drills.slice(0, 5).forEach(d => {
      console.log(`    - ${d.id}: ${d.title || d.name || 'Unknown'}`)
      if (d.video_url || d.vimeo_id) {
        console.log(`      Video: ${d.video_url || `Vimeo ID: ${d.vimeo_id}`}`)
      }
    })
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ Table analysis complete')
  
  // Check for drill relationships
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant.drill_ids && variant.drill_ids.length > 0) {
      console.log('\n🔗 Checking drill relationships:')
      console.log(`  Variant ${variant.id} has drill_ids: [${variant.drill_ids.join(', ')}]`)
      
      // Check if these drill IDs exist in drill library
      const { data: mappedDrills } = await supabase
        .from('wall_ball_drill_library')
        .select('id, title')
        .in('id', variant.drill_ids)
      
      if (mappedDrills) {
        console.log('  Mapped drills found:')
        mappedDrills.forEach(d => {
          console.log(`    - Drill ${d.id}: ${d.title}`)
        })
      }
    }
  }
}

checkCorrectTables().catch(console.error)