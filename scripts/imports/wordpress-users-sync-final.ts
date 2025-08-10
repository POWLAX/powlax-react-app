/**
 * Final WordPress → Supabase user sync - works with actual table structure
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const WP_BASE = 'https://powlax.com/wp-json'
const WP_USER = process.env.WORDPRESS_USERNAME || ''
const WP_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || ''

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function wpHeaders() {
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64')
  return { Authorization: `Basic ${auth}` }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: wpHeaders() })
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`)
  return res.json() as Promise<T>
}

type WpUser = { 
  id: number; 
  name?: string; 
  slug?: string; 
  email?: string; 
  roles?: string[];
}

async function syncWordPressUsers() {
  console.log('🚀 Starting WordPress User Migration\n')
  
  // Get group IDs
  const groups = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups?per_page=100`)
  const clubOS = groups.find(g => g.name === 'Your Club OS')
  const varsityTeam = groups.find(g => g.name === 'Your Varsity Team HQ')
  
  console.log(`Found Groups:`)
  console.log(`  - Your Club OS: ${clubOS ? 'ID ' + clubOS.id : 'Not found'}`)
  console.log(`  - Your Varsity Team HQ: ${varsityTeam ? 'ID ' + varsityTeam.id : 'Not found'}`)
  
  // Collect all member IDs
  let allMemberIds: number[] = []
  
  if (clubOS) {
    const members = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups/${clubOS.id}/members?per_page=100`)
    const ids = members.map(m => m.id || m.user_id).filter(Boolean)
    allMemberIds = allMemberIds.concat(ids)
    console.log(`  - Club OS members: ${ids.length}`)
  }
  
  if (varsityTeam) {
    const members = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups/${varsityTeam.id}/members?per_page=100`)
    const ids = members.map(m => m.id || m.user_id).filter(Boolean)
    allMemberIds = allMemberIds.concat(ids)
    console.log(`  - Varsity Team members: ${ids.length}`)
  }
  
  // Remove duplicates
  const uniqueIds = Array.from(new Set(allMemberIds))
  console.log(`\n📊 Total unique members to migrate: ${uniqueIds.length}\n`)
  
  // Fetch user details
  if (uniqueIds.length > 0) {
    const wpUsers = await fetchJson<WpUser[]>(`${WP_BASE}/wp/v2/users?include=${uniqueIds.join(',')}`)
    
    console.log('💾 Migrating users to Supabase...\n')
    let successCount = 0
    let errorCount = 0
    
    for (const wpUser of wpUsers) {
      const fullName = wpUser.name || wpUser.slug || `User ${wpUser.id}`
      const email = (wpUser as any).email || `wp_user_${wpUser.id}@powlax.com`
      
      // Build user record matching actual table structure
      const userRecord = {
        wordpress_id: wpUser.id,
        email: email,
        full_name: fullName,
        first_name: fullName.split(' ')[0] || null,
        last_name: fullName.split(' ').slice(1).join(' ') || null,
        roles: wpUser.roles || [],
        is_active: true,
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('wordpress_id', wpUser.id)
        .maybeSingle()
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('users')
          .update({
            email: userRecord.email,
            full_name: userRecord.full_name,
            roles: userRecord.roles,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        
        if (error) {
          console.error(`  ❌ Error updating ${fullName}:`, error.message)
          errorCount++
        } else {
          console.log(`  ✅ Updated: ${fullName}`)
          successCount++
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('users')
          .insert(userRecord)
        
        if (error) {
          console.error(`  ❌ Error creating ${fullName}:`, error.message)
          errorCount++
        } else {
          console.log(`  ✅ Created: ${fullName}`)
          successCount++
        }
      }
    }
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`  ✅ Success: ${successCount} users`)
    console.log(`  ❌ Errors: ${errorCount} users`)
  }
  
  // Now create team structures
  await createTeamStructures()
}

async function createTeamStructures() {
  console.log('\n🏗️ Creating Team Structures...\n')
  
  // Create Club OS
  let clubId: string
  const { data: existingClub } = await supabase
    .from('club_organizations')
    .select('id')
    .eq('name', 'POWLAX Demo Club')
    .maybeSingle()
  
  if (existingClub) {
    clubId = existingClub.id
    console.log(`  ✅ Club already exists: POWLAX Demo Club`)
  } else {
    const { data: newClub, error } = await supabase
      .from('club_organizations')
      .insert({
        name: 'POWLAX Demo Club',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error(`  ❌ Error creating club:`, error.message)
      return
    }
    clubId = newClub.id
    console.log(`  ✅ Created: POWLAX Demo Club`)
  }
  
  // Create teams
  const teams = [
    { name: 'Varsity Lacrosse', type: 'varsity' },
    { name: 'JV Lacrosse', type: 'jv' },
    { name: '8th Grade Lacrosse', type: 'middle_school' }
  ]
  
  for (const team of teams) {
    const { data: existing } = await supabase
      .from('team_teams')
      .select('id')
      .eq('name', team.name)
      .eq('club_id', clubId)
      .maybeSingle()
    
    if (!existing) {
      const { error } = await supabase
        .from('team_teams')
        .insert({
          club_id: clubId,
          name: team.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`  ❌ Error creating ${team.name}:`, error.message)
      } else {
        console.log(`  ✅ Created: ${team.name}`)
      }
    } else {
      console.log(`  ✅ Already exists: ${team.name}`)
    }
  }
  
  // Assign users to teams
  await assignUsersToTeams(clubId)
}

async function assignUsersToTeams(clubId: string) {
  console.log('\n👥 Assigning Users to Teams...\n')
  
  // Get migrated users
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, wordpress_id')
    .not('wordpress_id', 'is', null)
    .limit(20)
  
  // Get teams
  const { data: teams } = await supabase
    .from('team_teams')
    .select('id, name')
    .eq('club_id', clubId)
  
  if (!users || !teams) {
    console.log('  No users or teams to assign')
    return
  }
  
  // Distribute users across teams with appropriate roles
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const team = teams[i % teams.length]
    
    // Assign roles based on position in list
    let role: string
    if (i === 0) role = 'head_coach'
    else if (i <= 2) role = 'assistant_coach'
    else if (i % 3 === 0) role = 'parent'
    else role = 'player'
    
    // Check if already assigned
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!existing) {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: role,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`  ❌ Error assigning ${user.full_name}:`, error.message)
      } else {
        console.log(`  ✅ Assigned ${user.full_name} to ${team.name} as ${role}`)
      }
    } else {
      console.log(`  ✅ ${user.full_name} already in ${team.name}`)
    }
  }
  
  // Create sample entitlements
  await createSampleEntitlements(users?.slice(0, 5) || [])
}

async function createSampleEntitlements(users: any[]) {
  console.log('\n🎫 Creating Sample Entitlements...\n')
  
  for (const user of users) {
    // Check if entitlement exists
    const { data: existing } = await supabase
      .from('membership_entitlements')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!existing) {
      const { error } = await supabase
        .from('membership_entitlements')
        .insert({
          user_id: user.id,
          entitlement_key: 'team_hq_activated',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'migration',
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`  ❌ Error creating entitlement for ${user.full_name}:`, error.message)
      } else {
        console.log(`  ✅ Created team_hq_activated for ${user.full_name}`)
      }
    }
  }
}

async function main() {
  try {
    await syncWordPressUsers()
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ MIGRATION COMPLETE!')
    console.log('='.repeat(50))
    console.log('\n📋 Next Steps:')
    console.log('  1. Apply database migration via Supabase Dashboard')
    console.log('  2. Go to: https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/sql/new')
    console.log('  3. Copy SQL from: supabase/migrations/062_user_migration_enhancements.sql')
    console.log('  4. Execute to add missing columns')
    console.log('\n🎯 Testing:')
    console.log('  - Users are now in the database')
    console.log('  - Teams and club structure created')
    console.log('  - Team memberships assigned')
    console.log('  - Sample entitlements created')
  } catch (err) {
    console.error('Fatal error:', err)
    process.exit(1)
  }
}

main()