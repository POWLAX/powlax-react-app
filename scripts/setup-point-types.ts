/**
 * GamiPress Point Types Setup Script
 * Agent 1: Database schema updates and point type setup
 * Contract: POWLAX-GAM-001
 * 
 * This script parses the WordPress GamiPress Points-Types-Export CSV
 * and creates/updates point types in the Supabase database.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
// import * as csv from 'csv-parser'

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WordPressPointType {
  ID: string
  Title: string
  URL: string
  'Featured Image URL'?: string
  '_gamipress_plural_name': string
  Slug: string
  '_gamipress_notifications_by_type_points_award_title_pattern'?: string
  '_gamipress_points_limits_limit'?: string
  '_gamipress_points_limits_limit_recurrence'?: string
  Status: string
}

interface PointTypeRecord {
  currency: string
  display_name: string
  slug: string
  wordpress_id: number
  icon_url?: string
  notification_pattern?: string
  points_limit?: number
  limit_recurrence?: string
  is_workout_specific: boolean
}

// Utility functions
function generateCurrencyKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
}

function isWorkoutSpecific(title: string): boolean {
  const workoutKeywords = ['workout', 'workouts', 'drill', 'exercise', 'training']
  return workoutKeywords.some(keyword => 
    title.toLowerCase().includes(keyword)
  )
}

function extractIconUrl(urlString: string): string | undefined {
  if (!urlString) return undefined
  
  // Handle multiple URLs separated by |
  const urls = urlString.split('|')
  const imageUrl = urls.find(url => 
    url.includes('.png') || 
    url.includes('.jpg') || 
    url.includes('.jpeg') || 
    url.includes('.gif')
  )
  
  return imageUrl?.trim() || undefined
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      inQuotes = false
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
      i++
      continue
    } else {
      current += char
    }
    i++
  }
  
  result.push(current.trim())
  return result
}

async function parseCSV(): Promise<PointTypeRecord[]> {
  const csvPath = path.join(process.cwd(), 'docs/Wordpress CSV\'s/Gamipress Gamification Exports/Points-Types-Export-2025-July-31-1904.csv')
  
  console.log('🔍 Reading CSV file:', csvPath)
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`)
  }

  const content = fs.readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or has no data rows')
  }
  
  // Parse header to get column indices
  const headers = parseCSVLine(lines[0])
  const idIndex = headers.findIndex(h => h === 'ID')
  const titleIndex = headers.findIndex(h => h === 'Title')
  const urlIndex = headers.findIndex(h => h === 'URL')
  const pluralNameIndex = headers.findIndex(h => h === '_gamipress_plural_name')
  const slugIndex = headers.findIndex(h => h === 'Slug')
  const statusIndex = headers.findIndex(h => h === 'Status')
  const notificationIndex = headers.findIndex(h => h === '_gamipress_notifications_by_type_points_award_title_pattern')
  const limitIndex = headers.findIndex(h => h === '_gamipress_points_limits_limit')
  const recurrenceIndex = headers.findIndex(h => h === '_gamipress_points_limits_limit_recurrence')
  
  console.log(`📋 Found ${headers.length} columns, key indices: ID=${idIndex}, Title=${titleIndex}, Status=${statusIndex}`)
  
  const pointTypes: PointTypeRecord[] = []
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const columns = parseCSVLine(lines[i])
      
      // Skip rows without required fields
      if (!columns[idIndex] || !columns[titleIndex] || columns[statusIndex] !== 'publish') {
        continue
      }

      const wordpressId = parseInt(columns[idIndex])
      if (isNaN(wordpressId)) {
        console.warn(`⚠️  Invalid WordPress ID: ${columns[idIndex]}`)
        continue
      }

      const title = columns[titleIndex]?.replace(/^"|"$/g, '').trim()
      const pluralName = columns[pluralNameIndex]?.replace(/^"|"$/g, '').trim() || title
      const slug = columns[slugIndex]?.replace(/^"|"$/g, '').trim()
      
      if (!title) {
        console.warn(`⚠️  Missing title for ID: ${wordpressId}`)
        continue
      }

      const pointType: PointTypeRecord = {
        currency: generateCurrencyKey(title),
        display_name: pluralName,
        slug: slug || generateCurrencyKey(title).replace(/_/g, '-'),
        wordpress_id: wordpressId,
        icon_url: extractIconUrl(columns[urlIndex] || ''),
        notification_pattern: columns[notificationIndex]?.replace(/^"|"$/g, '').trim() || 'You earned {points} {points_type} {image}',
        points_limit: parseInt(columns[limitIndex] || '0') || 0,
        limit_recurrence: columns[recurrenceIndex]?.replace(/^"|"$/g, '').trim() || 'lifetime',
        is_workout_specific: isWorkoutSpecific(title)
      }

      pointTypes.push(pointType)
      console.log(`✅ Parsed: ${pointType.display_name} (${pointType.currency})`)
    } catch (error) {
      console.error(`❌ Error parsing line ${i + 1}:`, error)
    }
  }
  
  console.log(`📊 Total point types parsed: ${pointTypes.length}`)
  return pointTypes
}

async function checkExistingPointTypes(): Promise<Set<string>> {
  console.log('🔍 Checking existing point types...')
  
  const { data, error } = await supabase
    .from('powlax_points_currencies')
    .select('currency, wordpress_id')
  
  if (error) {
    throw new Error(`Failed to fetch existing point types: ${error.message}`)
  }
  
  const existingCurrencies = new Set(data?.map(pt => pt.currency) || [])
  const existingWordPressIds = new Set(data?.map(pt => pt.wordpress_id).filter(Boolean) || [])
  
  console.log(`📈 Found ${existingCurrencies.size} existing currencies`)
  console.log(`📈 Found ${existingWordPressIds.size} existing WordPress IDs`)
  
  return existingCurrencies
}

async function upsertPointTypes(pointTypes: PointTypeRecord[]): Promise<void> {
  console.log('💾 Upserting point types to database...')
  
  let created = 0
  let updated = 0
  let errors = 0
  
  for (const pointType of pointTypes) {
    try {
      // Check if exists by WordPress ID first, then by currency
      const { data: existing } = await supabase
        .from('powlax_points_currencies')
        .select('currency, wordpress_id')
        .or(`currency.eq.${pointType.currency},wordpress_id.eq.${pointType.wordpress_id}`)
        .single()
      
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('powlax_points_currencies')
          .update({
            display_name: pointType.display_name,
            slug: pointType.slug,
            wordpress_id: pointType.wordpress_id,
            icon_url: pointType.icon_url,
            notification_pattern: pointType.notification_pattern,
            points_limit: pointType.points_limit,
            limit_recurrence: pointType.limit_recurrence,
            is_workout_specific: pointType.is_workout_specific,
            updated_at: new Date().toISOString()
          })
          .eq('currency', existing.currency)
        
        if (error) {
          console.error(`❌ Error updating ${pointType.currency}:`, error)
          errors++
        } else {
          console.log(`🔄 Updated: ${pointType.display_name}`)
          updated++
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('powlax_points_currencies')
          .insert(pointType)
        
        if (error) {
          console.error(`❌ Error inserting ${pointType.currency}:`, error)
          errors++
        } else {
          console.log(`✅ Created: ${pointType.display_name}`)
          created++
        }
      }
      
      // Log to sync table
      await supabase
        .from('gamipress_sync_log')
        .insert({
          entity_type: 'point_types',
          wordpress_id: pointType.wordpress_id,
          supabase_id: pointType.currency,
          action_type: existing ? 'updated' : 'created',
          sync_data: pointType
        })
      
    } catch (error) {
      console.error(`❌ Error processing ${pointType.currency}:`, error)
      errors++
    }
  }
  
  console.log('\n📊 SUMMARY:')
  console.log(`✅ Created: ${created}`)
  console.log(`🔄 Updated: ${updated}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📄 Total processed: ${created + updated + errors}`)
}

async function validateSetup(): Promise<void> {
  console.log('🧪 Validating setup...')
  
  const { data: pointTypes, error } = await supabase
    .from('powlax_points_currencies')
    .select('*')
    .order('display_name')
  
  if (error) {
    throw new Error(`Validation failed: ${error.message}`)
  }
  
  console.log(`\n✅ Validation complete: ${pointTypes?.length || 0} point types in database`)
  
  // Show breakdown
  const workoutTypes = pointTypes?.filter(pt => pt.is_workout_specific) || []
  const coreTypes = pointTypes?.filter(pt => !pt.is_workout_specific) || []
  const withIcons = pointTypes?.filter(pt => pt.icon_url) || []
  
  console.log(`🏋️  Workout-specific: ${workoutTypes.length}`)
  console.log(`⚡ Core types: ${coreTypes.length}`)
  console.log(`🎨 With icons: ${withIcons.length}`)
  
  // Show sample data
  console.log('\n🔍 Sample point types:')
  pointTypes?.slice(0, 5).forEach(pt => {
    console.log(`  • ${pt.display_name} (${pt.currency})`)
  })
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting GamiPress Point Types Setup\n')
    
    // Parse CSV
    const pointTypes = await parseCSV()
    
    if (pointTypes.length === 0) {
      console.log('⚠️  No valid point types found in CSV')
      return
    }
    
    // Check existing data
    await checkExistingPointTypes()
    
    // Upsert point types
    await upsertPointTypes(pointTypes)
    
    // Validate
    await validateSetup()
    
    console.log('\n🎉 Setup complete!')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as setupPointTypes, parseCSV, upsertPointTypes }