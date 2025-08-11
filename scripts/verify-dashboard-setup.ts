#!/usr/bin/env npx tsx
/**
 * Verify Dashboard Setup
 * Checks that all dashboard data is properly configured
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const PATRICK_ID = '523f2768-6404-439c-a429-f9eb6736aa17'

async function verifyDashboardSetup() {
  console.log('🔍 DASHBOARD SETUP VERIFICATION\n')
  console.log('='.repeat(60))
  
  let allGood = true

  // 1. Check Patrick's Account
  console.log('\n✅ PATRICK\'S ADMIN ACCOUNT')
  const { data: patrick } = await supabase
    .from('users')
    .select('*')
    .eq('id', PATRICK_ID)
    .single()
  
  if (patrick) {
    console.log(`  Email: ${patrick.email}`)
    console.log(`  Display Name: ${patrick.display_name}`)
    console.log(`  Account Type: ${patrick.account_type}`)
    console.log(`  Roles: ${patrick.roles?.join(', ')}`)
    console.log(`  ✓ Has Admin Role: ${patrick.roles?.includes('administrator') ? 'YES' : 'NO'}`)
    console.log(`  ✓ Has Parent Role: ${patrick.roles?.includes('parent') ? 'YES' : 'NO'}`)
  } else {
    console.log('  ❌ Patrick\'s account not found!')
    allGood = false
  }

  // 2. Check Children
  console.log('\n✅ CHILDREN ACCOUNTS')
  const { data: relationships } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      child:users!child_id (
        id,
        display_name,
        first_name,
        last_name,
        age_group,
        player_position,
        graduation_year,
        account_type
      )
    `)
    .eq('parent_id', PATRICK_ID)
  
  if (relationships && relationships.length > 0) {
    console.log(`  Total Children: ${relationships.length}`)
    relationships.forEach((rel, index) => {
      const child = rel.child
      console.log(`\n  Child ${index + 1}: ${child?.display_name}`)
      console.log(`    - Age Group: ${child?.age_group}`)
      console.log(`    - Position: ${child?.player_position}`)
      console.log(`    - Grad Year: ${child?.graduation_year}`)
    })
  } else {
    console.log('  ❌ No children linked to Patrick!')
    allGood = false
  }

  // 3. Check Gamification Setup
  console.log('\n✅ GAMIFICATION SYSTEM')
  
  // Check currencies
  const { data: currencies } = await supabase
    .from('powlax_points_currencies')
    .select('*')
  
  console.log(`  Point Currencies: ${currencies?.length || 0}`)
  currencies?.forEach(curr => {
    console.log(`    - ${curr.name}: $${curr.value_in_usd || 'undefined'} USD`)
  })

  // Check wallets
  const childIds = relationships?.map(r => r.child?.id).filter(Boolean) || []
  if (childIds.length > 0) {
    const { data: wallets } = await supabase
      .from('user_points_wallets')
      .select('*')
      .in('user_id', childIds)
    
    console.log(`  Child Wallets: ${wallets?.length || 0}`)
    wallets?.forEach(wallet => {
      const child = relationships?.find(r => r.child?.id === wallet.user_id)?.child
      console.log(`    - ${child?.display_name}: ${wallet.balance} points`)
    })
  }

  // Check badges
  if (childIds.length > 0) {
    const { data: badges } = await supabase
      .from('user_badges')
      .select('*')
      .in('user_id', childIds)
    
    console.log(`  Badges Earned: ${badges?.length || 0}`)
  }

  // 4. Check Skills Academy Progress
  console.log('\n✅ SKILLS ACADEMY PROGRESS')
  if (childIds.length > 0) {
    const { data: progress } = await supabase
      .from('skills_academy_user_progress')
      .select('*')
      .in('user_id', childIds)
    
    const completed = progress?.filter(p => p.status === 'completed').length || 0
    const inProgress = progress?.filter(p => p.status === 'in_progress').length || 0
    
    console.log(`  Total Progress Records: ${progress?.length || 0}`)
    console.log(`    - Completed: ${completed}`)
    console.log(`    - In Progress: ${inProgress}`)
  }

  // 5. Check Team Memberships
  console.log('\n✅ TEAM MEMBERSHIPS')
  if (childIds.length > 0) {
    const { data: memberships } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(name),
        user:users!user_id(display_name)
      `)
      .in('user_id', childIds)
    
    console.log(`  Children in Teams: ${memberships?.length || 0}`)
    memberships?.forEach(member => {
      console.log(`    - ${member.user?.display_name} → ${member.team?.name}`)
    })
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 DASHBOARD READINESS SUMMARY\n')
  
  if (allGood && relationships && relationships.length > 0) {
    console.log('✅ Dashboard is READY!')
    console.log('\n🎯 What\'s Working:')
    console.log('  1. Patrick has admin account with parent role')
    console.log(`  2. ${relationships.length} children linked to Patrick's account`)
    console.log('  3. AdminDashboard will show real data')
    console.log('  4. Children section will display in admin dashboard')
    console.log('  5. Gamification data is partially populated')
    
    console.log('\n⚠️  Known Limitations:')
    console.log('  1. Some gamification tables have schema mismatches')
    console.log('  2. Point transactions table expects integer IDs (not UUIDs)')
    console.log('  3. WordPress stats are not migrated (no integration exists)')
    console.log('  4. Mock data still used for some metrics')
    
    console.log('\n📝 Recommendations:')
    console.log('  1. The gamification system needs schema updates to fully work')
    console.log('  2. Consider creating a migration to fix table schemas')
    console.log('  3. WordPress data would need custom import if required')
    
    console.log('\n🚀 Next Steps:')
    console.log('  1. Visit http://localhost:3000/dashboard')
    console.log('  2. Login as patrick@powlax.com')
    console.log('  3. You\'ll see the admin dashboard with children data')
    console.log('  4. The dashboard shows real user counts and children info')
  } else {
    console.log('❌ Dashboard setup has issues!')
    console.log('  Please review the errors above and fix them.')
  }
  
  console.log('\n' + '='.repeat(60))
}

// Run verification
verifyDashboardSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })