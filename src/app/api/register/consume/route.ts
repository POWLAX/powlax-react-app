import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function randomId() { return Math.random().toString(36).slice(2) }

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

    // Ensure user exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
    let userId = existing?.id
    if (!userId) {
      const { data: ins } = await supabase
        .from('users')
        .insert({ email, full_name: fullName || null, created_at: new Date().toISOString() })
        .select('id')
        .single()
      userId = ins?.id
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

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'register error' }, { status: 500 })
  }
}


