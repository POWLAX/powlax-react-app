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
    title: 'Lacrosse Bot',
    lax_credits_required: 0,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.11-A-cartoonish-3D-animated-lacrosse-player-with-a-robotic-appearance-showcasing-a-confused-expression.-The-character-is-depicted-mechanically-moving-th.webp',
    description: 'Everyone starts out as a "Lacrosse Bot" lacks game awareness and skill, often making basic mistakes and following others without understanding why.',
    rank_order: 1,
    gender: 'neutral'
  },
  {
    title: '2nd Bar Syndrome',
    lax_credits_required: 25,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.45-A-3D-animated-cartoonish-lacrosse-player-with-oversized-helmet-bars-that-obscure-his-vision-like-peering-through-a-mail-slot.-This-character-is-awkw.webp',
    description: 'Ever feel like you\'re just not seeing the big picture? That\'s our friend with the 2nd Bar Syndrome, constantly navigating the field as if he\'s peering through a mail slot.',
    rank_order: 2,
    gender: 'neutral'
  },
  {
    title: 'Left Bench Hero',
    lax_credits_required: 60,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.12-A-high-resolution-3D-animated-image-of-a-cheerful-lacrosse-player-sitting-on-the-sideline-fully-equipped-intensely-observing-the-game.-The-player-d.webp',
    description: 'He made the team, but that\'s just the start. Our Left Bench hero might not play much, but he\'s got the best seat in the house to learn.',
    rank_order: 3,
    gender: 'neutral'
  },
  {
    title: 'Celly King',
    lax_credits_required: 100,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.10-Animated-scene-of-a-lacrosse-player-on-the-bench-leading-celebrations-with-dynamic-exaggerated-motions-like-dances-and-fist-pumps.-The-character-is-.webp',
    description: 'The hype-man of the bench. He might not score the goals, but he leads the league in celebrations.',
    rank_order: 4,
    gender: 'neutral'
  },
  {
    title: 'D-Mid Rising',
    lax_credits_required: 140,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-05-22.10.09-A-cartoonish-3D-animated-image-of-a-lacrosse-defensive-midfielder-known-as-D-Mid-Rising-viewed-from-the-front.-The-top-of-the-helmet-slightly-cover.webp',
    description: 'Emerging from the sidelines to the heart of the action, you\'re honing your transition skills and sharpening defensive instincts.',
    rank_order: 5,
    gender: 'neutral'
  },
  {
    title: 'Lacrosse Utility',
    lax_credits_required: 200,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lacrosse-Utility.png',
    description: 'Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.',
    rank_order: 6,
    gender: 'neutral'
  },
  {
    title: 'Flow Bro',
    lax_credits_required: 300,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Flow-Bro.png',
    description: 'Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.',
    rank_order: 7,
    gender: 'neutral'
  },
  {
    title: 'Lax Beast',
    lax_credits_required: 450,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Beast.png',
    description: 'The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill.',
    rank_order: 8,
    gender: 'neutral'
  },
  {
    title: 'Lax Ninja',
    lax_credits_required: 600,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Ninja.png',
    description: 'The Lax Ninja moves with stealth and precision, blending agility, focus, and technique.',
    rank_order: 9,
    gender: 'neutral'
  },
  {
    title: 'Lax God',
    lax_credits_required: 1000,
    icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-God-2.png',
    description: 'The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess.',
    rank_order: 10,
    gender: 'neutral'
  }
]

async function populatePlayerRanks() {
  console.log('🔄 Populating powlax_player_ranks table with correct structure...')
  
  for (const rank of playerRanks) {
    const { data, error } = await supabase
      .from('powlax_player_ranks')
      .insert([rank])
      .select()
    
    if (error) {
      console.error(`❌ Error inserting ${rank.title}:`, error)
    } else {
      console.log(`✅ Added ${rank.title} (${rank.lax_credits_required}+ credits) with image`)
    }
  }
  
  console.log('🎉 Player ranks population complete!')
  
  // Show final count
  const { data: allRanks, error: countError } = await supabase
    .from('powlax_player_ranks')
    .select('title, lax_credits_required, icon_url')
    .order('rank_order')
  
  if (!countError && allRanks) {
    console.log(`\n📊 Total ranks in database: ${allRanks.length}`)
    allRanks.forEach(rank => {
      console.log(`   • ${rank.title} (${rank.lax_credits_required}+ credits) - ${rank.icon_url ? '🖼️ Has image' : '❌ No image'}`)
    })
  }
}

populatePlayerRanks().catch(console.error)
