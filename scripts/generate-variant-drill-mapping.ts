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

async function generateVariantDrillMapping() {
  console.log('🔗 Generating Workout Variant to Drill Mapping...\n')
  
  // Read and parse CSV
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  const headerRow1 = lines[0].split(',')
  
  // Define workout variant column mapping
  const workoutVariantColumns = [
    { col: 4, name: 'Master Fundamentals', duration: null, coaching: true },
    { col: 5, name: '10 Master Fund', duration: 10, coaching: true },
    { col: 6, name: '5 Minute Master Fundamentals', duration: 5, coaching: true },
    { col: 7, name: 'Dodging', duration: null, coaching: true },
    { col: 8, name: '10 Dodging', duration: 10, coaching: true },
    { col: 9, name: '5 Dodging', duration: 5, coaching: true },
    { col: 10, name: 'Conditioning', duration: null, coaching: true },
    { col: 11, name: '10 Min Conditioning', duration: 10, coaching: true },
    { col: 12, name: '5 Min Conditioning', duration: 5, coaching: true },
    { col: 13, name: 'Faking and Inside Finishing', duration: null, coaching: true },
    { col: 14, name: '10 Min Faking', duration: 10, coaching: true },
    { col: 15, name: '5 Minute Faking', duration: 5, coaching: true },
    { col: 16, name: 'Shooting', duration: null, coaching: true },
    { col: 17, name: '10 Shooting', duration: 10, coaching: true },
    { col: 18, name: '5 Shooting', duration: 5, coaching: true },
    { col: 19, name: 'Defensive Emphasis', duration: null, coaching: true },
    { col: 20, name: '10 Defense', duration: 10, coaching: true },
    { col: 21, name: '5 Defense', duration: 5, coaching: true },
    { col: 22, name: 'Catch Everything', duration: null, coaching: true },
    { col: 23, name: '10 Catch Everything', duration: 10, coaching: true },
    { col: 24, name: '5 Catch Everything', duration: 5, coaching: true },
    { col: 25, name: 'Advanced - Fun and Challenging', duration: null, coaching: true },
    { col: 26, name: '10 Catch Everything', duration: 10, coaching: true }, // Note: This seems to be a duplicate
    { col: 27, name: '5 Catch Everything', duration: 5, coaching: true }    // Note: This seems to be a duplicate
  ]
  
  // Parse drills and their workout sequence positions
  const drillSequences: { [workoutVariant: string]: Array<{ drillName: string, position: number }> } = {}
  
  // Initialize all workout variants
  workoutVariantColumns.forEach(variant => {
    drillSequences[variant.name] = []
  })
  
  // Parse each drill row
  for (let i = 3; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const drillName = cols[1]?.trim()
    
    if (!drillName) continue
    
    // Check each workout variant column for sequence position
    workoutVariantColumns.forEach(variant => {
      const sequenceValue = cols[variant.col]?.trim()
      if (sequenceValue && sequenceValue !== '' && sequenceValue !== 'X' && !isNaN(parseInt(sequenceValue))) {
        drillSequences[variant.name].push({
          drillName,
          position: parseInt(sequenceValue)
        })
      }
    })
  }
  
  // Sort each workout's drills by sequence position
  Object.keys(drillSequences).forEach(workoutName => {
    drillSequences[workoutName].sort((a, b) => a.position - b.position)
  })
  
  // Get current database variants and drills
  const { data: dbVariants } = await supabase
    .from('wall_ball_workout_variants')
    .select('*')
    .order('series_id, duration_minutes, has_coaching')
  
  const { data: dbSeries } = await supabase
    .from('wall_ball_workout_series')
    .select('*')
    .order('id')
  
  console.log('📊 Workout Variant Analysis:')
  console.log('=' .repeat(80))
  
  Object.entries(drillSequences).forEach(([workoutName, drills]) => {
    if (drills.length > 0) {
      console.log(`\n🏋️ ${workoutName} (${drills.length} drills):`)
      drills.forEach(drill => {
        console.log(`  ${drill.position}. ${drill.drillName}`)
      })
    }
  })
  
  // Generate SQL to update workout variants with drill mappings
  let mappingSQL = `-- ============================================
-- WALL BALL VARIANT DRILL MAPPING UPDATE
-- ============================================
-- Updates workout variants with correct drill_ids based on CSV sequence
-- Generated: ${new Date().toISOString()}
-- Run AFTER uploading missing drills
-- ============================================

-- First, let's create a helper function to get drill ID by name
CREATE OR REPLACE FUNCTION get_drill_id_by_name(drill_name_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    drill_id_result INTEGER;
BEGIN
    SELECT id INTO drill_id_result 
    FROM wall_ball_drill_library 
    WHERE drill_name = drill_name_param;
    
    IF drill_id_result IS NULL THEN
        RAISE WARNING 'Drill not found: %', drill_name_param;
        RETURN NULL;
    END IF;
    
    RETURN drill_id_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE WORKOUT VARIANTS WITH DRILL MAPPINGS
-- ============================================

`
  
  // Generate update statements for each workout variant
  Object.entries(drillSequences).forEach(([workoutName, drills]) => {
    if (drills.length === 0) return
    
    // Map workout name to database series and duration
    const seriesMapping = {
      'Master Fundamentals': 'Master Fundamentals',
      '10 Master Fund': 'Master Fundamentals',
      '5 Minute Master Fundamentals': 'Master Fundamentals',
      'Dodging': 'Dodging',
      '10 Dodging': 'Dodging',
      '5 Dodging': 'Dodging',
      'Conditioning': 'Conditioning',
      '10 Min Conditioning': 'Conditioning',
      '5 Min Conditioning': 'Conditioning',
      'Faking and Inside Finishing': 'Faking and Inside Finishing',
      '10 Min Faking': 'Faking and Inside Finishing',
      '5 Minute Faking': 'Faking and Inside Finishing',
      'Shooting': 'Shooting',
      '10 Shooting': 'Shooting',
      '5 Shooting': 'Shooting',
      'Defensive Emphasis': 'Defensive Emphasis',
      '10 Defense': 'Defensive Emphasis',
      '5 Defense': 'Defensive Emphasis',
      'Catch Everything': 'Catch Everything',
      '10 Catch Everything': 'Catch Everything',
      '5 Catch Everything': 'Catch Everything',
      'Advanced - Fun and Challenging': 'Advanced - Fun and Challenging'
    }
    
    const seriesName = seriesMapping[workoutName as keyof typeof seriesMapping]
    const duration = workoutName.includes('10') ? 10 : workoutName.includes('5') ? 5 : null
    
    if (!seriesName) return
    
    const drillIdArray = drills.map(drill => `get_drill_id_by_name('${drill.drillName.replace(/'/g, "''")}')`).join(',\n        ')
    
    mappingSQL += `
-- Update ${workoutName}
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        ${drillIdArray}
    ],
    total_drills = ${drills.length},
    drill_sequence = '${drills.map(d => `${d.position}:${d.drillName}`).join(', ')}'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = '${seriesName}')
  ${duration ? `AND duration_minutes = ${duration}` : 'AND duration_minutes IS NULL'}
  AND has_coaching = true;

`
  })
  
  mappingSQL += `
-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check drill mappings
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching,
    wbwv.total_drills,
    array_length(wbwv.drill_ids, 1) as drill_count,
    wbwv.drill_sequence
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NOT NULL AND array_length(wbwv.drill_ids, 1) > 0
ORDER BY wbws.series_name, wbwv.duration_minutes, wbwv.has_coaching;

-- Check for any missing drill mappings
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NULL OR array_length(wbwv.drill_ids, 1) = 0
ORDER BY wbws.series_name, wbwv.duration_minutes;

-- Drop the helper function
DROP FUNCTION IF EXISTS get_drill_id_by_name(TEXT);
`
  
  const mappingSQLPath = 'scripts/update-variant-drill-mappings.sql'
  fs.writeFileSync(mappingSQLPath, mappingSQL)
  
  console.log(`🔗 Generated mapping SQL: ${mappingSQLPath}`)
  console.log('\n✅ Complete analysis and SQL generation finished!')
}

generateVariantDrillMapping().catch(console.error)
