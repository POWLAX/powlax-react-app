#!/usr/bin/env npx tsx

/**
 * POWLAX GamiPress User Badges Migration Script
 * Agent 3: User Data Migration
 * Contract: POWLAX-GAM-001
 * 
 * Migrates WordPress user badge earnings to Supabase gamification system
 * Sources: Completed-Workouts-Export-2025-July-31-1849.csv
 * 
 * Tables populated:
 * - user_badge_progress (user badge earnings and progress)
 * - points_transactions (badge-related point awards)
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

interface WordPressWorkoutRecord {
  ID: string
  Title: string
  Content: string
  Date: string
  'Post Type': string
  Status: string
  'Author ID': string
  'Author Username': string
  'Author Email': string
  'Author First Name': string
  'Author Last Name': string
  Slug: string
}

interface UserBadgeProgress {
  user_id: string
  badge_id: number
  progress: number
  earned_count: number
  first_earned_at: string
  last_earned_at: string
}

interface BadgeMapping {
  workout_pattern: string
  badge_category: string
  badge_title_pattern: string
  progress_increment: number
}

class UserBadgesMigrator {
  private csvPath: string
  private userLookup: Map<string, any> = new Map()
  private badgeMapping: BadgeMapping[] = []
  private existingBadges: Map<string, any> = new Map()
  
  constructor() {
    this.csvPath = path.join(process.cwd(), 'docs', 'Wordpress CSV\'s', 'Gamipress Gamification Exports', 'Completed-Workouts-Export-2025-July-31-1849.csv')
    this.initializeBadgeMapping()
  }
  
  private initializeBadgeMapping() {
    // Define how WordPress workouts map to badge categories
    this.badgeMapping = [
      {
        workout_pattern: '5.*drill.*workout',
        badge_category: 'completed-workouts',
        badge_title_pattern: '.*5.*drill.*workout.*',
        progress_increment: 1
      },
      {
        workout_pattern: '10.*drill.*workout',
        badge_category: 'completed-workouts', 
        badge_title_pattern: '.*10.*drill.*workout.*',
        progress_increment: 1
      },
      {
        workout_pattern: '15.*drill.*workout',
        badge_category: 'completed-workouts',
        badge_title_pattern: '.*15.*drill.*workout.*',
        progress_increment: 1
      },
      {
        workout_pattern: 'wall.*ball',
        badge_category: 'wall-ball-badges',
        badge_title_pattern: '.*wall.*ball.*',
        progress_increment: 1
      },
      {
        workout_pattern: 'attack',
        badge_category: 'attack-badges',
        badge_title_pattern: '.*attack.*',
        progress_increment: 1
      },
      {
        workout_pattern: 'defense',
        badge_category: 'defense-badges',
        badge_title_pattern: '.*defense.*',
        progress_increment: 1
      },
      {
        workout_pattern: 'midfield',
        badge_category: 'midfield-badges',
        badge_title_pattern: '.*midfield.*',
        progress_increment: 1
      }
    ]
  }
  
  async migrate() {
    console.log('🏆 POWLAX User Badges Migration Agent 3')
    console.log('======================================')
    
    try {
      // Step 1: Load WordPress workout completion data
      console.log('📥 Loading WordPress workout completions...')
      const workoutData = await this.loadWorkoutData()
      console.log(`   Found ${workoutData.length} workout completion records`)
      
      // Step 2: Load existing badges from Supabase
      console.log('🏅 Loading existing badge definitions...')
      await this.loadExistingBadges()
      console.log(`   Found ${this.existingBadges.size} badge definitions`)
      
      // Step 3: Load user lookup
      console.log('👤 Loading user lookup data...')
      await this.loadUserLookup()
      console.log(`   Loaded ${this.userLookup.size} user mappings`)
      
      // Step 4: Analyze workout completions for badge progress
      console.log('🔄 Analyzing workout completions for badge progress...')
      const badgeProgress = await this.analyzeBadgeProgress(workoutData)
      console.log(`   Generated ${badgeProgress.length} badge progress records`)
      
      // Step 5: Insert badge progress
      console.log('💾 Inserting user badge progress...')
      await this.insertBadgeProgress(badgeProgress)
      
      console.log('✅ User badges migration completed successfully!')
      await this.logProgress('User badges migration completed')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      await this.logProgress(`Migration failed: ${error}`)
      throw error
    }
  }
  
  private async loadWorkoutData(): Promise<WordPressWorkoutRecord[]> {
    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`Workout completions CSV file not found at: ${this.csvPath}`)
    }
    
    const csvContent = fs.readFileSync(this.csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      quote: '"'
    })
    
    return records.filter(record => record.Status === 'draft' || record.Status === 'publish')
  }
  
  private async loadExistingBadges() {
    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
    
    if (error) {
      throw new Error(`Failed to load badges: ${error.message}`)
    }
    
    badges?.forEach(badge => {
      this.existingBadges.set(badge.id.toString(), badge)
    })
  }
  
  private async loadUserLookup() {
    try {
      // Try to load from previous user points migration
      const lookupPath = 'tmp/wordpress-user-lookup.json'
      if (fs.existsSync(lookupPath)) {
        const lookupData = JSON.parse(fs.readFileSync(lookupPath, 'utf-8'))
        lookupData.forEach((user: any) => {
          this.userLookup.set(user.wordpress_id, user)
        })
        return
      }
    } catch (error) {
      console.warn('   Could not load existing user lookup, creating new one')
    }
    
    // If no existing lookup, we'll build it from workout data
    console.log('   No existing user lookup found, will build from workout data')
  }
  
  private async analyzeBadgeProgress(workoutData: WordPressWorkoutRecord[]): Promise<UserBadgeProgress[]> {
    const badgeProgress: UserBadgeProgress[] = []
    const userBadgeTracking = new Map<string, Map<number, any>>()
    
    // Group workouts by user and analyze patterns
    workoutData.forEach(workout => {
      const userId = workout['Author ID']
      const workoutTitle = workout.Title.toLowerCase()
      const workoutDate = workout.Date
      
      // Build user lookup if not exists
      if (!this.userLookup.has(userId)) {
        this.userLookup.set(userId, {
          wordpress_id: userId,
          username: workout['Author Username'],
          email: workout['Author Email'],
          first_name: workout['Author First Name'],
          last_name: workout['Author Last Name'],
          supabase_user_id: null
        })
      }
      
      // Find matching badge patterns
      this.badgeMapping.forEach(mapping => {
        const pattern = new RegExp(mapping.workout_pattern, 'i')
        if (pattern.test(workoutTitle)) {
          // Find matching badges in the database
          const matchingBadges = Array.from(this.existingBadges.values())
            .filter(badge => {
              const titlePattern = new RegExp(mapping.badge_title_pattern, 'i')
              return badge.category === mapping.badge_category && 
                     titlePattern.test(badge.title)
            })
          
          matchingBadges.forEach(badge => {
            const userKey = userId
            const badgeId = badge.id
            
            if (!userBadgeTracking.has(userKey)) {
              userBadgeTracking.set(userKey, new Map())
            }
            
            const userBadges = userBadgeTracking.get(userKey)!
            
            if (!userBadges.has(badgeId)) {
              userBadges.set(badgeId, {
                user_id: this.userLookup.get(userId)?.supabase_user_id || `wp_${userId}`,
                badge_id: badgeId,
                progress: 0,
                earned_count: 0,
                first_earned_at: workoutDate,
                last_earned_at: workoutDate
              })
            }
            
            const badgeProgress = userBadges.get(badgeId)
            badgeProgress.progress += mapping.progress_increment
            badgeProgress.earned_count += 1
            badgeProgress.last_earned_at = workoutDate
          })
        }
      })
    })
    
    // Convert tracking map to array
    userBadgeTracking.forEach(userBadges => {
      userBadges.forEach(progress => {
        badgeProgress.push(progress)
      })
    })
    
    return badgeProgress
  }
  
  private async insertBadgeProgress(progressRecords: UserBadgeProgress[]) {
    if (progressRecords.length === 0) {
      console.log('   No badge progress records to insert')
      return
    }
    
    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < progressRecords.length; i += batchSize) {
      const batch = progressRecords.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('user_badge_progress')
        .upsert(batch, {
          onConflict: 'user_id,badge_id'
        })
      
      if (error) {
        console.error(`   Failed to insert badge progress batch ${Math.floor(i/batchSize) + 1}:`, error)
        throw error
      }
      
      console.log(`   Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(progressRecords.length/batchSize)} (${batch.length} records)`)
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
  
  // Export badge analysis for verification
  async exportBadgeAnalysis() {
    const analysisPath = 'tmp/badge-progress-analysis.json'
    
    // Ensure tmp directory exists
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('tmp', { recursive: true })
    }
    
    const analysis = {
      total_badges: this.existingBadges.size,
      badge_mappings: this.badgeMapping,
      user_count: this.userLookup.size,
      export_timestamp: new Date().toISOString()
    }
    
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2))
    console.log(`📊 Badge analysis exported to ${analysisPath}`)
  }
}

// Main execution
async function main() {
  const migrator = new UserBadgesMigrator()
  
  try {
    await migrator.migrate()
    await migrator.exportBadgeAnalysis()
    
    console.log('')
    console.log('🏆 User Badges Migration Complete!')
    console.log('==================================')
    console.log('Next step: Run user ranks migration: npx tsx scripts/migrate-user-ranks.ts')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { UserBadgesMigrator }