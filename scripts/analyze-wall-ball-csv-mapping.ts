import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CSVDrill {
  csvRow: number
  drillName: string
  difficulty: number
  strongHandVideo: string
  offHandVideo: string
  alternatingVideo: string
  workoutMappings: { [workoutName: string]: number | string }
}

async function analyzeCSVMapping() {
  console.log('🔍 Analyzing Wall Ball CSV Structure and Mapping...\n')
  
  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  // Parse header rows to understand workout variant structure
  console.log('📋 CSV Header Analysis:')
  console.log('=' .repeat(80))
  
  const headerRow1 = lines[0].split(',')
  const headerRow2 = lines[1].split(',') 
  const headerRow3 = lines[2].split(',')
  
  console.log('Row 1 (Workout Types):', headerRow1.slice(4, 28).filter(h => h.trim()))
  console.log('Row 2 (Hand Types):', headerRow2.slice(28).filter(h => h.trim()))
  console.log('Row 3 (Sequence Numbers):', headerRow3.slice(4, 28).filter(h => h.trim()))
  
  // Map workout variants from headers
  const workoutVariants: { [key: string]: { columnIndex: number, seriesName: string, duration?: string } } = {}
  
  for (let i = 4; i < 28; i++) {
    const workoutName = headerRow1[i]?.trim()
    if (workoutName && workoutName !== 'X') {
      workoutVariants[workoutName] = {
        columnIndex: i,
        seriesName: workoutName.includes('Master Fund') ? 'Master Fundamentals' :
                   workoutName.includes('Dodging') ? 'Dodging' :
                   workoutName.includes('Conditioning') ? 'Conditioning' :
                   workoutName.includes('Faking') ? 'Faking and Inside Finishing' :
                   workoutName.includes('Shooting') ? 'Shooting' :
                   workoutName.includes('Defense') ? 'Defensive Emphasis' :
                   workoutName.includes('Catch Everything') ? 'Catch Everything' :
                   workoutName.includes('Advanced') ? 'Advanced - Fun and Challenging' : 'Unknown',
        duration: workoutName.includes('10') ? '10' : workoutName.includes('5') ? '5' : undefined
      }
    }
  }
  
  console.log('\n📊 Identified Workout Variants:')
  console.log('=' .repeat(80))
  Object.entries(workoutVariants).forEach(([name, info]) => {
    console.log(`  Column ${info.columnIndex}: "${name}" → Series: "${info.seriesName}", Duration: ${info.duration || 'N/A'}`)
  })
  
  // Parse drill data
  const drills: CSVDrill[] = []
  
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const csvRow = parseInt(cols[0]) || 0
    const drillName = cols[1]?.trim()
    const difficulty = parseInt(cols[2]) || 1
    
    if (!drillName || csvRow === 0) continue
    
    // Extract video URLs (columns 28-32 based on the pattern)
    const strongHandVideo = cols[28]?.trim() || ''
    const offHandVideo = cols[29]?.trim() || ''
    const alternatingVideo = cols[32]?.trim() || ''
    
    // Map workout assignments
    const workoutMappings: { [workoutName: string]: number | string } = {}
    Object.entries(workoutVariants).forEach(([variantName, info]) => {
      const value = cols[info.columnIndex]?.trim()
      if (value && value !== '' && value !== 'X') {
        workoutMappings[variantName] = isNaN(parseInt(value)) ? value : parseInt(value)
      }
    })
    
    drills.push({
      csvRow,
      drillName,
      difficulty,
      strongHandVideo,
      offHandVideo,
      alternatingVideo,
      workoutMappings
    })
  }
  
  console.log(`\n📚 Found ${drills.length} drills in CSV`)
  
  // Get current database drills
  const { data: currentDrills } = await supabase
    .from('wall_ball_drill_library')
    .select('drill_name')
    .order('id')
  
  const currentDrillNames = new Set(currentDrills?.map(d => d.drill_name) || [])
  
  console.log('\n🔍 Gap Analysis:')
  console.log('=' .repeat(80))
  console.log(`Current drills in database: ${currentDrillNames.size}`)
  console.log(`Total drills in CSV: ${drills.length}`)
  
  const missingDrills = drills.filter(drill => !currentDrillNames.has(drill.drillName))
  const existingDrills = drills.filter(drill => currentDrillNames.has(drill.drillName))
  
  console.log(`Missing drills: ${missingDrills.length}`)
  console.log(`Already uploaded: ${existingDrills.length}`)
  
  console.log('\n📋 Missing Drills List:')
  console.log('=' .repeat(80))
  missingDrills.forEach((drill, index) => {
    console.log(`${index + 1}. "${drill.drillName}" (Difficulty: ${drill.difficulty})`)
    console.log(`   Strong Hand Video: ${drill.strongHandVideo || 'None'}`)
    console.log(`   Off Hand Video: ${drill.offHandVideo || 'None'}`)
    console.log(`   Alternating Video: ${drill.alternatingVideo || 'None'}`)
    console.log(`   Appears in workouts: ${Object.keys(drill.workoutMappings).length > 0 ? Object.keys(drill.workoutMappings).join(', ') : 'None'}`)
    console.log('')
  })
  
  console.log('\n📋 Already Uploaded Drills:')
  console.log('=' .repeat(80))
  existingDrills.forEach((drill, index) => {
    console.log(`${index + 1}. "${drill.drillName}" (Difficulty: ${drill.difficulty})`)
  })
  
  // Get current workout variants for mapping analysis
  const { data: variants } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .order('id')
  
  console.log('\n🔗 Workout Variant Mapping Analysis:')
  console.log('=' .repeat(80))
  console.log(`Current variants in database: ${variants?.length || 0}`)
  
  if (variants && variants.length > 0) {
    console.log('\nSample variants:')
    variants.slice(0, 5).forEach(v => {
      console.log(`  - ID ${v.id}: "${v.variant_name}" (Series: ${v.series_id}, Duration: ${v.duration_minutes}min, Coaching: ${v.has_coaching})`)
      console.log(`    Drill IDs: [${v.drill_ids?.join(', ') || 'None'}]`)
    })
  }
  
  return { drills, missingDrills, existingDrills, workoutVariants, variants }
}

analyzeCSVMapping().then(result => {
  console.log('\n✅ Analysis complete!')
  console.log(`\nSummary:`)
  console.log(`- Total CSV drills: ${result.drills.length}`)
  console.log(`- Missing from database: ${result.missingDrills.length}`)
  console.log(`- Already in database: ${result.existingDrills.length}`)
  console.log(`- Workout variants identified: ${Object.keys(result.workoutVariants).length}`)
  console.log(`- Database variants: ${result.variants?.length || 0}`)
}).catch(console.error)
