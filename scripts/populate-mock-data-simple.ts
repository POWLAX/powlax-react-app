#!/usr/bin/env npx tsx
/**
 * Simplified script to populate database with mock data for Management interface
 * Works with actual database schema - no extra columns needed
 * All mock data is marked with (MOCK) in display names
 */

import { createClient } from '@supabase/supabase-js'

// Hardcoded connection for simplicity
const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Mock data generators
const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Maria']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

async function populateMockUsers() {
  console.log('👥 Adding mock users...')
  
  const mockUsers = []
  const roles = [
    ['administrator'],
    ['coach', 'head_coach'],
    ['coach', 'assistant_coach'],
    ['player'],
    ['parent'],
    ['player', 'team_captain']
  ]
  
  for (let i = 1; i <= 15; i++) {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const displayName = `${firstName} ${lastName} (MOCK)`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.mock${i}@example.com`
    const userRoles = randomElement(roles)
    
    mockUsers.push({
      email,
      display_name: displayName,
      roles: userRoles,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Try to insert, ignore duplicates
  for (const user of mockUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (!error) {
      console.log(`  ✅ Created user: ${user.email}`)
    } else if (error.code === '23505') {
      console.log(`  ⏭️  User exists: ${user.email}`)
    } else {
      console.log(`  ❌ Error creating ${user.email}:`, error.message)
    }
  }
  
  // Get all users for return
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
  
  return allUsers || []
}

async function populateMockClubs() {
  console.log('🏢 Adding mock clubs...')
  
  const clubNames = [
    'Premier Lacrosse Club (MOCK)',
    'City Youth Lacrosse (MOCK)',
    'Elite Academy (MOCK)'
  ]
  
  const mockClubs = []
  for (const name of clubNames) {
    mockClubs.push({
      name,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Try to insert, ignore duplicates
  for (const club of mockClubs) {
    const { data, error } = await supabase
      .from('clubs')
      .insert(club)
      .select()
      .single()
    
    if (!error) {
      console.log(`  ✅ Created club: ${club.name}`)
    } else if (error.code === '23505') {
      console.log(`  ⏭️  Club exists: ${club.name}`)
    } else {
      console.log(`  ❌ Error creating ${club.name}:`, error.message)
    }
  }
  
  // Get all clubs for return
  const { data: allClubs } = await supabase
    .from('clubs')
    .select('*')
  
  return allClubs || []
}

async function populateMockTeams(clubs: any[]) {
  console.log('🏈 Adding mock teams...')
  
  const teamTypes = [
    'U10 Lions (MOCK)',
    'U12 Tigers (MOCK)',
    'U14 Hawks (MOCK)',
    'U16 Eagles (MOCK)',
    'Varsity Warriors (MOCK)',
    'JV Knights (MOCK)'
  ]
  
  const mockTeams = []
  for (const club of clubs) {
    // Add 2-3 teams per club
    const numTeams = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < numTeams && i < teamTypes.length; i++) {
      mockTeams.push({
        name: teamTypes[i],
        club_id: club.id,
        age_group: teamTypes[i].split(' ')[0],
        season: '2025 Spring',
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }
  
  // Try to insert teams
  for (const team of mockTeams) {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()
    
    if (!error) {
      console.log(`  ✅ Created team: ${team.name}`)
    } else if (error.code === '23505') {
      console.log(`  ⏭️  Team exists: ${team.name}`)
    } else {
      console.log(`  ❌ Error creating ${team.name}:`, error.message)
    }
  }
  
  // Get all teams for return
  const { data: allTeams } = await supabase
    .from('teams')
    .select('*')
  
  return allTeams || []
}

async function populateMockTeamMembers(teams: any[], users: any[]) {
  console.log('👥 Adding mock team members...')
  
  const coaches = users.filter(u => u.roles?.includes('coach'))
  const players = users.filter(u => u.roles?.includes('player'))
  
  for (const team of teams.slice(0, 5)) { // Just do first 5 teams
    // Add 1 coach per team
    if (coaches.length > 0) {
      const coach = coaches[Math.floor(Math.random() * coaches.length)]
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: coach.id,
          role: 'coach',
          position: 'Head Coach',
          joined_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        })
      
      if (!error) {
        console.log(`  ✅ Added coach to ${team.name}`)
      }
    }
    
    // Add 5-10 players per team
    const numPlayers = 5 + Math.floor(Math.random() * 6)
    for (let i = 0; i < numPlayers && i < players.length; i++) {
      const player = players[i]
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: player.id,
          role: 'player',
          position: randomElement(['Attack', 'Midfield', 'Defense', 'Goalie']),
          jersey_number: i + 1,
          joined_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        })
      
      if (!error) {
        console.log(`  ✅ Added player ${i + 1} to ${team.name}`)
      }
    }
  }
}

async function populateMockMagicLinks(users: any[]) {
  console.log('🔗 Adding mock magic links...')
  
  for (let i = 0; i < Math.min(8, users.length); i++) {
    const user = users[i]
    const status = randomElement(['active', 'expired', 'used'])
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    const { error } = await supabase
      .from('magic_links')
      .insert({
        user_id: user.id,
        token: `mock-token-${Math.random().toString(36).substring(2, 15)}`,
        email: user.email,
        expires_at: new Date(createdAt.getTime() + (status === 'expired' ? -1 : 1) * 24 * 60 * 60 * 1000).toISOString(),
        created_at: createdAt.toISOString(),
        used_at: status === 'used' ? new Date(createdAt.getTime() + 30 * 60 * 1000).toISOString() : null,
        redirect_to: randomElement(['/dashboard', '/practice-planner', '/academy', '/teams'])
      })
    
    if (!error) {
      console.log(`  ✅ Created magic link for ${user.email}`)
    }
  }
}

async function populateMockMembershipProducts() {
  console.log('💳 Adding mock membership products...')
  
  const products = [
    { 
      id: 'mock_skills_academy_monthly',
      name: 'Skills Academy Monthly (MOCK)',
      price: 29.99,
      billing_period: 'monthly'
    },
    {
      id: 'mock_coach_essentials',
      name: 'Coach Essentials Kit (MOCK)',
      price: 19.99,
      billing_period: 'monthly'
    },
    {
      id: 'mock_team_hq_structure',
      name: 'Team HQ Structure (MOCK)',
      price: 99.99,
      billing_period: 'monthly'
    }
  ]
  
  for (const product of products) {
    const { error } = await supabase
      .from('membership_products')
      .insert(product)
    
    if (!error) {
      console.log(`  ✅ Created product: ${product.name}`)
    } else if (error.code !== '23505') { // Ignore duplicates
      console.log(`  ⚠️  Product issue: ${product.name}`)
    }
  }
  
  // Get all products for return
  const { data: allProducts } = await supabase
    .from('membership_products')
    .select('*')
  
  return allProducts || []
}

async function populateMockMembershipEntitlements(users: any[], products: any[]) {
  console.log('🎫 Adding mock membership entitlements...')
  
  // Give random users random products
  for (let i = 0; i < Math.min(10, users.length); i++) {
    const user = users[i]
    const product = randomElement(products)
    
    if (!product) continue
    
    const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
    
    const { error } = await supabase
      .from('membership_entitlements')
      .insert({
        user_id: user.id,
        product_id: product.id,
        status: randomElement(['active', 'expired', 'cancelled']),
        started_at: startDate.toISOString(),
        expires_at: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    
    if (!error) {
      console.log(`  ✅ Gave ${product.name} to ${user.email}`)
    }
  }
}

async function main() {
  console.log('🚀 Starting mock data population for Management interface')
  console.log('📊 All mock data will be marked with (MOCK) suffix')
  console.log('')
  
  try {
    // Populate data in dependency order
    const users = await populateMockUsers()
    console.log(`  Total users in database: ${users.length}`)
    
    const clubs = await populateMockClubs()
    console.log(`  Total clubs in database: ${clubs.length}`)
    
    const teams = await populateMockTeams(clubs)
    console.log(`  Total teams in database: ${teams.length}`)
    
    await populateMockTeamMembers(teams, users)
    
    await populateMockMagicLinks(users)
    
    const products = await populateMockMembershipProducts()
    await populateMockMembershipEntitlements(users, products)
    
    console.log('')
    console.log('✅ Mock data population complete!')
    console.log('🎯 You can now view this data in the Management interface')
    console.log('   All mock data is clearly marked with (MOCK) suffix')
    console.log('')
    console.log('📊 Data now available in Management tabs:')
    console.log('   - Users tab: Real and mock users')
    console.log('   - Clubs tab: Real and mock clubs')
    console.log('   - Team HQ tab: Real and mock teams')
    console.log('   - Magic Links tab: Mock magic links')
    console.log('   - Memberpress Sync: Mock membership data')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()