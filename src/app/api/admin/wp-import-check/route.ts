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

    // Query the actual tables (club_organizations and team_teams don't exist)
    const [{ data: orgs, error: orgErr }, { data: teams, error: teamErr }, { data: members, error: memErr }] = await Promise.all([
      supabase.from('clubs').select('id, name').order('name'),
      supabase.from('teams').select('id, name, club_id').order('name'),
      supabase.from('team_members').select('team_id, user_id, role')
    ])

    if (orgErr) throw orgErr
    if (teamErr) throw teamErr
    if (memErr) throw memErr

    const userIds = Array.from(new Set((members || []).map(m => m.user_id).filter(Boolean)))
    let usersById: Record<string, { email?: string; full_name?: string; username?: string }> = {}
    if (userIds.length) {
      const { data: users, error: ue } = await supabase
        .from('users')
        .select('id, email, display_name')
        .in('id', userIds)
      if (ue) {
        // If users table fails, just continue without user data
        console.error('Error fetching users:', ue)
      } else {
        for (const u of users || []) {
          usersById[u.id as string] = { 
            email: u.email as string, 
            full_name: u.display_name as string || u.email as string, 
            username: u.email as string // Use email as username fallback
          }
        }
      }
    }

    return NextResponse.json({ orgs: orgs || [], teams: teams || [], members: members || [], usersById })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


