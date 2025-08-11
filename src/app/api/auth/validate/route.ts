import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const tokenFromBody = body.token
    
    // Get token from body, cookie, or Authorization header
    const cookieStore = cookies()
    const sessionToken = tokenFromBody || 
                        cookieStore.get('powlax_session')?.value ||
                        request.headers.get('authorization')?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 401 }
      )
    }

    const supabase = getAdminClient()
    
    // Validate session token in database
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        user_id,
        expires_at
      `)
      .eq('auth_token', sessionToken)
      .single()
    
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session', valid: false },
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
        { error: 'Session expired', valid: false },
        { status: 401 }
      )
    }
    
    // Get user data from Supabase Auth
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
    
    // If we don't have Supabase user data, try to get from our users table
    if (!user && sessionData.user_id) {
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.user_id)
          .single()
        
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.full_name || dbUser.username,
            first_name: dbUser.first_name || '',
            last_name: dbUser.last_name || '',
            supabase_id: dbUser.id,
            avatar: dbUser.avatar_url || null,
            roles: dbUser.roles || ['subscriber']
          }
        }
      } catch (dbError) {
        console.warn('Could not fetch user from database:', dbError)
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User data not found', valid: false },
        { status: 401 }
      )
    }
    
    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('auth_token', sessionToken)
    
    return NextResponse.json({
      valid: true,
      user,
      expiresAt: sessionData.expires_at,
      source: 'supabase_auth'
    })

  } catch (error) {
    console.error('Token validation error:', error)
    
    return NextResponse.json(
      { error: 'Token validation failed', valid: false },
      { status: 500 }
    )
  }
}