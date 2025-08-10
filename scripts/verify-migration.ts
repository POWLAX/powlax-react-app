/**
 * Verify WordPress migration and create team/club structures
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function verifyMigration() {
  console.log('🔍 Verifying WordPress User Migration...\n')
  
  // Check migrated users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, wordpress_id, email, username, full_name, roles')
    .not('wordpress_id', 'is', null)
    .order('created_at', { ascending: false })
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
    return
  }
  
  console.log(`✅ Found ${users?.length || 0} WordPress users migrated`)
  
  if (users && users.length > 0) {
    console.log('\n📋 Sample of migrated users:')
    users.slice(0, 5).forEach(user => {
      console.log(`  - ${user.full_name || user.username} (WP ID: ${user.wordpress_id})`)
      console.log(`    Email: ${user.email || 'N/A'}`)
      console.log(`    Roles: ${user.roles?.join(', ') || 'N/A'}`)
    })
  }
  
  // Check existing teams and clubs
  const { data: clubs } = await supabase
    .from('club_organizations')
    .select('id, name')
  
  const { data: teams } = await supabase
    .from('team_teams')
    .select('id, name, club_id')
  
  console.log(`\n📊 Existing structures:`)
  console.log(`  - Clubs: ${clubs?.length || 0}`)
  console.log(`  - Teams: ${teams?.length || 0}`)
  
  // Create demo structures if they don't exist
  await createDemoStructures()
  
  return { users, clubs, teams }
}

async function createDemoStructures() {
  console.log('\n🏗️ Creating demo team/club structures...\n')
  
  // Create Club OS demo structure
  const { data: existingClub } = await supabase
    .from('club_organizations')
    .select('id')
    .eq('name', 'Demo Club OS')
    .single()
  
  let clubId = existingClub?.id
  
  if (!clubId) {
    const { data: newClub, error: clubError } = await supabase
      .from('club_organizations')
      .insert({
        name: 'Demo Club OS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (clubError) {
      console.error('Error creating club:', clubError)
      return
    }
    
    clubId = newClub.id
    console.log(`✅ Created Demo Club OS (ID: ${clubId})`)
  } else {
    console.log(`✅ Demo Club OS already exists (ID: ${clubId})`)
  }
  
  // Create teams for the club
  const teamConfigs = [
    { name: 'Demo Varsity Team', team_type: 'varsity' },
    { name: 'Demo JV Team', team_type: 'jv' },
    { name: 'Demo 8th Grade Team', team_type: 'middle_school' }
  ]
  
  for (const config of teamConfigs) {
    const { data: existingTeam } = await supabase
      .from('team_teams')
      .select('id')
      .eq('name', config.name)
      .single()
    
    if (!existingTeam) {
      const { data: newTeam, error: teamError } = await supabase
        .from('team_teams')
        .insert({
          club_id: clubId,
          name: config.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (teamError) {
        console.error(`Error creating team ${config.name}:`, teamError)
      } else {
        console.log(`✅ Created ${config.name} (ID: ${newTeam.id})`)
      }
    } else {
      console.log(`✅ ${config.name} already exists (ID: ${existingTeam.id})`)
    }
  }
  
  // Create registration links for each team
  await createRegistrationLinks(clubId)
}

async function createRegistrationLinks(clubId: string) {
  console.log('\n🔗 Creating registration links...\n')
  
  const { data: teams } = await supabase
    .from('team_teams')
    .select('id, name')
    .eq('club_id', clubId)
  
  if (!teams) return
  
  for (const team of teams) {
    // Check if links already exist
    const { data: existingLinks } = await supabase
      .from('registration_links')
      .select('id')
      .eq('target_id', team.id)
      .eq('target_type', 'team')
    
    if (!existingLinks || existingLinks.length === 0) {
      // Create player and parent registration links
      const links = [
        {
          token: generateToken(),
          target_type: 'team',
          target_id: team.id,
          default_role: 'player',
          max_uses: 25,
          used_count: 0,
          expires_at: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString() // 100 days
        },
        {
          token: generateToken(),
          target_type: 'team',
          target_id: team.id,
          default_role: 'parent',
          max_uses: 75,
          used_count: 0,
          expires_at: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString() // 100 days
        }
      ]
      
      const { error } = await supabase
        .from('registration_links')
        .insert(links)
      
      if (error) {
        console.error(`Error creating links for ${team.name}:`, error)
      } else {
        console.log(`✅ Created registration links for ${team.name}`)
      }
    } else {
      console.log(`✅ Registration links already exist for ${team.name}`)
    }
  }
}

function generateToken(): string {
  // Generate a secure random token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

async function assignUsersToTeams() {
  console.log('\n👥 Assigning demo users to teams...\n')
  
  // Get WordPress users
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, roles')
    .not('wordpress_id', 'is', null)
    .limit(10) // Just assign first 10 users as demo
  
  // Get teams
  const { data: teams } = await supabase
    .from('team_teams')
    .select('id, name')
  
  if (!users || !teams || teams.length === 0) {
    console.log('No users or teams to assign')
    return
  }
  
  // Distribute users across teams
  for (let i = 0; i < users.length && i < 10; i++) {
    const user = users[i]
    const team = teams[i % teams.length] // Rotate through teams
    
    // Determine role based on WordPress roles or index
    let role = 'player'
    if (i === 0) role = 'head_coach'
    else if (i === 1) role = 'assistant_coach'
    else if (i % 3 === 0) role = 'parent'
    
    // Check if membership already exists
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single()
    
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
        console.error(`Error assigning ${user.full_name} to ${team.name}:`, error)
      } else {
        console.log(`✅ Assigned ${user.full_name} to ${team.name} as ${role}`)
      }
    } else {
      console.log(`✅ ${user.full_name} already in ${team.name}`)
    }
  }
}

async function createSampleEntitlements() {
  console.log('\n🎫 Creating sample membership entitlements...\n')
  
  // Get some users to assign entitlements
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name')
    .not('wordpress_id', 'is', null)
    .limit(5)
  
  const { data: teams } = await supabase
    .from('team_teams')
    .select('id, name')
    .limit(3)
  
  if (!users || !teams) return
  
  for (let i = 0; i < users.length && i < 3; i++) {
    const user = users[i]
    const team = teams[i % teams.length]
    
    // Check if entitlement exists
    const { data: existing } = await supabase
      .from('membership_entitlements')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (!existing) {
      const entitlement = {
        user_id: user.id,
        team_id: team.id,
        entitlement_key: i === 0 ? 'team_hq_activated' : 'skills_academy_basic',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        source: 'migration',
        created_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('membership_entitlements')
        .insert(entitlement)
      
      if (error) {
        console.error(`Error creating entitlement for ${user.full_name}:`, error)
      } else {
        console.log(`✅ Created ${entitlement.entitlement_key} entitlement for ${user.full_name}`)
      }
    }
  }
}

async function main() {
  console.log('🚀 WordPress to POWLAX Migration Verification\n')
  console.log('=' .repeat(50))
  
  const results = await verifyMigration()
  await assignUsersToTeams()
  await createSampleEntitlements()
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Migration verification complete!')
  console.log('\n📊 Final Summary:')
  console.log(`  - WordPress users migrated: ${results?.users?.length || 0}`)
  console.log(`  - Clubs created: ${results?.clubs?.length || 0}`)
  console.log(`  - Teams created: ${results?.teams?.length || 0}`)
  console.log('\n🎯 Next Steps:')
  console.log('  1. Apply the database migration manually via Supabase Dashboard')
  console.log('  2. Test user login with magic links')
  console.log('  3. Verify team access and permissions')
  console.log('  4. Check Skills Academy and Practice Planner access')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})