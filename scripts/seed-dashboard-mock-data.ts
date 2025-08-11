#!/usr/bin/env npx tsx
/**
 * DASHBOARD MOCK DATA SEEDER
 * Seeds Supabase with mock data for all dashboard types
 * Tables marked with (MOCK) suffix will be populated with test data
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

// Define mock user types
const mockUsers = [
  {
    id: 'mock-player-1',
    email: 'player1@mock.com',
    username: 'MockPlayer1',
    first_name: 'Johnny',
    last_name: 'Player (MOCK)',
    role: 'player',
    roles: ['player'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-player-2',
    email: 'player2@mock.com',
    username: 'MockPlayer2',
    first_name: 'Sarah',
    last_name: 'Athlete (MOCK)',
    role: 'player',
    roles: ['player'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-coach-1',
    email: 'coach@mock.com',
    username: 'MockCoach',
    first_name: 'Mike',
    last_name: 'Coach (MOCK)',
    role: 'team_coach',
    roles: ['team_coach'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-parent-1',
    email: 'parent@mock.com',
    username: 'MockParent',
    first_name: 'Lisa',
    last_name: 'Parent (MOCK)',
    role: 'parent',
    roles: ['parent'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-director-1',
    email: 'director@mock.com',
    username: 'MockDirector',
    first_name: 'Robert',
    last_name: 'Director (MOCK)',
    role: 'club_director',
    roles: ['club_director'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-admin-1',
    email: 'admin@mock.com',
    username: 'MockAdmin',
    first_name: 'System',
    last_name: 'Admin (MOCK)',
    role: 'administrator',
    roles: ['administrator'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock teams data
const mockTeams = [
  {
    id: 100,
    name: 'Varsity Eagles (MOCK)',
    sport: 'lacrosse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    club_id: 1
  },
  {
    id: 101,
    name: 'JV Hawks (MOCK)',
    sport: 'lacrosse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    club_id: 1
  },
  {
    id: 102,
    name: 'U12 Lightning (MOCK)',
    sport: 'lacrosse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    club_id: 1
  }
]

// Mock team members
const mockTeamMembers = [
  {
    team_id: 100,
    user_id: 'mock-player-1',
    role: 'player',
    joined_at: new Date().toISOString()
  },
  {
    team_id: 100,
    user_id: 'mock-player-2',
    role: 'player',
    joined_at: new Date().toISOString()
  },
  {
    team_id: 100,
    user_id: 'mock-coach-1',
    role: 'coach',
    joined_at: new Date().toISOString()
  }
]

// Mock points wallets
const mockPointsWallets = [
  {
    user_id: 'mock-player-1',
    currency_id: 'attack_tokens',
    balance: 450,
    lifetime_earned: 850,
    last_updated: new Date().toISOString()
  },
  {
    user_id: 'mock-player-1',
    currency_id: 'defense_dollars',
    balance: 320,
    lifetime_earned: 520,
    last_updated: new Date().toISOString()
  },
  {
    user_id: 'mock-player-1',
    currency_id: 'midfield_medals',
    balance: 280,
    lifetime_earned: 380,
    last_updated: new Date().toISOString()
  },
  {
    user_id: 'mock-player-2',
    currency_id: 'attack_tokens',
    balance: 380,
    lifetime_earned: 580,
    last_updated: new Date().toISOString()
  },
  {
    user_id: 'mock-player-2',
    currency_id: 'defense_dollars',
    balance: 290,
    lifetime_earned: 390,
    last_updated: new Date().toISOString()
  }
]

// Mock skills academy progress
const mockSkillsProgress = [
  {
    user_id: 'mock-player-1',
    workout_id: 23,
    completed: true,
    completion_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    perfect_score: false,
    points_earned: 150,
    time_spent: 1200
  },
  {
    user_id: 'mock-player-1',
    workout_id: 24,
    completed: true,
    completion_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    perfect_score: true,
    points_earned: 200,
    time_spent: 1500
  },
  {
    user_id: 'mock-player-1',
    workout_id: 25,
    completed: false,
    completion_date: null,
    perfect_score: false,
    points_earned: 0,
    time_spent: 300
  }
]

// Mock badges
const mockUserBadges = [
  {
    user_id: 'mock-player-1',
    badge_id: 'week_warrior',
    badge_name: 'Week Warrior',
    badge_description: 'Complete 7 workouts in a week',
    earned_at: new Date(Date.now() - 86400000).toISOString(),
    points_value: 100
  },
  {
    user_id: 'mock-player-1',
    badge_id: 'wall_ball_master',
    badge_name: 'Wall Ball Master',
    badge_description: 'Complete all wall ball workouts',
    earned_at: new Date(Date.now() - 172800000).toISOString(),
    points_value: 200
  },
  {
    user_id: 'mock-player-2',
    badge_id: 'first_timer',
    badge_name: 'First Timer',
    badge_description: 'Complete your first workout',
    earned_at: new Date(Date.now() - 259200000).toISOString(),
    points_value: 50
  }
]

// Mock practices
const mockPractices = [
  {
    id: 1000,
    team_id: 100,
    title: 'Offensive Drills Practice (MOCK)',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    start_time: '15:30:00',
    end_time: '17:00:00',
    location: 'Field A',
    notes: 'Focus on offensive positioning and shooting accuracy',
    created_by: 'mock-coach-1',
    created_at: new Date().toISOString()
  },
  {
    id: 1001,
    team_id: 100,
    title: 'Defensive Skills Practice (MOCK)',
    date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    start_time: '15:30:00',
    end_time: '17:00:00',
    location: 'Field B',
    notes: 'Work on defensive footwork and stick skills',
    created_by: 'mock-coach-1',
    created_at: new Date().toISOString()
  }
]

// Mock family relationships
const mockFamilyAccounts = [
  {
    id: 100,
    account_name: 'The Player Family (MOCK)',
    primary_parent_id: 'mock-parent-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockParentChildRelationships = [
  {
    parent_id: 'mock-parent-1',
    child_id: 'mock-player-1',
    relationship_type: 'parent',
    created_at: new Date().toISOString()
  }
]

// Mock point transactions
const mockPointTransactions = [
  {
    user_id: 'mock-player-1',
    currency_id: 'attack_tokens',
    amount: 50,
    transaction_type: 'earned',
    source: 'workout_completion',
    source_id: '23',
    description: 'Completed Wall Ball Workout',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    user_id: 'mock-player-1',
    currency_id: 'defense_dollars',
    amount: 30,
    transaction_type: 'earned',
    source: 'drill_completion',
    source_id: '45',
    description: 'Perfect drill execution',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

async function seedMockData() {
  console.log('🚀 Starting mock data seeding...\n')

  try {
    // 1. Insert mock users
    console.log('👤 Creating mock users...')
    for (const user of mockUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating user ${user.username}:`, error.message)
      } else {
        console.log(`✅ Created/updated user: ${user.username} (${user.role})`)
      }
    }

    // 2. Insert mock teams
    console.log('\n🏆 Creating mock teams...')
    for (const team of mockTeams) {
      const { error } = await supabase
        .from('teams')
        .upsert(team, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating team ${team.name}:`, error.message)
      } else {
        console.log(`✅ Created/updated team: ${team.name}`)
      }
    }

    // 3. Insert team members
    console.log('\n👥 Creating team memberships...')
    for (const member of mockTeamMembers) {
      const { error } = await supabase
        .from('team_members')
        .upsert(member, { onConflict: 'team_id,user_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating team member:`, error.message)
      } else {
        console.log(`✅ Added user ${member.user_id} to team ${member.team_id}`)
      }
    }

    // 4. Insert points wallets
    console.log('\n💰 Creating points wallets...')
    for (const wallet of mockPointsWallets) {
      const { error } = await supabase
        .from('user_points_wallets')
        .upsert(wallet, { onConflict: 'user_id,currency_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating wallet:`, error.message)
      } else {
        console.log(`✅ Created wallet: ${wallet.user_id} - ${wallet.currency_id}: ${wallet.balance}`)
      }
    }

    // 5. Insert skills academy progress
    console.log('\n📊 Creating skills academy progress...')
    for (const progress of mockSkillsProgress) {
      const { error } = await supabase
        .from('skills_academy_user_progress')
        .upsert(progress, { onConflict: 'user_id,workout_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating progress:`, error.message)
      } else {
        console.log(`✅ Created progress: User ${progress.user_id} - Workout ${progress.workout_id}`)
      }
    }

    // 6. Insert user badges
    console.log('\n🏅 Creating user badges...')
    for (const badge of mockUserBadges) {
      const { error } = await supabase
        .from('user_badges')
        .upsert(badge, { onConflict: 'user_id,badge_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating badge:`, error.message)
      } else {
        console.log(`✅ Awarded badge: ${badge.badge_name} to ${badge.user_id}`)
      }
    }

    // 7. Insert practices
    console.log('\n📅 Creating practice schedules...')
    for (const practice of mockPractices) {
      const { error } = await supabase
        .from('practices')
        .upsert(practice, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating practice:`, error.message)
      } else {
        console.log(`✅ Created practice: ${practice.title}`)
      }
    }

    // 8. Insert family accounts
    console.log('\n👨‍👩‍👧 Creating family relationships...')
    for (const family of mockFamilyAccounts) {
      const { error } = await supabase
        .from('family_accounts')
        .upsert(family, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating family account:`, error.message)
      } else {
        console.log(`✅ Created family: ${family.account_name}`)
      }
    }

    // 9. Insert parent-child relationships
    for (const relationship of mockParentChildRelationships) {
      const { error } = await supabase
        .from('parent_child_relationships')
        .upsert(relationship, { onConflict: 'parent_id,child_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating relationship:`, error.message)
      } else {
        console.log(`✅ Linked parent ${relationship.parent_id} to child ${relationship.child_id}`)
      }
    }

    // 10. Insert point transactions
    console.log('\n💸 Creating point transaction history...')
    for (const transaction of mockPointTransactions) {
      const { error } = await supabase
        .from('points_transactions_powlax')
        .insert(transaction)
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating transaction:`, error.message)
      } else {
        console.log(`✅ Created transaction: ${transaction.amount} ${transaction.currency_id}`)
      }
    }

    console.log('\n✨ Mock data seeding complete!')
    console.log('\n📝 Test accounts created:')
    console.log('  Player: player1@mock.com')
    console.log('  Coach: coach@mock.com')
    console.log('  Parent: parent@mock.com')
    console.log('  Director: director@mock.com')
    console.log('  Admin: admin@mock.com')
    console.log('\nAll users have "(MOCK)" suffix in their last names for easy identification.')

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Run the seeding
seedMockData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })