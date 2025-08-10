/**
 * GamiPress Sync API Endpoint
 * Agent 4 - WordPress API and Sync Implementation
 * Contract: POWLAX-GAM-001
 * 
 * Provides API endpoints for triggering and monitoring GamiPress sync operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { GamiPressSyncService, type SyncStats } from '../../../../../scripts/sync-gamipress'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SyncRequest {
  user_ids?: number[]
  force_full_sync?: boolean
  dry_run?: boolean
}

interface SyncResponse {
  success: boolean
  stats?: SyncStats
  error?: string
  sync_id?: string
}

/**
 * POST /api/gamipress/sync
 * Triggers a GamiPress sync operation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json() as SyncRequest
    const { user_ids, force_full_sync = false, dry_run = false } = body

    // Validate request
    if (user_ids && (!Array.isArray(user_ids) || user_ids.some(id => typeof id !== 'number'))) {
      return NextResponse.json({
        success: false,
        error: 'user_ids must be an array of numbers'
      }, { status: 400 })
    }

    // Check for authentication (optional - add your auth logic here)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid authorization header'
      }, { status: 401 })
    }

    // Log sync start
    const syncId = crypto.randomUUID()
    await supabase
      .from('gamipress_sync_log')
      .insert({
        entity_type: 'sync_api_request',
        wordpress_id: 0,
        supabase_id: syncId,
        action_type: 'created',
        sync_data: {
          user_ids,
          force_full_sync,
          dry_run,
          request_ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      })

    console.log(`Starting GamiPress sync via API - ID: ${syncId}`)

    if (dry_run) {
      // For dry run, just return what would be synced
      return NextResponse.json({
        success: true,
        sync_id: syncId,
        stats: {
          users_processed: user_ids?.length || 0,
          points_synced: 0,
          badges_synced: 0,
          ranks_synced: 0,
          errors: 0,
          start_time: new Date(),
          end_time: new Date()
        },
        message: 'Dry run completed - no data was actually synced'
      })
    }

    // Initialize sync service
    const syncService = new GamiPressSyncService()

    // Perform sync
    const stats = await syncService.syncGamiPressData(user_ids)

    // Log sync completion
    await supabase
      .from('gamipress_sync_log')
      .insert({
        entity_type: 'sync_api_response',
        wordpress_id: 0,
        supabase_id: syncId,
        action_type: 'updated',
        sync_data: {
          ...stats,
          success: true
        }
      })

    return NextResponse.json({
      success: true,
      sync_id: syncId,
      stats
    })

  } catch (error) {
    console.error('GamiPress sync API error:', error)

    // Log error
    await supabase
      .from('gamipress_sync_log')
      .insert({
        entity_type: 'sync_api_error',
        wordpress_id: 0,
        supabase_id: crypto.randomUUID(),
        action_type: 'failed',
        sync_data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        },
        error_message: error instanceof Error ? error.message : String(error)
      })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

/**
 * GET /api/gamipress/sync
 * Gets sync status and recent sync logs
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const syncId = searchParams.get('sync_id')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (syncId) {
      // Get specific sync status
      const { data: syncLogs, error } = await supabase
        .from('gamipress_sync_log')
        .select('*')
        .eq('supabase_id', syncId)
        .order('synced_at', { ascending: false })

      if (error) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        sync_id: syncId,
        logs: syncLogs
      })
    }

    // Get recent sync operations
    const { data: recentSyncs, error } = await supabase
      .from('gamipress_sync_log')
      .select('*')
      .in('entity_type', ['sync_session', 'sync_api_request', 'sync_api_response'])
      .order('synced_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Get sync statistics (simple aggregation for now)
    const { data: syncStats, error: statsError } = await supabase
      .from('gamipress_sync_log')
      .select('entity_type, action_type, synced_at')
      .order('synced_at', { ascending: false })
      .limit(100)

    const aggregatedStats = syncStats ? {
      total_syncs: syncStats.length,
      successful_syncs: syncStats.filter(s => s.action_type === 'updated' || s.action_type === 'created').length,
      failed_syncs: syncStats.filter(s => s.action_type === 'failed').length,
      last_sync: syncStats[0]?.synced_at || null
    } : null

    return NextResponse.json({
      success: true,
      recent_syncs: recentSyncs,
      stats: aggregatedStats
    })

  } catch (error) {
    console.error('GamiPress sync status API error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/gamipress/sync
 * Cancels a running sync operation (if supported)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const syncId = searchParams.get('sync_id')

    if (!syncId) {
      return NextResponse.json({
        success: false,
        error: 'sync_id parameter is required'
      }, { status: 400 })
    }

    // Log cancellation request
    await supabase
      .from('gamipress_sync_log')
      .insert({
        entity_type: 'sync_cancellation',
        wordpress_id: 0,
        supabase_id: syncId,
        action_type: 'updated',
        sync_data: {
          cancelled_at: new Date().toISOString(),
          request_ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Sync cancellation requested',
      sync_id: syncId
    })

  } catch (error) {
    console.error('GamiPress sync cancel API error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}