/**
 * GamiPress Badge Setup Script
 * Agent 2 - Badge Definitions and Requirements
 * 
 * This script processes all 6 badge category CSV files and populates the badges_powlax table
 * with proper requirements, point types, and metadata extracted from WordPress GamiPress exports.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { parse } from 'csv-parse/sync'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Badge interface matching our badges_powlax table
interface BadgeData {
  original_id: number
  title: string
  description: string
  icon_url: string | null
  category: string
  sub_category?: string
  earned_by_type: 'milestone' | 'quest' | 'points' | 'action'
  points_type_required?: string
  points_required?: number
  quest_id?: number
  maximum_earnings: number
  is_hidden: boolean
  sort_order: number
  metadata: Record<string, any>
}

interface CSVRow {
  ID: string
  Title: string
  Content: string
  Excerpt: string
  Slug: string
  URL: string
  _gamipress_points_type: string
  _gamipress_earned_by: string
  _gamipress_points_required: string
  _gamipress_congratulations_text: string
  _gamipress_hidden: string
  _gamipress_maximum_earnings: string
  'Post Type': string
}

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
  console.error(`   SERVICE_KEY: ${supabaseKey ? '✅' : '❌'}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Badge CSV files to process
const badgeFiles = [
  {
    file: 'Attack-Badges-Export-2025-July-31-1836.csv',
    category: 'Attack',
    order_offset: 0
  },
  {
    file: 'Defense-Badges-Export-2025-July-31-1855.csv', 
    category: 'Defense',
    order_offset: 100
  },
  {
    file: 'Midfield-Badges-Export-2025-July-31-1903.csv',
    category: 'Midfield', 
    order_offset: 200
  },
  {
    file: 'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
    category: 'Wall Ball',
    order_offset: 300
  },
  {
    file: 'Solid-Start-Badges-Export-2025-July-31-1920.csv',
    category: 'Solid Start',
    order_offset: 400
  },
  {
    file: 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv',
    category: 'Lacrosse IQ',
    order_offset: 500
  }
]

/**
 * Extract workout count from badge content HTML
 * Badges typically require "5 workouts" completion
 */
function extractWorkoutRequirement(content: string): number {
  // Look for patterns like "Complete and Submit 5 of the" 
  const workoutMatch = content.match(/Complete and Submit (\d+) of the/i)
  if (workoutMatch) {
    return parseInt(workoutMatch[1], 10)
  }
  
  // Default to 5 workouts if not specified
  return 5
}

/**
 * Extract points type from HTML content
 * Look for gamipress_user_points type="" attributes
 */
function extractPointsType(content: string): string | null {
  const pointsTypeMatch = content.match(/type="([^"]+)"/i)
  if (pointsTypeMatch) {
    return pointsTypeMatch[1]
  }
  return null
}

/**
 * Extract icon URL from the CSV data
 */
function extractIconUrl(csvRow: CSVRow): string | null {
  // The URL field contains the icon URL for badges
  if (csvRow.URL && csvRow.URL.includes('.png')) {
    return csvRow.URL.split('|')[0] // Take first URL if multiple
  }
  return null
}

/**
 * Clean and truncate badge title to fit database constraints
 */
function cleanBadgeTitle(title: string): string {
  // If title contains pipe characters, take the first part (primary badge name)
  const primaryTitle = title.split('|')[0].trim()
  
  // Truncate to 250 characters to be safe with VARCHAR(255)
  if (primaryTitle.length > 250) {
    return primaryTitle.substring(0, 247) + '...'
  }
  
  return primaryTitle
}

/**
 * Parse badge requirements from CSV content
 */
function parseBadgeRequirements(csvRow: CSVRow, category: string): Partial<BadgeData> {
  const workoutCount = extractWorkoutRequirement(csvRow.Content)
  const pointsType = extractPointsType(csvRow.Content)
  
  // Default earning mechanism is completing workouts (quest-based)
  let earnedByType: 'milestone' | 'quest' | 'points' | 'action' = 'quest'
  let pointsRequired: number | undefined
  
  // Some badges may be earned by points instead of workouts
  if (csvRow._gamipress_points_required && parseInt(csvRow._gamipress_points_required) > 0) {
    earnedByType = 'points'
    pointsRequired = parseInt(csvRow._gamipress_points_required)
  }
  
  const metadata = {
    wordpress_id: parseInt(csvRow.ID),
    slug: csvRow.Slug,
    excerpt: csvRow.Excerpt,
    congratulations_text: csvRow._gamipress_congratulations_text || null,
    workout_requirement: workoutCount,
    points_type: pointsType,
    post_type: csvRow['Post Type']
  }
  
  return {
    original_id: parseInt(csvRow.ID),
    title: cleanBadgeTitle(csvRow.Title),
    description: csvRow.Excerpt || cleanBadgeTitle(csvRow.Title),
    icon_url: extractIconUrl(csvRow),
    category,
    earned_by_type: earnedByType,
    points_type_required: pointsType || `${category.toLowerCase().replace(/\s+/g, '-')}-points`,
    points_required: pointsRequired,
    maximum_earnings: parseInt(csvRow._gamipress_maximum_earnings) || 1,
    is_hidden: csvRow._gamipress_hidden === 'hide',
    metadata
  }
}

/**
 * Process a single badge CSV file
 */
async function processBadgeFile(fileConfig: typeof badgeFiles[0]): Promise<BadgeData[]> {
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/Gamipress Gamification Exports', fileConfig.file)
  
  console.log(`\n📋 Processing ${fileConfig.category} badges from ${fileConfig.file}`)
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`)
    return []
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    encoding: 'utf8'
  }) as CSVRow[]
  
  console.log(`   Found ${records.length} badge records`)
  
  const badges: BadgeData[] = []
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const badgeData = parseBadgeRequirements(record, fileConfig.category)
    
    badges.push({
      ...badgeData,
      sort_order: fileConfig.order_offset + i,
    } as BadgeData)
    
    console.log(`   ✓ Processed: ${record.Title}`)
  }
  
  return badges
}

/**
 * Insert badges into Supabase
 */
async function insertBadges(badges: BadgeData[]): Promise<void> {
  console.log(`\n💾 Inserting ${badges.length} badges into database...`)
  
  const { data, error } = await supabase
    .from('badges_powlax')
    .upsert(badges, {
      onConflict: 'original_id'
    })
  
  if (error) {
    console.error('❌ Error inserting badges:', error)
    throw error
  }
  
  console.log(`✅ Successfully inserted ${badges.length} badges`)
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎖️  GamiPress Badge Setup - Agent 2')
  console.log('=====================================')
  console.log(`Processing ${badgeFiles.length} badge categories...`)
  
  let allBadges: BadgeData[] = []
  
  // Process each badge category file
  for (const fileConfig of badgeFiles) {
    try {
      const badges = await processBadgeFile(fileConfig)
      allBadges = allBadges.concat(badges)
    } catch (error) {
      console.error(`❌ Error processing ${fileConfig.file}:`, error)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total badges processed: ${allBadges.length}`)
  
  // Group by category for summary
  const categoryCounts = allBadges.reduce((acc, badge) => {
    acc[badge.category] = (acc[badge.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('   Badges by category:')
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`     ${category}: ${count}`)
  })
  
  // Insert into database
  if (allBadges.length > 0) {
    await insertBadges(allBadges)
  }
  
  console.log('\n🎉 Badge setup complete!')
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main as setupBadges }