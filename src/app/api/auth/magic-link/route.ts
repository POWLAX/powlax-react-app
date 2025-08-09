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
    const token = req.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', req.url))
    }

    const supabase = getAdminClient()
    
    // Validate magic link token
    let sessionData
    try {
      const { data, error } = await supabase.rpc('validate_magic_link', {
        p_token: token
      })
      
      if (error) throw error
      sessionData = Array.isArray(data) ? data[0] : data
    } catch (rpcError) {
      console.log('Magic link validation failed:', rpcError)
      // Fallback: Try to find user by token in a simpler way
      // This is for when the RPC function doesn't exist yet
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
    }
    
    if (!sessionData?.session_token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
    }
    
    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('powlax_session', sessionData.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
    
  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.redirect(new URL('/login?error=server_error', req.url))
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    const supabase = getAdminClient()
    
    // Generate magic link
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin')}/auth/magic-link`
      }
    })
    
    if (authError || !authData) {
      console.error('Magic link generation error:', authError)
      return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
    }
    
    // Send email with magic link
    const { emailService } = await import('@/lib/email-service')
    
    // Extract token from the magic link URL
    const url = new URL(authData.properties.action_link)
    const token = url.searchParams.get('token') || url.hash.split('token=')[1]?.split('&')[0]
    
    if (token) {
      const sent = await emailService.sendMagicLink(email, token)
      
      if (sent) {
        return NextResponse.json({ 
          success: true, 
          message: 'Magic link sent to your email' 
        })
      } else {
        // Email not sent but link was generated
        console.log('Magic link (email not sent):', authData.properties.action_link)
        return NextResponse.json({ 
          success: true,
          message: 'Magic link generated (check logs)',
          debug: process.env.NODE_ENV === 'development' ? authData.properties.action_link : undefined
        })
      }
    }
    
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    
  } catch (error: any) {
    console.error('Magic link request error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Server error' 
    }, { status: 500 })
  }
}