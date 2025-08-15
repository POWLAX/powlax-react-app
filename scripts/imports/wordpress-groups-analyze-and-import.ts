/**
 * WordPress BuddyBoss/BuddyPress Groups Analyzer and Importer
 *
 * Phase 1: Analyze and output CSV previews (clubs, teams, team_members, users)
 * Phase 2: Import into Supabase (clubs, teams, team_members, users)
 *
 * Notes:
 * - There are no existing parent/child relationships in WP; skip creating those.
 * - Uses Application Password for WordPress REST.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Config
const WP_BASE_RAW = process.env.WP_API_BASE 
  || process.env.WORDPRESS_API_BASE 
  || process.env.WORDPRESS_API_URL 
  || process.env.NEXT_PUBLIC_WP_API_BASE 
  || process.env.NEXT_PUBLIC_WORDPRESS_URL 
  || process.env.WORDPRESS_API 
  || process.env.WP_BASE 
  || 'https://your-wordpress-site.com/wp-json'
// Normalize to the REST root: ${domain}/wp-json
const WP_BASE = (() => {
  const trimmed = WP_BASE_RAW.replace(/\/$/, '')
  const idx = trimmed.indexOf('/wp-json')
  if (idx >= 0) return trimmed.slice(0, idx + '/wp-json'.length)
  return `${trimmed}/wp-json`
})()
const WP_USER = process.env.WP_API_USER 
  || process.env.WORDPRESS_API_USER 
  || process.env.WORDPRESS_USER 
  || process.env.WORDPRESS_USERNAME 
  || process.env.WP_USERNAME 
  || process.env.WP_USER 
  || process.env.NEXT_PUBLIC_WORDPRESS_USER 
  || ''
const WP_APP_PASSWORD = process.env.WP_API_APP_PASSWORD 
  || process.env.WORDPRESS_API_APP_PASSWORD 
  || process.env.WORDPRESS_APPLICATION_PASSWORD 
  || process.env.WORDPRESS_APP_PASSWORD 
  || process.env.WP_APPLICATION_PASSWORD 
  || process.env.WP_APP_PASSWORD 
  || process.env.WP_PASSWORD 
  || process.env.NEXT_PUBLIC_WORDPRESS_APP_PASSWORD 
  || ''

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

type WpUser = {
  id: number
  name: string
  email?: string
  username?: string
  roles?: string[]
  avatar_urls?: Record<string, string>
}

type WpGroup = {
  id: number
  name: string
  description?: string
  parent_id?: number | null
  status?: string
  // Custom meta may include group_type, age_band, season, etc.
  meta?: Record<string, any>
}

type WpGroupMember = {
  id: number // user id
  is_admin?: boolean
  is_mod?: boolean
}

type AnalyzeResult = {
  clubs: any[]
  teams: any[]
  users: any[]
  teamMembers: any[]
}

function wpHeaders() {
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64')
  return { Authorization: `Basic ${auth}` }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await (globalThis as any).fetch(url, { headers: wpHeaders() })
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${url}`)
  return res.json() as Promise<T>
}

async function fetchProbe(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await (globalThis as any).fetch(url, { headers: wpHeaders() })
    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text.slice(0, 300) }
  } catch (e: any) {
    return { ok: false, status: 0, body: String(e?.message || e) }
  }
}

function groupTypeOf(g: WpGroup): string {
  const raw = (g as any)?.group_type || g.meta?.group_type || ''
  // Handle case where group_type comes as object like { slug: 'club-team-hq', name: 'Club Team HQ' }
  if (raw && typeof raw === 'object') {
    const slug = (raw as any).slug || (raw as any).key || ''
    const name = (raw as any).name || (raw as any).label || ''
    const source = String(slug || name).toLowerCase()
    if (source.includes('club') && source.includes('team') && source.includes('hq')) return 'club_team_hq'
    if (source.includes('team') && source.includes('hq')) return 'team_hq'
    if (source.includes('club') && source.includes('os')) return 'club_os'
    if (source.includes('club') && source.includes('hq')) return 'club_team_hq'
    return ''
  }
  let type = String(raw || '').toLowerCase().trim()
  if (!type) return ''
  const t = type.replace(/[-\s]+/g, '_')
  if (t.includes('club_os')) return 'club_os'
  if (t.includes('club_team_hq')) return 'club_team_hq'
  if (t.includes('team_hq')) return 'team_hq'
  if (type.includes('club os')) return 'club_os'
  if (type.includes('club team hq')) return 'club_team_hq'
  if (type.includes('team hq')) return 'team_hq'
  return t
}

function normalizeName(name?: string): string {
  return (name || '').trim().toLowerCase()
}

// Infer types by known group names when group_type meta is missing
const KNOWN_GROUP_NAME_MAP: Record<string, 'club_os' | 'team_hq'> = {
  'your club os': 'club_os',
  'your varsity team hq': 'team_hq',
  'your 8th grade team hq': 'team_hq',
  'your jv team hq': 'team_hq',
}

function mapRole(isAdmin?: boolean, isMod?: boolean): 'head_coach' | 'assistant_coach' | 'player' {
  if (isAdmin) return 'head_coach'
  if (isMod) return 'assistant_coach'
  return 'player'
}

async function fetchAllGroups(): Promise<WpGroup[]> {
  // Try multiple namespaces (BuddyBoss/BuddyPress) and include private/hidden visibility
  const bases = [
    `${WP_BASE}/buddyboss/v1/groups`,
    `${WP_BASE}/buddypress/v1/groups`,
    `${WP_BASE}/bp/v1/groups`,
    `${WP_BASE}/bb/v1/groups`,
    `${WP_BASE}/wp/v2/groups`,
  ]
  const statusParams = [
    '', // default
    'status=public',
    'status=private',
    'status=hidden',
    'scope=all',
  ]
  for (const base of bases) {
    let all: any[] = []
    try {
      for (const status of statusParams) {
        let page = 1
        while (page <= 10) { // safety cap
          const qp = [`per_page=100`, `page=${page}`, status, 'context=edit'].filter(Boolean).join('&')
          const url = `${base}?${qp}`
          const data = await fetchJson<any>(url)
          const arr = Array.isArray(data) ? data : (Array.isArray(data?.groups) ? data.groups : [])
          if (!arr.length) break
          all = all.concat(arr)
          if (arr.length < 100) break
          page++
        }
      }
      if (all.length) return dedupeById(all) as WpGroup[]
    } catch (_e) {
      // try next base
    }
  }
  return []
}

function dedupeById(items: any[]): any[] {
  const seen = new Set<number>()
  const out: any[] = []
  for (const it of items) {
    const id = (it && typeof it.id === 'number') ? it.id : undefined
    if (id && !seen.has(id)) {
      seen.add(id)
      out.push(it)
    }
  }
  return out
}

async function fetchGroupMembers(groupId: number): Promise<WpGroupMember[]> {
  const endpoints = [
    `${WP_BASE}/buddyboss/v1/groups/${groupId}/members?per_page=100&page=1&context=edit`,
    `${WP_BASE}/buddypress/v1/groups/${groupId}/members?per_page=100&page=1&context=edit`,
    `${WP_BASE}/bp/v1/groups/${groupId}/members?per_page=100&page=1&context=edit`,
    `${WP_BASE}/bb/v1/groups/${groupId}/members?per_page=100&page=1&context=edit`,
    `${WP_BASE}/wp/v2/groups/${groupId}/members?per_page=100&page=1&context=edit`
  ]
  for (const url of endpoints) {
    try {
      const data = await fetchJson<any[]>(url)
      return (data || []).map((m) => ({
        id: m?.id || m?.user_id,
        is_admin: !!(m?.is_admin || m?.is_admins),
        is_mod: !!(m?.is_mod || m?.is_mods)
      }))
    } catch (_) {
      // try next
    }
  }
  return []
}

async function fetchUsersByIds(userIds: number[]): Promise<WpUser[]> {
  // Batch by 100
  const all: WpUser[] = []
  const ids = [...new Set(userIds)].filter(Boolean)
  while (ids.length) {
    const chunk = ids.splice(0, 100)
    const url = `${WP_BASE}/wp/v2/users?context=edit&include=${chunk.join(',')}`
    try {
      const data = await fetchJson<WpUser[]>(url)
      all.push(...(data || []))
    } catch (err) {
      console.error('User fetch error:', err)
    }
  }
  return all
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function toCsvRow(values: (string | number | null | undefined)[]) {
  return values
    .map((v) => (v === null || v === undefined ? '' : String(v).replace(/"/g, '""')))
    .map((v) => (v.includes(',') || v.includes('"') ? `"${v}"` : v))
    .join(',')
}

async function analyze(): Promise<AnalyzeResult> {
  const groups = await fetchAllGroups()
  const clubs: any[] = []
  const teams: any[] = []
  const teamMembers: any[] = []
  const wpUserIds: number[] = []

  // Always write an all-groups preview for debugging
  try {
    ensureDir('tmp/wp_groups_preview')
    fs.writeFileSync(path.join('tmp/wp_groups_preview', 'groups_all.csv'), [
      'wp_group_id,name,status,parent_id',
      ...groups.map((g) => toCsvRow([g.id, g.name, (g as any).status, (g as any).parent_id]))
    ].join('\n'))
  } catch (e) {
    console.warn('Could not write groups_all.csv:', e)
  }

  for (const g of groups) {
    let type: any = groupTypeOf(g)
    // If type is not a non-empty string, infer by name heuristics
    if (typeof type !== 'string' || !type.trim()) {
      const norm = normalizeName(g.name)
      const inferred = KNOWN_GROUP_NAME_MAP[norm]
      if (inferred) type = inferred
      else if (norm.includes('club os')) type = 'club_os'
      else if (norm.includes('team hq')) type = 'team_hq'
      else type = ''
    }

    // Debug classification
    if (process.env.DEBUG_GROUPS === '1') {
      console.log(`[classify] id=${g.id} name="${g.name}" → type=${type || '(none)'} status=${(g as any).status}`)
    }
    if (type === 'club_os') {
      clubs.push({
        wp_group_id: g.id,
        name: g.name,
        status: g.status,
        parent_id: g.parent_id || null
      })
    } else if (type === 'team_hq' || type === 'club_team_hq') {
      teams.push({
        wp_group_id: g.id,
        name: g.name,
        status: g.status,
        parent_group_id: g.parent_id || null,
        group_type: type,
        age_band: g.meta?.age_band || null
      })
      // members
      const members = await fetchGroupMembers(g.id)
      for (const m of members) {
        teamMembers.push({
          wp_group_id: g.id,
          wp_user_id: m.id,
          role: mapRole(m.is_admin, m.is_mod)
        })
        if (m.id) wpUserIds.push(m.id)
      }
    }
  }

  const users = await fetchUsersByIds(wpUserIds)
  return { clubs, teams, users, teamMembers }
}

async function writeCsvPreviews(outDir: string, data: AnalyzeResult) {
  ensureDir(outDir)
  fs.writeFileSync(path.join(outDir, 'clubs.csv'), [
    'wp_group_id,name,status,parent_id',
    ...data.clubs.map((o) => toCsvRow([o.wp_group_id, o.name, o.status, o.parent_id]))
  ].join('\n'))

  fs.writeFileSync(path.join(outDir, 'teams.csv'), [
    'wp_group_id,name,status,parent_group_id,group_type,age_band',
    ...data.teams.map((t) => toCsvRow([t.wp_group_id, t.name, t.status, t.parent_group_id, t.group_type, t.age_band]))
  ].join('\n'))

  fs.writeFileSync(path.join(outDir, 'team_members.csv'), [
    'wp_group_id,wp_user_id,role',
    ...data.teamMembers.map((tm) => toCsvRow([tm.wp_group_id, tm.wp_user_id, tm.role]))
  ].join('\n'))

  fs.writeFileSync(path.join(outDir, 'users.csv'), [
    'wp_user_id,email,username,full_name,roles,avatar_96',
    ...data.users.map((u) => toCsvRow([
      u.id,
      (u as any).email,
      (u as any).username,
      u.name,
      Array.isArray(u.roles) ? u.roles.join('|') : '',
      u.avatar_urls?.['96']
    ]))
  ].join('\n'))
}

async function importData(data: AnalyzeResult) {
  // Start log
  const { data: log } = await supabase
    .from('wp_sync_log')
    .insert({ sync_type: 'groups-import', status: 'started' })
    .select()
    .single()

  let created = 0, updated = 0
  const orgIdByWp: Record<number, string> = {}
  const teamIdByWp: Record<number, string> = {}
  const userIdByWp: Record<number, string> = {}

  // Upsert users
  for (const u of data.users) {
    const userRow = {
      wordpress_id: u.id,
      email: (u as any).email || null,
      username: (u as any).username || null,
      full_name: u.name || null,
      roles: Array.isArray(u.roles) ? u.roles : [],
      avatar_url: u.avatar_urls?.['96'] || null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('wordpress_id', u.id)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase.from('users').update(userRow).eq('id', existing.id)
      if (!error) { updated++ ; userIdByWp[u.id] = existing.id }
    } else {
      const { data: ins, error } = await supabase.from('users').insert(userRow).select('id').single()
      if (!error && ins?.id) { created++ ; userIdByWp[u.id] = ins.id }
    }
  }

  // Upsert clubs
  for (const o of data.clubs) {
    const meta = { wp_group_id: o.wp_group_id }
    const { data: existing } = await supabase
      .from('clubs')
      .select('id, metadata')
      .contains('metadata', { wp_group_id: o.wp_group_id })
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase
        .from('clubs')
        .update({ name: o.name, metadata: meta, updated_at: new Date().toISOString() as any })
        .eq('id', existing.id)
      if (!error) { updated++ ; orgIdByWp[o.wp_group_id] = existing.id }
    } else {
      const { data: ins, error } = await supabase
        .from('clubs')
        .insert({ name: o.name, metadata: meta })
        .select('id')
        .single()
      if (!error && ins?.id) { created++ ; orgIdByWp[o.wp_group_id] = ins.id }
    }
  }

  // Upsert teams
  for (const t of data.teams) {
    const parentOrgId = t.parent_group_id ? orgIdByWp[t.parent_group_id] : null
    const meta = { wp_group_id: t.wp_group_id, wp_parent_group_id: t.parent_group_id, group_type: t.group_type }
    const row: any = {
      name: t.name,
      organization_id: parentOrgId,
      subscription_tier: 'structure',
      metadata: meta,
      updated_at: new Date().toISOString()
    }

    const { data: existing } = await supabase
      .from('teams')
      .select('id, metadata')
      .contains('metadata', { wp_group_id: t.wp_group_id })
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase.from('teams').update(row).eq('id', existing.id)
      if (!error) { updated++ ; teamIdByWp[t.wp_group_id] = existing.id }
    } else {
      const { data: ins, error } = await supabase.from('teams').insert(row).select('id').single()
      if (!error && ins?.id) { created++ ; teamIdByWp[t.wp_group_id] = ins.id }
    }
  }

  // Upsert team_members
  for (const tm of data.teamMembers) {
    const teamId = teamIdByWp[tm.wp_group_id]
    const userId = userIdByWp[tm.wp_user_id]
    if (!teamId || !userId) continue
    const row = { team_id: teamId, user_id: userId, role: tm.role }
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle()
    if (existing?.id) {
      const { error } = await supabase.from('team_members').update({ role: tm.role }).eq('id', existing.id)
      if (!error) updated++
    } else {
      const { error } = await supabase.from('team_members').insert(row)
      if (!error) created++
    }
  }

  if (log) {
    await supabase
      .from('wp_sync_log')
      .update({ status: 'completed', records_created: created, records_updated: updated, completed_at: new Date().toISOString() })
      .eq('id', log.id)
  }
}

async function main() {
  const mode = process.argv[2] || 'analyze'
  const outDir = process.argv[3] || 'tmp/wp_groups_preview'

  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  if (!SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!WP_USER || !WP_APP_PASSWORD) {
    const missing: string[] = []
    if (!WP_USER) missing.push('WP_API_USER/WP_USERNAME')
    if (!WP_APP_PASSWORD) missing.push('WP_API_APP_PASSWORD/WP_APP_PASSWORD')
    throw new Error(`Missing WP API credentials: ${missing.join(', ')}`)
  }

  if (mode === 'analyze') {
    const { data: log } = await supabase
      .from('wp_sync_log')
      .insert({ sync_type: 'groups-analyze', status: 'started' })
      .select()
      .single()

    const result = await analyze()
    await writeCsvPreviews(outDir, result)
    if (log) {
      await supabase
        .from('wp_sync_log')
        .update({ status: 'completed', metadata: { counts: {
          clubs: result.clubs.length,
          teams: result.teams.length,
          users: result.users.length,
          team_members: result.teamMembers.length
        } }, completed_at: new Date().toISOString() })
        .eq('id', log.id)
    }
    console.log(`Analyze complete. CSVs at ${outDir}`)
    return
  }

  if (mode === 'debug') {
    console.log('WP_BASE:', WP_BASE)
    const endpoints = [
      `${WP_BASE}`,
      `${WP_BASE}/buddyboss/v1/groups?per_page=2`,
      `${WP_BASE}/buddypress/v1/groups?per_page=2`,
      `${WP_BASE}/bp/v1/groups?per_page=2`,
      `${WP_BASE}/bb/v1/groups?per_page=2`,
      `${WP_BASE}/wp/v2/users?per_page=2`
    ]
    for (const url of endpoints) {
      const r = await fetchProbe(url)
      console.log(`[probe] ${url} → ok=${r.ok} status=${r.status} body=${r.body}`)
    }
    // Probe searches for specific group names
    const namesToFind = [
      'Your Club OS',
      'Your Varsity Team HQ',
      'Your 8th Grade Team HQ',
      'Your JV Team HQ'
    ]
    for (const name of namesToFind) {
      const url = `${WP_BASE}/buddyboss/v1/groups?per_page=10&search=${encodeURIComponent(name)}`
      const r = await fetchProbe(url)
      console.log(`[search] ${name} → ok=${r.ok} status=${r.status} body=${r.body}`)
    }
    return
  }

  if (mode === 'import') {
    const result = await analyze()
    await importData(result)
    console.log('Import complete.')
    return
  }

  console.log('Usage: ts-node scripts/imports/wordpress-groups-analyze-and-import.ts [analyze|import] [outDir]')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


