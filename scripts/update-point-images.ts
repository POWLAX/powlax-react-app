#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const pointTypeImages = {
  'lax_credit': 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
  'attack_token': 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png', 
  'defense_dollar': 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
  'midfield_medal': 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
  'rebound_reward': 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
  'lax_iq_point': 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
  'flex_point': 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png'
}

async function updatePointTypeImages() {
  console.log('🔄 Updating point type images...')
  
  for (const [pointType, imageUrl] of Object.entries(pointTypeImages)) {
    const { data, error } = await supabase
      .from('powlax_points_currencies')
      .update({ icon_url: imageUrl })
      .eq('name', pointType)
    
    if (error) {
      console.error(`❌ Error updating ${pointType}:`, error)
    } else {
      console.log(`✅ Updated ${pointType} with image: ${imageUrl}`)
    }
  }
  
  console.log('🎉 Point type images update complete!')
}

updatePointTypeImages().catch(console.error)
