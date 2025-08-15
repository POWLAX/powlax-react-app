#!/usr/bin/env npx tsx

/**
 * SUPABASE TABLE DISCOVERY SCRIPT
 * 
 * Downloads complete table list, schemas, and record counts from Supabase
 * Creates a comprehensive database map for the codebase indexing contract
 * 
 * Usage:
 *   npx tsx scripts/get-supabase-tables.ts
 *   npx tsx scripts/get-supabase-tables.ts --output-json  # Save as JSON
 *   npx tsx scripts/get-supabase-tables.ts --with-schemas # Include column details
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface TableInfo {
  table_name: string
  record_count: number
  schema: string
  columns?: ColumnInfo[]
  last_updated?: string
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
}

class SupabaseTableDiscovery {
  private tables: TableInfo[] = []
  private includeSchemas: boolean = false
  private outputJson: boolean = false

  constructor(includeSchemas = false, outputJson = false) {
    this.includeSchemas = includeSchemas
    this.outputJson = outputJson
  }

  async discoverTables(): Promise<void> {
    console.log('🔍 Discovering Supabase tables...\n')

    try {
      // Get all tables from information_schema
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_table_list')
        .select()

      if (tablesError) {
        // Fallback: Try direct query to information_schema
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .eq('table_schema', 'public')
          .order('table_name')

        if (fallbackError) {
          console.log('⚠️  RPC not available, using manual discovery...')
          await this.manualTableDiscovery()
          return
        }

        this.tables = await this.processTableList(fallbackData || [])
      } else {
        this.tables = await this.processTableList(tablesData || [])
      }

      if (this.includeSchemas) {
        await this.addSchemaInfo()
      }

      await this.displayResults()
      
      if (this.outputJson) {
        await this.saveToJson()
      }

    } catch (error) {
      console.error('❌ Error discovering tables:', error)
      console.log('\n🔄 Attempting manual discovery...')
      await this.manualTableDiscovery()
      
      await this.displayResults()
      
      if (this.outputJson) {
        await this.saveToJson()
      }
    }
  }

  private async processTableList(rawTables: any[]): Promise<TableInfo[]> {
    const tables: TableInfo[] = []

    for (const table of rawTables) {
      const tableName = table.table_name
      
      try {
        // Get record count
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`⚠️  ${tableName}: ${error.message}`)
          tables.push({
            table_name: tableName,
            record_count: -1,
            schema: 'public'
          })
        } else {
          tables.push({
            table_name: tableName,
            record_count: count || 0,
            schema: 'public'
          })
        }
      } catch (e) {
        console.log(`❌ ${tableName}: Failed to query`)
        tables.push({
          table_name: tableName,
          record_count: -1,
          schema: 'public'
        })
      }
    }

    return tables.sort((a, b) => a.table_name.localeCompare(b.table_name))
  }

  private async manualTableDiscovery(): Promise<void> {
    console.log('🔍 Manual table discovery from codebase patterns...\n')

    // Common POWLAX table patterns based on codebase analysis
    const knownTables = [
      // Skills Academy
      'skills_academy_drills',
      'skills_academy_series',
      'skills_academy_workouts',
      'skills_academy_user_progress',
      'wall_ball_drill_library',
      
      // Practice Planning
      'powlax_drills',
      'powlax_strategies',
      'practices',
      'practice_drills',
      'powlax_images',
      'user_drills',
      'user_strategies',
      
      // Team Management
      'clubs',
      'teams',
      'team_members',
      
      // User & Auth
      'users',
      'user_sessions',
      'user_auth_status',
      'magic_links',
      'registration_links',
      'registration_sessions',
      
      // Family Management
      'family_accounts',
      'family_members',
      'parent_child_relationships',
      
      // Gamification
      'powlax_points_currencies',
      'user_points_balance_powlax',
      'powlax_badges',
      'user_badges',
      'powlax_player_ranks',
      'user_rank_progress',
      
      // Team Playbooks
      'team_playbooks',
      'playbook_drills',
      'playbook_strategies'
    ]

    for (const tableName of knownTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (!error) {
          this.tables.push({
            table_name: tableName,
            record_count: count || 0,
            schema: 'public'
          })
          console.log(`✅ ${tableName}: ${count} records`)
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }
  }

  private async addSchemaInfo(): Promise<void> {
    console.log('\n📋 Adding schema information...\n')

    for (const table of this.tables) {
      try {
        // Get column information
        const { data: columns, error } = await supabase
          .rpc('get_table_columns', { table_name: table.table_name })

        if (!error && columns) {
          table.columns = columns
        }
      } catch (e) {
        console.log(`⚠️  Could not get schema for ${table.table_name}`)
      }
    }
  }

  private async displayResults(): Promise<void> {
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUPABASE DATABASE DISCOVERY RESULTS')
    console.log('='.repeat(60))
    console.log(`\n🎯 Total Tables Found: ${this.tables.length}`)
    console.log(`📅 Discovery Date: ${new Date().toISOString()}\n`)

    // Group by category
    const categories = {
      'Skills Academy': this.tables.filter(t => t.table_name.includes('skills_academy') || t.table_name.includes('wall_ball')),
      'Practice Planning': this.tables.filter(t => t.table_name.includes('powlax_drills') || t.table_name.includes('powlax_strategies') || t.table_name.includes('practice') || t.table_name.includes('user_drill') || t.table_name.includes('user_strat')),
      'Team Management': this.tables.filter(t => ['clubs', 'teams', 'team_members', 'team_playbooks'].includes(t.table_name)),
      'User & Auth': this.tables.filter(t => t.table_name.includes('user') && !t.table_name.includes('drill') && !t.table_name.includes('strat') || t.table_name.includes('magic_link') || t.table_name.includes('registration')),
      'Gamification': this.tables.filter(t => t.table_name.includes('points') || t.table_name.includes('badge') || t.table_name.includes('rank')),
      'Other': this.tables.filter(t => !['Skills Academy', 'Practice Planning', 'Team Management', 'User & Auth', 'Gamification'].some(cat => 
        this.getCategoryTables(cat).some(catTable => catTable.table_name === t.table_name)
      ))
    }

    Object.entries(categories).forEach(([category, tables]) => {
      if (tables.length > 0) {
        console.log(`\n📁 ${category.toUpperCase()}:`)
        console.log('-'.repeat(40))
        tables.forEach(table => {
          const count = table.record_count >= 0 ? `${table.record_count} records` : 'Access denied'
          console.log(`  ✅ ${table.table_name.padEnd(35)} ${count}`)
        })
      }
    })

    console.log('\n' + '='.repeat(60))
  }

  private getCategoryTables(category: string): TableInfo[] {
    switch (category) {
      case 'Skills Academy':
        return this.tables.filter(t => t.table_name.includes('skills_academy') || t.table_name.includes('wall_ball'))
      case 'Practice Planning':
        return this.tables.filter(t => t.table_name.includes('powlax_drills') || t.table_name.includes('powlax_strategies') || t.table_name.includes('practice') || t.table_name.includes('user_drill') || t.table_name.includes('user_strat'))
      case 'Team Management':
        return this.tables.filter(t => ['clubs', 'teams', 'team_members', 'team_playbooks'].includes(t.table_name))
      case 'User & Auth':
        return this.tables.filter(t => t.table_name.includes('user') && !t.table_name.includes('drill') && !t.table_name.includes('strat') || t.table_name.includes('magic_link') || t.table_name.includes('registration'))
      case 'Gamification':
        return this.tables.filter(t => t.table_name.includes('points') || t.table_name.includes('badge') || t.table_name.includes('rank'))
      default:
        return []
    }
  }

  private async saveToJson(): Promise<void> {
    const outputPath = path.join(process.cwd(), 'docs/codebase-index/supabase-tables-discovery.json')
    
    const output = {
      discovery_date: new Date().toISOString(),
      total_tables: this.tables.length,
      tables: this.tables,
      summary: {
        skills_academy: this.tables.filter(t => t.table_name.includes('skills_academy')).length,
        practice_planning: this.tables.filter(t => t.table_name.includes('powlax_') || t.table_name.includes('practice')).length,
        team_management: this.tables.filter(t => ['clubs', 'teams', 'team_members'].includes(t.table_name)).length,
        user_auth: this.tables.filter(t => t.table_name.includes('user') || t.table_name.includes('magic_link')).length,
        gamification: this.tables.filter(t => t.table_name.includes('points') || t.table_name.includes('badge')).length
      }
    }

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2))
    console.log(`\n💾 Results saved to: ${outputPath}`)
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const includeSchemas = args.includes('--with-schemas')
  const outputJson = args.includes('--output-json')

  console.log('🚀 POWLAX Supabase Table Discovery\n')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('   Please ensure .env.local contains:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const discovery = new SupabaseTableDiscovery(includeSchemas, outputJson)
  await discovery.discoverTables()

  console.log('\n🎯 Next Steps:')
  console.log('   1. Review the table list above')
  console.log('   2. Run the codebase indexing contract')
  console.log('   3. Use this data to validate database references')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { SupabaseTableDiscovery }
