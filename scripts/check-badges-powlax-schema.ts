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

async function checkBadgesSchema() {
  console.log('🔍 Testing badges_powlax table schema...\n')
  
  // Try to insert a test record to see what fields are expected
  const testBadge = {
    title: 'Test Badge',
    category: 'test',
    description: 'Test description',
    image_url: 'https://example.com/test.png',
    congratulations_text: 'Test congratulations'
  }
  
  const { data, error } = await supabase
    .from('badges_powlax')
    .insert([testBadge])
    .select()
  
  if (error) {
    console.log('❌ Insert failed - this tells us about the schema:')
    console.log(error.message)
    console.log(JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Insert succeeded!')
    console.log('📋 Inserted record:', data)
    
    // Clean up - delete the test record
    if (data && data[0]) {
      await supabase
        .from('badges_powlax')
        .delete()
        .eq('id', data[0].id)
      console.log('🧹 Cleaned up test record')
    }
  }
  
  // Also check user_badges schema
  console.log('\n🔍 Testing user_badges table schema...\n')
  
  const testUserBadge = {
    user_id: '00000000-0000-0000-0000-000000000000',
    badge_id: 1,
    earned_at: new Date().toISOString()
  }
  
  const { data: userData, error: userError } = await supabase
    .from('user_badges')
    .insert([testUserBadge])
    .select()
  
  if (userError) {
    console.log('❌ user_badges insert failed:')
    console.log(userError.message)
  } else {
    console.log('✅ user_badges insert succeeded!')
    console.log('📋 Inserted record:', userData)
    
    // Clean up
    if (userData && userData[0]) {
      await supabase
        .from('user_badges')
        .delete()
        .eq('id', userData[0].id)
      console.log('🧹 Cleaned up test user badge')
    }
  }
}

checkBadgesSchema().catch(console.error)