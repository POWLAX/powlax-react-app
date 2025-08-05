import { NextRequest, NextResponse } from 'next/server'
import { wordpressTeamSync } from '@/lib/wordpress-team-sync'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get sync status
    const syncHistory = await wordpressTeamSync.getSyncStatus(limit)

    // Get counts from database
    const [orgsResult, teamsResult, rolesResult] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('user_team_roles').select('id', { count: 'exact', head: true })
    ])

    return NextResponse.json({
      currentCounts: {
        organizations: orgsResult.count || 0,
        teams: teamsResult.count || 0,
        teamMemberships: rolesResult.count || 0
      },
      syncHistory: syncHistory
    })

  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}