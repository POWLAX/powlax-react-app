import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('powlax_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ 
        authenticated: false,
        reason: 'no_session_token' 
      })
    }

    const supabase = getAdminClient()
    
    // Check if session exists and is valid
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('auth_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return NextResponse.json({ 
        authenticated: false,
        reason: 'invalid_session' 
      })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name, role, roles')
      .eq('id', session.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ 
        authenticated: false,
        reason: 'user_not_found' 
      })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        display_name: userData.display_name,
        role: userData.role,
        roles: userData.roles
      },
      session: {
        expires_at: session.expires_at
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false,
      reason: 'server_error' 
    }, { status: 500 })
  }
}