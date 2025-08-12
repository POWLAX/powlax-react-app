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

async function discoverUserBadgesSchema() {
  console.log('🔍 Discovering user_badges schema - we know badge_key is required...\n')
  
  let userTestFields = [
    { user_id: '00000000-0000-0000-0000-000000000000', badge_key: 'test' },
    { user_id: '00000000-0000-0000-0000-000000000000', badge_key: 'test', badges_powlax_id: 88 },
    { user_id: '00000000-0000-0000-0000-000000000000', badge_key: 'test', badge_id: 88 }
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
      console.log(`📋 Full user_badges structure:`, data[0])
      
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

discoverUserBadgesSchema().catch(console.error)