import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface BadgeData {
  title: string
  description: string
  category: string
  icon_url?: string
  badge_type?: string
  sub_category?: string
  earned_by_type?: string
  points_type_required?: string
  points_required: number
  wordpress_id?: number
  maximum_earnings: number
  is_hidden: boolean
  sort_order?: number
  metadata?: any
}

// Manually curated badge data based on the guide and what we know should exist
const knownBadges: BadgeData[] = [
  // Lacrosse IQ Badges (from CSV file structure we saw)
  {
    title: "Offensive Maestro",
    description: "Awarded to the player who completed the Offensive Strategy Master Class, gaining a deep understanding of offensive principles. They know how to create opportunities, adapt to defenses, and guide their team to success.",
    category: "lacrosse_iq",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/IQ-Offense.png",
    points_required: 0,
    points_type_required: "",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 1,
    wordpress_id: 27227,
    earned_by_type: "triggers",
    metadata: {
      congratulations_text: "Congratulations! You've earned the Offensive Maestro achievement."
    }
  },
  {
    title: "Defensive Strategist",
    description: "Awarded to the player who completed the Defensive Strategy Master Class, developing a comprehensive grasp of defensive systems. They anticipate plays, position themselves effectively, and help anchor their team's defense.",
    category: "lacrosse_iq",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/IQ-Settled-Defense-1-1.png",
    points_required: 0,
    points_type_required: "",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 2,
    wordpress_id: 27228,
    earned_by_type: "triggers",
    metadata: {
      congratulations_text: "Well done! You've earned the Defensive Strategist achievement. Your defensive IQ is rock solid!"
    }
  },
  {
    title: "Fast Break Commander",
    description: "Awarded to the player who completed the Fast Break Strategy Master Class, learning how to transition seamlessly from defense to offense. They understand the timing, spacing, and decision-making required to maximize fast break opportunities.",
    category: "lacrosse_iq",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/IQ-Offensive-Transition.png",
    points_required: 0,
    points_type_required: "",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 3,
    wordpress_id: 27229,
    earned_by_type: "triggers",
    metadata: {
      congratulations_text: "You've unlocked the Fast Break Commander achievement! Your Transition Offense IQ will keep your team moving forward with speed and precision!"
    }
  },
  {
    title: "Lockdown Specialist",
    description: "Awarded to the player who completed the Transition Defense Master Class, mastering the strategy to slow down opposing transitions. They recognize threats early and position themselves to protect the goal while supporting their teammates.",
    category: "lacrosse_iq",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/IQ-Transition-Defense.png",
    points_required: 0,
    points_type_required: "",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 4,
    wordpress_id: 27230,
    earned_by_type: "triggers"
  },
  
  // Wall Ball Badges (example based on guide)
  {
    title: "Foundation Ace",
    description: "Master of the fundamentals. This player has shown dedication to the basics of wall ball practice and built a solid foundation for their lacrosse skills.",
    category: "wall_ball",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png",
    points_required: 5,
    points_type_required: "lax_credit",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 5,
    earned_by_type: "completing_workouts"
  },
  {
    title: "Stamina Star",
    description: "This player has demonstrated exceptional endurance and commitment to extended wall ball sessions. Their stamina on the field shows through their dedicated practice.",
    category: "wall_ball",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png",
    points_required: 10,
    points_type_required: "lax_credit",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 6,
    earned_by_type: "completing_workouts"
  },
  
  // Attack Badges (example based on guide)
  {
    title: "Crease Crawler",
    description: "Awarded for completing drills focused on finishing around the crease with finesse. This player knows how to find space and score in tight quarters.",
    category: "attack",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png",
    points_required: 5,
    points_type_required: "attack_token",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 7,
    earned_by_type: "completing_drills",
    metadata: {
      congratulations_text: "Congratulations! You've earned the Crease Crawler Badge!"
    }
  },
  {
    title: "Fast Break Finisher",
    description: "Master of transition offense. This player excels at converting fast break opportunities into goals with speed and precision.",
    category: "attack",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/A4-Fast-Break-Finisher.png",
    points_required: 8,
    points_type_required: "attack_token",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 8,
    earned_by_type: "completing_drills"
  },
  
  // Defense Badges (example based on guide)
  {
    title: "Turnover Titan",
    description: "Master of defensive disruption. This player excels at creating turnovers and generally shutting down offensive players.",
    category: "defense",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png",
    points_required: 5,
    points_type_required: "defense_dollar",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 9,
    earned_by_type: "completing_drills",
    metadata: {
      congratulations_text: "You've become a nightmare for attackers"
    }
  },
  {
    title: "Silky Smooth",
    description: "Awarded for mastering defensive footwork and positioning. This player moves with grace and efficiency on defense.",
    category: "defense",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png",
    points_required: 6,
    points_type_required: "defense_dollar",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 10,
    earned_by_type: "completing_drills"
  },
  
  // Midfield Badges (example based on guide)
  {
    title: "Fast Break Starter",
    description: "Master of transition initiation. This midfielder excels at starting fast breaks and controlling the pace of play.",
    category: "midfield",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/M5-Fast-Break-Starter.png",
    points_required: 7,
    points_type_required: "midfield_medal",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 11,
    earned_by_type: "completing_drills"
  },
  {
    title: "Modest Midfielder",
    description: "A well-rounded player who excels in all aspects of midfield play. Humble but effective in their contributions to the team.",
    category: "midfield",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/M9-Modest-Midfielder.png",
    points_required: 10,
    points_type_required: "midfield_medal",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 12,
    earned_by_type: "completing_drills"
  },
  
  // Solid Start Badges (beginner badges)
  {
    title: "First Steps",
    description: "Welcome to lacrosse! This badge recognizes a player's first steps into the game and commitment to learning the fundamentals.",
    category: "solid_start",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/SS1-First-Steps.png",
    points_required: 1,
    points_type_required: "lax_credit",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 13,
    earned_by_type: "account_creation"
  },
  {
    title: "Learning Path",
    description: "This player is on the right track! They've shown dedication to following structured learning and skill development.",
    category: "solid_start",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/SS2-Learning-Path.png",
    points_required: 3,
    points_type_required: "lax_credit",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 14,
    earned_by_type: "completing_lessons"
  },
  
  // Completed Workouts Badges
  {
    title: "Workout Warrior",
    description: "Dedicated to fitness and skill development. This player consistently completes their training workouts.",
    category: "completed_workouts",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/CW1-Workout-Warrior.png",
    points_required: 5,
    points_type_required: "lax_credit",
    maximum_earnings: 5,
    is_hidden: false,
    sort_order: 15,
    earned_by_type: "completing_workouts"
  },
  {
    title: "Training Champion",
    description: "Elite level dedication to training. This player has completed numerous workouts and shows exceptional commitment.",
    category: "completed_workouts",
    icon_url: "https://powlax.com/wp-content/uploads/2024/10/CW2-Training-Champion.png",
    points_required: 15,
    points_type_required: "lax_credit",
    maximum_earnings: 1,
    is_hidden: false,
    sort_order: 16,
    earned_by_type: "completing_workouts"
  }
]

