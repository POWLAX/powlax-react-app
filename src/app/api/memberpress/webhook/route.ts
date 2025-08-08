import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function randomToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

async function ensureUser(supabase: ReturnType<typeof createClient>, email?: string, wordpressId?: number, fullName?: string) {
  if (!email && !wordpressId) return null
  if (wordpressId) {
    const { data: byWp } = await supabase.from('users').select('id').eq('wordpress_id', wordpressId).maybeSingle()
    if (byWp?.id) return byWp.id
  }
  if (email) {
    const { data: byEmail } = await supabase.from('users').select('id, wordpress_id').eq('email', email).maybeSingle()
    if (byEmail?.id) {
      if (wordpressId && !byEmail.wordpress_id) {
        await supabase.from('users').update({ wordpress_id: wordpressId }).eq('id', byEmail.id)
      }
      return byEmail.id
    }
    const { data: ins } = await supabase
      .from('users')
      .insert({ email, wordpress_id: wordpressId || null, full_name: fullName || null, created_at: new Date().toISOString() })
      .select('id')
      .single()
    return ins?.id || null
  }
  return null
}

async function createTeamWithLinks(supabase: ReturnType<typeof createClient>, clubId: string | null, teamName: string, buyerUserId: string | null) {
  const { data: team } = await supabase
    .from('team_teams')
    .insert({ club_id: clubId, name: teamName })
    .select('id')
    .single()
  const teamId = team!.id

  // Create player and parent links
  const links = [
    { default_role: 'player', max_uses: 25 },
    { default_role: 'parent', max_uses: 75 },
  ]
  for (const l of links) {
    await supabase.from('registration_links').insert({
      token: randomToken(),
      target_type: 'team',
      target_id: teamId,
      default_role: l.default_role,
      max_uses: l.max_uses,
      created_by: buyerUserId,
    })
  }
  return teamId
}

async function createClubWithTeamsAndLinks(supabase: ReturnType<typeof createClient>, clubName: string, buyerUserId: string | null) {
  const { data: club } = await supabase
    .from('club_organizations')
    .insert({ name: clubName })
    .select('id')
    .single()
  const clubId = club!.id
  // Create 3 teams under club
  const teamNames = ['Team A', 'Team B', 'Team C']
  for (const name of teamNames) {
    await createTeamWithLinks(supabase, clubId, name, buyerUserId)
  }
  return clubId
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient()
    const payload = await req.json().catch(() => ({}))

    // Log raw event for troubleshooting
    try {
      const headersObj: Record<string, string> = {}
      req.headers.forEach((v, k) => (headersObj[k] = v))
      await supabase.from('webhook_events').insert({ source: 'memberpress', headers: headersObj, payload })
    } catch {}

    // Basic payload expectations from MemberPress
    const event = payload?.event || payload?.type || ''
    const membershipId = Number(payload?.membership_id || payload?.product_id || 0)
    const wpUserId = Number(payload?.user_id || payload?.wordpress_user_id || 0)
    const email: string | undefined = payload?.email || payload?.user_email
    const fullName: string | undefined = payload?.full_name || payload?.user_name

    if (!event || !membershipId) {
      return NextResponse.json({ ok: true, message: 'Ignored: missing event/membershipId' })
    }

    // Lookup mapping
    const { data: product } = await supabase
      .from('membership_products')
      .select('*')
      .eq('wp_membership_id', membershipId)
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ ok: true, message: 'No mapping for membershipId' })
    }

    // Ensure buyer exists in users
    const buyerUserId = await ensureUser(supabase, email, wpUserId, fullName)

    if (event.includes('subscription') && (event.includes('created') || event.includes('upgraded') || event.includes('activated'))) {
      // Issue entitlement row
      await supabase.from('membership_entitlements').insert({
        user_id: buyerUserId,
        entitlement_key: product.entitlement_key,
        status: 'active',
        source: 'memberpress',
        metadata: { membershipId },
      })

      // Provision resources and links
      if (product.create_behavior === 'create_team') {
        await createTeamWithLinks(supabase, null, `${product.entitlement_key} – ${email || 'team'}`, buyerUserId)
      } else if (product.create_behavior === 'create_club') {
        await createClubWithTeamsAndLinks(supabase, `${product.entitlement_key} – ${email || 'club'}`, buyerUserId)
      }
    }

    if (event.includes('subscription') && (event.includes('canceled') || event.includes('expired'))) {
      // Update entitlement
      await supabase
        .from('membership_entitlements')
        .update({ status: event.includes('canceled') ? 'canceled' : 'expired', updated_at: new Date().toISOString() })
        .eq('user_id', buyerUserId)
        .eq('entitlement_key', product.entitlement_key)

      // Soft unlink any team memberships for the buyer if team-scoped
      if (product.scope === 'team') {
        await supabase.from('team_members').update({ status: 'inactive' }).eq('user_id', buyerUserId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'webhook error' }, { status: 500 })
  }
}


