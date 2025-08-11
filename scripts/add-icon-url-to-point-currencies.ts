#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const pointTypeImages = {
  'lax_credits': 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
  'attack_tokens': 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png', 
  'defense_dollars': 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
  'midfield_medals': 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
  'rebound_rewards': 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
  'lax_iq_points': 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
  'flex_points': 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png'
}

async function addIconUrlColumn() {
  console.log('🔄 Adding icon_url column to powlax_points_currencies table...')
  
  // First, add the icon_url column
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE powlax_points_currencies ADD COLUMN IF NOT EXISTS icon_url TEXT;`
  })
  
  if (alterError) {
    console.error('❌ Error adding column:', alterError)
    return
  }
  
  console.log('✅ Added icon_url column')
  
  // Now update each point type with its image
  for (const [currency, imageUrl] of Object.entries(pointTypeImages)) {
    const { data, error } = await supabase
      .from('powlax_points_currencies')
      .update({ icon_url: imageUrl })
      .eq('currency', currency)
    
    if (error) {
      console.error(`❌ Error updating ${currency}:`, error)
    } else {
      console.log(`✅ Updated ${currency} with image: ${imageUrl}`)
    }
  }
  
  console.log('🎉 Point type images update complete!')
}

addIconUrlColumn().catch(console.error)
