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

async function discoverSchema() {
  console.log('🔍 Discovering badges_powlax schema by testing minimal fields...\n')
  
  // Start with absolute minimum
  let testFields = [
    { title: 'Test' },
    { name: 'Test' },
    { id: 999, title: 'Test' },
    { id: 999, name: 'Test' },
    { title: 'Test', description: 'Test desc' },
    { name: 'Test', description: 'Test desc' },
    { title: 'Test', category: 'test' },
    { name: 'Test', category: 'test' }
  ]
  
  for (let i = 0; i < testFields.length; i++) {
    const testBadge = testFields[i]
    console.log(`Trying: ${JSON.stringify(testBadge)}`)
    
    const { data, error } = await supabase
      .from('badges_powlax')
      .insert([testBadge])
      .select()
    
    if (error) {
      console.log(`❌ ${error.message}`)
    } else {
      console.log(`✅ SUCCESS! Schema accepts:`, testBadge)
      console.log(`📋 Returned:`, data)
      
      // Clean up
      if (data && data[0] && data[0].id) {
        await supabase
          .from('badges_powlax')
          .delete()
          .eq('id', data[0].id)
        console.log('🧹 Cleaned up')
      }
      break
    }
    
    console.log('')
  }
  
  console.log('\n🔍 Discovering user_badges schema...\n')
  
  let userTestFields = [
    { user_id: '00000000-0000-0000-0000-000000000000' },
    { user_id: '00000000-0000-0000-0000-000000000000', badge_powlax_id: 1 },
    { user_id: '00000000-0000-0000-0000-000000000000', badges_powlax_id: 1 },
    { user_id: '00000000-0000-0000-0000-000000000000', powlax_badge_id: 1 }
  ]
  
  for (let i = 0; i < userTestFields.length; i++) {
    const testUserBadge = userTestFields[i]
    console.log(`Trying: ${JSON.stringify(testUserBadge)}`)
    
    const { data, error } = await supabase
      .from('user_badges')
      .insert([testUserBadge])
      .select()
    
    if (error) {
      console.log(`❌ ${error.message}`)
    } else {
      console.log(`✅ SUCCESS! Schema accepts:`, testUserBadge)
      console.log(`📋 Returned:`, data)
      
      // Clean up
      if (data && data[0] && data[0].id) {
        await supabase
          .from('user_badges')
          .delete()
          .eq('id', data[0].id)
        console.log('🧹 Cleaned up')
      }
      break
    }
    
    console.log('')
  }
}

discoverSchema().catch(console.error)