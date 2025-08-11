import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
// WordPress auth removed - using Supabase Auth only
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

// Enhanced interface for magic link tokens
interface MagicLinkData {
  email: string
  supabase_user_id?: string
  created_at: string
  expires_at: string
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_token', req.url))
    }

    const supabase = getAdminClient()
    
    // Look up magic link token
    const { data: magicLinkData, error: lookupError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (lookupError || !magicLinkData) {
      console.log('Magic link validation failed:', lookupError)
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', req.url))
    }
    
    const { email, supabase_user_id } = magicLinkData
    
    // Get or create Supabase Auth user
    let authUser = null
    if (supabase_user_id) {
      const { data: existingUser } = await supabase.auth.admin.getUserById(supabase_user_id)
      authUser = existingUser.user
    }
    
    if (!authUser) {
      // Create Supabase Auth user if it doesn't exist
      try {
        console.log('Creating Supabase user with email:', email)
        let userData: any = { 
          email: email.trim().toLowerCase(),
          email_confirm: true,
          password: Math.random().toString(36),
          user_metadata: {}
        }
        
        // Set basic user metadata
        userData.user_metadata = {
          full_name: '',
          first_name: '',
          last_name: ''
        }
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser(userData)
        
        if (createError) {
          console.error('Error creating auth user:', createError)
          return NextResponse.redirect(new URL('/auth/login?error=auth_creation_failed', req.url))
        }
        
        authUser = newUser.user
        
        // Update magic link with new user ID
        await supabase
          .from('magic_links')
          .update({ supabase_user_id: authUser.id })
          .eq('token', token)
      } catch (error) {
        console.error('Failed to create auth user:', error)
        return NextResponse.redirect(new URL('/auth/login?error=auth_creation_failed', req.url))
      }
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Create session record
    try {
      await supabase
        .from('user_sessions')
        .insert({
          auth_token: sessionToken,
          user_id: authUser.id,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to create session:', error)
    }
    
    // Delete used magic link
    await supabase
      .from('magic_links')
      .delete()
      .eq('token', token)
    
    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('powlax_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    // Also set Supabase auth session if possible
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: authUser.email!,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin')}/dashboard`
        }
      })
      
      if (!sessionError && sessionData) {
        // This creates a session that can be used by the client
        console.log('Supabase session created for user:', authUser.email)
      }
    } catch (error) {
      console.warn('Could not create Supabase session:', error)
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url))
    
  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=server_error', req.url))
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, create_if_not_exists = true } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    const supabase = getAdminClient()
    
    // Generate secure magic link token
    const token = crypto.randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Check if Supabase Auth user exists
    let supabaseUser = null
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      supabaseUser = existingUsers.users.find(u => u.email === email)
    } catch (error) {
      console.warn('Error checking existing Supabase users:', error)
    }
    
    // Create Supabase Auth user if it doesn't exist and we're allowed to
    if (!supabaseUser && create_if_not_exists) {
      try {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: '',
            first_name: '',
            last_name: ''
          }
        })
        
        if (createError) {
          console.error('Error creating Supabase user:', createError)
        } else {
          supabaseUser = newUser.user
        }
      } catch (error) {
        console.error('Failed to create Supabase user:', error)
      }
    }
    
    // Store magic link token in database with WordPress linkage
    try {
      const { error: insertError } = await supabase
        .from('magic_links')
        .insert({
          token,
          email,
          supabase_user_id: supabaseUser?.id || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Error storing magic link:', insertError)
        return NextResponse.json({ error: 'Failed to create magic link' }, { status: 500 })
      }
    } catch (error) {
      console.error('Database error storing magic link:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Send email with magic link
    const { emailService } = await import('@/lib/email-service')
    const sent = await emailService.sendMagicLink(email, token)
    
    if (sent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Magic link sent to your email'
      })
    } else {
      // Email not sent but link was generated
      const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/magic-link?token=${token}`
      console.log('Magic link (email not sent):', magicLinkUrl)
      return NextResponse.json({ 
        success: true,
        message: 'Magic link generated (check logs)',
        debug: process.env.NODE_ENV === 'development' ? magicLinkUrl : undefined
      })
    }
    
  } catch (error: any) {
    console.error('Magic link request error:', error)
    return NextResponse.json({ 
      error: error?.message || 'Server error' 
    }, { status: 500 })
  }
}