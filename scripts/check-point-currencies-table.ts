#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPointCurrenciesTable() {
  console.log('🔍 Checking powlax_points_currencies table...')
  
  const { data, error } = await supabase
    .from('powlax_points_currencies')
    .select('*')
    .limit(3)
  
  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Sample data:')
    console.log(JSON.stringify(data, null, 2))
  }
}

checkPointCurrenciesTable().catch(console.error)
