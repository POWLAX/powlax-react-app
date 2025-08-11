#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPlayerRanksTable() {
  console.log('🔍 Checking powlax_player_ranks table...')
  
  const { data, error } = await supabase
    .from('powlax_player_ranks')
    .select('*')
    .limit(3)
  
  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Sample data:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data && data.length > 0) {
      console.log('\n📋 Available columns:')
      console.log(Object.keys(data[0]).join(', '))
    }
  }
}

checkPlayerRanksTable().catch(console.error)
