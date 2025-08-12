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
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments (multiline)
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

// Parse CSV with proper quoted field handling
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n')
  if (lines.length < 2) return []
  
  // Remove BOM if present
  const firstLine = lines[0].replace(/^\uFEFF/, '')
  const headers = parseCSVLine(firstLine)
  
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = parseCSVLine(line)
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    // Only include rows that have basic badge data
    if (row['Title'] && row['Title'].length > 0 && row['Title'] !== 'Title') {
      rows.push(row)
    }
  }
  
  return rows
}

// Parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"'
        i += 2
        continue
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
    
    i++
  }
  
  result.push(current.trim())
  return result
}

async function extractProperBadges() {
  console.log('🏆 Extracting proper badge data from CSV files...\n')
  
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
      
      console.log(`   Found ${rows.length} potential badge rows`)
      
      let validBadgeCount = 0
      
      for (const row of rows) {
        // Get clean title and description
        const title = cleanText(row['Title'])
        const description = cleanText(row['Excerpt'] || row['Content'] || '')
        
        // Validate basic badge requirements
        if (!title || title.length < 3 || title.length > 255) {
          continue
        }
        
        // Skip obviously invalid entries
        if (title.toLowerCase().includes('post type') || 
            title.toLowerCase().includes('permalink') ||
            description.toLowerCase().includes('access denied')) {
          continue
        }
        
        // Extract badge data
        const badge: BadgeData = {
          title: title,
          description: description.substring(0, 500), // Limit description length
          category: category,
          icon_url: extractFirstUrl(row['URL']),
          points_required: parseInt(row['_gamipress_points_required']) || 0,
          points_type_required: standardizePointType(row['_gamipress_points_type_required'] || ''),
          maximum_earnings: parseInt(row['_gamipress_maximum_earnings']) || 1,
          is_hidden: (row['_gamipress_hidden'] || '').toLowerCase() === 'show' ? false : true,
          sort_order: validBadgeCount + 1
        }
        
        // Add WordPress ID if available
        if (row['ID'] && !isNaN(parseInt(row['ID']))) {
          badge.wordpress_id = parseInt(row['ID'])
        }
        
        // Set earned_by_type
        if (row['_gamipress_earned_by']) {
          badge.earned_by_type = cleanText(row['_gamipress_earned_by']).substring(0, 100)
        }
        
        // Store metadata for additional fields
        const metadata: any = {}
        if (row['_gamipress_congratulations_text']) {
          const congrats = cleanText(row['_gamipress_congratulations_text'])
          if (congrats && congrats.length > 0) {
            metadata.congratulations_text = congrats.substring(0, 500)
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
      
      console.log(`   📊 Valid badges extracted: ${validBadgeCount}`)
      
    } catch (error) {
      console.log(`❌ Error processing ${file}:`, error)
    }
  }
  
  console.log(`\n📊 Total badges extracted: ${allBadges.length}`)
  
  return allBadges
}

async function insertBadgesIntoSupabase(badges: BadgeData[]) {
  console.log('\n🚀 Inserting badges into Supabase...')
  
  // Clear existing badges
  console.log('🧹 Clearing existing badges...')
  const { error: deleteError } = await supabase
    .from('badges_powlax')
    .delete()
    .neq('id', 0)
  
  if (deleteError) {
    console.log('⚠️ Warning: Could not clear existing badges:', deleteError.message)
  }
  
  // Insert badges one by one to catch specific errors
  let successCount = 0
  
  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i]
    
    console.log(`📦 Inserting badge ${i + 1}/${badges.length}: ${badge.title}`)
    
    const { data, error } = await supabase
      .from('badges_powlax')
      .insert([badge])
      .select('id, title, category')
    
    if (error) {
      console.log(`❌ Error inserting badge:`, error.message)
      console.log('Badge data:', {
        title: badge.title,
        titleLength: badge.title.length,
        description: badge.description?.substring(0, 100) + '...',
        category: badge.category
      })
    } else {
      console.log(`✅ Inserted: ${data?.[0]?.title}`)
      successCount++
    }
  }
  
  // Get final count
  const { count } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Successfully inserted: ${successCount}/${badges.length} badges`)
  console.log(`🎉 Final badge count in database: ${count}`)
}

async function main() {
  try {
    const badges = await extractProperBadges()
    
    if (badges.length === 0) {
      console.log('❌ No badges extracted, aborting...')
      return
    }
    
    console.log('\n🔍 Sample badge data:')
    badges.slice(0, 3).forEach((badge, i) => {
      console.log(`Badge ${i + 1}:`, {
        title: badge.title,
        description: badge.description.substring(0, 100) + '...',
        category: badge.category,
        icon_url: badge.icon_url,
        wordpress_id: badge.wordpress_id
      })
    })
    
    await insertBadgesIntoSupabase(badges)
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

main()