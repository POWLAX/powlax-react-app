import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Paid Supabase features we can leverage:
// - Larger batch inserts (up to 1000 rows)
// - Better performance with indexes
// - Real-time subscriptions for import progress
// - Database functions for data processing

async function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        bom: true
      }))
      .on('data', (data) => results.push(data))
      .on('error', reject)
      .on('end', () => resolve(results))
  })
}

async function importDrills() {
  console.log('📊 Starting drill import...')
  
  const drillsPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Drills-Export-2025-July-31-1656.csv')
  const records = await parseCSV(drillsPath)
  
  console.log(`Found ${records.length} drill records`)
  
  // Larger batch size with paid Supabase
  const batchSize = 100
  let imported = 0
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map(row => ({
      wp_id: row['ID'],
      title: row['Title'],
      content: row['Content'],
      drill_types: row['Drill Types'],
      drill_category: row['_drill_category'],
      drill_duration: row['_drill_duration'],
      drill_video_url: row['_drill_video_url'],
      drill_notes: row['_drill_notes'],
      game_states: row['_drill_game_states'],
      status: row['Status'],
      slug: row['Slug'],
      // Store raw data for later processing
      raw_data: JSON.stringify(row)
    }))
    
    const { error } = await supabase
      .from('drills_powlax')
      .insert(batch)
    
    if (error) {
      console.error(`Error importing batch ${i}-${i + batchSize}:`, error)
    } else {
      imported += batch.length
      console.log(`✓ Imported ${imported}/${records.length} drills`)
    }
  }
  
  console.log('✅ Drill import complete!')
}

async function importSkillsAcademyDrills() {
  console.log('🎯 Starting Skills Academy drills import...')
  
  const academyPath = path.join(__dirname, '../docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Online Skills Academy Drills-POWLAX Online Skills Academy Drills and I Frames.csv')
  
  try {
    const records = await parseCSV(academyPath)
    console.log(`Found ${records.length} Skills Academy records`)
    
    // Skip header rows and process actual drill data
    const drills = records.slice(3).filter(row => row['Name'] && row['VIMEO URL'])
    
    const academyDrills = drills.map(row => ({
      title: row['Name'],
      vimeo_url: row['VIMEO URL'],
      academy_category: row['Category'],
      location_setup: row['Location or Setup'],
      equipment_needed: {
        balls: row['Balls'] === 'Yes',
        goal: row['Goal Needed'] === 'Yes',
        cones: row['Cones Needed'] === 'Yes',
        bounce_back: row['Bounce Back or Partner Needed'] === 'Yes',
        speed_ladder: row['Speed Ladder'] === 'Yes'
      },
      // Position-specific relevance
      attack_relevance: row['Attack'] || null,
      midfield_relevance: row['Midfield'] || null,
      defense_relevance: row['Defense'] || null,
      progression_info: row['Progression Information'],
      // Map to which workouts include this drill
      included_in_workouts: {
        attack: extractWorkoutNumbers(row, 'Attack'),
        midfield: extractWorkoutNumbers(row, 'Midfield'),
        defense: extractWorkoutNumbers(row, 'Defense')
      },
      raw_data: JSON.stringify(row)
    }))
    
    // Insert in smaller batches
    const batchSize = 50
    let imported = 0
    
    for (let i = 0; i < academyDrills.length; i += batchSize) {
      const batch = academyDrills.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('skills_academy_powlax')
        .insert(batch)
      
      if (error) {
        console.error(`Error importing batch ${i}-${i + batchSize}:`, error)
      } else {
        imported += batch.length
        console.log(`✓ Imported ${imported}/${academyDrills.length} academy drills`)
      }
    }
    
    console.log('✅ Skills Academy import complete!')
  } catch (error) {
    console.error('Error importing Skills Academy:', error)
  }
}

function extractWorkoutNumbers(row: any, position: string): number[] {
  const workouts: number[] = []
  
  // Check columns like "Attack 1", "Attack 2", etc.
  for (let i = 1; i <= 12; i++) {
    const columnName = `${position} ${i}`
    if (row[columnName] && row[columnName].trim() !== '') {
      workouts.push(i)
    }
  }
  
  return workouts
}

async function importWallBallSkills() {
  console.log('🏐 Starting Wall Ball Skills import...')
  
  const wallBallPath = path.join(__dirname, '../docs/Wordpress CSV\'s/2015 POWLAX Plan CSV\'s Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv')
  
  try {
    const records = await parseCSV(wallBallPath)
    console.log(`Found ${records.length} wall ball skill records`)
    
    const wallBallSkills = records.filter(row => row['Skill Name']).map(row => ({
      title: row['Skill Name'],
      vimeo_url: row['VIMEO URL'],
      workout_type: 'skill',
      // Map which workouts include this skill
      included_in_workouts: extractWallBallWorkouts(row),
      description: row['Description'] || null,
      raw_data: JSON.stringify(row)
    }))
    
    const { error } = await supabase
      .from('wall_ball_powlax')
      .insert(wallBallSkills)
    
    if (error) {
      console.error('Error importing wall ball skills:', error)
    } else {
      console.log(`✅ Wall Ball Skills import complete! (${wallBallSkills.length} records)`)
    }
  } catch (error) {
    console.error('Error importing Wall Ball Skills:', error)
  }
}

