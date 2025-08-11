#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const playerRanks = [
  {
    name: 'Lacrosse Bot',
    min_lax_credits: 0,
    max_lax_credits: 24,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.11-A-cartoonish-3D-animated-lacrosse-player-with-a-robotic-appearance-showcasing-a-confused-expression.-The-character-is-depicted-mechanically-moving-th.webp',
    description: 'Everyone starts out as a "Lacrosse Bot" lacks game awareness and skill, often making basic mistakes and following others without understanding why.',
    rank_order: 1
  },
  {
    name: '2nd Bar Syndrome',
    min_lax_credits: 25,
    max_lax_credits: 59,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.45-A-3D-animated-cartoonish-lacrosse-player-with-oversized-helmet-bars-that-obscure-his-vision-like-peering-through-a-mail-slot.-This-character-is-awkw.webp',
    description: 'Ever feel like you\'re just not seeing the big picture? That\'s our friend with the 2nd Bar Syndrome, constantly navigating the field as if he\'s peering through a mail slot.',
    rank_order: 2
  },
  {
    name: 'Left Bench Hero',
    min_lax_credits: 60,
    max_lax_credits: 99,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.12-A-high-resolution-3D-animated-image-of-a-cheerful-lacrosse-player-sitting-on-the-sideline-fully-equipped-intensely-observing-the-game.-The-player-d.webp',
    description: 'He made the team, but that\'s just the start. Our Left Bench hero might not play much, but he\'s got the best seat in the house to learn.',
    rank_order: 3
  },
  {
    name: 'Celly King',
    min_lax_credits: 100,
    max_lax_credits: 139,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.10-Animated-scene-of-a-lacrosse-player-on-the-bench-leading-celebrations-with-dynamic-exaggerated-motions-like-dances-and-fist-pumps.-The-character-is-.webp',
    description: 'The hype-man of the bench. He might not score the goals, but he leads the league in celebrations.',
    rank_order: 4
  },
  {
    name: 'D-Mid Rising',
    min_lax_credits: 140,
    max_lax_credits: 199,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-05-22.10.09-A-cartoonish-3D-animated-image-of-a-lacrosse-defensive-midfielder-known-as-D-Mid-Rising-viewed-from-the-front.-The-top-of-the-helmet-slightly-cover.webp',
    description: 'Emerging from the sidelines to the heart of the action, you\'re honing your transition skills and sharpening defensive instincts.',
    rank_order: 5
  },
  {
    name: 'Lacrosse Utility',
    min_lax_credits: 200,
    max_lax_credits: 299,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lacrosse-Utility.png',
    description: 'Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.',
    rank_order: 6
  },
  {
    name: 'Flow Bro',
    min_lax_credits: 300,
    max_lax_credits: 449,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Flow-Bro.png',
    description: 'Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.',
    rank_order: 7
  },
  {
    name: 'Lax Beast',
    min_lax_credits: 450,
    max_lax_credits: 599,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Beast.png',
    description: 'The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill.',
    rank_order: 8
  },
  {
    name: 'Lax Ninja',
    min_lax_credits: 600,
    max_lax_credits: 999,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Ninja.png',
    description: 'The Lax Ninja moves with stealth and precision, blending agility, focus, and technique.',
    rank_order: 9
  },
  {
    name: 'Lax God',
    min_lax_credits: 1000,
    max_lax_credits: 999999,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-God-2.png',
    description: 'The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess.',
    rank_order: 10
  }
]

async function populatePlayerRanks() {
  console.log('🔄 Populating powlax_player_ranks table...')
  
  // First, check if the table has the expected columns by trying to insert one record
  const testRank = playerRanks[0]
  const { data: testData, error: testError } = await supabase
    .from('powlax_player_ranks')
    .insert([testRank])
    .select()
  
  if (testError) {
    console.error('❌ Error with test insert (checking table structure):', testError)
    
    // If icon_url column doesn't exist, try without it
    const { data: testData2, error: testError2 } = await supabase
      .from('powlax_player_ranks')
      .insert([{
        name: testRank.name,
        min_lax_credits: testRank.min_lax_credits,
        max_lax_credits: testRank.max_lax_credits,
        description: testRank.description,
        rank_order: testRank.rank_order
      }])
      .select()
    
    if (testError2) {
      console.error('❌ Error with simplified insert:', testError2)
      return
    } else {
      console.log('⚠️  Table exists but no icon_url column. Adding ranks without images for now...')
      
      // Insert remaining ranks without icon_url
      for (let i = 1; i < playerRanks.length; i++) {
        const rank = playerRanks[i]
        const { error } = await supabase
          .from('powlax_player_ranks')
          .insert([{
            name: rank.name,
            min_lax_credits: rank.min_lax_credits,
            max_lax_credits: rank.max_lax_credits,
            description: rank.description,
            rank_order: rank.rank_order
          }])
        
        if (error) {
          console.error(`❌ Error inserting ${rank.name}:`, error)
        } else {
          console.log(`✅ Added ${rank.name} (${rank.min_lax_credits}-${rank.max_lax_credits} credits)`)
        }
      }
    }
  } else {
    console.log(`✅ Test insert successful! Table has icon_url column.`)
    
    // Insert remaining ranks with icon_url
    for (let i = 1; i < playerRanks.length; i++) {
      const rank = playerRanks[i]
      const { error } = await supabase
        .from('powlax_player_ranks')
        .insert([rank])
      
      if (error) {
        console.error(`❌ Error inserting ${rank.name}:`, error)
      } else {
        console.log(`✅ Added ${rank.name} (${rank.min_lax_credits}-${rank.max_lax_credits} credits) with image`)
      }
    }
  }
  
  console.log('🎉 Player ranks population complete!')
}

populatePlayerRanks().catch(console.error)
