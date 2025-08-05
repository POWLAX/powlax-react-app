import { NextRequest, NextResponse } from 'next/server'
import { wordpressTeamSync } from '@/lib/wordpress-team-sync'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Unauthorized - No authorization header' },
        { status: 401 }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: userData } = await supabase
      .from('users')
      .select('roles')
      .eq('id', user.id)
      .single()

    if (!userData?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get CSV path from request body (optional)
    const body = await request.json().catch(() => ({}))
    const csvPath = body.csvPath

    // Run full sync
    const results = await wordpressTeamSync.runFullSync(csvPath)

    return NextResponse.json({
      success: Object.values(results).every(r => r.success),
      results: {
        organizations: {
          success: results.organizations.success,
          created: results.organizations.created,
          updated: results.organizations.updated,
          errors: results.organizations.errors
        },
        teams: {
          success: results.teams.success,
          created: results.teams.created,
          updated: results.teams.updated,
          errors: results.teams.errors
        },
        users: {
          success: results.users.success,
          created: results.users.created,
          updated: results.users.updated,
          errors: results.users.errors
        }
      }
    })

  } catch (error) {
    console.error('Full sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger sync.' },
    { status: 405 }
  )
}