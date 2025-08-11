#!/usr/bin/env npx tsx
/**
 * PATRICK'S DASHBOARD DATA SEEDER (FIXED)
 * Sets up Patrick's admin account with children and gamification data
 * Fixed based on actual table schemas
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

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

// Patrick's actual admin account ID from the database
const PATRICK_ADMIN_ID = '523f2768-6404-439c-a429-f9eb6736aa17'

// Generate IDs for children accounts
const childIds = {
  child1: randomUUID(),
  child2: randomUUID(),
  child3: randomUUID()
}

// Get the existing club ID (POWLAX Demo Club)
const DEMO_CLUB_ID = '857c14ac-568d-4421-9855-604230eb4846'

async function seedPatrickDashboardData() {
  console.log('🚀 Starting Patrick\'s Dashboard Data Seeding (FIXED)...\n')

  try {
    // 1. First, update Patrick's account to have family admin type and parent role
    console.log('👤 Updating Patrick\'s admin account...')
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        account_type: 'family_admin',
        first_name: 'Patrick',
        last_name: 'Chapla',
        display_name: 'Patrick Chapla (Admin)',
        club_id: DEMO_CLUB_ID,
        roles: ['administrator', 'parent'] // Add parent role so he can see children
      })
      .eq('id', PATRICK_ADMIN_ID)
    
    if (updateError) {
      console.error('Error updating Patrick\'s account:', updateError.message)
    } else {
      console.log('✅ Updated Patrick\'s account to family admin with parent role')
    }

    // 2. Create child accounts for Patrick with correct age_group values
    console.log('\n👶 Creating child accounts...')
    const childAccounts = [
      {
        id: childIds.child1,
        email: 'patrick.child1@powlax.com',
        display_name: 'Alex Chapla',
        first_name: 'Alex',
        last_name: 'Chapla',
        role: 'player',
        roles: ['player'],
        club_id: DEMO_CLUB_ID,
        account_type: 'child',
        age_group: 'youth_14_18', // Fixed age group value
        player_position: 'Attack',
        graduation_year: 2027,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: childIds.child2,
        email: 'patrick.child2@powlax.com',
        display_name: 'Morgan Chapla',
        first_name: 'Morgan',
        last_name: 'Chapla',
        role: 'player',
        roles: ['player'],
        club_id: DEMO_CLUB_ID,
        account_type: 'child',
        age_group: 'youth_11_13', // Fixed age group value
        player_position: 'Midfield',
        graduation_year: 2029,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: childIds.child3,
        email: 'patrick.child3@powlax.com',
        display_name: 'Taylor Chapla',
        first_name: 'Taylor',
        last_name: 'Chapla',
        role: 'player',
        roles: ['player'],
        club_id: DEMO_CLUB_ID,
        account_type: 'child',
        age_group: 'youth_8_10', // Fixed age group value
        player_position: 'Defense',
        graduation_year: 2031,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    for (const child of childAccounts) {
      const { error } = await supabase
        .from('users')
        .upsert(child, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating child ${child.display_name}:`, error.message)
      } else {
        console.log(`✅ Created child account: ${child.display_name} (${child.age_group})`)
      }
    }

    // 3. Create family account for Patrick
    console.log('\n👨‍👩‍👧‍👦 Creating family account...')
    const familyAccountId = randomUUID()
    const { error: familyError } = await supabase
      .from('family_accounts')
      .upsert({
        id: familyAccountId,
        primary_parent_id: PATRICK_ADMIN_ID,
        family_name: 'The Chapla Family',
        billing_parent_id: PATRICK_ADMIN_ID,
        family_settings: {
          combined_stats: true,
          shared_calendar: true,
          notification_preferences: 'all'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }) // Use id for conflict resolution
    
    if (familyError && !familyError.message.includes('duplicate')) {
      console.error('Error creating family account:', familyError.message)
    } else {
      console.log('✅ Created family account: The Chapla Family')
    }

    // 4. Create parent-child relationships
    console.log('\n👨‍👧‍👦 Creating parent-child relationships...')
    const relationships = Object.values(childIds).map((childId, index) => ({
      id: randomUUID(),
      parent_id: PATRICK_ADMIN_ID,
      child_id: childId,
      relationship_type: 'parent',
      permissions: {
        billing: true,
        view_progress: true,
        manage_schedule: true,
        approve_activities: true
      },
      is_primary_guardian: true,
      emergency_contact: true,
      notes: `Child ${index + 1} of Patrick's family`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    for (const rel of relationships) {
      const { error } = await supabase
        .from('parent_child_relationships')
        .upsert(rel, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating relationship:', error.message)
      } else {
        console.log('✅ Linked Patrick to child')
      }
    }

    // 5. Set up gamification currencies (using actual column names)
    console.log('\n💰 Setting up gamification currencies...')
    const currencies = [
      {
        id: 'points',
        name: 'POWLAX Points',
        description: 'Standard points earned through activities',
        value_in_usd: 0.01,
        is_active: true
      },
      {
        id: 'xp',
        name: 'Experience Points',
        description: 'Experience gained from completing workouts',
        value_in_usd: 0.005,
        is_active: true
      },
      {
        id: 'coins',
        name: 'Gold Coins',
        description: 'Premium currency for special rewards',
        value_in_usd: 0.10,
        is_active: true
      }
    ]

    for (const currency of currencies) {
      const { error } = await supabase
        .from('powlax_points_currencies')
        .upsert(currency, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating currency ${currency.name}:`, error.message)
      } else {
        console.log(`✅ Created/Updated currency: ${currency.name}`)
      }
    }

    // 6. Create point wallets for each child (using actual column names)
    console.log('\n💳 Creating point wallets for children...')
    for (const [key, childId] of Object.entries(childIds)) {
      // Create wallets for points only (main currency)
      const walletId = randomUUID()
      const balance = Math.floor(Math.random() * 5000) + 1000  // Random points between 1000-6000

      const { error } = await supabase
        .from('user_points_wallets')
        .upsert({
          id: walletId,
          user_id: childId,
          balance: balance,
          total_earned: balance + Math.floor(Math.random() * 1000),
          total_spent: Math.floor(Math.random() * 500),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating wallet:`, error.message)
      } else {
        console.log(`✅ Created points wallet for child with balance: ${balance}`)
      }
    }

    // 7. Create some point transactions for history (using actual columns)
    console.log('\n📊 Creating point transaction history...')
    const transactionTypes = [
      { type: 'workout_complete', points: 100, description: 'Completed Skills Academy workout' },
      { type: 'drill_complete', points: 20, description: 'Completed individual drill' },
      { type: 'daily_login', points: 10, description: 'Daily login bonus' },
      { type: 'streak_bonus', points: 50, description: '7-day streak bonus' },
      { type: 'badge_earned', points: 200, description: 'Earned new badge' }
    ]

    for (const childId of Object.values(childIds)) {
      // Create 5-10 transactions per child
      const numTransactions = Math.floor(Math.random() * 5) + 5
      for (let i = 0; i < numTransactions; i++) {
        const transType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
        const daysAgo = Math.floor(Math.random() * 30) // Random date within last 30 days
        
        const { error } = await supabase
          .from('points_transactions_powlax')
          .insert({
            id: randomUUID(),
            user_id: childId,
            amount: transType.points,
            transaction_type: transType.type,
            description: transType.description,
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
          })
        
        if (error) {
          console.error('Error creating transaction:', error.message)
        }
      }
    }
    console.log('✅ Created transaction history')

    // 8. Create badges and assign some to children (simplified structure)
    console.log('\n🏅 Creating badges and achievements...')
    const badgeTypes = [
      { name: 'First Workout', icon: '🎯' },
      { name: 'Week Warrior', icon: '💪' },
      { name: 'Drill Master', icon: '⭐' },
      { name: 'Consistency King', icon: '👑' },
      { name: 'Speed Demon', icon: '⚡' },
      { name: 'Wall Ball Expert', icon: '🏐' }
    ]

    for (const childId of Object.values(childIds)) {
      // Assign 2-5 random badges to each child
      const numBadges = Math.floor(Math.random() * 3) + 2
      const selectedBadges = badgeTypes
        .sort(() => Math.random() - 0.5)
        .slice(0, numBadges)
      
      for (const badge of selectedBadges) {
        const { error } = await supabase
          .from('user_badges')
          .insert({
            id: randomUUID(),
            user_id: childId,
            badge_name: badge.name,
            badge_icon: badge.icon,
            earned_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            points_awarded: Math.floor(Math.random() * 100) + 50
          })
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating badge:', error.message)
        }
      }
    }
    console.log('✅ Created badges and achievements')

    // 9. Add children to teams
    console.log('\n🏆 Adding children to teams...')
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('club_id', DEMO_CLUB_ID)
      .limit(3)
    
    if (teams && teams.length > 0) {
      let teamIndex = 0
      for (const childId of Object.values(childIds)) {
        const team = teams[teamIndex % teams.length]
        const { error } = await supabase
          .from('team_members')
          .upsert({
            id: randomUUID(),
            team_id: team.id,
            user_id: childId,
            role: 'player',
            status: 'active',
            created_at: new Date().toISOString()
          }, { onConflict: 'id' })
        
        if (error && !error.message.includes('duplicate')) {
          console.error('Error adding to team:', error.message)
        } else {
          console.log(`✅ Added child to team: ${team.name}`)
        }
        teamIndex++
      }
    }

    // 10. Create Skills Academy progress for children
    console.log('\n📈 Creating Skills Academy progress...')
    const { data: workouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, name')
      .limit(10)
    
    if (workouts && workouts.length > 0) {
      for (const childId of Object.values(childIds)) {
        // Each child gets 2-4 workout progress records
        const numWorkouts = Math.floor(Math.random() * 3) + 2
        const selectedWorkouts = workouts
          .sort(() => Math.random() - 0.5)
          .slice(0, numWorkouts)
        
        for (const workout of selectedWorkouts) {
          const isCompleted = Math.random() > 0.3 // 70% chance of being completed
          const drillsCompleted = isCompleted ? 5 : Math.floor(Math.random() * 4) + 1
          
          const { error } = await supabase
            .from('skills_academy_user_progress')
            .upsert({
              user_id: childId,
              workout_id: workout.id,
              current_drill_index: drillsCompleted,
              drills_completed: drillsCompleted,
              total_drills: 5,
              started_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
              last_activity_at: new Date(Date.now() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString(),
              completed_at: isCompleted ? new Date().toISOString() : null,
              total_time_seconds: Math.floor(Math.random() * 1800) + 300,
              status: isCompleted ? 'completed' : 'in_progress',
              completion_percentage: (drillsCompleted / 5) * 100,
              points_earned: isCompleted ? Math.floor(Math.random() * 200) + 100 : 0
            }, { onConflict: 'user_id,workout_id' })
          
          if (error && !error.message.includes('duplicate')) {
            console.error('Error creating progress:', error.message)
          }
        }
      }
      console.log('✅ Created Skills Academy progress')
    }

    console.log('\n✨ Dashboard data seeding complete!')
    console.log('\n📊 Summary:')
    console.log('  - Patrick\'s admin account updated to family admin with parent role')
    console.log('  - 3 child accounts created and linked')
    console.log('  - Family account established')
    console.log('  - Gamification system populated:')
    console.log('    • Point currencies defined')
    console.log('    • Wallets created with balances')
    console.log('    • Transaction history generated')
    console.log('    • Badges and achievements assigned')
    console.log('  - Children added to teams')
    console.log('  - Skills Academy progress tracked')
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Visit http://localhost:3000/dashboard to see your admin dashboard')
    console.log('2. The dashboard will now show real data')
    console.log('3. As an admin with parent role, you can see children\'s data')
    console.log('4. Gamification data is connected and will display')
    
    console.log('\n👨‍👧‍👦 Your Children:')
    console.log('  - Alex Chapla (14-18 years, Attack)')
    console.log('  - Morgan Chapla (11-13 years, Midfield)')
    console.log('  - Taylor Chapla (8-10 years, Defense)')

    // Verify the relationships were created
    console.log('\n🔍 Verifying parent-child relationships...')
    const { data: verifyRel, error: verifyError } = await supabase
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', PATRICK_ADMIN_ID)
    
    if (verifyError) {
      console.error('Error verifying relationships:', verifyError)
    } else {
      console.log(`✅ Confirmed ${verifyRel?.length || 0} parent-child relationships`)
    }

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Run the seeding
seedPatrickDashboardData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })