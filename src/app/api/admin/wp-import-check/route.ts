import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const [{ data: prefOrgs, error: orgErr1 }, { data: prefTeams, error: teamErr1 }, { data: members, error: memErr }] = await Promise.all([
      supabase.from('club_organizations').select('id, name').order('name'),
      supabase.from('team_teams').select('id, name, club_id').order('name'),
      supabase.from('team_members').select('team_id, user_id, role')
    ])

    // Fallback to legacy tables if prefix query failed or returned empty
    let orgs = prefOrgs || []
    if ((orgErr1 && orgErr1.message.includes('does not exist')) || (orgs.length === 0)) {
      const { data: legacyOrgs } = await supabase.from('organizations').select('id, name').order('name')
      orgs = legacyOrgs || []
    }

    let teams = prefTeams || []
    if ((teamErr1 && teamErr1.message.includes('does not exist')) || (teams.length === 0)) {
      const { data: legacyTeams } = await supabase.from('teams').select('id, name, organization_id').order('name')
      teams = (legacyTeams || []).map((x: any) => ({ id: x.id, name: x.name, club_id: x.organization_id || null }))
    }

    const orgErr = null
    const teamErr = null

    if (orgErr) throw orgErr
    if (teamErr) throw teamErr
    if (memErr) throw memErr

    const userIds = Array.from(new Set((members || []).map(m => m.user_id).filter(Boolean)))
    let usersById: Record<string, { email?: string; full_name?: string; username?: string }> = {}
    if (userIds.length) {
      const { data: users, error: ue } = await supabase
        .from('users')
        .select('id, email, full_name, username')
        .in('id', userIds)
      if (ue) throw ue
      for (const u of users || []) {
        usersById[u.id as string] = { email: u.email as string, full_name: u.full_name as string, username: u.username as string }
      }
    }

    return NextResponse.json({ orgs: orgs || [], teams: teams || [], members: members || [], usersById })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


