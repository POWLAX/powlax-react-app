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

interface DrillMapping {
  drillName: string
  difficulty: number
  strongHandVideo: string
  offHandVideo: string
  alternatingVideo: string
  workoutMappings: { [workoutVariant: string]: number }
}

async function createUploadPlan() {
  console.log('🎯 Creating Complete Wall Ball Upload Plan...\n')
  
  // Read CSV and parse structure
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  const headerRow1 = lines[0].split(',')
  const headerRow3 = lines[2].split(',') // Row with sequence numbers
  
  // Create workout variant mapping with sequence positions
  const workoutColumns: { [columnIndex: number]: { name: string, seriesName: string, duration?: number, sequencePosition?: number } } = {}
  
  for (let i = 4; i < 28; i++) {
    const workoutName = headerRow1[i]?.trim()
    const sequenceNum = parseInt(headerRow3[i]?.trim()) || null
    
    if (workoutName && workoutName !== 'X') {
      workoutColumns[i] = {
        name: workoutName,
        seriesName: workoutName.includes('Master Fund') ? 'Master Fundamentals' :
                   workoutName.includes('Dodging') ? 'Dodging' :
                   workoutName.includes('Conditioning') ? 'Conditioning' :
                   workoutName.includes('Faking') ? 'Faking and Inside Finishing' :
                   workoutName.includes('Shooting') ? 'Shooting' :
                   workoutName.includes('Defense') ? 'Defensive Emphasis' :
                   workoutName.includes('Catch Everything') ? 'Catch Everything' :
                   workoutName.includes('Advanced') ? 'Advanced - Fun and Challenging' : 'Unknown',
        duration: workoutName.includes('10') ? 10 : workoutName.includes('5') ? 5 : undefined,
        sequencePosition: sequenceNum
      }
    }
  }
  
  // Parse all drills with their workout mappings
  const allDrills: DrillMapping[] = []
  
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const csvRow = parseInt(cols[0]) || 0
    const drillName = cols[1]?.trim()
    const difficulty = parseInt(cols[2]) || 1
    
    if (!drillName || csvRow === 0) continue
    
    // Extract video URLs
    const strongHandVideo = cols[28]?.trim() || ''
    const offHandVideo = cols[29]?.trim() || ''
    const alternatingVideo = cols[32]?.trim() || ''
    
    // Map workout assignments with sequence numbers
    const workoutMappings: { [workoutVariant: string]: number } = {}
    
    Object.entries(workoutColumns).forEach(([colIndex, workoutInfo]) => {
      const value = cols[parseInt(colIndex)]?.trim()
      if (value && value !== '' && value !== 'X' && !isNaN(parseInt(value))) {
        workoutMappings[workoutInfo.name] = parseInt(value)
      }
    })
    
    allDrills.push({
      drillName,
      difficulty,
      strongHandVideo,
      offHandVideo,
      alternatingVideo,
      workoutMappings
    })
  }
  
  // Get current database state
  const { data: currentDrills } = await supabase
    .from('wall_ball_drill_library')
    .select('drill_name')
  
  const { data: currentVariants } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .order('series_id, duration_minutes, has_coaching')
  
  const currentDrillNames = new Set(currentDrills?.map(d => d.drill_name) || [])
  const missingDrills = allDrills.filter(drill => !currentDrillNames.has(drill.drillName))
  
  console.log('📊 Analysis Results:')
  console.log('=' .repeat(80))
  console.log(`Total drills in CSV: ${allDrills.length}`)
  console.log(`Current drills in database: ${currentDrillNames.size}`)
  console.log(`Missing drills to upload: ${missingDrills.length}`)
  console.log(`Current workout variants: ${currentVariants?.length || 0}`)
  
  // Generate SQL for missing drills
  let insertSQL = `-- ============================================
-- WALL BALL MISSING DRILLS UPLOAD
-- ============================================
-- Inserts ${missingDrills.length} missing drills from CSV into wall_ball_drill_library
-- Generated: ${new Date().toISOString()}
-- ============================================

INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    strong_hand_video_url,
    strong_hand_vimeo_id,
    off_hand_video_url,
    off_hand_vimeo_id,
    both_hands_video_url,
    both_hands_vimeo_id,
    difficulty_level,
    description,
    skill_focus,
    drill_type,
    equipment_needed,
    is_active
) VALUES\n`

  const drillValues: string[] = []
  
  missingDrills.forEach(drill => {
    const slug = drill.drillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    // Extract Vimeo IDs from URLs
    const extractVimeoId = (url: string) => {
      if (!url || url === 'F' || url === 'X') return null
      const match = url.match(/vimeo\.com\/(\d+)/)
      return match ? match[1] : null
    }
    
    const strongVimeoId = extractVimeoId(drill.strongHandVideo)
    const offVimeoId = extractVimeoId(drill.offHandVideo)
    const alternatingVimeoId = extractVimeoId(drill.alternatingVideo)
    
    // Generate description based on drill name and difficulty
    const description = `${drill.drillName} wall ball drill (Difficulty: ${drill.difficulty})`
    
    // Determine skill focus based on workout mappings
    const skillFocus = Array.from(new Set(
      Object.keys(drill.workoutMappings).map(workout => 
        workoutColumns[Object.values(workoutColumns).findIndex(w => w.name === workout) + 4]?.seriesName || 'General'
      ).filter(focus => focus !== 'General')
    ))
    
    const skillFocusSQL = skillFocus.length > 0 ? `ARRAY[${skillFocus.map(s => `'${s}'`).join(', ')}]` : 'ARRAY[\'Wall Ball\']'
    
    drillValues.push(`    (
        '${drill.drillName.replace(/'/g, "''")}',
        '${slug}',
        ${drill.strongHandVideo && drill.strongHandVideo !== 'F' && drill.strongHandVideo !== 'X' ? `'${drill.strongHandVideo}'` : 'NULL'},
        ${strongVimeoId ? `'${strongVimeoId}'` : 'NULL'},
        ${drill.offHandVideo && drill.offHandVideo !== 'F' && drill.offHandVideo !== 'X' ? `'${drill.offHandVideo}'` : 'NULL'},
        ${offVimeoId ? `'${offVimeoId}'` : 'NULL'},
        ${drill.alternatingVideo && drill.alternatingVideo !== 'F' && drill.alternatingVideo !== 'X' ? `'${drill.alternatingVideo}'` : 'NULL'},
        ${alternatingVimeoId ? `'${alternatingVimeoId}'` : 'NULL'},
        ${drill.difficulty},
        '${description}',
        ${skillFocusSQL},
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    )`)
  })
  
  insertSQL += drillValues.join(',\n') + ';\n\n'
  
  // Add verification query
  insertSQL += `-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total drills after insert
SELECT COUNT(*) as total_drills FROM wall_ball_drill_library;

-- Check newly inserted drills
SELECT id, drill_name, difficulty_level, 
       CASE 
           WHEN strong_hand_vimeo_id IS NOT NULL THEN 'Has Strong Hand Video'
           ELSE 'No Strong Hand Video'
       END as strong_hand_status,
       CASE 
           WHEN off_hand_vimeo_id IS NOT NULL THEN 'Has Off Hand Video'
           ELSE 'No Off Hand Video'
       END as off_hand_status
FROM wall_ball_drill_library 
WHERE id > 9  -- Assuming current max ID is 9
ORDER BY difficulty_level, drill_name;
`
  
  // Write SQL file
  const sqlPath = 'scripts/upload-missing-wall-ball-drills.sql'
  fs.writeFileSync(sqlPath, insertSQL)
  
  console.log(`\n📝 Generated SQL file: ${sqlPath}`)
  
  // Generate mapping strategy document
  const mappingDoc = `# Wall Ball Drill-to-Variant Mapping Strategy

**Generated:** ${new Date().toISOString()}
**Purpose:** Document how to map drills to workout variants for points/gamification

## Overview

The CSV contains ${allDrills.length} total drills that map to ${Object.keys(workoutColumns).length} different workout variants across 8 series.

## Workout Series Structure

${Object.values(workoutColumns).reduce((acc, variant) => {
  if (!acc[variant.seriesName]) {
    acc[variant.seriesName] = []
  }
  acc[variant.seriesName].push(variant)
  return acc
}, {} as any)}

${Object.entries(Object.values(workoutColumns).reduce((acc, variant) => {
  if (!acc[variant.seriesName]) {
    acc[variant.seriesName] = []
  }
  acc[variant.seriesName].push(variant)
  return acc
}, {} as any)).map(([seriesName, variants]: [string, any[]]) => `
### ${seriesName}
${variants.map(v => `- ${v.name} (Duration: ${v.duration || 'Variable'}min, Sequence: ${v.sequencePosition || 'N/A'})`).join('\n')}
`).join('')}

## Drill Sequence Mapping Strategy

Each drill in the CSV has numbers indicating its position in specific workout variants. The mapping works as follows:

1. **Sequence Numbers**: The number in each workout column indicates the drill's position in that workout
2. **Empty Cells**: Mean the drill is not included in that workout variant
3. **Workout Variants**: Are identified by Series + Duration + Coaching status

## Missing Drills Analysis

**Missing Drills (${missingDrills.length}):**
${missingDrills.map((drill, i) => `
${i + 1}. **${drill.drillName}** (Difficulty: ${drill.difficulty})
   - Strong Hand Video: ${drill.strongHandVideo || 'None'}
   - Off Hand Video: ${drill.offHandVideo || 'None'}
   - Alternating Video: ${drill.alternatingVideo || 'None'}
   - Appears in ${Object.keys(drill.workoutMappings).length} workout variants
   - Workout positions: ${Object.entries(drill.workoutMappings).map(([workout, pos]) => `${workout}(${pos})`).join(', ')}
