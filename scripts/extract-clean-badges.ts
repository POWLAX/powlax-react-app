import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Badge CSV files mapping
const badgeFiles = [
  { file: 'Attack-Badges-Export-2025-July-31-1836.csv', category: 'attack' },
  { file: 'Defense-Badges-Export-2025-July-31-1855.csv', category: 'defense' },
  { file: 'Midfield-Badges-Export-2025-July-31-1903.csv', category: 'midfield' },
  { file: 'Wall-Ball-Badges-Export-2025-July-31-1925.csv', category: 'wall_ball' },
  { file: 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv', category: 'lacrosse_iq' },
  { file: 'Solid-Start-Badges-Export-2025-July-31-1920.csv', category: 'solid_start' },
  { file: 'Completed-Workouts-Export-2025-July-31-1849.csv', category: 'completed_workouts' }
]

interface BadgeData {
  title: string
  description: string
  category: string
  icon_url?: string
  badge_type?: string
  sub_category?: string
  earned_by_type?: string
  points_type_required?: string
  points_required: number
  wordpress_id?: number
  maximum_earnings: number
  is_hidden: boolean
  sort_order?: number
  metadata?: any
}

// Helper function to clean HTML and shortcodes from text
function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/<!--.*?-->/gs, '') // Remove HTML comments
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[.*?\]/g, '') // Remove WordPress shortcodes
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Helper function to extract first URL from pipe-separated list
function extractFirstUrl(urlString: string): string | null {
  if (!urlString) return null
  
  const urls = urlString.split('|')
  const firstUrl = urls[0]?.trim()
  
  // Check if it's a valid URL
  if (firstUrl && firstUrl.startsWith('http')) {
    return firstUrl
  }
  
  return null
}

// Helper function to check if title looks like a valid badge title
function isValidBadgeTitle(title: string): boolean {
  if (!title || title.length < 3) return false
  
  // Skip WordPress HTML content
  if (title.includes('make sure to log in') || 
      title.includes('Access denied') ||
      title.includes('contact your coach') ||
      title.includes('wp-content/uploads') ||
      title.length > 100) {
    return false
  }
  
  // Skip pipe characters (indicates corrupted data)
  if (title.includes('|') && title.length < 20) return false
  
  return true
}

// Helper function to standardize point types
function standardizePointType(pointType: string): string {
  if (!pointType) return ''
  
  const mapping: { [key: string]: string } = {
    'lax-credit': 'lax_credit',
    'attack-token': 'attack_token',
    'midfield-metal': 'midfield_medal',
    'midfield-medal': 'midfield_medal',
    'defense-dollar': 'defense_dollar',
    'rebound-rewards': 'rebound_reward',
    'lax-iq-point': 'lax_iq_point',
    'flex-point': 'flex_point'
  }
  
  return mapping[pointType] || pointType.replace(/-/g, '_')
}

// Parse CSV manually with better handling
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n')
  if (lines.length < 2) return []
  
  // Get headers
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine)
  
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = parseCSVLine(line)
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row)
  }
  
  return rows
}

// Simple CSV line parser that handles quoted values
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