function extractWallBallWorkouts(row: any): any {
  const workouts = {
    short: [],
    medium: [],
    long: []
  }
  
  // Check for workout inclusions
  Object.keys(row).forEach(key => {
    if (key.includes('Workout') && row[key] === 'X') {
      if (key.includes('Short')) workouts.short.push(key)
      if (key.includes('Medium')) workouts.medium.push(key)
      if (key.includes('Long')) workouts.long.push(key)
    }
  })
  
  return workouts
}

async function importMasterClasses() {
  console.log('📚 Starting Master Classes import...')
  
  const masterClassPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Master-Classes-Export-2025-July-31-0929.csv')
  const records = await parseCSV(masterClassPath)
  
  console.log(`Found ${records.length} Master Class records`)
  
  // Filter for strategies (Coaches Corner without drill types)
  const strategies = records.filter(row => 
    row['Post Categories']?.includes('Coaches Corner') && 
    !row['Drill Types']
  )
  
  console.log(`Found ${strategies.length} strategy records`)
  
  const strategiesData = strategies.map(row => ({
    wp_id: row['ID'],
    title: row['Title'],
    content: row['Content'],
    coaching_strategies: row['Post Categories'],
    featured_image: row['Featured Image'],
    master_class_id: row['ID'],
    raw_data: JSON.stringify(row)
  }))
  
  const { error } = await supabase
    .from('strategies_powlax')
    .insert(strategiesData)
  
  if (error) {
    console.error('Error importing strategies:', error)
  } else {
    console.log('✅ Strategy import complete!')
  }
}

async function importLessons() {
  console.log('📖 Starting Lessons import...')
  
  const lessonsPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Lessons-Export-2025-July-31-0933.csv')
  const records = await parseCSV(lessonsPath)
  
  console.log(`Found ${records.length} lesson records`)
  
  // Import all lessons for now, we'll categorize later
  const batchSize = 100
  let imported = 0
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map(row => ({
      wp_id: row['ID'],
      title: row['Title'],
      content: row['Content'],
      lesson_type: row['Lesson Type'] || row['Post Type'],
      vimeo_url: row['Vimeo URL'] || row['Video URL'],
      raw_data: JSON.stringify(row)
    }))
    
    const { error } = await supabase
      .from('lessons_powlax')
      .insert(batch)
    
    if (error) {
      console.error(`Error importing batch ${i}-${i + batchSize}:`, error)
    } else {
      imported += batch.length
      console.log(`✓ Imported ${imported}/${records.length} lessons`)
    }
  }
  
  console.log('✅ Lessons import complete!')
}

async function createRelationshipTables() {
  console.log('🔗 Creating relationship tables for better connections...')
  
  // This function creates helper tables that leverage Supabase paid features
  // We'll create these after import to establish connections
  
  const { error } = await supabase.rpc('create_drill_relationships', {})
  
  if (error) {
    console.log('Note: Relationship tables will be created manually')
  } else {
    console.log('✅ Relationship tables created!')
  }
}

async function createImportSummary() {
  console.log('\n📊 Creating import summary...\n')
  
  const tables = [
    'drills_powlax',
    'strategies_powlax',
    'skills_academy_powlax',
    'wall_ball_powlax',
    'lessons_powlax'
  ]
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (!error) {
      console.log(`${table}: ${count} records`)
    }
  }
  
  // Show connection opportunities
  console.log('\n🔗 Connection Opportunities:')
  console.log('- Drills with game_states field can map to strategies')
  console.log('- Academy drills can connect to skill progressions')
  console.log('- Wall ball skills can link to specific workouts')
  console.log('- Position-specific content can create personalized paths')
}

async function main() {
  console.log('🚀 Starting POWLAX CSV Import to Supabase\n')
  console.log('Supabase URL:', supabaseUrl)
  console.log('\n📌 Leveraging Paid Supabase Features:')
  console.log('- Larger batch inserts (100 rows)')
  console.log('- Better indexing for performance')
  console.log('- JSONB storage for flexible data')
  console.log('\n')
  
  try {
    // Core imports
    await importDrills()
    await importMasterClasses()
    await importLessons()
    
    // Skills Academy imports
    await importSkillsAcademyDrills()
    await importWallBallSkills()
    
    // Create relationships
    await createRelationshipTables()
    
    // Summary
    await createImportSummary()
    
    console.log('\n✅ All imports complete!')
    console.log('\n🎯 Next Steps:')
    console.log('1. Run drill→strategy mapping script')
    console.log('2. Create position-specific learning paths')
    console.log('3. Build skill progression relationships')
    console.log('4. Connect academy drills to team drills')
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
main()