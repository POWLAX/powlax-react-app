/**
 * Badge CSV Processing Script
 * Agent 2 - Badge Definitions and Requirements
 * 
 * Processes all badge CSV files to extract complete data and create requirements mapping
 */

import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

interface BadgeCSVRow {
  ID: string
  Title: string
  Content: string
  Excerpt: string
  Date: string
  'Post Type': string
  Permalink: string
  URL: string
  _gamipress_points_type: string
  _gamipress_earned_by: string
  _gamipress_points_required: string
  _gamipress_congratulations_text: string
  _gamipress_hidden: string
  _gamipress_maximum_earnings: string
  Slug: string
}

interface ProcessedBadge {
  wordpress_id: number
  title: string
  excerpt: string
  category: string
  post_type: string
  slug: string
  permalink: string
  icon_url: string | null
  points_type: string | null
  earned_by: string
  points_required: number
  congratulations_text: string
  is_hidden: boolean
  maximum_earnings: number
  workout_requirement: number
  content_preview: string
  quiz_ids: number[]
}

interface BadgeRequirementsMap {
  categories: {
    [key: string]: {
      name: string
      post_type: string
      badge_count: number
      badges: ProcessedBadge[]
    }
  }
  summary: {
    total_badges: number
    categories_processed: number
    processing_date: string
  }
}

// Badge files configuration
const badgeFiles = [
  {
    file: 'Attack-Badges-Export-2025-July-31-1836.csv',
    category: 'Attack',
    post_type: 'attack-class'
  },
  {
    file: 'Defense-Badges-Export-2025-July-31-1855.csv',
    category: 'Defense',
    post_type: 'defense-class'
  },
  {
    file: 'Midfield-Badges-Export-2025-July-31-1903.csv',
    category: 'Midfield',
    post_type: 'midfield-class'
  },
  {
    file: 'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
    category: 'Wall Ball',
    post_type: 'wall-ball-class'
  },
  {
    file: 'Solid-Start-Badges-Export-2025-July-31-1920.csv',
    category: 'Solid Start',
    post_type: 'solid-start-class'
  },
  {
    file: 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv',
    category: 'Lacrosse IQ',
    post_type: 'lacrosse-iq-class'
  }
]

/**
 * Extract workout requirement from HTML content
 */
function extractWorkoutRequirement(content: string): number {
  const matches = [
    /Complete and Submit (\d+) of the/i,
    /complete (\d+) .*workouts?/i,
    /(\d+) .*workouts? below/i
  ]
  
  for (const pattern of matches) {
    const match = content.match(pattern)
    if (match) {
      return parseInt(match[1], 10)
    }
  }
  
  return 5 // Default requirement
}

/**
 * Extract points type from gamipress shortcodes
 */
function extractPointsType(content: string): string | null {
  const match = content.match(/type="([^"]+)"/i)
  return match ? match[1] : null
}

/**
 * Extract quiz IDs from content
 */
function extractQuizIds(content: string): number[] {
  const quizMatches = content.match(/quiz_id="(\d+)"/g) || []
  return quizMatches.map(match => {
    const idMatch = match.match(/(\d+)/)
    return idMatch ? parseInt(idMatch[1], 10) : 0
  }).filter(id => id > 0)
}

/**
 * Extract icon URL from URL field
 */
function extractIconUrl(urlField: string): string | null {
  if (!urlField) return null
  
  // URLs are pipe-separated, take the first PNG URL
  const urls = urlField.split('|')
  const pngUrl = urls.find(url => url.includes('.png'))
  return pngUrl || null
}

/**
 * Create content preview (first 200 chars of clean text)
 */
function createContentPreview(content: string): string {
  // Remove HTML tags and normalize whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  return cleanContent.length > 200 
    ? cleanContent.substring(0, 200) + '...'
    : cleanContent
}

/**
 * Process a single badge CSV file
 */
