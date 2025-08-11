/**
 * WordPress Team/Organization Sync Service
 * Handles syncing teams and organizations from WordPress/LearnDash/BuddyBoss
 */

import { supabase } from '@/lib/supabase'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

interface WordPressTeam {
  ID: string
  Title: string
  Slug: string
  learndash_group_users?: string
  _groups?: string
  [key: string]: any // For dynamic learndash_group_users_* columns
}

interface WordPressUser {
  username: string
  user_id?: number
  role?: string
}

interface SyncResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  syncLogId?: string
}

class WordPressTeamSync {
  private supabase = supabase

  /**
   * Parse serialized PHP array from WordPress/LearnDash
   * These arrays are in the format: a:count:{i:index;i:value;...}
   */
  private parseSerializedArray(serialized: string): number[] {
    if (!serialized || serialized.trim() === '') return []
    
    try {
      // Remove quotes and clean the string
      const cleaned = serialized.replace(/^"|"$/g, '').replace(/\\"/g, '"')
      
      // Extract numbers from the serialized array
      const matches = cleaned.match(/i:\d+;i:(\d+);/g)
      if (!matches) return []
      
      return matches.map(match => {
        const num = match.match(/i:\d+;i:(\d+);/)
        return num ? parseInt(num[1]) : null
      }).filter(n => n !== null) as number[]
    } catch (error) {
      console.error('Error parsing serialized array:', error)
      return []
    }
  }

  /**
   * Extract all learndash user arrays from a team row
   */
  private extractLearnDashUsers(team: WordPressTeam): number[] {
    const allUserIds: number[] = []
    
    // Check all columns that start with learndash_group_users_
    Object.keys(team).forEach(key => {
      if (key.startsWith('learndash_group_users_')) {
        const users = this.parseSerializedArray(team[key])
        allUserIds.push(...users)
      }
    })
    
    // Remove duplicates
    return [...new Set(allUserIds)]
  }

  /**
   * Map WordPress role to our system role
   */
  private mapWordPressRole(wpRole: string = 'subscriber'): 'head_coach' | 'assistant_coach' | 'player' {
    // This is a simplified mapping - you may need to adjust based on your WordPress setup
    if (wpRole.includes('admin') || wpRole.includes('coach')) {
      return 'head_coach'
    } else if (wpRole.includes('assistant')) {
      return 'assistant_coach'
    } else {
      return 'player'
    }
  }

  /**
   * Sync organizations from WordPress (BuddyBoss groups)
   */
  async syncOrganizationsFromWordPress(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: []
    }

    try {
      // Start sync log
      const { data: syncLog, error: logError } = await this.supabase
        .from('wp_sync_log')
        .insert({
          sync_type: 'organizations',
          status: 'started'
        })
        .select()
        .single()

      if (logError) {
        console.error('Error creating sync log:', logError)
      }

      result.syncLogId = syncLog?.id

      // For now, we'll create a basic POWLAX organization structure
      // In production, this would read from WordPress API or CSV
      const organizations = [
        {
          wp_group_id: 1,
          name: 'POWLAX Lacrosse',
          slug: 'powlax-lacrosse',
          type: 'club_os',
          tier: 'foundation'
        }
      ]

      for (const org of organizations) {
        const { data: existing } = await this.supabase
          .from('clubs')
          .select('id')
          .eq('wp_group_id', org.wp_group_id)
          .single()

        if (existing) {
          // Update existing
          const { error } = await this.supabase
            .from('clubs')
            .update({
              ...org,
              wp_last_synced: new Date().toISOString()
            })
            .eq('wp_group_id', org.wp_group_id)

          if (error) {
            result.errors.push(`Failed to update org ${org.name}: ${error.message}`)
          } else {
            result.updated++
          }
        } else {
          // Create new
          const { error } = await this.supabase
            .from('clubs')
            .insert({
              ...org,
              wp_last_synced: new Date().toISOString()
            })

          if (error) {
            result.errors.push(`Failed to create org ${org.name}: ${error.message}`)
          } else {
            result.created++
          }
        }
      }

      // Update sync log
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: result.errors.length > 0 ? 'failed' : 'completed',
            records_processed: organizations.length,
            records_created: result.created,
            records_updated: result.updated,
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: 'failed',
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }
      
      return result
    }
  }

  /**
   * Sync teams from WordPress (LearnDash groups)
   */
  async syncTeamsFromWordPress(csvPath?: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: []
    }

    try {
      // Start sync log
      const { data: syncLog } = await this.supabase
        .from('wp_sync_log')
        .insert({
          sync_type: 'teams',
          status: 'started'
        })
        .select()
        .single()

      result.syncLogId = syncLog?.id

      // Get default organization
      const { data: defaultOrg } = await this.supabase
        .from('clubs')
        .select('id')
        .eq('type', 'club_os')
        .single()

      if (!defaultOrg) {
        throw new Error('No default organization found. Run organization sync first.')
      }

      let teams: WordPressTeam[] = []

      if (csvPath) {
        // Read from CSV file
        const fileContent = readFileSync(csvPath, 'utf-8')
        teams = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true
        })
      } else {
        // In production, this would call WordPress API
        // For now, return empty array
        teams = []
      }

      for (const team of teams) {
        // Skip if no valid ID
        if (!team.ID) continue

        const teamData = {
          wp_group_id: parseInt(team.ID),
          organization_id: defaultOrg.id,
          name: team.Title,
          slug: team.Slug,
          team_type: 'team_hq' as const,
          subscription_tier: 'structure' as const,
          wp_last_synced: new Date().toISOString()
        }

        const { data: existing } = await this.supabase
          .from('teams')
          .select('id')
          .eq('wp_group_id', teamData.wp_group_id)
          .single()

        if (existing) {
          // Update existing
          const { error } = await this.supabase
            .from('teams')
            .update(teamData)
            .eq('wp_group_id', teamData.wp_group_id)

          if (error) {
            result.errors.push(`Failed to update team ${team.Title}: ${error.message}`)
          } else {
            result.updated++
          }
        } else {
          // Create new
          const { error } = await this.supabase
            .from('teams')
            .insert(teamData)

          if (error) {
            result.errors.push(`Failed to create team ${team.Title}: ${error.message}`)
          } else {
            result.created++
          }
        }
      }

      // Update sync log
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: result.errors.length > 0 ? 'failed' : 'completed',
            records_processed: teams.length,
            records_created: result.created,
            records_updated: result.updated,
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: 'failed',
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }
      
      return result
    }
  }

  /**
   * Sync user memberships from WordPress teams
   */
  async syncUserMemberships(csvPath?: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      errors: []
    }

    try {
      // Start sync log
      const { data: syncLog } = await this.supabase
        .from('wp_sync_log')
        .insert({
          sync_type: 'users',
          status: 'started'
        })
        .select()
        .single()

      result.syncLogId = syncLog?.id

      let teams: WordPressTeam[] = []

      if (csvPath) {
        // Read from CSV file
        const fileContent = readFileSync(csvPath, 'utf-8')
        teams = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true
        })
      } else {
        // In production, this would call WordPress API
        teams = []
      }

      for (const team of teams) {
        if (!team.ID) continue

        const wpGroupId = parseInt(team.ID)
        
        // Get the team from our database
        const { data: dbTeam } = await this.supabase
          .from('teams')
          .select('id')
          .eq('wp_group_id', wpGroupId)
          .single()

        if (!dbTeam) {
          result.errors.push(`Team not found for WP ID ${wpGroupId}`)
          continue
        }

        // Extract all user IDs from LearnDash columns
        const userIds = this.extractLearnDashUsers(team)

        for (const wpUserId of userIds) {
          // Find user by WordPress ID
          const { data: user } = await this.supabase
            .from('users')
            .select('id')
            .eq('wordpress_id', wpUserId)
            .single()

          if (!user) {
            // User not synced yet - skip for now
            console.log(`User with WordPress ID ${wpUserId} not found in database`)
            continue
          }

          // Check if relationship exists
          const { data: existing } = await this.supabase
            .from('user_team_roles')
            .select('id')
            .eq('user_id', user.id)
            .eq('team_id', dbTeam.id)
            .single()

          if (!existing) {
            // Create new relationship
            const { error } = await this.supabase
              .from('user_team_roles')
              .insert({
                user_id: user.id,
                team_id: dbTeam.id,
                role: 'player', // Default role - adjust as needed
                wp_last_synced: new Date().toISOString()
              })

            if (error) {
              result.errors.push(`Failed to add user ${wpUserId} to team ${team.Title}: ${error.message}`)
            } else {
              result.created++
            }
          } else {
            // Update sync timestamp
            const { error } = await this.supabase
              .from('user_team_roles')
              .update({
                wp_last_synced: new Date().toISOString()
              })
              .eq('id', existing.id)

            if (!error) {
              result.updated++
            }
          }
        }
      }

      // Update sync log
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: result.errors.length > 0 ? 'failed' : 'completed',
            records_processed: teams.length,
            records_created: result.created,
            records_updated: result.updated,
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      if (result.syncLogId) {
        await this.supabase
          .from('wp_sync_log')
          .update({
            status: 'failed',
            error_message: result.errors.join('; '),
            completed_at: new Date().toISOString()
          })
          .eq('id', result.syncLogId)
      }
      
      return result
    }
  }

  /**
   * Run full sync of organizations, teams, and users
   */
  async runFullSync(teamsCsvPath?: string): Promise<{
    organizations: SyncResult
    teams: SyncResult
    users: SyncResult
  }> {
    // Start full sync log
    const { data: syncLog } = await this.supabase
      .from('wp_sync_log')
      .insert({
        sync_type: 'full',
        status: 'started'
      })
      .select()
      .single()

    const results = {
      organizations: await this.syncOrganizationsFromWordPress(),
      teams: await this.syncTeamsFromWordPress(teamsCsvPath),
      users: await this.syncUserMemberships(teamsCsvPath)
    }

    // Update full sync log
    if (syncLog) {
      const totalCreated = results.organizations.created + results.teams.created + results.users.created
      const totalUpdated = results.organizations.updated + results.teams.updated + results.users.updated
      const allErrors = [
        ...results.organizations.errors,
        ...results.teams.errors,
        ...results.users.errors
      ]

      await this.supabase
        .from('wp_sync_log')
        .update({
          status: allErrors.length > 0 ? 'failed' : 'completed',
          records_created: totalCreated,
          records_updated: totalUpdated,
          error_message: allErrors.join('; '),
          completed_at: new Date().toISOString(),
          metadata: {
            organizations: {
              created: results.organizations.created,
              updated: results.organizations.updated,
              errors: results.organizations.errors.length
            },
            teams: {
              created: results.teams.created,
              updated: results.teams.updated,
              errors: results.teams.errors.length
            },
            users: {
              created: results.users.created,
              updated: results.users.updated,
              errors: results.users.errors.length
            }
          }
        })
        .eq('id', syncLog.id)
    }

    return results
  }

  /**
   * Get sync status and history
   */
  async getSyncStatus(limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('wp_sync_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching sync status:', error)
      return []
    }

    return data || []
  }
}

export const wordpressTeamSync = new WordPressTeamSync()
export type { SyncResult, WordPressTeam }