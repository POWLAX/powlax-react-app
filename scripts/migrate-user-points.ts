#!/usr/bin/env npx tsx

/**
 * POWLAX GamiPress User Points Migration Script
 * Agent 3: User Data Migration
 * Contract: POWLAX-GAM-001
 * 
 * Migrates WordPress user point balances to Supabase gamification system
 * Sources: Lax-IQ-Points-Export-2025-July-31-1900.csv
 * 
 * Tables populated:
 * - user_points_balance (user point balances by type)
 * - points_transactions (historical transaction log)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { parse } from 'csv-parse/sync'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface WordPressPointRecord {
  ID: string
  Title: string
  'Post Type': string
  Slug: string
  'Author ID': string
  'Author Username': string
  'Author Email': string
  'Author First Name': string
  'Author Last Name': string
  Order: string
  Status: string
}

interface UserPointWallet {
  user_id: string
  currency: string
  balance: number
}

interface PointLedgerEntry {
  user_id: string
  currency: string
  delta: number
  reason: string
  source: string
  source_id: string | null
}

class UserPointsMigrator {
  private csvPath: string
  private userLookup: Map<string, any> = new Map()
  
  constructor() {
    this.csvPath = path.join(process.cwd(), 'docs', 'Wordpress CSV\'s', 'Gamipress Gamification Exports', 'Lax-IQ-Points-Export-2025-July-31-1900.csv')
  }
  
  async migrate() {
    console.log('🎯 POWLAX User Points Migration Agent 3')
    console.log('=====================================')
    
    try {
      // Step 1: Load CSV data
      console.log('📥 Loading WordPress points data...')
      const pointsData = await this.loadPointsData()
      console.log(`   Found ${pointsData.length} point records`)
      
      // Step 2: Create user lookup (prepare for future user sync)
      console.log('👤 Building user lookup table...')
      await this.buildUserLookup(pointsData)
      console.log(`   Identified ${this.userLookup.size} unique WordPress users`)
      
      // Step 3: Transform points data to Supabase format
      console.log('🔄 Transforming points data...')
      const userWallets = await this.transformPointsData(pointsData)
      console.log(`   Created ${userWallets.length} user wallet records`)
      
      // Step 4: Insert points wallets
      console.log('💾 Inserting user point wallets...')
      await this.insertUserWallets(userWallets)
      
      // Step 5: Create ledger entries
      console.log('📊 Creating ledger entries...')
      const ledgerEntries = await this.createLedgerEntries(userWallets)
      await this.insertLedgerEntries(ledgerEntries)
      
      console.log('✅ User points migration completed successfully!')
      await this.logProgress('User points migration completed')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      await this.logProgress(`Migration failed: ${error}`)
      throw error
    }
  }
  
  private async loadPointsData(): Promise<WordPressPointRecord[]> {
    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`Points CSV file not found at: ${this.csvPath}`)
    }
    
    const csvContent = fs.readFileSync(this.csvPath, 'utf-8')
    
    // Handle potential BOM and parsing issues
    const cleanCsv = csvContent.replace(/^\uFEFF/, '')
    
    const records = parse(cleanCsv, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      quote: '"',
      escape: '"',
      relax_column_count: true,
      skip_records_with_error: true
    })
    
    return records.filter(record => record.Status === 'publish')
  }
  
  private async buildUserLookup(pointsData: WordPressPointRecord[]) {
    // Build lookup of WordPress users
    // Note: No user_profiles table found yet, so we prepare the structure
    pointsData.forEach(record => {
      if (record['Author ID'] && !this.userLookup.has(record['Author ID'])) {
        this.userLookup.set(record['Author ID'], {
          wordpress_id: record['Author ID'],
          username: record['Author Username'],
          email: record['Author Email'],
          first_name: record['Author First Name'],
          last_name: record['Author Last Name'],
          supabase_user_id: null // Will be populated when user sync happens
        })
      }
    })
  }
  
  private async transformPointsData(pointsData: WordPressPointRecord[]): Promise<UserPointWallet[]> {
    const userWallets: UserPointWallet[] = []
    
    // Group points by user and extract balance from title
    const userPointsMap = new Map<string, number>()
    
    // Create a mapping based on Order field which should indicate the point level
    // Order 1=0pts, Order 2=5pts, Order 3=10pts, etc.
    const pointValuesByOrder: { [key: number]: number } = {
      1: 0,    // 0 pts
      2: 5,    // 5 pts  
      3: 10,   // 10 pts
      4: 15,   // 15 pts
      5: 20,   // 20 pts
      6: 25,   // 25 pts
      7: 30,   // 30 pts
      8: 35,   // 35 pts
      9: 40,   // 40 pts
      10: 45,  // 45 pts
      11: 50,  // 50 pts
      12: 55,  // 55 pts
      13: 60,  // 60 pts
      14: 65,  // 65 pts
      15: 70,  // 70 pts
      16: 75,  // 75 pts
      17: 80,  // 80 pts
      18: 85,  // 85 pts
      19: 90,  // 90 pts
      20: 95,  // 95 pts
      21: 100, // 100 pts
      22: 150  // 150+ pts (estimate)
    }
    
    pointsData.forEach((record, index) => {
      const userId = record['Author ID']
      const orderNum = parseInt(record.Order) || 0
      const pointValue = pointValuesByOrder[orderNum] || 0
      
      if (index < 5) { // Log first 5 for debugging
        console.log(`   Debug [${index}]: User ${userId}, Order: ${orderNum}, Points: ${pointValue}`)
      }
      
      if (userId && pointValue >= 0) {
        // Take the highest point value for each user (in case of multiple records)
        const existingPoints = userPointsMap.get(userId) || 0
        if (pointValue > existingPoints) {
          userPointsMap.set(userId, pointValue)
          console.log(`     → Set user ${userId} to ${pointValue} points`)
        }
      }
    })
    
    // Convert to wallet records
    for (const [wordpressUserId, balance] of userPointsMap) {
      const userData = this.userLookup.get(wordpressUserId)
      
      if (userData) {
        // Generate a UUID for WordPress users (deterministic based on WordPress ID)
        if (!userData.supabase_user_id) {
          userData.supabase_user_id = this.generateWordPressUUID(wordpressUserId)
        }
        
        // Create wallet record for Lax IQ Points
        userWallets.push({
          user_id: userData.supabase_user_id,
          currency: 'lax_iq_points',
          balance: balance
        })
      }
    }
    
    return userWallets
  }
  
  private async insertUserWallets(wallets: UserPointWallet[]) {
    if (wallets.length === 0) {
      console.log('   No wallet records to insert')
      return
    }
    
    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('user_points_wallets')
        .upsert(batch, {
          onConflict: 'user_id,currency'
        })
      
      if (error) {
        console.error(`   Failed to insert batch ${Math.floor(i/batchSize) + 1}:`, error)
        throw error
      }
      
      console.log(`   Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(wallets.length/batchSize)} (${batch.length} records)`)
    }
  }
  
  private async createLedgerEntries(wallets: UserPointWallet[]): Promise<PointLedgerEntry[]> {
    const entries: PointLedgerEntry[] = []
    
    // Create initial balance entries (migration baseline)
    wallets.forEach(wallet => {
      entries.push({
        user_id: wallet.user_id,
        currency: wallet.currency,
        delta: wallet.balance,
        reason: `WordPress migration: Initial balance of ${wallet.balance} ${wallet.currency.replace('_', ' ')} points`,
        source: 'wordpress_gamipress',
        source_id: null
      })
    })
    
    return entries
  }
  
  private async insertLedgerEntries(entries: PointLedgerEntry[]) {
    if (entries.length === 0) {
      console.log('   No ledger entries to insert')
      return
    }
    
    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('user_points_ledger')
        .insert(batch)
      
      if (error) {
        console.error(`   Failed to insert ledger batch ${Math.floor(i/batchSize) + 1}:`, error)
        throw error
      }
      
      console.log(`   Inserted ledger batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(entries.length/batchSize)} (${batch.length} records)`)
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
  
  // Generate deterministic UUID for WordPress users
  private generateWordPressUUID(wordpressId: string): string {
    // Create a deterministic UUID based on WordPress ID
    // This ensures the same WordPress user always gets the same UUID
    const hash = crypto.createHash('sha1')
    hash.update(`wordpress_user_${wordpressId}`)
    const hexString = hash.digest('hex')
    
    // Format as UUID v4
    const uuid = [
      hexString.substring(0, 8),
      hexString.substring(8, 12),
      '4' + hexString.substring(13, 16), // version 4
      ((parseInt(hexString.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hexString.substring(17, 20), // variant bits
      hexString.substring(20, 32)
    ].join('-')
    
    return uuid
  }
  
  // Export user lookup for other migration scripts
  async exportUserLookup() {
    const lookupData = Array.from(this.userLookup.values())
    const outputPath = 'tmp/wordpress-user-lookup.json'
    
    // Ensure tmp directory exists
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('tmp', { recursive: true })
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(lookupData, null, 2))
    console.log(`📋 User lookup exported to ${outputPath}`)
    return lookupData
  }
}

// Main execution
async function main() {
  const migrator = new UserPointsMigrator()
  
  try {
    await migrator.migrate()
    await migrator.exportUserLookup()
    
    console.log('')
    console.log('🎉 User Points Migration Complete!')
    console.log('==================================')
    console.log('Next steps:')
    console.log('1. Run user badges migration: npx tsx scripts/migrate-user-badges.ts')
    console.log('2. Run user ranks migration: npx tsx scripts/migrate-user-ranks.ts')
    console.log('3. Sync with actual user profiles when available')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { UserPointsMigrator }