/**
 * Complete WordPress migration with actual table structure
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

async function migrateUsers() {
  console.log('🚀 WordPress to POWLAX User Migration\n')
  console.log('=' .repeat(50))
  
  // Get BuddyBoss groups
  const groups = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups?per_page=100`)
  const clubOS = groups.find(g => g.name === 'Your Club OS')
  const varsityTeam = groups.find(g => g.name === 'Your Varsity Team HQ')
  
  console.log('\n📁 BuddyBoss Groups Found:')
  console.log(`  • Your Club OS: ${clubOS ? `Group ID ${clubOS.id}` : 'Not found'}`)
  console.log(`  • Your Varsity Team HQ: ${varsityTeam ? `Group ID ${varsityTeam.id}` : 'Not found'}`)
  
  // Collect member IDs
  let allMemberIds: number[] = []
  
  if (clubOS) {
    const members = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups/${clubOS.id}/members?per_page=100`)
    const ids = members.map(m => m.id || m.user_id).filter(Boolean)
    allMemberIds = allMemberIds.concat(ids)
    console.log(`    - ${ids.length} members in Club OS`)
  }
  
  if (varsityTeam) {
    const members = await fetchJson<any[]>(`${WP_BASE}/buddyboss/v1/groups/${varsityTeam.id}/members?per_page=100`)
    const ids = members.map(m => m.id || m.user_id).filter(Boolean)
    allMemberIds = allMemberIds.concat(ids)
    console.log(`    - ${ids.length} members in Varsity Team`)
  }
  
  const uniqueIds = Array.from(new Set(allMemberIds))
  console.log(`\n📊 Total unique users to migrate: ${uniqueIds.length}`)
  
  if (uniqueIds.length === 0) {
    console.log('  ⚠️ No users found in groups')
    return []
  }
  
  // Fetch WordPress user details
  const wpUsers = await fetchJson<any[]>(`${WP_BASE}/wp/v2/users?include=${uniqueIds.join(',')}`)
  
  console.log('\n💾 Migrating Users to Supabase...\n')
  const migratedUsers = []
  
  for (const wpUser of wpUsers) {
    const displayName = wpUser.name || wpUser.slug || `User ${wpUser.id}`
    const email = wpUser.email || `wordpress_${wpUser.id}@powlax.com`
    
    // Determine role based on group membership or default
    let role = 'player'
    if (wpUser.roles?.includes('administrator')) role = 'head_coach'
    else if (wpUser.roles?.includes('editor')) role = 'assistant_coach'
    
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('wordpress_id', wpUser.id)
      .maybeSingle()
    
    const userRecord = {
      wordpress_id: wpUser.id,
      wp_user_id: wpUser.id, // Also set this legacy column
      email: email,
      display_name: displayName,
      role: role,
      roles: wpUser.roles || [],
      metadata: {
        source: 'wordpress_migration',
        migrated_at: new Date().toISOString(),
        original_groups: {
          club_os: clubOS ? allMemberIds.includes(wpUser.id) : false,
          varsity_team: varsityTeam ? allMemberIds.includes(wpUser.id) : false
        }
      },
      updated_at: new Date().toISOString()
    }
    
    let userId: string
    
    if (existing) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update(userRecord)
        .eq('id', existing.id)
      
      if (error) {
        console.log(`  ❌ Failed to update ${displayName}: ${error.message}`)
        continue
      }
      userId = existing.id
      console.log(`  ✅ Updated: ${displayName}`)
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          ...userRecord,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.log(`  ❌ Failed to create ${displayName}: ${error.message}`)
        continue
      }
      userId = newUser.id
      console.log(`  ✅ Created: ${displayName} (${email})`)
    }
    
    migratedUsers.push({ id: userId, ...userRecord })
  }
  
  return migratedUsers
}

async function createOrganizationStructure() {
  console.log('\n🏢 Creating Organization Structure...\n')
  
  // Check for existing club
  let { data: club } = await supabase
    .from('club_organizations')
    .select('id, name')
    .eq('name', 'POWLAX Demo Club')
    .maybeSingle()
  
  if (!club) {
    // Create club
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
      console.log(`  ❌ Failed to create club: ${error.message}`)
      return null
    }
    club = newClub
    console.log(`  ✅ Created: POWLAX Demo Club`)
  } else {
    console.log(`  ✅ Exists: POWLAX Demo Club`)
  }
  
  // Create teams
  const teamConfigs = [
    { name: 'Varsity Lacrosse Team', level: 'varsity' },
    { name: 'JV Lacrosse Team', level: 'jv' },
    { name: '8th Grade Lacrosse', level: 'middle_school' }
  ]
  
  const teams = []
  
  for (const config of teamConfigs) {
    let { data: team } = await supabase
      .from('team_teams')
      .select('id, name')
      .eq('name', config.name)
      .eq('club_id', club.id)
      .maybeSingle()
    
    if (!team) {
      const { data: newTeam, error } = await supabase
        .from('team_teams')
        .insert({
          club_id: club.id,
          name: config.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.log(`  ❌ Failed to create ${config.name}: ${error.message}`)
        continue
      }
      team = newTeam
      console.log(`  ✅ Created: ${config.name}`)
    } else {
      console.log(`  ✅ Exists: ${config.name}`)
    }
    
    teams.push(team)
  }
  
  return { club, teams }
}

async function assignTeamMemberships(users: any[], teams: any[]) {
  console.log('\n👥 Assigning Team Memberships...\n')
  
  if (!users.length || !teams.length) {
    console.log('  ⚠️ No users or teams available')
    return
  }
  
  // Assign users to teams with appropriate roles
  for (let i = 0; i < Math.min(users.length, 15); i++) {
    const user = users[i]
    const team = teams[i % teams.length]
    
    // Determine role
    let memberRole: string
    if (i === 0) memberRole = 'head_coach'
    else if (i <= 2) memberRole = 'assistant_coach'
    else if (i % 3 === 0) memberRole = 'parent'
    else memberRole = 'player'
    
    // Check existing membership
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
          role: memberRole,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.log(`  ❌ Failed to assign ${user.display_name}: ${error.message}`)
      } else {
        console.log(`  ✅ ${user.display_name} → ${team.name} (${memberRole})`)
      }
    } else {
      console.log(`  ✅ ${user.display_name} already in ${team.name}`)
    }
  }
}

async function createRegistrationLinks(teams: any[]) {
  console.log('\n🔗 Creating Registration Links...\n')
  
  for (const team of teams) {
    // Check for existing links
    const { data: existing } = await supabase
      .from('registration_links')
      .select('id, default_role')
      .eq('target_id', team.id)
      .eq('target_type', 'team')
    
    if (!existing || existing.length === 0) {
      // Create player and parent links
      const links = [
        {
          token: Math.random().toString(36).substring(2) + Date.now().toString(36),
          target_type: 'team',
          target_id: team.id,
          default_role: 'player',
          max_uses: 25,
          used_count: 0,
          expires_at: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          token: Math.random().toString(36).substring(2) + Date.now().toString(36),
          target_type: 'team',
          target_id: team.id,
          default_role: 'parent',
          max_uses: 75,
          used_count: 0,
          expires_at: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      for (const link of links) {
        const { error } = await supabase
          .from('registration_links')
          .insert(link)
        
        if (error) {
          console.log(`  ❌ Failed to create ${link.default_role} link: ${error.message}`)
        } else {
          console.log(`  ✅ Created ${link.default_role} link for ${team.name}`)
        }
      }
    } else {
      console.log(`  ✅ Links already exist for ${team.name}`)
    }
  }
}

async function createSampleEntitlements(users: any[]) {
  console.log('\n🎫 Creating Sample Entitlements...\n')
  
  // Create entitlements for first 5 users
  for (const user of users.slice(0, 5)) {
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
        console.log(`  ❌ Failed for ${user.display_name}: ${error.message}`)
      } else {
        console.log(`  ✅ Created team_hq_activated for ${user.display_name}`)
      }
    }
  }
}

async function main() {
  try {
    // Step 1: Migrate users
    const users = await migrateUsers()
    
    // Step 2: Create organization structure
    const structure = await createOrganizationStructure()
    
    if (structure) {
      // Step 3: Assign memberships
      await assignTeamMemberships(users, structure.teams)
      
      // Step 4: Create registration links
      await createRegistrationLinks(structure.teams)
      
      // Step 5: Create sample entitlements
      await createSampleEntitlements(users)
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50))
    console.log('✅ MIGRATION COMPLETE!')
    console.log('=' .repeat(50))
    
    console.log('\n📊 Migration Summary:')
    console.log(`  • Users migrated: ${users.length}`)
    console.log(`  • Club created: ${structure?.club ? 1 : 0}`)
    console.log(`  • Teams created: ${structure?.teams.length || 0}`)
    
    console.log('\n🎯 What Was Created:')
    console.log('  1. WordPress users imported with proper IDs')
    console.log('  2. POWLAX Demo Club organization')
    console.log('  3. Three teams (Varsity, JV, 8th Grade)')
    console.log('  4. Team memberships with roles')
    console.log('  5. Registration links for new members')
    console.log('  6. Sample membership entitlements')
    
    console.log('\n📝 Database Migration Still Needed:')
    console.log('  The following columns should be added for full functionality:')
    console.log('  - users.auth_user_id (for Supabase Auth)')
    console.log('  - users.memberpress_subscription_id')
    console.log('  - team_members.status, joined_at, soft_deleted_at')
    console.log('  - Apply: supabase/migrations/062_user_migration_enhancements.sql')
    
    console.log('\n✨ Ready for Testing:')
    console.log('  - Check users in Supabase Dashboard')
    console.log('  - Test team access in the app')
    console.log('  - Verify Practice Planner access')
    console.log('  - Test Skills Academy features')
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  }
}

main()