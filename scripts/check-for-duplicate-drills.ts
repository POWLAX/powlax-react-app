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

async function checkForDuplicates() {
  console.log('🔍 Checking for duplicate drills before upload...\n')
  
  // Get all current drills
  const { data: currentDrills } = await supabase
    .from('wall_ball_drill_library')
    .select('id, drill_name, drill_slug')
    .order('id')
  
  console.log('📊 Current drills in database:')
  console.log('=' .repeat(60))
  currentDrills?.forEach(drill => {
    console.log(`ID ${drill.id}: "${drill.drill_name}" (slug: ${drill.drill_slug})`)
  })
  
  // Parse CSV to get all drill names
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  const csvDrills: string[] = []
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const drillName = cols[1]?.trim()
    if (drillName) {
      csvDrills.push(drillName)
    }
  }
  
  console.log(`\n📋 CSV contains ${csvDrills.length} total drills`)
  
  // Check for exact name matches
  const currentDrillNames = new Set(currentDrills?.map(d => d.drill_name) || [])
  const exactMatches = csvDrills.filter(csvDrill => currentDrillNames.has(csvDrill))
  const csvMissing = csvDrills.filter(csvDrill => !currentDrillNames.has(csvDrill))
  
  console.log('\n✅ Exact name matches (already in database):')
  exactMatches.forEach(drill => console.log(`  - "${drill}"`))
  
  console.log('\n❌ Missing from database:')
  csvMissing.forEach(drill => console.log(`  - "${drill}"`))
  
  // Check for similar names that might cause slug conflicts
  console.log('\n🔍 Potential slug conflicts:')
  console.log('=' .repeat(60))
  
  const currentSlugs = new Set(currentDrills?.map(d => d.drill_slug) || [])
  const potentialConflicts: string[] = []
  
  csvMissing.forEach(csvDrill => {
    const slug = csvDrill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (currentSlugs.has(slug)) {
      potentialConflicts.push(`"${csvDrill}" → slug "${slug}" (conflicts with existing drill)`)
    }
  })
  
  if (potentialConflicts.length > 0) {
    console.log('⚠️  Found potential conflicts:')
    potentialConflicts.forEach(conflict => console.log(`  - ${conflict}`))
  } else {
    console.log('✅ No slug conflicts detected')
  }
  
  return { currentDrills, csvDrills, exactMatches, csvMissing, potentialConflicts }
}

checkForDuplicates().catch(console.error)