async function insertKnownBadges() {
  console.log('🏆 Inserting known badge data into Supabase...\n')
  
  // Clear existing badges
  console.log('🧹 Clearing existing badges...')
  const { error: deleteError } = await supabase
    .from('badges_powlax')
    .delete()
    .neq('id', 0)
  
  if (deleteError) {
    console.log('⚠️ Warning: Could not clear existing badges:', deleteError.message)
  }
  
  let successCount = 0
  
  for (let i = 0; i < knownBadges.length; i++) {
    const badge = knownBadges[i]
    
    console.log(`📦 Inserting badge ${i + 1}/${knownBadges.length}: ${badge.title}`)
    
    const { data, error } = await supabase
      .from('badges_powlax')
      .insert([badge])
      .select('id, title, category')
    
    if (error) {
      console.log(`❌ Error inserting badge:`, error.message)
      console.log('Badge data:', {
        title: badge.title,
        category: badge.category,
        titleLength: badge.title.length
      })
    } else {
      console.log(`✅ Inserted: ${data?.[0]?.title} (${badge.category})`)
      successCount++
    }
  }
  
  // Get final count
  const { count } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n🎉 Successfully inserted: ${successCount}/${knownBadges.length} badges`)
  console.log(`🎉 Final badge count in database: ${count}`)
  
  // Show sample of inserted badges
  const { data: sampleBadges } = await supabase
    .from('badges_powlax')
    .select('id, title, category, icon_url, points_required')
    .limit(5)
  
  console.log('\n📋 Sample inserted badges:')
  sampleBadges?.forEach(badge => {
    console.log(`   ${badge.id}: ${badge.title} (${badge.category}) - ${badge.points_required} points`)
  })
}

async function main() {
  try {
    await insertKnownBadges()
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

main()