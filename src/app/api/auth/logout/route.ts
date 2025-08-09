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
    
    if (sessionToken) {
      const supabase = getAdminClient()
      
      // Invalidate session in database
      try {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('auth_token', sessionToken)
      } catch (error) {
        console.error('Session cleanup error:', error)
      }
    }
    
    // Clear session cookie
    cookieStore.delete('powlax_session')
    
    // Also clear Supabase auth cookies if they exist
    const supabaseCookies = ['sb-access-token', 'sb-refresh-token']
    supabaseCookies.forEach(name => {
      if (cookieStore.get(name)) {
        cookieStore.delete(name)
      }
    })

    // Also try the proxy logout for WordPress compatibility
    try {
      const { token } = await request.json().catch(() => ({}))
      if (token) {
        await fetch(`${request.nextUrl.origin}/api/auth/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'logout',
            token
          })
        })
      }
    } catch {}
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
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