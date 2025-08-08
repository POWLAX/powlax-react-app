/**
 * Minimal WordPress → Supabase user sync for BuddyBoss group members.
 * Ensures `users` rows exist with `wordpress_id`, email, username, full_name, roles, avatar_url.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const WP_BASE_RAW = process.env.WORDPRESS_API_URL
  || process.env.NEXT_PUBLIC_WORDPRESS_URL
  || process.env.WP_API_BASE
  || 'https://powlax.com/wp-json'
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

type WpMember = { id: number }
type WpUser = { id: number; name?: string; slug?: string; username?: string; email?: string; roles?: string[]; avatar_urls?: Record<string,string> }

async function getGroupIdByName(name: string): Promise<number | null> {
  const url = `${WP_BASE}/buddyboss/v1/groups?per_page=100&context=edit`
  const groups = await fetchJson<any[]>(url)
  const g = (groups || []).find(g => String(g?.name || '').toLowerCase() === name.toLowerCase())
  return g?.id || null
}

async function getGroupMembers(groupId: number): Promise<number[]> {
  const url = `${WP_BASE}/buddyboss/v1/groups/${groupId}/members?per_page=100&context=edit`
  const members = await fetchJson<any[]>(url)
  return (members || []).map(m => m?.id || m?.user_id).filter(Boolean)
}

async function fetchUsersByIds(ids: number[]): Promise<WpUser[]> {
  const all: WpUser[] = []
  const unique = Array.from(new Set(ids))
  while (unique.length) {
    const chunk = unique.splice(0, 100)
    const url = `${WP_BASE}/wp/v2/users?context=edit&include=${chunk.join(',')}`
    const rows = await fetchJson<WpUser[]>(url)
    all.push(...(rows || []))
  }
  return all
}

async function upsertUser(u: WpUser) {
  const username = u.username || u.slug || undefined
  const fullName = u.name || username || undefined
  const email = (u as any).email || undefined
  const avatar = u.avatar_urls?.['96'] || u.avatar_urls?.['48'] || u.avatar_urls?.['24'] || null

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('wordpress_id', u.id)
    .maybeSingle()

  const row = {
    wordpress_id: u.id,
    email: email || null,
    username: username || null,
    full_name: fullName || null,
    roles: Array.isArray(u.roles) ? u.roles : [],
    avatar_url: avatar,
    updated_at: new Date().toISOString()
  }

  if (existing?.id) {
    await supabase.from('users').update(row).eq('id', existing.id)
  } else {
    await supabase.from('users').insert({ ...row, created_at: new Date().toISOString() })
  }
}

async function syncUsersFromGroups(names: string[]) {
  let allIds: number[] = []
  for (const name of names) {
    const gid = await getGroupIdByName(name)
    if (!gid) continue
    const ids = await getGroupMembers(gid)
    allIds = allIds.concat(ids)
  }
  if (!allIds.length) return
  const wpUsers = await fetchUsersByIds(allIds)
  for (const u of wpUsers) {
    await upsertUser(u)
  }
}

async function main() {
  const groups = ['Your Club OS', 'Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ']
  await syncUsersFromGroups(groups)
  console.log('User sync complete')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


