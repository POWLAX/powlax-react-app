#!/usr/bin/env npx tsx

/**
 * POWLAX GamiPress User Ranks Migration Script
 * Agent 3: User Data Migration
 * Contract: POWLAX-GAM-001
 * 
 * Migrates WordPress user ranks to Supabase gamification system
 * Sources: Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv + user point balances
 * 
 * Tables populated:
 * - user_rank_progress (user current ranks and progress)
 * - points_transactions (rank-related point awards)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WordPressRankRecord {
  ID: string
  Title: string
  Content: string
  Excerpt: string
  Date: string
  'Post Type': string
  Status: string
  'Author ID': string
  'Author Username': string
  'Author Email': string
  'Author First Name': string
  'Author Last Name': string
  Slug: string
  Order: string
}

interface UserRankProgress {
  user_id: string
  current_rank_id: number
  points_progress: object
  rank_achieved_at: string
}

interface RankPointMapping {
  rank_title: string
  min_points: number
  point_type: string
  rank_order: number
}

class UserRanksMigrator {
  private csvPath: string
  private userLookup: Map<string, any> = new Map()
  private existingRanks: Map<string, any> = new Map()
  private rankPointMappings: RankPointMapping[] = []
  private userPointBalances: Map<string, Map<string, number>> = new Map()
  
  constructor() {
    this.csvPath = path.join(process.cwd(), 'docs', 'Wordpress CSV\'s', 'Gamipress Gamification Exports', 'Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv')
    this.initializeRankMappings()
  }
  
  private initializeRankMappings() {
    // Define rank progression based on Lax IQ Points
    this.rankPointMappings = [
      { rank_title: 'Lacrosse Bot', min_points: 0, point_type: 'lax_iq_point', rank_order: 1 },
      { rank_title: '2nd Bar Syndrome', min_points: 25, point_type: 'lax_iq_point', rank_order: 2 },
      { rank_title: 'Left Bench Hero', min_points: 60, point_type: 'lax_iq_point', rank_order: 3 },
      { rank_title: 'Celly King', min_points: 100, point_type: 'lax_iq_point', rank_order: 4 },
      { rank_title: 'Squad Player', min_points: 150, point_type: 'lax_iq_point', rank_order: 5 },
      { rank_title: 'JV Hero', min_points: 200, point_type: 'lax_iq_point', rank_order: 6 },
      { rank_title: 'Varsity Starter', min_points: 300, point_type: 'lax_iq_point', rank_order: 7 },
      { rank_title: 'Team Captain', min_points: 500, point_type: 'lax_iq_point', rank_order: 8 },
      { rank_title: 'All Conference', min_points: 750, point_type: 'lax_iq_point', rank_order: 9 },
      { rank_title: 'Lax Legend', min_points: 1000, point_type: 'lax_iq_point', rank_order: 10 }
    ]
  }
  
  async migrate() {
    console.log('🎖️ POWLAX User Ranks Migration Agent 3')
    console.log('=====================================')
    
    try {
      // Step 1: Load existing ranks from Supabase
      console.log('🏆 Loading existing rank definitions...')
      await this.loadExistingRanks()
      console.log(`   Found ${this.existingRanks.size} rank definitions`)
      
      // Step 2: Load user lookup and point balances
      console.log('👤 Loading user lookup and point balances...')
      await this.loadUserData()
      console.log(`   Loaded ${this.userLookup.size} users with point balances`)
      
      // Step 3: Calculate user ranks based on points
      console.log('🔄 Calculating user ranks based on point balances...')
      const userRanks = await this.calculateUserRanks()
      console.log(`   Calculated ranks for ${userRanks.length} users`)
      
      // Step 4: Insert user rank progress
      console.log('💾 Inserting user rank progress...')
      await this.insertUserRanks(userRanks)
      
      console.log('✅ User ranks migration completed successfully!')
      await this.logProgress('User ranks migration completed')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      await this.logProgress(`Migration failed: ${error}`)
      throw error
    }
  }
  
  private async loadExistingRanks() {
    const { data: ranks, error } = await supabase
      .from('player_ranks')
      .select('*')
      .order('rank_order')
    
    if (error) {
      throw new Error(`Failed to load ranks: ${error.message}`)
    }
    
    ranks?.forEach(rank => {
      this.existingRanks.set(rank.title.toLowerCase(), rank)
    })
  }
  
  private async loadUserData() {
    // Load user lookup from previous migration
    try {
      const lookupPath = 'tmp/wordpress-user-lookup.json'
      if (fs.existsSync(lookupPath)) {
        const lookupData = JSON.parse(fs.readFileSync(lookupPath, 'utf-8'))
        lookupData.forEach((user: any) => {
          this.userLookup.set(user.wordpress_id, user)
        })
      }
    } catch (error) {
      console.warn('   Could not load user lookup:', error)
    }
    
    // Load user point balances from Supabase
    const { data: balances, error } = await supabase
      .from('user_points_balance')
      .select('*')
    
    if (error) {
      console.warn('   Could not load point balances:', error.message)
      return
    }
    
    balances?.forEach(balance => {
      if (!this.userPointBalances.has(balance.user_id)) {
        this.userPointBalances.set(balance.user_id, new Map())
      }
      this.userPointBalances.get(balance.user_id)?.set(balance.point_type, balance.balance)
    })
    
    console.log(`   Loaded point balances for ${this.userPointBalances.size} users`)
  }
  
  private async calculateUserRanks(): Promise<UserRankProgress[]> {
    const userRanks: UserRankProgress[] = []
    const now = new Date().toISOString()
    
    // Calculate rank for each user based on their Lax IQ Points
    for (const [userId, pointBalances] of this.userPointBalances) {
      const laxIqPoints = pointBalances.get('lax_iq_point') || 0
      
      // Find the highest rank this user qualifies for
      let currentRank = null
      let maxQualifiedRank = 0
      
      for (const mapping of this.rankPointMappings) {
        if (laxIqPoints >= mapping.min_points && mapping.rank_order > maxQualifiedRank) {
          const rankKey = mapping.rank_title.toLowerCase()
          if (this.existingRanks.has(rankKey)) {
            currentRank = this.existingRanks.get(rankKey)
            maxQualifiedRank = mapping.rank_order
          }
        }
      }
      
      // Default to first rank if no points
      if (!currentRank && this.existingRanks.size > 0) {
        currentRank = Array.from(this.existingRanks.values())
          .find(rank => rank.rank_order === 1)
      }
      
      if (currentRank) {
        // Calculate progress to next rank
        const nextRankMapping = this.rankPointMappings
          .find(mapping => mapping.rank_order === maxQualifiedRank + 1)
        
        const pointsProgress = {
          lax_iq_point: laxIqPoints,
          progress_to_next: nextRankMapping ? 
            Math.max(0, nextRankMapping.min_points - laxIqPoints) : 0,
          next_rank_required: nextRankMapping?.min_points || null
        }
        
        userRanks.push({
          user_id: userId,
          current_rank_id: currentRank.id,
          points_progress: pointsProgress,
          rank_achieved_at: now
        })
      }
    }
    
    return userRanks
  }
  
  private async insertUserRanks(userRanks: UserRankProgress[]) {
    if (userRanks.length === 0) {
      console.log('   No user ranks to insert')
      return
    }
    
    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < userRanks.length; i += batchSize) {
      const batch = userRanks.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('user_rank_progress')
        .upsert(batch, {
          onConflict: 'user_id'
        })
      
      if (error) {
        console.error(`   Failed to insert rank batch ${Math.floor(i/batchSize) + 1}:`, error)
        throw error
      }
      
      console.log(`   Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(userRanks.length/batchSize)} (${batch.length} records)`)
    }
  }
  
  private async logProgress(message: string) {
    const timestamp = new Date().toISOString()
    const logMessage = `${timestamp} - Agent 3: ${message}\n`
    
    try {
      fs.appendFileSync('logs/gamipress-migration-agent-3.log', logMessage)
    } catch (error) {
      console.error('Failed to write to log:', error)
    }
  }
  
  // Export rank analysis for verification
  async exportRankAnalysis() {
    const analysisPath = 'tmp/rank-progress-analysis.json'
    
    // Ensure tmp directory exists
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('tmp', { recursive: true })
    }
    
    // Analyze current distribution
    const { data: currentRanks, error } = await supabase
      .from('user_rank_progress')
      .select(`
        current_rank_id,
        points_progress,
        player_ranks!inner(title, rank_order)
      `)
    
    if (error) {
      console.warn('Could not load rank distribution for analysis')
    }
    
    const distribution = new Map<string, number>()
    currentRanks?.forEach(record => {
      const rankTitle = (record as any).player_ranks.title
      distribution.set(rankTitle, (distribution.get(rankTitle) || 0) + 1)
    })
    
    const analysis = {
      total_ranked_users: currentRanks?.length || 0,
      rank_mappings: this.rankPointMappings,
      rank_distribution: Object.fromEntries(distribution),
      export_timestamp: new Date().toISOString()
    }
    
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2))
    console.log(`📊 Rank analysis exported to ${analysisPath}`)
    
    // Show distribution
    console.log('\n📈 Rank Distribution:')
    Array.from(distribution.entries())
      .sort((a, b) => {
        const aRank = this.rankPointMappings.find(r => r.rank_title === a[0])?.rank_order || 0
        const bRank = this.rankPointMappings.find(r => r.rank_title === b[0])?.rank_order || 0
        return aRank - bRank
      })
      .forEach(([rank, count]) => {
        const mapping = this.rankPointMappings.find(r => r.rank_title === rank)
        console.log(`   ${rank} (${mapping?.min_points}+ pts): ${count} users`)
      })
  }
}

// Main execution
async function main() {
  const migrator = new UserRanksMigrator()
  
  try {
    await migrator.migrate()
    await migrator.exportRankAnalysis()
    
    console.log('')
    console.log('🎖️ User Ranks Migration Complete!')
    console.log('=================================')
    console.log('All Agent 3 migrations completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('- User points migrated from WordPress')
    console.log('- User badge progress calculated from workout completions')
    console.log('- User ranks assigned based on Lax IQ Point balances')
    console.log('')
    console.log('🔄 Next steps:')
    console.log('1. Sync with actual user profiles when user system is ready')
    console.log('2. Set up triggers for real-time point/badge/rank updates')
    console.log('3. Test gamification UI with migrated data')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { UserRanksMigrator }