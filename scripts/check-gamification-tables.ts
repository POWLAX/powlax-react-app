#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGamificationTables() {
  console.log('🔍 Checking Gamification Tables')
  console.log('===============================')
  
  const tables = [
    'user_points_wallets',
    'user_points_ledger', 
    'user_badges',
    'user_ranks'
  ]
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: exists`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err}`)
    }
  }
}

checkGamificationTables()