async function processBadgeFile(fileConfig: typeof badgeFiles[0]): Promise<ProcessedBadge[]> {
  const csvPath = path.join(
    process.cwd(), 
    'docs/Wordpress CSV\'s/Gamipress Gamification Exports', 
    fileConfig.file
  )
  
  console.log(`\n📋 Processing ${fileConfig.category} badges...`)
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`)
    return []
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // Remove BOM if present and fix malformed header
  const cleanContent = csvContent
    .replace(/^\uFEFF/, '')
    .replace(/^﻿1ID,/, 'ID,')  // Fix Attack CSV header issue
    .replace(/^1ID,/, 'ID,')   // Alternative fix
  
  const records = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    encoding: 'utf8'
  }) as BadgeCSVRow[]
  
  console.log(`   Found ${records.length} badge records`)
  
  const badges: ProcessedBadge[] = []
  
  for (const record of records) {
    if (!record.ID || !record.Title) continue
    
    const badge: ProcessedBadge = {
      wordpress_id: parseInt(record.ID),
      title: record.Title,
      excerpt: record.Excerpt || '',
      category: fileConfig.category,
      post_type: fileConfig.post_type,
      slug: record.Slug || '',
      permalink: record.Permalink || '',
      icon_url: extractIconUrl(record.URL),
      points_type: record._gamipress_points_type || extractPointsType(record.Content),
      earned_by: record._gamipress_earned_by || 'triggers',
      points_required: parseInt(record._gamipress_points_required) || 0,
      congratulations_text: record._gamipress_congratulations_text || '',
      is_hidden: record._gamipress_hidden === 'hide',
      maximum_earnings: parseInt(record._gamipress_maximum_earnings) || 1,
      workout_requirement: extractWorkoutRequirement(record.Content),
      content_preview: createContentPreview(record.Content),
      quiz_ids: extractQuizIds(record.Content)
    }
    
    badges.push(badge)
    console.log(`   ✓ ${badge.title} (${badge.workout_requirement} workouts required)`)
  }
  
  return badges
}

/**
 * Generate complete badge requirements mapping
 */
async function generateBadgeRequirementsMap(): Promise<BadgeRequirementsMap> {
  console.log('🎖️  Generating Badge Requirements Map')
  console.log('=====================================')
  
  const requirementsMap: BadgeRequirementsMap = {
    categories: {},
    summary: {
      total_badges: 0,
      categories_processed: 0,
      processing_date: new Date().toISOString()
    }
  }
  
  for (const fileConfig of badgeFiles) {
    try {
      const badges = await processBadgeFile(fileConfig)
      
      requirementsMap.categories[fileConfig.category] = {
        name: fileConfig.category,
        post_type: fileConfig.post_type,
        badge_count: badges.length,
        badges
      }
      
      requirementsMap.summary.total_badges += badges.length
      requirementsMap.summary.categories_processed++
      
    } catch (error) {
      console.error(`❌ Error processing ${fileConfig.category}:`, error)
    }
  }
  
  return requirementsMap
}

/**
 * Save badge requirements map to JSON file
 */
async function saveBadgeRequirementsMap(data: BadgeRequirementsMap): Promise<void> {
  const outputPath = path.join(process.cwd(), 'docs/badge-requirements-map.json')
  
  console.log(`\n💾 Saving badge requirements map to: ${outputPath}`)
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
  
  console.log(`✅ Badge requirements map saved successfully`)
  console.log(`📊 Summary:`)
  console.log(`   Total badges: ${data.summary.total_badges}`)
  console.log(`   Categories: ${data.summary.categories_processed}`)
  
  // Print category breakdown
  console.log(`\n📋 Badge breakdown by category:`)
  Object.entries(data.categories).forEach(([category, info]) => {
    console.log(`   ${category}: ${info.badge_count} badges`)
  })
}

/**
 * Main execution function
 */
async function main() {
  try {
    const badgeRequirementsMap = await generateBadgeRequirementsMap()
    await saveBadgeRequirementsMap(badgeRequirementsMap)
    
    console.log('\n🎉 Badge CSV processing complete!')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  main()
}

export { generateBadgeRequirementsMap, main as processBadgeCSVs }