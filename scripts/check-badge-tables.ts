/**
 * Check Badge Tables Structure
 * Verify the current badge-related tables and their schemas
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkBadgeTables() {
  console.log('🔍 Checking badge-related tables...\n')

  // List of potential badge table names
  const tableNames = [
    'user_badges',
    'badges_powlax', 
    'powlax_badges',
    'badge_definitions',
    'powlax_player_ranks',
    'user_badge_progress_powlax'
  ]

  for (const tableName of tableNames) {
    console.log(`📋 Checking table: ${tableName}`)
    
    try {
      // Try to get table structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: EXISTS`)
        if (data && data.length > 0) {
          console.log(`   Sample columns:`, Object.keys(data[0]))
        } else {
          console.log(`   (empty table)`)
        }
        
        // Get count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        console.log(`   Record count: ${count}`)
      }
    } catch (err) {
      console.log(`❌ ${tableName}: Error - ${err}`)
    }
    
    console.log('')
  }

  // Check for badge-related data in existing tables
  console.log('🔍 Looking for existing badge data...\n')
  
  try {
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('*')
      .limit(3)
    
    if (userBadges && userBadges.length > 0) {
      console.log('📋 Sample user_badges data:')
      console.log(JSON.stringify(userBadges[0], null, 2))
    }
  } catch (err) {
    console.log('Could not access user_badges')
  }
}

checkBadgeTables().catch(console.error)