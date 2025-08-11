import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkSupabaseAuth() {
  console.log('🔍 Checking Supabase Tables and Data...\n')
  console.log('='.repeat(60))
  
  // 1. Check critical tables
  console.log('\n📊 TABLE STATUS:')
  console.log('-'.repeat(40))
  
  const tables = [
    'user_profiles',
    'teams',
    'team_members',
    'practice_plans',
    'drills_powlax',
    'strategies_powlax',
    'user_drills',
    'user_strategies',
    'team_playbooks'
  ]
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table.padEnd(25)}: ERROR - ${error.message}`)
      } else {
        console.log(`✅ ${table.padEnd(25)}: ${count} records`)
      }
    } catch (e) {
      console.log(`❌ ${table.padEnd(25)}: FAILED TO CONNECT`)
    }
  }
  
  // 2. Check for admin users in user_profiles
  console.log('\n👤 ADMIN USERS:')
  console.log('-'.repeat(40))
  
  const adminEmails = ['admin@powlax.com', 'patrick@powlax.com', 'support@powlax.com']
  
  for (const email of adminEmails) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, roles')
      .eq('email', email)
      .single()
    
    if (data) {
      console.log(`✅ ${email}: Found (ID: ${data.id})`)
      console.log(`   Roles: ${data.roles || 'No roles set'}`)
    } else {
      console.log(`⚠️  ${email}: Not found in user_profiles`)
    }
  }
  
  // 3. Check if drills are accessible
  console.log('\n🏃 DRILL ACCESS TEST:')
  console.log('-'.repeat(40))
  
  const { data: drills, error: drillError } = await supabase
    .from('drills_powlax')
    .select('id, title')
    .limit(5)
  
  if (drills && drills.length > 0) {
    console.log(`✅ Can access drills (${drills.length} sample drills found)`)
  } else if (drillError) {
    console.log(`❌ Cannot access drills: ${drillError.message}`)
  } else {
    console.log(`⚠️  No drills found in database`)
  }
  
  // 4. Check if strategies are accessible
  console.log('\n🎯 STRATEGY ACCESS TEST:')
  console.log('-'.repeat(40))
  
  const { data: strategies, error: strategyError } = await supabase
    .from('strategies_powlax')
    .select('id, strategy_name')
    .limit(5)
  
  if (strategies && strategies.length > 0) {
    console.log(`✅ Can access strategies (${strategies.length} sample strategies found)`)
  } else if (strategyError) {
    console.log(`❌ Cannot access strategies: ${strategyError.message}`)
  } else {
    console.log(`⚠️  No strategies found in database`)
  }
  
  // 5. Check if practice plans can be saved/loaded
  console.log('\n💾 PRACTICE PLAN ACCESS TEST:')
  console.log('-'.repeat(40))
  
  const { data: plans, error: planError } = await supabase
    .from('practice_plans')
    .select('id, title, team_id')
    .limit(5)
  
  if (plans && plans.length > 0) {
    console.log(`✅ Can access practice plans (${plans.length} plans found)`)
  } else if (planError) {
    console.log(`❌ Cannot access practice plans: ${planError.message}`)
  } else {
    console.log(`⚠️  No practice plans found in database`)
  }
  
  // 6. Check RLS policies
  console.log('\n🔒 RLS POLICY CHECK:')
  console.log('-'.repeat(40))
  console.log('Note: Using service role key bypasses RLS')
  console.log('If features don\'t work in the app, RLS policies may be blocking access')
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 SUMMARY:')
  console.log('-'.repeat(40))
  console.log('1. Check if all tables show ✅ above')
  console.log('2. Verify admin users exist in user_profiles')
  console.log('3. Ensure drills and strategies are accessible')
  console.log('4. If using app auth, RLS policies may need adjustment')
  console.log('\n💡 TIP: If admin features don\'t show, the user data')
  console.log('   might not be syncing between WordPress and Supabase')
}

checkSupabaseAuth().catch(console.error)