import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  })
}

// GET: Get current session status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('powlax_session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'No session token found' 
        },
        { status: 401 }
      )
    }
    
    const supabase = getAdminClient()
    
    // Validate current session
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        user_id,
        expires_at,
        last_activity
      `)
      .eq('auth_token', sessionToken)
      .single()
    
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'Invalid session' 
        },
        { status: 401 }
      )
    }
    
    // Check if session is expired
    if (new Date(sessionData.expires_at) < new Date()) {
      // Clean up expired session
      await supabase
        .from('user_sessions')
        .delete()
        .eq('auth_token', sessionToken)
        
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'Session expired' 
        },
        { status: 401 }
      )
    }
    
    // Get user data
    let user = null
    if (sessionData.user_id) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(sessionData.user_id)
        if (authUser.user) {
          user = {
            id: authUser.user.id,
            email: authUser.user.email,
            name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0],
            first_name: authUser.user.user_metadata?.first_name || '',
            last_name: authUser.user.user_metadata?.last_name || '',
            supabase_id: authUser.user.id,
            avatar: authUser.user.user_metadata?.avatar_url || null,
            roles: authUser.user.user_metadata?.roles || ['subscriber']
          }
        }
      } catch (userError) {
        console.warn('Could not fetch user data:', userError)
      }
    }
    
    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('auth_token', sessionToken)
    
    return NextResponse.json({
      authenticated: true,
      user,
      expiresAt: sessionData.expires_at,
      lastActivity: sessionData.last_activity
    })
    
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'Server error' 
      },
      { status: 500 }
    )
  }
}

// POST: Refresh session
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const currentToken = cookieStore.get('powlax_session')?.value
    
    if (!currentToken) {
      return NextResponse.json(
        { error: 'No session to refresh' },
        { status: 401 }
      )
    }
    
    const supabase = getAdminClient()
    
    // Get current session data
    const { data: currentSession, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('auth_token', currentToken)
      .single()
    
    if (sessionError || !currentSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    // Check if session can be refreshed (not expired more than 7 days ago)
    const expiredDate = new Date(currentSession.expires_at)
    const gracePeriod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    
    if (expiredDate < gracePeriod) {
      return NextResponse.json(
        { error: 'Session too old to refresh' },
        { status: 401 }
      )
    }
    
    // Generate new session token
    const newToken = crypto.randomBytes(32).toString('base64url')
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Update session with new token and expiration
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        auth_token: newToken,
        expires_at: newExpiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('auth_token', currentToken)
    
    if (updateError) {
      console.error('Session refresh error:', updateError)
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 500 }
      )
    }
    
    // Set new session cookie
    cookieStore.set('powlax_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Session refreshed',
      expiresAt: newExpiresAt.toISOString()
    })
    
  } catch (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// PUT: Extend session (bump expiration without changing token)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('powlax_session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }
    
    const supabase = getAdminClient()
    
    // Check if session exists and is valid
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('expires_at')
      .eq('auth_token', sessionToken)
      .single()
    
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    // Check if session is not expired by more than 24 hours
    const expiredDate = new Date(sessionData.expires_at)
    const maxExtendTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    
    if (expiredDate < maxExtendTime) {
      return NextResponse.json(
        { error: 'Session too old to extend' },
        { status: 401 }
      )
    }
    
    // Extend session by 30 days from now
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        expires_at: newExpiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('auth_token', sessionToken)
    
    if (updateError) {
      console.error('Session extend error:', updateError)
      return NextResponse.json(
        { error: 'Failed to extend session' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session extended',
      expiresAt: newExpiresAt.toISOString()
    })
    
  } catch (error) {
    console.error('Session extend error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete/invalidate current session (same as logout)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('powlax_session')?.value
    
    if (sessionToken) {
      const supabase = getAdminClient()
      
      // Delete session from database
      await supabase
        .from('user_sessions')
        .delete()
        .eq('auth_token', sessionToken)
    }
    
    // Clear session cookie
    cookieStore.delete('powlax_session')
    
    return NextResponse.json({
      success: true,
      message: 'Session deleted'
    })
    
  } catch (error) {
    console.error('Session delete error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}