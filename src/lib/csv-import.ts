import { supabase } from './supabase'
import fs from 'fs'
import { parse } from 'csv-parse'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export interface DrillImportRow {
  title: string
  content: string
  drill_types: string
  drill_emphasis: string
  game_phase: string
  do_it_ages: string
  coach_it_ages: string
  own_it_ages: string
  vimeo_url?: string
  featured_image?: string
}

export interface StrategyImportRow {
  title: string
  content: string
  coaching_strategies: string
  game_phase: string
  do_it_ages: string
  coach_it_ages: string
  own_it_ages: string
  featured_image: string
  has_printable_playbook: boolean
  pdf_url?: string
  master_class_id?: number
}

export async function importDrills(csvPath: string) {
  const fileContent = await readFile(csvPath, 'utf-8')
  
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      from_line: 1,
      to_line: 276 // Team drills only
    }, async (err, records) => {
      if (err) {
        reject(err)
        return
      }

      // Transform CSV data to match our schema
      const drills = records.map((row: any) => ({
        title: row['Title'] || row['Post Title'],
        content: row['Content'] || row['Post Content'],
        drill_types: row['Drill Types'],
        drill_emphasis: row['Drill Emphasis'],
        game_phase: row['Game Phase'],
        do_it_ages: row['Players See & Do The Skills'],
        coach_it_ages: row['Coach the Skills'],
        own_it_ages: row['Players Own the Skills'],
        vimeo_url: row['Vimeo URL'],
        featured_image: row['Featured Image URL']
      }))

      // Insert into staging table
      const { data, error } = await supabase
        .from('staging_wp_drills')
        .insert(drills)
        .select()

      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

export async function importStrategies(csvPath: string) {
  const fileContent = await readFile(csvPath, 'utf-8')
  
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }, async (err, records) => {
      if (err) {
        reject(err)
        return
      }

      // Filter for Coaches Corner entries without Drill Types
      const strategies = records
        .filter((row: any) => 
          row['Master Class Categories']?.includes('Coaches Corner') && 
          !row['Drill Types']
        )
        .map((row: any) => ({
          title: row['Title'] || row['Post Title'],
          content: row['Content'] || row['Post Content'],
          coaching_strategies: row['Coaching Strategies'],
          game_phase: row['Game Phase'],
          do_it_ages: row['See & Do It Ages'],
          coach_it_ages: row['Coach It Ages'],
          own_it_ages: row['Own It Ages'],
          featured_image: row['Featured Image URL'],
          has_printable_playbook: row['Includes Printable Playbook'] === 'Yes',
          master_class_id: parseInt(row['ID']) || null
        }))

      // Insert into staging table
      const { data, error } = await supabase
        .from('staging_wp_strategies')
        .insert(strategies)
        .select()

      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

export async function createInitialMappings() {
  // Define keyword mappings for obvious connections
  const keywordMappings = [
    { drill: '3 Man Passing', strategy: 'Clearing', confidence: 0.9 },
    { drill: '+1 Ground Ball', strategy: 'Ground Ball', confidence: 0.85 },
    { drill: '10 Man Ride', strategy: 'Riding', confidence: 0.95 },
    { drill: 'Box Lacrosse Ground Ball', strategy: 'Ground Ball', confidence: 0.9 },
    { drill: 'Clear vs Ride', strategy: 'Clearing', confidence: 0.9 },
    { drill: 'Clear vs Ride', strategy: 'Riding', confidence: 0.9 },
  ]

  // Get drills and strategies from staging tables
  const { data: drills } = await supabase
    .from('staging_wp_drills')
    .select('id, title')

  const { data: strategies } = await supabase
    .from('staging_wp_strategies')
    .select('id, title')

  if (!drills || !strategies) return

  const mappings: any[] = []

  // Create mappings based on keywords
  for (const mapping of keywordMappings) {
    const drill = drills.find(d => d.title?.includes(mapping.drill))
    const strategy = strategies.find(s => s.title?.includes(mapping.strategy))

    if (drill && strategy) {
      mappings.push({
        drill_id: drill.id,
        strategy_id: strategy.id,
        confidence_score: mapping.confidence,
        mapping_source: 'keyword'
      })
    }
  }

  // Insert mappings
  if (mappings.length > 0) {
    const { error } = await supabase
      .from('staging_drill_strategy_map')
      .insert(mappings)

    if (error) {
      console.error('Error creating mappings:', error)
    } else {
      console.log(`Created ${mappings.length} drill-strategy mappings`)
    }
  }
}