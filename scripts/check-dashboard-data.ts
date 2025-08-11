#!/usr/bin/env npx tsx
/**
 * Check actual dashboard data in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDashboardData() {
  console.log('📊 Checking Dashboard Data...\n')

  // 1. Check users table
  console.log('=== USERS TABLE ===')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (usersError) {
    console.error('Error fetching users:', usersError.message)
  } else {
    console.log(`Found ${users?.length || 0} users:`)
    users?.forEach(user => {
      console.log(`  - ${user.display_name || user.email} (${user.role}/${user.account_type}) ID: ${user.id}`)
      if (user.roles) console.log(`    Roles: ${user.roles.join(', ')}`)
      if (user.age_group) console.log(`    Age: ${user.age_group}`)
    })
  }

  // 2. Check clubs
  console.log('\n=== CLUBS TABLE ===')
  const { data: clubs, error: clubsError } = await supabase
    .from('clubs')
    .select('*')

  if (clubsError) {
    console.error('Error fetching clubs:', clubsError.message)
  } else {
    console.log(`Found ${clubs?.length || 0} clubs:`)
    clubs?.forEach(club => {
      console.log(`  - ${club.name} (ID: ${club.id})`)
    })
  }

  // 3. Check teams
  console.log('\n=== TEAMS TABLE ===')
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')

  if (teamsError) {
    console.error('Error fetching teams:', teamsError.message)
  } else {
    console.log(`Found ${teams?.length || 0} teams:`)
    teams?.forEach(team => {
      console.log(`  - ${team.name} (Club: ${team.club_id})`)
    })
  }

  // 4. Check team members
  console.log('\n=== TEAM MEMBERS ===')
  const { data: teamMembers, error: tmError } = await supabase
    .from('team_members')
    .select('*')
    .limit(10)

  if (tmError) {
    console.error('Error fetching team members:', tmError.message)
  } else {
    console.log(`Found ${teamMembers?.length || 0} team members`)
  }

  // 5. Check family relationships
  console.log('\n=== FAMILY RELATIONSHIPS ===')
  const { data: families, error: famError } = await supabase
    .from('family_accounts')
    .select('*')

  if (famError) {
    console.error('Error fetching family accounts:', famError.message)
  } else {
    console.log(`Found ${families?.length || 0} family accounts:`)
    families?.forEach(family => {
      console.log(`  - ${family.family_name} (Primary: ${family.primary_parent_id})`)
    })
  }

  // 6. Check parent-child relationships
  console.log('\n=== PARENT-CHILD RELATIONSHIPS ===')
  const { data: parentChild, error: pcError } = await supabase
    .from('parent_child_relationships')
    .select('*')

  if (pcError) {
    console.error('Error fetching parent-child relationships:', pcError.message)
  } else {
    console.log(`Found ${parentChild?.length || 0} parent-child relationships:`)
    parentChild?.forEach(rel => {
      console.log(`  - Parent: ${rel.parent_id} -> Child: ${rel.child_id} (${rel.relationship_type})`)
    })
  }

  // 7. Check gamification tables
  console.log('\n=== GAMIFICATION DATA ===')
  
  // Check point currencies
  const { data: currencies, error: currError } = await supabase
    .from('powlax_points_currencies')
    .select('*')

  if (currError) {
    console.error('Error fetching currencies:', currError.message)
  } else {
    console.log(`Found ${currencies?.length || 0} point currencies:`)
    currencies?.forEach(curr => {
      console.log(`  - ${curr.name}: ${curr.value_in_usd} USD`)
    })
  }

  // Check user wallets
  const { data: wallets, error: walletError } = await supabase
    .from('user_points_wallets')
    .select('*')
    .limit(10)

  if (walletError) {
    console.error('Error fetching wallets:', walletError.message)
  } else {
    console.log(`Found ${wallets?.length || 0} user wallets`)
  }

  // Check point transactions
  const { data: transactions, error: transError } = await supabase
    .from('points_transactions_powlax')
    .select('*')
    .limit(10)

  if (transError) {
    console.error('Error fetching transactions:', transError.message)
  } else {
    console.log(`Found ${transactions?.length || 0} point transactions`)
  }

  // Check badges
  const { data: badges, error: badgeError } = await supabase
    .from('user_badges')
    .select('*')
    .limit(10)

  if (badgeError) {
    console.error('Error fetching badges:', badgeError.message)
  } else {
    console.log(`Found ${badges?.length || 0} user badges`)
  }

  // 8. Check skills academy progress
  console.log('\n=== SKILLS ACADEMY PROGRESS ===')
  const { data: progress, error: progError } = await supabase
    .from('skills_academy_user_progress')
    .select('*')
    .limit(10)

  if (progError) {
    console.error('Error fetching progress:', progError.message)
  } else {
    console.log(`Found ${progress?.length || 0} progress records:`)
    progress?.forEach(prog => {
      console.log(`  - User: ${prog.user_id}, Workout: ${prog.workout_id}, Status: ${prog.status}, Points: ${prog.points_earned}`)
    })
  }

  // 9. Check for Patrick's admin account
  console.log('\n=== CHECKING FOR PATRICK\'S ADMIN ACCOUNT ===')
  const { data: patrick, error: patrickError } = await supabase
    .from('users')
    .select('*')
    .or('email.ilike.%patrick%,email.ilike.%chapla%,display_name.ilike.%patrick%,display_name.ilike.%chapla%')

  if (patrickError) {
    console.error('Error searching for Patrick:', patrickError.message)
  } else {
    console.log(`Found ${patrick?.length || 0} potential Patrick accounts:`)
    patrick?.forEach(user => {
      console.log(`  - ${user.display_name || user.email} (${user.role}) ID: ${user.id}`)
      console.log(`    Email: ${user.email}`)
      console.log(`    Roles: ${user.roles?.join(', ') || 'none'}`)
    })
  }
}

// Run the check
checkDashboardData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })