/**
 * Gamipress CSV importer → Supabase points/badges/ranks
 *
 * Expected CSV sources in docs/Wordpress CSV's/Gamipress Gamification Exports/
 * - Points by user and currency
 * - Badges by user
 * - Ranks by user
 *
 * This script is idempotent and uses UPSERT-style logic at application level.
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function loadCsv(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return parse(raw, { columns: true, skip_empty_lines: true })
}

async function upsertWallet(userId: string, currency: string, balance: number) {
  const { data: existing } = await supabase
    .from('user_points_wallets')
    .select('id, balance')
    .eq('user_id', userId)
    .eq('currency', currency)
    .maybeSingle()
  if (existing?.id) {
    await supabase.from('user_points_wallets').update({ balance, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('user_points_wallets').insert({ user_id: userId, currency, balance })
  }
}

async function awardBadge(userId: string, badgeKey: string, badgeName?: string) {
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_key', badgeKey)
    .maybeSingle()
  if (!existing) {
    await supabase.from('user_badges').insert({ user_id: userId, badge_key: badgeKey, badge_name: badgeName, source: 'wordpress_gamipress' })
  }
}

async function awardRank(userId: string, rankKey: string, rankName?: string) {
  const { data: existing } = await supabase
    .from('user_ranks')
    .select('id')
    .eq('user_id', userId)
    .eq('rank_key', rankKey)
    .maybeSingle()
  if (!existing) {
    await supabase.from('user_ranks').insert({ user_id: userId, rank_key: rankKey, rank_name: rankName, source: 'wordpress_gamipress' })
  }
}

async function resolveUserIdByWordPressId(wpUserId: string): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('wordpress_id', Number(wpUserId))
    .maybeSingle()
  return data?.id || null
}

async function importPoints(pointsCsvPath: string) {
  const rows = loadCsv(pointsCsvPath)
  for (const row of rows) {
    const wpUserId = String(row.user_id || row.wp_user_id || '').trim()
    const currency = String(row.currency || row.type || '').trim().toLowerCase().replace(/\s+/g, '_')
    const balance = Number(row.balance || row.points || 0)
    if (!wpUserId || !currency) continue
    const userId = await resolveUserIdByWordPressId(wpUserId)
    if (!userId) continue
    await upsertWallet(userId, currency, balance)
  }
}

async function importBadges(badgesCsvPath: string) {
  const rows = loadCsv(badgesCsvPath)
  for (const row of rows) {
    const wpUserId = String(row.user_id || row.wp_user_id || '').trim()
    const key = String(row.badge_key || row.badge || row.slug || '').trim().toLowerCase()
    const name = String(row.badge_name || row.name || '').trim()
    if (!wpUserId || !key) continue
    const userId = await resolveUserIdByWordPressId(wpUserId)
    if (!userId) continue
    await awardBadge(userId, key, name)
  }
}

async function importRanks(ranksCsvPath: string) {
  const rows = loadCsv(ranksCsvPath)
  for (const row of rows) {
    const wpUserId = String(row.user_id || row.wp_user_id || '').trim()
    const key = String(row.rank_key || row.rank || row.slug || '').trim().toLowerCase()
    const name = String(row.rank_name || row.name || '').trim()
    if (!wpUserId || !key) continue
    const userId = await resolveUserIdByWordPressId(wpUserId)
    if (!userId) continue
    await awardRank(userId, key, name)
  }
}

async function main() {
  const base = "docs/Wordpress CSV's/Gamipress Gamification Exports"
  const pointsCsv = path.join(base, 'points.csv')
  const badgesCsv = path.join(base, 'badges.csv')
  const ranksCsv = path.join(base, 'ranks.csv')

  if (fs.existsSync(pointsCsv)) await importPoints(pointsCsv)
  if (fs.existsSync(badgesCsv)) await importBadges(badgesCsv)
  if (fs.existsSync(ranksCsv)) await importRanks(ranksCsv)

  console.log('Gamipress import complete')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


