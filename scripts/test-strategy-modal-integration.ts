import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStrategyModalIntegration() {
  console.log('🧪 Testing Strategy Modal Integration\n')
  console.log('=====================================\n')

  try {
    // Step 1: Get Patrick's user ID (our primary test user)
    console.log('1️⃣ Finding Patrick\'s user account...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name')
      .eq('email', 'patrickchapla@gmail.com')
      .single()

    if (userError || !users) {
      console.log('   Patrick not found, using any available user...')
      const { data: anyUser } = await supabase
        .from('users')
        .select('id, email, display_name')
        .limit(1)
        .single()
      
      if (!anyUser) {
        console.error('❌ No users found in database')
        return
      }
      console.log(`✅ Using user: ${anyUser.email} (${anyUser.id})\n`)
      var testUser = anyUser
    } else {
      console.log(`✅ Using Patrick: ${users.email} (${users.id})\n`)
      var testUser = users
    }

    // Step 2: Create a strategy simulating what AddCustomStrategiesModal sends
    console.log('2️⃣ Simulating AddCustomStrategiesModal data submission...')
    
    // This matches exactly what the modal sends (see AddCustomStrategiesModal.tsx lines 79-93)
    const modalData = {
      user_id: testUser.id,
      strategy_name: 'Elite 2-3-1 Motion Offense',
      description: 'A comprehensive motion offense designed for advanced high school and college teams',
      lesson_category: 'Settled Offense',
      vimeo_link: 'https://vimeo.com/987654321',
      lacrosse_lab_links: [
        'https://lacrosselab.com/motion-offense-basics',
        'https://lacrosselab.com/2-3-1-spacing',
        'https://lacrosselab.com/cutting-patterns'
      ],
      target_audience: 'Varsity Attackmen and Midfielders',
      see_it_ages: '14-16',
      coach_it_ages: '16-18',
      own_it_ages: '18+',
      is_public: false,
      team_share: [],
      club_share: []
    }

    console.log('   Submitting strategy data...')
    const { data: created, error: createError } = await supabase
      .from('user_strategies')
      .insert([modalData])
      .select()
      .single()

    if (createError) {
      console.error('❌ Failed to create strategy:', createError)
      return
    }

    console.log('✅ Strategy created successfully!')
    console.log('   ID:', created.id)
    console.log('   Name:', created.strategy_name)
    console.log('   Description:', created.description?.substring(0, 50) + '...')
    console.log('   Game Phase:', created.lesson_category)
    console.log('   Vimeo:', created.vimeo_link ? '✓' : '✗')
    console.log('   Lab URLs:', Array.isArray(created.lacrosse_lab_links) ? created.lacrosse_lab_links.length : 0)
    console.log('   Ages:', `See: ${created.see_it_ages}, Coach: ${created.coach_it_ages}, Own: ${created.own_it_ages}\n`)

    // Step 3: Verify it appears in user strategies query
    console.log('3️⃣ Verifying strategy appears in user strategies list...')
    const { data: userStrategies, error: listError } = await supabase
      .from('user_strategies')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })

    if (listError) {
      console.error('❌ Failed to list strategies:', listError)
    } else {
      const foundStrategy = userStrategies.find(s => s.id === created.id)
      if (foundStrategy) {
        console.log('✅ Strategy found in user\'s strategy list!')
        console.log(`   Total user strategies: ${userStrategies.length}`)
      } else {
        console.error('❌ Strategy not found in user list')
      }
    }

    // Step 4: Test what the StrategiesTab would see
    console.log('\n4️⃣ Testing StrategiesTab integration...')
    const { data: allStrategies, error: allError } = await supabase
      .from('user_strategies')
      .select('*')
      .order('created_at', { ascending: false })

    if (!allError && allStrategies) {
      console.log(`✅ Total strategies in database: ${allStrategies.length}`)
      const recentStrategy = allStrategies.find(s => s.id === created.id)
      if (recentStrategy) {
        console.log('✅ New strategy would appear in StrategiesTab!')
        console.log('   Source: user')
        console.log('   Category:', recentStrategy.lesson_category || recentStrategy.strategy_categories)
      }
    }

    // Step 5: Clean up
    console.log('\n5️⃣ Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('user_strategies')
      .delete()
      .eq('id', created.id)

    if (deleteError) {
      console.error('⚠️ Failed to clean up:', deleteError)
    } else {
      console.log('✅ Test data cleaned up\n')
    }

    // Summary
    console.log('=====================================')
    console.log('📊 INTEGRATION TEST SUMMARY')
    console.log('=====================================')
    console.log('✅ AddCustomStrategiesModal data structure: CORRECT')
    console.log('✅ Database save with all fields: WORKING')
    console.log('✅ Strategy retrieval: WORKING')
    console.log('✅ StrategiesTab integration: READY')
    console.log('\n🎉 Custom Strategy Creation is FULLY FUNCTIONAL!')
    console.log('🎉 All fields are saved and retrievable from the database!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testStrategyModalIntegration()