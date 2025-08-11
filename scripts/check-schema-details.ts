#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkSchemas() {
  console.log('🔍 Checking specific table schemas...\n')

  // Check parent_child_relationships
  console.log('1. parent_child_relationships table:')
  const { data: parentChild, error: pcError } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .limit(1)
  
  if (pcError) {
    console.log('❌ Error:', pcError.message)
  } else {
    console.log('✅ Sample record:', parentChild?.[0] || 'No records')
  }

  // Check user_points_wallets 
  console.log('\n2. user_points_wallets table:')
  const { data: wallets, error: walletError } = await supabase
    .from('user_points_wallets')
    .select('*')
    .limit(1)
  
  if (walletError) {
    console.log('❌ Error:', walletError.message)
  } else {
    console.log('✅ Sample record:', wallets?.[0] || 'No records')
  }

  // Check user_badges
  console.log('\n3. user_badges table:')
  const { data: badges, error: badgeError } = await supabase
    .from('user_badges')
    .select('*')
    .limit(1)
  
  if (badgeError) {
    console.log('❌ Error:', badgeError.message)
  } else {
    console.log('✅ Sample record:', badges?.[0] || 'No records')
  }

  // Check user_rank_progress_powlax
  console.log('\n4. user_rank_progress_powlax table:')
  const { data: ranks, error: rankError } = await supabase
    .from('user_rank_progress_powlax')
    .select('*')
    .limit(1)
  
  if (rankError) {
    console.log('❌ Error:', rankError.message)
  } else {
    console.log('✅ Sample record:', ranks?.[0] || 'No records')
  }

  // Check team_members columns specifically
  console.log('\n5. team_members columns by attempting insert:')
  const testInsert = await supabase
    .from('team_members')
    .insert({
      team_id: 'test',
      user_id: 'test', 
      role: 'test',
      status: 'test'
    })
  
  console.log('team_members insert error (shows available columns):', testInsert.error?.message)

  // Check practices columns
  console.log('\n6. practices columns by attempting insert:')
  const practiceInsert = await supabase
    .from('practices')
    .insert({
      coach_id: 'test',
      team_id: 'test',
      name: 'test',
      practice_date: new Date().toISOString()
    })
  
  console.log('practices insert error (shows available columns):', practiceInsert.error?.message)
}

checkSchemas().catch(console.error)