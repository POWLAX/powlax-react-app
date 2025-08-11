#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function discoverTableStructure() {
  console.log('🔍 Discovering powlax_player_ranks table structure...')
  
  // Try different minimal inserts to discover column structure
  const testCombinations = [
    { title: 'Basic name only', data: { name: 'Test' } },
    { title: 'Title field', data: { title: 'Test Rank' } },
    { title: 'Name and credits', data: { name: 'Test', lax_credits_required: 100 } },
    { title: 'Title and credits', data: { title: 'Test Rank', lax_credits_required: 100 } },
    { title: 'With icon_url', data: { title: 'Test Rank', icon_url: 'test.png' } },
    { title: 'With rank_order', data: { title: 'Test Rank', rank_order: 1 } },
    { title: 'Full attempt', data: { title: 'Test Rank', lax_credits_required: 100, icon_url: 'test.png', rank_order: 1, description: 'Test description' } }
  ]
  
  for (const test of testCombinations) {
    console.log(`\n🧪 Testing: ${test.title}`)
    console.log(`   Data: ${JSON.stringify(test.data)}`)
    
    const { data, error } = await supabase
      .from('powlax_player_ranks')
      .insert([test.data])
      .select()
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      console.log(`   ✅ Success! Inserted:`, data)
      
      // Clean up - delete the test record
      if (data && data.length > 0 && data[0].id) {
        await supabase
          .from('powlax_player_ranks')
          .delete()
          .eq('id', data[0].id)
        console.log(`   🧹 Cleaned up test record`)
      }
      
      // If we found a working combination, show the structure
      console.log(`   📋 Working column structure found!`)
      break
    }
  }
}

discoverTableStructure().catch(console.error)
