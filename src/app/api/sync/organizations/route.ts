import { NextRequest, NextResponse } from 'next/server'
import { wordpressTeamSync } from '@/lib/wordpress-team-sync'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
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

    // Run organization sync
    const result = await wordpressTeamSync.syncOrganizationsFromWordPress()

    return NextResponse.json({
      success: result.success,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
      syncLogId: result.syncLogId
    })

  } catch (error) {
    console.error('Organization sync error:', error)
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