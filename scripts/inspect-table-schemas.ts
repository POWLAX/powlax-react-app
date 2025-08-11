#!/usr/bin/env npx tsx
/**
 * Inspect actual table schemas to understand the column names
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectTables() {
  console.log('🔍 Inspecting table schemas...\n')

  const tablesToInspect = [
    'users',
    'teams',
    'team_members',
    'user_points_wallets',
    'skills_academy_user_progress',
    'user_badges',
    'practices',
    'family_accounts',
    'parent_child_relationships',
    'points_transactions_powlax'
  ]

  for (const table of tablesToInspect) {
    console.log(`\n📊 Table: ${table}`)
    console.log('─'.repeat(50))
    
    try {
      // Get one row to see the column structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Error: ${error.message}`)
      } else if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        console.log('Columns:', columns.join(', '))
        console.log('Sample row:', JSON.stringify(data[0], null, 2))
      } else {
        // Try to get schema info even with no data
        const { data: emptyData, error: emptyError } = await supabase
          .from(table)
          .select('*')
          .limit(0)
        
        if (!emptyError) {
          console.log('✅ Table exists but is empty')
        }
      }
    } catch (err) {
      console.error(`❌ Failed to inspect: ${err}`)
    }
  }
}

inspectTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })