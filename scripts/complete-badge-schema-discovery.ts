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

async function completeBadgeSchemaDiscovery() {
  console.log('🔍 Complete badge schema discovery...\n')
  
  // First get a real user
  console.log('📋 Getting a real user...')
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(1)
  
  if (!users || users.length === 0) {
    console.log('❌ No users found')
    return
  }
  
  const realUserId = users[0].id
  console.log(`✅ Using real user ID: ${realUserId}`)
  
  // Test user_badges with real user and try different field combinations
  console.log('\n🔍 Testing user_badges schema with real user...')
  
  const userTestCombos = [
    { user_id: realUserId, badge_key: 'test_badge' },
    { user_id: realUserId, badge_key: 'test_badge', earned_at: new Date().toISOString() },
    { user_id: realUserId, badge_key: 'test_badge', badges_powlax_id: 88 },
    { user_id: realUserId, badge_key: 'test_badge', powlax_badge_id: 88 },
    { user_id: realUserId, badge_key: 'test_badge', powlax_badges_id: 88 }
  ]
  
  for (const testCombo of userTestCombos) {
    console.log(`\nTrying: ${JSON.stringify(testCombo, null, 2)}`)
    
    const { data, error } = await supabase
      .from('user_badges')
      .insert([testCombo])
      .select()
    
    if (error) {
      console.log(`❌ ${error.message}`)
    } else {
      console.log(`✅ SUCCESS! user_badges schema:`)
      console.log(`📋 Complete structure:`, JSON.stringify(data[0], null, 2))
      
      // Clean up
      if (data && data[0] && data[0].id) {
        await supabase
          .from('user_badges')
          .delete()
          .eq('id', data[0].id)
        console.log('🧹 Cleaned up test record')
      }
      break
    }
  }
  
  // Also show the complete badges_powlax structure we discovered
  console.log('\n📋 SUMMARY - badges_powlax table structure:')
  console.log(`{
    id: number (auto),
    title: string (required),
    description: string (nullable),
    icon_url: string (nullable),
    category: string (nullable),
    badge_type: string (nullable),
    sub_category: string (nullable),
    earned_by_type: string (nullable),
    points_type_required: string (nullable),
    points_required: number (default: 0),
    wordpress_id: number (nullable),
    quest_id: number (nullable),
    maximum_earnings: number (default: 1),
    is_hidden: boolean (default: false),
    sort_order: number (default: 0),
    metadata: object (nullable),
    created_at: timestamp,
    updated_at: timestamp
  }`)
}

completeBadgeSchemaDiscovery().catch(console.error)