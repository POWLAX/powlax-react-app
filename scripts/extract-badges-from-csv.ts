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
    .replace(/<!--.*?-->/g, '') // Remove HTML comments
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[.*?\]/g, '') // Remove WordPress shortcodes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Helper function to extract first URL from pipe-separated list
function extractFirstUrl(urlString: string): string | null {
  if (!urlString) return null
  
  const urls = urlString.split('|')
  return urls[0]?.trim() || null
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

// Parse CSV manually (simple parser for this specific case)
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Simple CSV parsing - may need adjustment for complex CSV with quotes
    const values = line.split(',').map(v => v.replace(/"/g, '').trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row)
  }
  
  return rows
}

async function extractBadgesFromCSV() {
  console.log('🏆 Extracting badge data from CSV files...\n')
  
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
      
      for (const row of rows) {
        // Skip empty rows
        if (!row['Title'] || row['Title'] === 'Title') continue
        
        // Extract badge data according to the guide
        const badge: BadgeData = {
          title: cleanText(row['Title']),
          description: cleanText(row['Excerpt'] || row['Content'] || ''),
          category: category,
          icon_url: extractFirstUrl(row['URL']),
          points_required: parseInt(row['_gamipress_points_required'] || '0') || 0,
          points_type_required: standardizePointType(row['_gamipress_points_type_required'] || ''),
          maximum_earnings: parseInt(row['_gamipress_maximum_earnings'] || '1') || 1,
          is_hidden: (row['_gamipress_hidden'] || '').toLowerCase() === 'yes',
          sort_order: 0 // Will be set based on processing order
        }
        
        // Add WordPress ID if available
        if (row['ID']) {
          badge.wordpress_id = parseInt(row['ID'])
        }
        
        // Set earned_by_type based on the data
        if (row['_gamipress_earned_by']) {
          badge.earned_by_type = cleanText(row['_gamipress_earned_by'])
        }
        
        // Store metadata for additional fields
        const metadata: any = {}
        if (row['_gamipress_congratulations_text']) {
          metadata.congratulations_text = cleanText(row['_gamipress_congratulations_text'])
        }
        if (row['Featured']) {
          metadata.featured_image_url = extractFirstUrl(row['Featured'])
        }
        
        if (Object.keys(metadata).length > 0) {
          badge.metadata = metadata
        }
        
        allBadges.push(badge)
        console.log(`   ✅ ${badge.title}`)
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${file}:`, error)
    }
  }
  
  console.log(`\n📊 Total badges extracted: ${allBadges.length}`)
  
  // Add sort order
  allBadges.forEach((badge, index) => {
    badge.sort_order = index + 1
  })
  
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
  const batchSize = 10
  for (let i = 0; i < badges.length; i += batchSize) {
    const batch = badges.slice(i, i + batchSize)
    
    console.log(`📦 Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} badges)...`)
    
    const { data, error } = await supabase
      .from('badges_powlax')
      .insert(batch)
      .select('id, title, category')
    
    if (error) {
      console.log(`❌ Error inserting batch:`, error.message)
      console.log('Batch data:', batch)
    } else {
      console.log(`✅ Inserted ${data?.length} badges`)
    }
  }
  
  // Get final count
  const { count } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Final badge count in database: ${count}`)
}

async function main() {
  try {
    const badges = await extractBadgesFromCSV()
    
    if (badges.length === 0) {
      console.log('❌ No badges extracted, aborting...')
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