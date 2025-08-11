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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('powlax_session')?.value
    const body = await request.json().catch(() => ({}))
    const tokenFromBody = body.token || sessionToken
    
    let userId = null
    
    if (tokenFromBody) {
      const supabase = getAdminClient()
      
      // Get user ID before deleting session
      try {
        const { data: sessionData } = await supabase
          .from('user_sessions')
          .select('user_id, wordpress_user_id')
          .eq('auth_token', tokenFromBody)
          .single()
        
        if (sessionData) {
          userId = sessionData.user_id
          
          // Sign out from Supabase Auth if we have a user ID
          if (userId) {
            try {
              await supabase.auth.admin.signOut(userId)
            } catch (authError) {
              console.warn('Supabase auth signout failed:', authError)
            }
          }
        }
      } catch (error) {
        console.warn('Could not fetch session data:', error)
      }
      
      // Delete session from database
      try {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('auth_token', tokenFromBody)
      } catch (error) {
        console.error('Session cleanup error:', error)
      }
    }
    
    // Clear all authentication cookies
    const cookiesToClear = [
      'powlax_session',
      'sb-access-token', 
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ]
    
    cookiesToClear.forEach(cookieName => {
      try {
        cookieStore.delete(cookieName)
      } catch (error) {
        console.warn(`Could not delete cookie ${cookieName}:`, error)
      }
    })
    
    // Also try to clear cookies with different path configurations
    cookiesToClear.forEach(cookieName => {
      try {
        cookieStore.set(cookieName, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        })
      } catch (error) {
        console.warn(`Could not clear cookie ${cookieName}:`, error)
      }
    })

    // Also try the proxy logout for WordPress compatibility
    try {
      if (tokenFromBody) {
        await fetch(`${request.nextUrl.origin}/api/auth/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'logout',
            token: tokenFromBody
          })
        })
      }
    } catch (proxyError) {
      console.warn('Proxy logout failed:', proxyError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      cleared_session: !!tokenFromBody
    })

  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Logout failed'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Support GET for direct navigation logout
  await POST(req)
  return NextResponse.redirect(new URL('/login', req.url))
}