`).join('')}

## Implementation Steps

### Phase 1: Upload Missing Drills
1. Run \`scripts/upload-missing-wall-ball-drills.sql\`
2. Verify all ${missingDrills.length} drills are inserted
3. Confirm video URLs and Vimeo IDs are properly extracted

### Phase 2: Update Workout Variants with Drill Mappings
1. Query each workout variant by series_name + duration + coaching status
2. For each variant, find matching CSV column
3. Build drill_ids array based on sequence numbers from CSV
4. Update wall_ball_workout_variants.drill_ids with proper drill IDs

### Phase 3: Verification
1. Ensure all variants have correct drill_ids arrays
2. Verify sequence ordering matches CSV
3. Test that points can be awarded based on drill completion

## SQL Generation for Phase 2

The drill-to-variant mapping will require:
\`\`\`sql
-- Example: Update Master Fundamentals 5-minute coaching variant
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
    (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
    (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
    -- ... more drills in sequence order
]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 5 
  AND has_coaching = true;
\`\`\`

## Next Steps

1. **Review and approve** the upload SQL script
2. **Execute** the drill uploads
3. **Generate** the variant mapping SQL based on CSV sequence data
4. **Test** the complete system with points/gamification integration
`
  
  const docPath = 'scripts/WALL_BALL_UPLOAD_AND_MAPPING_PLAN.md'
  fs.writeFileSync(docPath, mappingDoc)
  
  console.log(`📋 Generated mapping strategy: ${docPath}`)
  
  // Show summary of what will be uploaded
  console.log('\n📦 Upload Summary:')
  console.log('=' .repeat(80))
  console.log(`Drills to upload: ${missingDrills.length}`)
  console.log(`Drills with strong hand videos: ${missingDrills.filter(d => d.strongHandVideo && d.strongHandVideo !== 'F').length}`)
  console.log(`Drills with off hand videos: ${missingDrills.filter(d => d.offHandVideo && d.offHandVideo !== 'F').length}`)
  console.log(`Drills with alternating videos: ${missingDrills.filter(d => d.alternatingVideo && d.alternatingVideo !== 'F' && d.alternatingVideo !== 'X').length}`)
  
  console.log('\n🎯 Files Generated:')
  console.log(`1. ${sqlPath} - SQL to upload ${missingDrills.length} missing drills`)
  console.log(`2. ${docPath} - Complete mapping strategy and implementation plan`)
  
  return { missingDrills, workoutColumns, currentVariants }
}

createUploadPlan().catch(console.error)
