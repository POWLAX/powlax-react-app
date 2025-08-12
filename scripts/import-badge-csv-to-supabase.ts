/**
 * Import Badge CSV Data to Supabase
 * Maps CSV fields to the actual badges_powlax table schema
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CSVBadge {
  title: string
  category: string
  description: string
  image_url: string
  congratulations_text: string
}

interface BadgePowlax {
  title: string
  description: string
  icon_url: string
  category: string
  badge_type?: string
  sub_category?: string
  earned_by_type?: string
  points_type_required?: string
  points_required: number
  wordpress_id?: number
  quest_id?: number
  maximum_earnings: number
  is_hidden: boolean
  sort_order: number
  metadata?: any
}

function parseCSV(csvContent: string): CSVBadge[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  
  console.log('📋 CSV Headers:', headers)
  
  const badges: CSVBadge[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Handle CSV parsing with potential commas in quoted fields
    const values = line.split(',').map(val => val.replace(/^"/, '').replace(/"$/, ''))
    
    if (values.length >= 5) {
      badges.push({
        title: values[0],
        category: values[1], 
        description: values[2],
        image_url: values[3],
        congratulations_text: values[4]
      })
    }
  }
  
  return badges
}

function mapCSVToBadgePowlax(csvBadge: CSVBadge, sortOrder: number): BadgePowlax {
  return {
    title: csvBadge.title,
    description: csvBadge.description,
    icon_url: csvBadge.image_url,
    category: csvBadge.category,
    badge_type: 'achievement', // Default badge type
    earned_by_type: 'skill_completion', // Default earning method
    points_required: 0, // Default points required
    maximum_earnings: 1, // Can only earn once
    is_hidden: false, // Visible by default
    sort_order: sortOrder,
    metadata: {
      congratulations_text: csvBadge.congratulations_text,
      source: 'powlax_badges_final_csv',
      imported_at: new Date().toISOString()
    }
  }
}

async function importBadgeCSV() {
  console.log('🚀 Starting badge CSV import to Supabase...\n')
  
  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'docs/data/extracted/powlax_badges_final.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`)
    return
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  console.log('✅ CSV file loaded')
  
  // Parse CSV data
  const csvBadges = parseCSV(csvContent)
  console.log(`📊 Parsed ${csvBadges.length} badges from CSV\n`)
  
  // Show sample data
  console.log('📋 Sample CSV badge:')
  console.log(JSON.stringify(csvBadges[0], null, 2))
  
  // Map to database schema
  const badgesToInsert = csvBadges.map((csvBadge, index) => 
    mapCSVToBadgePowlax(csvBadge, index + 1)
  )
  
  console.log('\n📋 Sample mapped badge:')
  console.log(JSON.stringify(badgesToInsert[0], null, 2))
  
  // Check if badges already exist
  const { data: existingBadges, error: checkError } = await supabase
    .from('badges_powlax')
    .select('title')
  
  if (checkError) {
    console.error('❌ Error checking existing badges:', checkError)
    return
  }
  
  const existingTitles = new Set(existingBadges?.map(b => b.title) || [])
  const newBadges = badgesToInsert.filter(badge => !existingTitles.has(badge.title))
  
  console.log(`\n📊 Import summary:`)
  console.log(`   Total CSV badges: ${csvBadges.length}`)
  console.log(`   Existing in DB: ${existingTitles.size}`)
  console.log(`   New to insert: ${newBadges.length}`)
  
  if (newBadges.length === 0) {
    console.log('✅ All badges already exist in database!')
    return
  }
  
  // Insert new badges
  console.log(`\n🚀 Inserting ${newBadges.length} new badges...`)
  
  const { data: insertedBadges, error: insertError } = await supabase
    .from('badges_powlax')
    .insert(newBadges)
    .select()
  
  if (insertError) {
    console.error('❌ Error inserting badges:', insertError)
    return
  }
  
  console.log(`✅ Successfully inserted ${insertedBadges?.length || 0} badges!`)
  
  // Show some sample results
  if (insertedBadges && insertedBadges.length > 0) {
    console.log('\n📋 Sample inserted badge:')
    console.log(JSON.stringify(insertedBadges[0], null, 2))
  }
  
  // Final verification
  const { count: totalCount } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Badge import complete! Total badges in database: ${totalCount}`)
}

// Run the import
importBadgeCSV().catch(console.error)