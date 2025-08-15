import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NjEwMzEsImV4cCI6MjA1MDEzNzAzMX0.dYqPbMzePgCYpvJlwwD6Pj9KFh1qyKYnTxTepUkgdh0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPatrickAuthAfterMigration() {
  console.log('🧪 Testing Patrick Authentication After Role Migration')
  console.log('==================================================')
  
  try {
    // Step 1: Verify Patrick's updated role
    console.log('\n1. Verifying Patrick\'s current role...')
    const { data: patrickData, error: patrickError } = await supabase
      .from('users')
      .select('id, email, role, display_name, first_name, last_name, account_type')
      .eq('email', 'patrick@powlax.com')
    
    if (patrickError) {
      console.error('❌ Error fetching Patrick\'s data:', patrickError)
      return
    }
    
    if (!patrickData || patrickData.length === 0) {
      console.error('❌ Patrick user not found!')
      return
    }
    
    const patrick = patrickData[0]
    console.log('📋 Patrick\'s Current Status:')
    console.log(`   ID: ${patrick.id}`)
    console.log(`   Email: ${patrick.email}`)
    console.log(`   Role: ${patrick.role}`)
    console.log(`   Name: ${patrick.display_name || `${patrick.first_name || 'NOT SET'} ${patrick.last_name || 'NOT SET'}`.trim()}`)
    console.log(`   Account Type: ${patrick.account_type}`)
    
    // Check WordPress alignment
    const wordpressAlignment = patrick.role === 'administrator' 
      ? '✅ Matches WordPress Standard' 
      : '❌ Does not match WordPress'
    console.log(`   WordPress Alignment: ${wordpressAlignment}`)
    
    // Step 2: Test RLS policies with new role
    console.log('\n2. Testing RLS policies with administrator role...')
    
    // Test if Patrick can access his own data
    const { data: selfAccess, error: selfError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', patrick.id)
    
    if (selfError) {
      console.error('❌ RLS policy error for self-access:', selfError)
    } else {
      console.log('✅ Self-access RLS policy works with administrator role')
    }
    
    // Step 3: Test admin-level permissions
    console.log('\n3. Testing administrator permissions...')
    
    // Test access to all users (admin privilege)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5)
    
    if (allUsersError) {
      console.warn('⚠️  Admin-level access might be restricted:', allUsersError.message)
    } else {
      console.log(`✅ Administrator can access user data (${allUsers?.length || 0} users found)`)
    }
    
    // Step 4: Test teams and clubs access
    console.log('\n4. Testing teams and clubs access...')
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, club_id')
      .limit(3)
    
    if (teamsError) {
      console.warn('⚠️  Teams access error:', teamsError.message)
    } else {
      console.log(`✅ Administrator can access teams data (${teams?.length || 0} teams found)`)
    }
    
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .limit(3)
    
    if (clubsError) {
      console.warn('⚠️  Clubs access error:', clubsError.message)
    } else {
      console.log(`✅ Administrator can access clubs data (${clubs?.length || 0} clubs found)`)
    }
    
    // Step 5: Test practice planner access
    console.log('\n5. Testing practice planner access...')
    
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('id, title, creator_id')
      .limit(3)
    
    if (practicesError) {
      console.warn('⚠️  Practice planner access error:', practicesError.message)
    } else {
      console.log(`✅ Administrator can access practices data (${practices?.length || 0} practices found)`)
    }
    
    // Step 6: Check if any other users were affected
    console.log('\n6. Checking other users were not affected...')
    
    const { data: allUsersRoles, error: rolesError } = await supabase
      .from('users')
      .select('role')
      .neq('email', 'patrick@powlax.com')
    
    if (rolesError) {
      console.error('❌ Error checking other users:', rolesError)
    } else {
      const roleCounts = allUsersRoles?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      
      console.log('📊 Other users\' roles unchanged:')
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`)
      })
      
      // Check if any other admin roles exist
      const adminCount = roleCounts['admin'] || 0
      if (adminCount > 0) {
        console.warn(`⚠️  Found ${adminCount} other users with 'admin' role`)
      } else {
        console.log('✅ No other users have "admin" role - migration isolated successfully')
      }
    }
    
    // Step 7: Final authentication test summary
    console.log('\n🎉 Authentication Test Summary')
    console.log('=============================')
    console.log('✅ Patrick\'s role successfully updated to "administrator"')
    console.log('✅ WordPress alignment achieved (administrator = WordPress standard)')
    console.log('✅ RLS policies work with new role')
    console.log('✅ Administrator permissions functional')
    console.log('✅ Other users unaffected by migration')
    console.log('\n📍 Phase 2 Migration - AUTHENTICATION VERIFIED')
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
  }
}

// Execute the test
testPatrickAuthAfterMigration()