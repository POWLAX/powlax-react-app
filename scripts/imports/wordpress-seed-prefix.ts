/**
 * Seed prefix tables (club_organizations, team_teams, team_members) directly from BuddyBoss groups
 * using known group names / ids. Uses service-role for Supabase writes.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const WP_BASE_RAW = process.env.WORDPRESS_API_URL
  || process.env.NEXT_PUBLIC_WORDPRESS_URL
  || process.env.WP_API_BASE
  || 'https://powlax.com/wp-json'
// Normalize to ROOT /wp-json (strip any trailing /wp/v2)
const WP_BASE = (() => {
  const trimmed = WP_BASE_RAW.replace(/\/$/, '')
  const idx = trimmed.indexOf('/wp-json')
  if (idx >= 0) return trimmed.slice(0, idx + '/wp-json'.length)
  return `${trimmed}/wp-json`
})()
const WP_USER = process.env.WORDPRESS_USERNAME || process.env.WP_API_USER || ''
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || process.env.WP_API_APP_PASSWORD || ''

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function wpHeaders() {
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64')
  return { Authorization: `Basic ${auth}` }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: wpHeaders() })
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${url}`)
  return res.json() as Promise<T>
}

type WpGroup = { id: number; name: string; parent_id?: number; status?: string; group_type?: any; meta?: any }
type WpMember = { id: number; is_admin?: boolean; is_mod?: boolean }

async function getGroupByName(name: string): Promise<WpGroup | null> {
  const url = `${WP_BASE}/buddyboss/v1/groups?per_page=100&context=edit`
  const arr = await fetchJson<any[]>(url)
  const norm = name.toLowerCase()
  const g = (arr || []).find(g => String(g?.name || '').toLowerCase() === norm)
  return g || null
}

async function getGroupMembers(groupId: number): Promise<WpMember[]> {
  const url = `${WP_BASE}/buddyboss/v1/groups/${groupId}/members?per_page=100&context=edit`
  const data = await fetchJson<any[]>(url)
  return (data || []).map(m => ({ id: m?.id || m?.user_id, is_admin: !!m?.is_admin, is_mod: !!m?.is_mod }))
}

async function resolveUserIdByWordPressId(wpUserId: number): Promise<string | null> {
  const { data } = await supabase.from('users').select('id').eq('wordpress_id', wpUserId).maybeSingle()
  return data?.id || null
}

async function ensureClub(name: string): Promise<string> {
  const { data } = await supabase.from('club_organizations').select('id').eq('name', name).maybeSingle()
  if (data?.id) return data.id
  const { data: ins, error } = await supabase.from('club_organizations').insert({ name }).select('id').single()
  if (error) throw error
  return ins!.id
}

async function ensureTeam(clubId: string, name: string): Promise<string> {
  const { data } = await supabase.from('team_teams').select('id').eq('name', name).maybeSingle()
  if (data?.id) return data.id
  const { data: ins, error } = await supabase.from('team_teams').insert({ club_id: clubId, name }).select('id').single()
  if (error) throw error
  return ins!.id
}

async function upsertMember(teamId: string, userId: string, role: 'head_coach'|'assistant_coach'|'player'|'parent') {
  const { data } = await supabase.from('team_members').select('id').eq('team_id', teamId).eq('user_id', userId).maybeSingle()
  if (data?.id) {
    await supabase.from('team_members').update({ role }).eq('id', data.id)
  } else {
    await supabase.from('team_members').insert({ team_id: teamId, user_id: userId, role })
  }
}

async function seed() {
  const clubName = 'Your Club OS'
  const teamNames = ['Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ']

  const clubGroup = await getGroupByName(clubName)
  const clubId = await ensureClub(clubName)

  for (const tName of teamNames) {
    const g = await getGroupByName(tName)
    const teamId = await ensureTeam(clubId, tName)
    if (!g) continue
    const members = await getGroupMembers(g.id)
    // Promote first member to head_coach; rest players
    let first = true
    for (const m of members) {
      const uid = await resolveUserIdByWordPressId(m.id)
      if (!uid) continue
      await upsertMember(teamId, uid, first ? 'head_coach' : 'player')
      first = false
    }
  }
}

seed().then(() => {
  console.log('BuddyBoss → prefix tables seed complete')
}).catch(err => {
  console.error(err)
  process.exit(1)
})


