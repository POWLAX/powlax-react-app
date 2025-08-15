#!/usr/bin/env npx tsx

/**
 * GamiPress WordPress to Supabase Sync Script
 * Agent 4 - WordPress API and Sync Implementation
 * Contract: POWLAX-GAM-001
 * 
 * Fetches latest WordPress GamiPress data and syncs to Supabase
 * Handles bi-directional sync for points, badges, and ranks
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

interface WordPressGamiPressData {
  users: Array<{
    id: number
    username: string
    email: string
    points: Record<string, number>
    badges: Array<{
      id: number
      earned_date: string
      badge_type: string
    }>
    ranks: Array<{
      id: number
      rank: string
      earned_date: string
    }>
  }>
  point_types: Array<{
    id: number
    slug: string
    name: string
    plural_name: string
    icon_url?: string
  }>
  badges: Array<{
    id: number
    slug: string
    title: string
    requirements: any
    icon_url?: string
  }>
  ranks: Array<{
    id: number
    slug: string
    title: string
    requirements: any
  }>
}

interface SyncStats {
  users_processed: number
  points_synced: number
  badges_synced: number
  ranks_synced: number
  errors: number
  start_time: Date
  end_time?: Date
}

class GamiPressSyncService {
  private supabase
  private wordpressApiUrl: string
  private syncStats: SyncStats

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    
    // WordPress API endpoint
    this.wordpressApiUrl = process.env.WORDPRESS_API_URL || 'https://powlax.com/wp-json'
    
    // Initialize sync stats
    this.syncStats = {
      users_processed: 0,
      points_synced: 0,
      badges_synced: 0,
      ranks_synced: 0,
      errors: 0,
      start_time: new Date()
    }
  }

  /**
   * Get the timestamp of the last successful sync
   */
  async getLastSyncTime(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('gamipress_sync_log')
        .select('synced_at')
        .eq('action_type', 'sync_completed')
        .order('synced_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error getting last sync time:', error)
        // Default to 24 hours ago if no previous sync found
        return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }

      return data?.[0]?.synced_at || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    } catch (error) {
      console.error('Failed to get last sync time:', error)
      return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  /**
   * Fetch WordPress GamiPress data since last sync
   */
  async fetchWordPressData(since: string, userIds?: number[]): Promise<WordPressGamiPressData> {
    try {
      const params = new URLSearchParams()
      params.set('since', since)
      if (userIds && userIds.length > 0) {
        params.set('user_ids', userIds.join(','))
      }

      const response = await fetch(`${this.wordpressApiUrl}/powlax/v1/gamipress-export?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if available
          ...(process.env.WORDPRESS_API_KEY && {
            'Authorization': `Bearer ${process.env.WORDPRESS_API_KEY}`
          })
        }
      })

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as WordPressGamiPressData
    } catch (error) {
      console.error('Error fetching WordPress data:', error)
      throw error
    }
  }

  /**
   * Process and sync point updates
   */
  async processPointUpdates(users: WordPressGamiPressData['users']): Promise<void> {
    console.log(`Processing point updates for ${users.length} users...`)

    for (const user of users) {
      try {
        // Find the corresponding Supabase user
        const { data: supabaseUser } = await this.supabase
          .from('users')
          .select('id')
          .eq('wordpress_id', user.id)
          .single()

        if (!supabaseUser) {
          console.warn(`No Supabase user found for WordPress ID: ${user.id}`)
          continue
        }

        // Process each point type for this user
        for (const [pointType, points] of Object.entries(user.points)) {
          if (points > 0) {
            // Get the point type currency mapping
            const { data: pointCurrency } = await this.supabase
              .from('powlax_points_currencies')
              .select('currency')
              .eq('slug', pointType)
              .single()

            if (pointCurrency) {
              // Update user points wallet
              await this.supabase
                .from('user_points_wallets')
                .upsert({
                  user_id: supabaseUser.id,
                  currency: pointCurrency.currency,
                  balance: points,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id,currency'
                })

              // Log the transaction
              await this.supabase
                .from('user_points_ledger')
                .insert({
                  user_id: supabaseUser.id,
                  currency: pointCurrency.currency,
                  amount: points,
                  transaction_type: 'sync_update',
                  description: `WordPress sync - ${pointType}`,
                  metadata: {
                    wordpress_sync: true,
                    wordpress_user_id: user.id,
                    sync_timestamp: new Date().toISOString()
                  }
                })

              this.syncStats.points_synced++
            }
          }
        }

        // Log sync for this user
        await this.logSyncOperation('user_points', user.id, supabaseUser.id, 'updated', {
          point_types: Object.keys(user.points).length,
          total_points: Object.values(user.points).reduce((a, b) => a + b, 0)
        })

        this.syncStats.users_processed++
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        this.syncStats.errors++
      }
    }
  }

  /**
   * Process and sync badge updates
   */
  async processBadgeUpdates(users: WordPressGamiPressData['users']): Promise<void> {
    console.log(`Processing badge updates for ${users.length} users...`)

    for (const user of users) {
      try {
        // Find the corresponding Supabase user
        const { data: supabaseUser } = await this.supabase
          .from('users')
          .select('id')
          .eq('wordpress_id', user.id)
          .single()

        if (!supabaseUser) {
          continue
        }

        // Process each badge for this user
        for (const badge of user.badges) {
          try {
            // Find the badge in our system
            const { data: supabaseBadge } = await this.supabase
              .from('badges')
              .select('id')
              .eq('wordpress_id', badge.id)
              .single()

            if (supabaseBadge) {
              // Insert or update user badge
              await this.supabase
                .from('user_badges')
                .upsert({
                  user_id: supabaseUser.id,
                  badge_id: supabaseBadge.id,
                  earned_at: badge.earned_date,
                  progress: 100,
                  metadata: {
                    wordpress_sync: true,
                    wordpress_badge_id: badge.id,
                    sync_timestamp: new Date().toISOString()
                  }
                }, {
                  onConflict: 'user_id,badge_id'
                })

              this.syncStats.badges_synced++
            }
          } catch (badgeError) {
            console.error(`Error processing badge ${badge.id} for user ${user.id}:`, badgeError)
          }
        }

        // Log sync for user badges
        if (user.badges.length > 0) {
          await this.logSyncOperation('user_badges', user.id, supabaseUser.id, 'updated', {
            badges_count: user.badges.length
          })
        }
      } catch (error) {
        console.error(`Error processing badges for user ${user.id}:`, error)
        this.syncStats.errors++
      }
    }
  }

  /**
   * Process and sync rank updates
   */
  async processRankUpdates(users: WordPressGamiPressData['users']): Promise<void> {
    console.log(`Processing rank updates for ${users.length} users...`)

    for (const user of users) {
      try {
        // Find the corresponding Supabase user
        const { data: supabaseUser } = await this.supabase
          .from('users')
          .select('id')
          .eq('wordpress_id', user.id)
          .single()

        if (!supabaseUser) {
          continue
        }

        // Process each rank for this user
        for (const rank of user.ranks) {
          try {
            // Find the rank in our system
            const { data: supabaseRank } = await this.supabase
              .from('player_ranks')
              .select('id')
              .ilike('title', `%${rank.rank}%`)
              .single()

            if (supabaseRank) {
              // Insert or update user rank
              await this.supabase
                .from('user_rank_progress')
                .upsert({
                  user_id: supabaseUser.id,
                  rank_id: supabaseRank.id,
                  achieved_at: rank.earned_date,
                  current_rank: true,
                  metadata: {
                    wordpress_sync: true,
                    wordpress_rank_id: rank.id,
                    sync_timestamp: new Date().toISOString()
                  }
                }, {
                  onConflict: 'user_id,rank_id'
                })

              // Set other ranks for this user as not current
              await this.supabase
                .from('user_rank_progress')
                .update({ current_rank: false })
                .eq('user_id', supabaseUser.id)
                .neq('rank_id', supabaseRank.id)

              this.syncStats.ranks_synced++
            }
          } catch (rankError) {
            console.error(`Error processing rank ${rank.id} for user ${user.id}:`, rankError)
          }
        }

        // Log sync for user ranks
        if (user.ranks.length > 0) {
          await this.logSyncOperation('user_ranks', user.id, supabaseUser.id, 'updated', {
            ranks_count: user.ranks.length
          })
        }
      } catch (error) {
        console.error(`Error processing ranks for user ${user.id}:`, error)
        this.syncStats.errors++
      }
    }
  }

  /**
   * Log sync operation to gamipress_sync_log
   */
  async logSyncOperation(
    entityType: string,
    wordpressId: number,
    supabaseId: string,
    actionType: 'created' | 'updated' | 'deleted' | 'failed',
    syncData: any,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('gamipress_sync_log')
        .insert({
          entity_type: entityType,
          wordpress_id: wordpressId,
          supabase_id: supabaseId,
          action_type: actionType,
          sync_data: syncData,
          error_message: errorMessage
        })
    } catch (error) {
      console.error('Error logging sync operation:', error)
    }
  }

  /**
   * Log sync completion with stats
   */
  async logSyncCompletion(): Promise<void> {
    this.syncStats.end_time = new Date()
    const duration = this.syncStats.end_time.getTime() - this.syncStats.start_time.getTime()

    await this.logSyncOperation('sync_session', 0, 'system', 'sync_completed' as any, {
      ...this.syncStats,
      duration_ms: duration,
      duration_readable: `${Math.round(duration / 1000)}s`
    })

    console.log('Sync completed successfully!')
    console.log('Stats:', {
      users_processed: this.syncStats.users_processed,
      points_synced: this.syncStats.points_synced,
      badges_synced: this.syncStats.badges_synced,
      ranks_synced: this.syncStats.ranks_synced,
      errors: this.syncStats.errors,
      duration: `${Math.round(duration / 1000)}s`
    })
  }

  /**
   * Main sync function
   */
  async syncGamiPressData(userIds?: number[]): Promise<SyncStats> {
    console.log('Starting GamiPress sync...', userIds ? `for users: ${userIds.join(', ')}` : 'for all users')

    try {
      // Get last sync time
      const lastSync = await this.getLastSyncTime()
      console.log(`Last sync: ${lastSync}`)

      // Fetch WordPress data
      const wpData = await this.fetchWordPressData(lastSync, userIds)
      console.log(`Fetched data for ${wpData.users.length} users`)

      // Process updates
      await this.processPointUpdates(wpData.users)
      await this.processBadgeUpdates(wpData.users)
      await this.processRankUpdates(wpData.users)

      // Log completion
      await this.logSyncCompletion()

      return this.syncStats
    } catch (error) {
      console.error('Sync failed:', error)
      
      // Log failure
      await this.logSyncOperation('sync_session', 0, 'system', 'failed', {
        error: error instanceof Error ? error.message : String(error),
        stats: this.syncStats
      }, error instanceof Error ? error.message : String(error))

      throw error
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2)
  let userIds: number[] | undefined

  // Parse user IDs if provided
  if (args.includes('--users')) {
    const userIndex = args.indexOf('--users')
    if (userIndex !== -1 && args[userIndex + 1]) {
      userIds = args[userIndex + 1].split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    }
  }

  try {
    const syncService = new GamiPressSyncService()
    await syncService.syncGamiPressData(userIds)
    console.log('✅ Sync completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

// Export for use in other modules
export { GamiPressSyncService, type SyncStats, type WordPressGamiPressData }

// Run if called directly
if (require.main === module) {
  main()
}