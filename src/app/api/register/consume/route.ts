import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Helper to generate secure random IDs
function randomId() { 
  if (typeof window === 'undefined') {
    const { randomBytes } = require('crypto')
    return randomBytes(16).toString('hex')
  }
  return Math.random().toString(36).slice(2) 
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { token, email, fullName } = await req.json()
    if (!token || !email) return NextResponse.json({ error: 'Missing token/email' }, { status: 400 })

    // Look up link
    const { data: link } = await supabase
      .from('registration_links')
      .select('*')
      .eq('token', token)
      .maybeSingle()
    if (!link) return NextResponse.json({ error: 'Invalid link' }, { status: 400 })
    if (link.expires_at && new Date(link.expires_at) < new Date()) return NextResponse.json({ error: 'Link expired' }, { status: 400 })
    if (link.max_uses && link.used_count >= link.max_uses) return NextResponse.json({ error: 'Link exhausted' }, { status: 400 })

    // Register user with Supabase Auth integration (try RPC first)
    let userId: string | undefined
    let authUserId: string | undefined
    let magicLink: string | undefined
    
    try {
      const { data: registration, error: regError } = await supabase.rpc('register_user_with_auth', {
        p_email: email,
        p_full_name: fullName || null,
        p_role: link.default_role
      })

      if (!regError && registration) {
        const regData = Array.isArray(registration) ? registration[0] : registration
        userId = regData?.user_id
        authUserId = regData?.auth_user_id
        magicLink = regData?.magic_link
      }
    } catch (rpcError) {
      console.log('RPC not available yet, using fallback registration')
    }
    
    // Fallback to basic user creation if RPC fails
    if (!userId) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
      userId = existing?.id
      if (!userId) {
        const { data: ins } = await supabase
          .from('users')
          .insert({ email, full_name: fullName || null, created_at: new Date().toISOString() })
          .select('id')
          .single()
        userId = ins?.id
      }
    }
    
    if (!userId) return NextResponse.json({ error: 'User creation failed' }, { status: 500 })

    // Join team or club
    if (link.target_type === 'team') {
      const { data: tm } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', link.target_id)
        .eq('user_id', userId)
        .maybeSingle()
      if (tm?.id) {
        await supabase.from('team_members').update({ status: 'active', role: link.default_role }).eq('id', tm.id)
      } else {
        await supabase.from('team_members').insert({ team_id: link.target_id, user_id: userId, role: link.default_role, status: 'active' })
      }
    } else if (link.target_type === 'club') {
      // For clubs, we might have a club membership table later; for now no-op
    }

    // Increment usage
    await supabase.from('registration_links').update({ used_count: (link.used_count || 0) + 1 }).eq('id', link.id)

    // Generate login URL if we have a magic link
    let loginUrl = null
    if (magicLink) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`
      loginUrl = `${baseUrl}/auth/magic-link?token=${magicLink}`
    }

    return NextResponse.json({ 
      ok: true,
      user_id: userId,
      auth_user_id: authUserId,
      login_url: loginUrl,
      message: loginUrl 
        ? 'Registration successful. Check your email for login link.'
        : 'Registration successful.'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'register error' }, { status: 500 })
  }
}


