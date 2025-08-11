import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkMapping() {
  // Get all workouts from 119 onwards (wall ball workouts)
  const { data: workouts } = await supabase
    .from('skills_academy_workouts')
    .select('id, series_id, workout_name, workout_size')
    .gte('id', 119)
    .lte('id', 166)
    .order('id')
  
  // Group by series_id
  const workoutsBySeries: Record<number, any[]> = {}
  workouts?.forEach(w => {
    if (!workoutsBySeries[w.series_id]) {
      workoutsBySeries[w.series_id] = []
    }
    workoutsBySeries[w.series_id].push(w)
  })
  
  console.log('Wall Ball Workouts Distribution:')
  console.log('================================')
  
  const seriesIds = Object.keys(workoutsBySeries).map(Number).sort((a, b) => a - b)
  
  for (const seriesId of seriesIds) {
    const { data: series } = await supabase
      .from('skills_academy_series')
      .select('series_name')
      .eq('id', seriesId)
      .single()
    
    console.log(`\nSeries ${seriesId}: ${series?.series_name || 'Unknown'}`)
    console.log(`  Total workouts: ${workoutsBySeries[seriesId].length}`)
    
    // Show first few workouts
    workoutsBySeries[seriesId].slice(0, 3).forEach(w => {
      console.log(`    - ID ${w.id}: ${w.workout_name} (${w.workout_size})`)
    })
    
    if (workoutsBySeries[seriesId].length > 3) {
      console.log(`    ... and ${workoutsBySeries[seriesId].length - 3} more`)
    }
  }
  
  console.log('\n================================')
  console.log('Total wall ball workouts:', workouts?.length)
  console.log('\nProblem: Workouts are mapped to series 42-49, but series 50-53 have no workouts!')
}

checkMapping().catch(console.error)