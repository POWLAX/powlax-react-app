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

async function comprehensiveDuplicateCheck() {
  console.log('🔍 Comprehensive Duplicate Check...\n')
  
  // Get current database drills
  const { data: currentDrills } = await supabase
    .from('wall_ball_drill_library')
    .select('id, drill_name, drill_slug')
    .order('id')
  
  console.log('📊 Current drills in wall_ball_drill_library:')
  console.log('=' .repeat(80))
  currentDrills?.forEach(drill => {
    console.log(`${drill.id}. "${drill.drill_name}" (slug: ${drill.drill_slug})`)
  })
  
  // Parse CSV drills
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  const csvDrills: Array<{name: string, difficulty: number, row: number}> = []
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const csvRow = parseInt(cols[0]) || 0
    const drillName = cols[1]?.trim()
    const difficulty = parseInt(cols[2]) || 1
    
    if (drillName && csvRow > 0) {
      csvDrills.push({ name: drillName, difficulty, row: csvRow })
    }
  }
  
  console.log(`\n📋 CSV contains ${csvDrills.length} drills`)
  
  // Create sets for comparison
  const currentDrillNames = new Set(currentDrills?.map(d => d.drill_name.toLowerCase()) || [])
  const currentSlugs = new Set(currentDrills?.map(d => d.drill_slug) || [])
  
  // Check for exact name matches (case-insensitive)
  const exactMatches: string[] = []
  const similarMatches: Array<{csv: string, db: string, similarity: string}> = []
  const trulyMissing: Array<{name: string, difficulty: number, row: number}> = []
  const slugConflicts: Array<{csvDrill: string, slug: string, conflictsWith: string}> = []
  
  csvDrills.forEach(csvDrill => {
    const csvLower = csvDrill.name.toLowerCase()
    const csvSlug = csvDrill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    // Check for exact matches
    if (currentDrillNames.has(csvLower)) {
      exactMatches.push(csvDrill.name)
      return
    }
    
    // Check for similar matches
    let foundSimilar = false
    currentDrills?.forEach(dbDrill => {
      const dbLower = dbDrill.drill_name.toLowerCase()
      
      // Check various similarity patterns
      if (
        csvLower.includes(dbLower) || 
        dbLower.includes(csvLower) ||
        csvLower.replace(/[^a-z]/g, '') === dbLower.replace(/[^a-z]/g, '') ||
        csvLower.replace(/\s+/g, '') === dbLower.replace(/\s+/g, '')
      ) {
        similarMatches.push({
          csv: csvDrill.name,
          db: dbDrill.drill_name,
          similarity: 'Name similarity'
        })
        foundSimilar = true
      }
    })
    
    // Check for slug conflicts
    if (currentSlugs.has(csvSlug)) {
      const conflictingDrill = currentDrills?.find(d => d.drill_slug === csvSlug)
      slugConflicts.push({
        csvDrill: csvDrill.name,
        slug: csvSlug,
        conflictsWith: conflictingDrill?.drill_name || 'Unknown'
      })
      foundSimilar = true
    }
    
    if (!foundSimilar) {
      trulyMissing.push(csvDrill)
    }
  })
  
  console.log('\n✅ EXACT MATCHES (already in database):')
  console.log('=' .repeat(80))
  exactMatches.forEach(drill => console.log(`  ✓ "${drill}"`))
  
  console.log('\n⚠️  SIMILAR MATCHES (potential duplicates):')
  console.log('=' .repeat(80))
  similarMatches.forEach(match => {
    console.log(`  📝 CSV: "${match.csv}" ↔ DB: "${match.db}" (${match.similarity})`)
  })
  
  console.log('\n🚨 SLUG CONFLICTS (would cause database error):')
  console.log('=' .repeat(80))
  slugConflicts.forEach(conflict => {
    console.log(`  ❌ CSV: "${conflict.csvDrill}" → slug "${conflict.slug}"`)
    console.log(`     Conflicts with DB: "${conflict.conflictsWith}"`)
  })
  
  console.log('\n✨ TRULY MISSING (safe to upload):')
  console.log('=' .repeat(80))
  trulyMissing.forEach((drill, index) => {
    console.log(`${index + 1}. "${drill.name}" (Difficulty: ${drill.difficulty}, CSV Row: ${drill.row})`)
  })
  
  console.log('\n📊 SUMMARY:')
  console.log('=' .repeat(80))
  console.log(`Total CSV drills: ${csvDrills.length}`)
  console.log(`Exact matches: ${exactMatches.length}`)
  console.log(`Similar matches: ${similarMatches.length}`)
  console.log(`Slug conflicts: ${slugConflicts.length}`)
  console.log(`Truly missing: ${trulyMissing.length}`)
  console.log(`Current database: ${currentDrills?.length || 0}`)
  console.log(`After upload: ${(currentDrills?.length || 0) + trulyMissing.length}`)
  
  return { currentDrills, csvDrills, exactMatches, similarMatches, slugConflicts, trulyMissing }
}

comprehensiveDuplicateCheck().catch(console.error)
