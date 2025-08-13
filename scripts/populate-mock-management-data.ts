#!/usr/bin/env npx tsx
/**
 * Script to populate database with comprehensive mock data for Management interface
 * All mock data is marked with (MOCK) to distinguish from real data
 * Run with: npx tsx scripts/populate-mock-management-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mock data generators
const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Maria', 'William', 'Patricia', 'Richard', 'Linda', 'Thomas']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Wilson', 'Moore', 'Jackson']
const teamNames = ['Lions', 'Tigers', 'Hawks', 'Eagles', 'Wolves', 'Panthers', 'Bears', 'Warriors', 'Knights', 'Spartans']
const ageGroups = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Varsity', 'JV']
const clubNames = ['Premier Lacrosse Club', 'City Youth Lacrosse', 'Elite Academy', 'County Lacrosse Association', 'Regional Sports Club']

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
}

async function populateMockUsers() {
  console.log('👥 Populating mock users...')
  
  const mockUsers = []
  const roles = [
    ['administrator'],
    ['coach', 'head_coach'],
    ['coach', 'assistant_coach'],
    ['player'],
    ['parent'],
    ['player', 'team_captain']
  ]
  
  for (let i = 0; i < 20; i++) {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const displayName = `${firstName} ${lastName} (MOCK)`
    const email = generateEmail(firstName, lastName).replace('@', `${i}@`)
    const userRoles = randomElement(roles)
    
    mockUsers.push({
      email,
      display_name: displayName,
      roles: userRoles,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_mock: true
    })
  }
  
  const { data, error } = await supabase
    .from('users')
    .upsert(mockUsers, { onConflict: 'email' })
    .select()
  
  if (error) {
    console.error('❌ Error populating users:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock users`)
  return data || []
}

async function populateMockClubs() {
  console.log('🏢 Populating mock clubs...')
  
  const mockClubs = clubNames.map((name, index) => ({
    name: `${name} (MOCK)`,
    description: `A premier lacrosse organization focused on player development and competitive excellence.`,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      tier: index === 0 ? 'club_os_command' : index === 1 ? 'club_os_growth' : 'club_os_foundation',
      features: {
        advanced_analytics: index < 2,
        custom_branding: index === 0,
        api_access: index === 0
      }
    },
    is_mock: true
  }))
  
  const { data, error } = await supabase
    .from('clubs')
    .upsert(mockClubs, { onConflict: 'name' })
    .select()
  
  if (error) {
    console.error('❌ Error populating clubs:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock clubs`)
  return data || []
}

async function populateMockTeams(clubs: any[]) {
  console.log('🏈 Populating mock teams...')
  
  const mockTeams = []
  
  for (const club of clubs) {
    for (let i = 0; i < 3; i++) {
      const ageGroup = randomElement(ageGroups)
      const teamName = randomElement(teamNames)
      
      mockTeams.push({
        name: `${ageGroup} ${teamName} (MOCK)`,
        club_id: club.id,
        age_group: ageGroup,
        season: '2025 Spring',
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        settings: {
          tier: i === 0 ? 'team_hq_activated' : i === 1 ? 'team_hq_leadership' : 'team_hq_structure',
          max_players: 25,
          academy_slots_used: Math.floor(Math.random() * 25)
        },
        is_mock: true
      })
    }
  }
  
  const { data, error } = await supabase
    .from('teams')
    .upsert(mockTeams, { onConflict: 'name' })
    .select()
  
  if (error) {
    console.error('❌ Error populating teams:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock teams`)
  return data || []
}

async function populateMockTeamMembers(teams: any[], users: any[]) {
  console.log('👥 Populating mock team members...')
  
  const mockMembers = []
  const coaches = users.filter(u => u.roles?.includes('coach'))
  const players = users.filter(u => u.roles?.includes('player'))
  
  for (const team of teams) {
    // Add 1-2 coaches per team
    const teamCoaches = coaches.slice(0, 2)
    for (const coach of teamCoaches) {
      mockMembers.push({
        team_id: team.id,
        user_id: coach.id,
        role: 'coach',
        position: 'Head Coach',
        jersey_number: null,
        joined_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_mock: true
      })
    }
    
    // Add 10-20 players per team
    const numPlayers = 10 + Math.floor(Math.random() * 10)
    const teamPlayers = players.slice(0, numPlayers)
    for (let i = 0; i < teamPlayers.length; i++) {
      mockMembers.push({
        team_id: team.id,
        user_id: teamPlayers[i].id,
        role: 'player',
        position: randomElement(['Attack', 'Midfield', 'Defense', 'Goalie']),
        jersey_number: i + 1,
        joined_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_mock: true
      })
    }
  }
  
  const { data, error } = await supabase
    .from('team_members')
    .upsert(mockMembers, { onConflict: 'team_id,user_id' })
    .select()
  
  if (error) {
    console.error('❌ Error populating team members:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock team members`)
  return data || []
}

async function populateMockMagicLinks(users: any[]) {
  console.log('🔗 Populating mock magic links...')
  
  const mockLinks = []
  const statuses = ['active', 'expired', 'used']
  
  for (let i = 0; i < 10; i++) {
    const user = randomElement(users)
    const status = randomElement(statuses)
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    mockLinks.push({
      user_id: user.id,
      token: `mock-token-${Math.random().toString(36).substring(2, 15)}`,
      email: user.email,
      expires_at: new Date(createdAt.getTime() + (status === 'expired' ? -1 : 1) * 24 * 60 * 60 * 1000).toISOString(),
      created_at: createdAt.toISOString(),
      used_at: status === 'used' ? new Date(createdAt.getTime() + 30 * 60 * 1000).toISOString() : null,
      redirect_to: randomElement(['/dashboard', '/practice-planner', '/academy', '/teams']),
      metadata: {
        source: 'admin_generated',
        capability_routing: true,
        note: '(MOCK) Test magic link'
      },
      is_mock: true
    })
  }
  
  const { data, error } = await supabase
    .from('magic_links')
    .upsert(mockLinks, { onConflict: 'token' })
    .select()
  
  if (error) {
    console.error('❌ Error populating magic links:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock magic links`)
  return data || []
}

async function populateMockMembershipProducts() {
  console.log('💳 Populating mock membership products...')
  
  const products = [
    { 
      id: 'skills_academy_monthly',
      name: 'Skills Academy Monthly (MOCK)',
      description: 'Full access to Skills Academy with monthly billing',
      price: 29.99,
      billing_period: 'monthly',
      capabilities: ['full_academy', 'drills', 'workouts'],
      is_mock: true
    },
    {
      id: 'skills_academy_annual',
      name: 'Skills Academy Annual (MOCK)',
      description: 'Full access to Skills Academy with annual billing',
      price: 299.99,
      billing_period: 'annual',
      capabilities: ['full_academy', 'drills', 'workouts'],
      is_mock: true
    },
    {
      id: 'coach_essentials_kit',
      name: 'Coach Essentials Kit (MOCK)',
      description: 'Practice planner and basic coaching resources',
      price: 19.99,
      billing_period: 'monthly',
      capabilities: ['practice_planner', 'resources'],
      is_mock: true
    },
    {
      id: 'coach_confidence_kit',
      name: 'Coach Confidence Kit (MOCK)',
      description: 'Advanced coaching tools with custom content',
      price: 39.99,
      billing_period: 'monthly',
      capabilities: ['practice_planner', 'custom_content', 'training'],
      is_mock: true
    },
    {
      id: 'team_hq_structure',
      name: 'Team HQ Structure (MOCK)',
      description: 'Basic team management with roster and scheduling',
      price: 99.99,
      billing_period: 'monthly',
      capabilities: ['team_management', 'roster', 'basic_scheduling'],
      is_mock: true
    },
    {
      id: 'team_hq_leadership',
      name: 'Team HQ Leadership (MOCK)',
      description: 'Advanced team management with playbook access',
      price: 149.99,
      billing_period: 'monthly',
      capabilities: ['team_management', 'playbook', 'advanced_scheduling'],
      is_mock: true
    },
    {
      id: 'club_os_foundation',
      name: 'Club OS Foundation (MOCK)',
      description: 'Basic club management for small organizations',
      price: 299.99,
      billing_period: 'monthly',
      capabilities: ['basic_settings', 'team_overview', 'billing_view'],
      is_mock: true
    }
  ]
  
  const { data, error } = await supabase
    .from('membership_products')
    .upsert(products, { onConflict: 'id' })
    .select()
  
  if (error) {
    console.error('❌ Error populating membership products:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock membership products`)
  return data || []
}

async function populateMockMembershipEntitlements(users: any[], products: any[]) {
  console.log('🎫 Populating mock membership entitlements...')
  
  const mockEntitlements = []
  
  for (let i = 0; i < Math.min(15, users.length); i++) {
    const user = users[i]
    const product = randomElement(products)
    const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
    
    mockEntitlements.push({
      user_id: user.id,
      product_id: product.id,
      status: randomElement(['active', 'expired', 'cancelled']),
      started_at: startDate.toISOString(),
      expires_at: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        source: 'mock_data',
        note: '(MOCK) Test membership'
      },
      is_mock: true
    })
  }
  
  const { data, error } = await supabase
    .from('membership_entitlements')
    .upsert(mockEntitlements, { onConflict: 'user_id,product_id' })
    .select()
  
  if (error) {
    console.error('❌ Error populating membership entitlements:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock membership entitlements`)
  return data || []
}

async function populateMockUserSessions(users: any[]) {
  console.log('🔐 Populating mock user sessions...')
  
  const mockSessions = []
  
  for (let i = 0; i < Math.min(10, users.length); i++) {
    const user = users[i]
    const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    
    mockSessions.push({
      user_id: user.id,
      token: `session-${Math.random().toString(36).substring(2, 15)}`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: randomElement([
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/14.0'
      ]),
      created_at: createdAt.toISOString(),
      last_activity: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        device: randomElement(['iPhone', 'Desktop', 'Android']),
        location: randomElement(['New York', 'Los Angeles', 'Chicago', 'Houston']),
        note: '(MOCK) Test session'
      },
      is_mock: true
    })
  }
  
  const { data, error } = await supabase
    .from('user_sessions')
    .upsert(mockSessions, { onConflict: 'token' })
    .select()
  
  if (error) {
    console.error('❌ Error populating user sessions:', error)
    return []
  }
  
  console.log(`✅ Created ${data?.length || 0} mock user sessions`)
  return data || []
}

async function populateMockPointsData(users: any[]) {
  console.log('🏆 Populating mock points and badges...')
  
  // Mock point wallets
  const mockWallets = []
  const players = users.filter(u => u.roles?.includes('player'))
  
  for (const player of players.slice(0, 10)) {
    mockWallets.push({
      user_id: player.id,
      currency_id: 'academy_points',
      balance: Math.floor(Math.random() * 1000),
      lifetime_earned: Math.floor(Math.random() * 2000),
      last_transaction_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_mock: true
    })
  }
  
  const { data: wallets, error: walletsError } = await supabase
    .from('user_points_wallets')
    .upsert(mockWallets, { onConflict: 'user_id,currency_id' })
    .select()
  
  if (walletsError) {
    console.error('❌ Error populating point wallets:', walletsError)
  } else {
    console.log(`✅ Created ${wallets?.length || 0} mock point wallets`)
  }
  
  // Mock badges
  const mockBadges = []
  const badgeTypes = ['first_drill', 'week_streak', 'skill_master', 'team_player', 'dedication']
  
  for (const player of players.slice(0, 8)) {
    for (let i = 0; i < 2; i++) {
      mockBadges.push({
        user_id: player.id,
        badge_id: randomElement(badgeTypes),
        earned_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          note: '(MOCK) Test badge achievement'
        },
        is_mock: true
      })
    }
  }
  
  const { data: badges, error: badgesError } = await supabase
    .from('user_badges')
    .upsert(mockBadges, { onConflict: 'user_id,badge_id' })
    .select()
  
  if (badgesError) {
    console.error('❌ Error populating badges:', badgesError)
  } else {
    console.log(`✅ Created ${badges?.length || 0} mock badges`)
  }
}

async function cleanupOldMockData() {
  console.log('🧹 Cleaning up old mock data...')
  
  const tables = [
    'user_badges',
    'user_points_wallets',
    'user_sessions',
    'membership_entitlements',
    'magic_links',
    'team_members',
    'teams',
    'clubs',
    'users'
  ]
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('is_mock', true)
    
    if (error) {
      console.log(`⚠️  Could not clean ${table}:`, error.message)
    }
  }
  
  console.log('✅ Cleanup complete')
}

async function main() {
  console.log('🚀 Starting mock data population for Management interface')
  console.log('📊 All mock data will be marked with (MOCK) suffix')
  console.log('')
  
  try {
    // Clean up old mock data first
    await cleanupOldMockData()
    
    // Populate data in dependency order
    const users = await populateMockUsers()
    const clubs = await populateMockClubs()
    const teams = await populateMockTeams(clubs)
    await populateMockTeamMembers(teams, users)
    await populateMockMagicLinks(users)
    const products = await populateMockMembershipProducts()
    await populateMockMembershipEntitlements(users, products)
    await populateMockUserSessions(users)
    await populateMockPointsData(users)
    
    console.log('')
    console.log('✅ Mock data population complete!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${users.length} mock records`)
    console.log(`   - Clubs: ${clubs.length} mock records`)
    console.log(`   - Teams: ${teams.length} mock records`)
    console.log(`   - Plus team members, magic links, memberships, and more`)
    console.log('')
    console.log('🎯 You can now view this data in the Management interface')
    console.log('   All mock data is clearly marked with (MOCK) suffix')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()