async function extractCleanBadges() {
  console.log('🏆 Extracting and cleaning badge data from CSV files...\n')
  
  const csvDir = path.join(process.cwd(), 'docs', 'Wordpress CSV\'s', 'Gamipress Gamification Exports')
  const allBadges: BadgeData[] = []
  
  for (const { file, category } of badgeFiles) {
    const filePath = path.join(csvDir, file)
    
    console.log(`📁 Processing ${file} (${category} category)...`)
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`)
      continue
    }
    
    try {
      const csvContent = fs.readFileSync(filePath, 'utf-8')
      const rows = parseCSV(csvContent)
      
      console.log(`   Found ${rows.length} rows in CSV`)
      
      let validBadgeCount = 0
      
      for (const row of rows) {
        // Extract basic title and check if it's valid
        const rawTitle = cleanText(row['Title'] || '')
        
        if (!isValidBadgeTitle(rawTitle)) {
          continue // Skip invalid badge entries
        }
        
        const rawDescription = cleanText(row['Excerpt'] || row['Content'] || '')
        
        // Extract badge data according to the guide
        const badge: BadgeData = {
          title: rawTitle.substring(0, 255), // Ensure it fits in database
          description: rawDescription.substring(0, 500), // Limit description length
          category: category,
          icon_url: extractFirstUrl(row['URL']),
          points_required: parseInt(row['_gamipress_points_required'] || '0') || 0,
          points_type_required: standardizePointType(row['_gamipress_points_type_required'] || ''),
          maximum_earnings: parseInt(row['_gamipress_maximum_earnings'] || '1') || 1,
          is_hidden: (row['_gamipress_hidden'] || '').toLowerCase() === 'yes',
          sort_order: validBadgeCount + 1
        }
        
        // Add WordPress ID if available and valid
        if (row['ID'] && !isNaN(parseInt(row['ID']))) {
          badge.wordpress_id = parseInt(row['ID'])
        }
        
        // Set earned_by_type based on the data
        if (row['_gamipress_earned_by']) {
          const earnedBy = cleanText(row['_gamipress_earned_by'])
          if (earnedBy && earnedBy.length < 100) {
            badge.earned_by_type = earnedBy
          }
        }
        
        // Store metadata for additional fields
        const metadata: any = {}
        if (row['_gamipress_congratulations_text']) {
          const congrats = cleanText(row['_gamipress_congratulations_text'])
          if (congrats && congrats.length < 500) {
            metadata.congratulations_text = congrats
          }
        }
        if (row['Featured']) {
          const featuredUrl = extractFirstUrl(row['Featured'])
          if (featuredUrl) {
            metadata.featured_image_url = featuredUrl
          }
        }
        
        if (Object.keys(metadata).length > 0) {
          badge.metadata = metadata
        }
        
        allBadges.push(badge)
        validBadgeCount++
        console.log(`   ✅ ${badge.title}`)
      }
      
      console.log(`   📊 Valid badges found: ${validBadgeCount}`)
      
    } catch (error) {
      console.log(`❌ Error processing ${file}:`, error)
    }
  }
  
  console.log(`\n📊 Total valid badges extracted: ${allBadges.length}`)
  
  return allBadges
}

async function insertBadgesIntoSupabase(badges: BadgeData[]) {
  console.log('\n🚀 Inserting badges into Supabase...')
  
  // Clear existing badges
  console.log('🧹 Clearing existing badges...')
  const { error: deleteError } = await supabase
    .from('badges_powlax')
    .delete()
    .neq('id', 0) // Delete all records
  
  if (deleteError) {
    console.log('⚠️ Warning: Could not clear existing badges:', deleteError.message)
  }
  
  // Insert in batches
  const batchSize = 5
  let successCount = 0
  
  for (let i = 0; i < badges.length; i += batchSize) {
    const batch = badges.slice(i, i + batchSize)
    
    console.log(`📦 Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} badges)...`)
    
    const { data, error } = await supabase
      .from('badges_powlax')
      .insert(batch)
      .select('id, title, category')
    
    if (error) {
      console.log(`❌ Error inserting batch:`, error.message)
      console.log('First badge in failed batch:', batch[0])
    } else {
      console.log(`✅ Inserted ${data?.length} badges`)
      successCount += data?.length || 0
    }
  }
  
  // Get final count
  const { count } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Successfully inserted: ${successCount} badges`)
  console.log(`🎉 Final badge count in database: ${count}`)
}

async function main() {
  try {
    const badges = await extractCleanBadges()
    
    if (badges.length === 0) {
      console.log('❌ No valid badges extracted, aborting...')
      return
    }
    
    console.log('\n🔍 Sample badge data:')
    console.log(JSON.stringify(badges[0], null, 2))
    
    await insertBadgesIntoSupabase(badges)
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

main()