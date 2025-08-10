/**
 * Fixed WordPress → Supabase user sync for BuddyBoss group members.
 * Works with current users table structure
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
  console.log(`Fetching: ${url}`)
  const res = await fetch(url, { headers: wpHeaders() })
  if (!res.ok) {
    const text = await res.text()
    console.error(`WP fetch failed: ${res.status} ${url}`)
    console.error(`Response: ${text.substring(0, 200)}`)
    throw new Error(`WP fetch failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

type WpMember = { id: number }
type WpUser = { 
  id: number; 
  name?: string; 
  slug?: string; 
  username?: string; 
  email?: string; 
  roles?: string[]; 
  avatar_urls?: Record<string,string> 
}

async function getGroupIdByName(name: string): Promise<number | null> {
  try {
    const url = `${WP_BASE}/buddyboss/v1/groups?per_page=100&context=edit`
    const groups = await fetchJson<any[]>(url)
    console.log(`Found ${groups?.length || 0} groups`)
    const g = (groups || []).find(g => String(g?.name || '').toLowerCase() === name.toLowerCase())
    if (g) {
      console.log(`Found group "${name}" with ID: ${g.id}`)
    } else {
      console.log(`Group "${name}" not found`)
      console.log('Available groups:', groups?.map(g => g.name).join(', '))
    }
    return g?.id || null
  } catch (err) {
    console.error(`Error fetching groups: ${err}`)
    return null
  }
}

async function getGroupMembers(groupId: number): Promise<number[]> {
  try {
    const url = `${WP_BASE}/buddyboss/v1/groups/${groupId}/members?per_page=100&context=edit`
    const members = await fetchJson<any[]>(url)
    const ids = (members || []).map(m => m?.id || m?.user_id).filter(Boolean)
    console.log(`Found ${ids.length} members in group ${groupId}`)
    return ids
  } catch (err) {
    console.error(`Error fetching group members: ${err}`)
    return []
  }
}

async function fetchUsersByIds(ids: number[]): Promise<WpUser[]> {
  const all: WpUser[] = []
  const unique = Array.from(new Set(ids))
  console.log(`Fetching details for ${unique.length} users`)
  
  while (unique.length) {
    const chunk = unique.splice(0, 100)
    try {
      const url = `${WP_BASE}/wp/v2/users?context=edit&include=${chunk.join(',')}`
      const rows = await fetchJson<WpUser[]>(url)
      all.push(...(rows || []))
      console.log(`Fetched ${rows?.length || 0} user details`)
    } catch (err) {
      console.error(`Error fetching user chunk: ${err}`)
    }
  }
  return all
}

async function upsertUser(u: WpUser) {
  const fullName = u.name || u.username || u.slug || `User ${u.id}`
  const email = (u as any).email || `wordpress_${u.id}@placeholder.com`
  const avatar = u.avatar_urls?.['96'] || u.avatar_urls?.['48'] || u.avatar_urls?.['24'] || null
  
  console.log(`Processing user: ${fullName} (WP ID: ${u.id})`)
  
  // Check if user exists
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('wordpress_id', u.id)
    .maybeSingle()
  
  if (selectError) {
    console.error(`Error checking user ${u.id}:`, selectError)
    return
  }
  
  const row = {
    wordpress_id: u.id,
    email: email,
    full_name: fullName,
    first_name: fullName.split(' ')[0] || null,
    last_name: fullName.split(' ').slice(1).join(' ') || null,
    roles: Array.isArray(u.roles) ? u.roles : [],
    avatar_url: avatar,
    is_active: true,
    subscription_status: 'active', // Default for migrated users
    updated_at: new Date().toISOString()
  }
  
  if (existing?.id) {
    console.log(`  Updating existing user ${existing.id}`)
    const { error } = await supabase
      .from('users')
      .update(row)
      .eq('id', existing.id)
    
    if (error) {
      console.error(`  Error updating user:`, error)
    } else {
      console.log(`  ✅ Updated user ${fullName}`)
    }
  } else {
    console.log(`  Creating new user`)
    const { error } = await supabase
      .from('users')
      .insert({ 
        ...row, 
        created_at: new Date().toISOString() 
      })
    
    if (error) {
      console.error(`  Error creating user:`, error)
    } else {
      console.log(`  ✅ Created user ${fullName}`)
    }
  }
}

async function syncUsersFromGroups(names: string[]) {
  let allIds: number[] = []
  
  for (const name of names) {
    console.log(`\n📁 Processing group: ${name}`)
    const gid = await getGroupIdByName(name)
    if (!gid) {
      console.log(`  ⚠️ Group not found, skipping`)
      continue
    }
    const ids = await getGroupMembers(gid)
    allIds = allIds.concat(ids)
  }
  
  if (!allIds.length) {
    console.log('\n⚠️ No group members found to sync')
    return
  }
  
  console.log(`\n👥 Fetching WordPress user details...`)
  const wpUsers = await fetchUsersByIds(allIds)
  
  console.log(`\n💾 Syncing ${wpUsers.length} users to Supabase...`)
  for (const u of wpUsers) {
    await upsertUser(u)
  }
  
  console.log(`\n✅ Successfully synced ${wpUsers.length} users`)
}

// Test with a simple user list first
async function testSimpleSync() {
  console.log('\n🧪 Testing with simple user fetch...')
  
  try {
    // Try to fetch first 10 WordPress users directly
    const url = `${WP_BASE}/wp/v2/users?per_page=10`
    const users = await fetchJson<WpUser[]>(url)
    
    console.log(`Found ${users?.length || 0} WordPress users`)
    
    if (users && users.length > 0) {
      console.log('\nSyncing test users to Supabase...')
      for (const u of users.slice(0, 5)) { // Just sync first 5 as test
        await upsertUser(u)
      }
    }
  } catch (err) {
    console.error('Test sync failed:', err)
  }
}

async function main() {
  console.log('🚀 WordPress User Sync\n')
  console.log('Configuration:')
  console.log(`  WP Base: ${WP_BASE}`)
  console.log(`  WP User: ${WP_USER}`)
  console.log(`  Supabase URL: ${SUPABASE_URL}\n`)
  
  // First try a simple test
  await testSimpleSync()
  
  // Then try the group sync
  console.log('\n📊 Syncing BuddyBoss Groups...')
  const groups = ['Your Club OS', 'Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ']
  await syncUsersFromGroups(groups)
  
  console.log('\n✅ User sync complete!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})