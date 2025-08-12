/**
 * Check Badges Table Script
 * Quick check of badges_powlax table status
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
  console.error(`   SERVICE_KEY: ${supabaseKey ? '✅' : '❌'}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBadgesTable() {
  console.log('🔍 Checking badges_powlax table...')
  
  try {
    // Check if table exists and get count
    const { count, error } = await supabase
      .from('badges_powlax')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error checking badges table:', error)
      return
    }
    
    console.log(`✅ Table exists with ${count} badges`)
    
    // Get a sample of existing badges
    const { data, error: selectError } = await supabase
      .from('badges_powlax')
      .select('id, title, category, points_required, icon_url')
      .limit(5)
    
    if (selectError) {
      console.error('❌ Error selecting badges:', selectError)
      return
    }
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample existing badges:')
      data.forEach(badge => {
        console.log(`   ${badge.id}: ${badge.title} (${badge.category})`)
      })
    } else {
      console.log('   No badges found in table')
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

checkBadgesTable()