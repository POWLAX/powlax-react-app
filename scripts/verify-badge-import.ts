/**
 * Verify Badge Import and Create Sample User Badge Awards
 * Check that badges were imported correctly and create example badge awards
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyBadgeImport() {
  console.log('🔍 Verifying badge import and creating sample awards...\n')

  // 1. Check badge categories and counts
  console.log('📊 Badge categories and counts:')
  const { data: categoryStats } = await supabase
    .from('badges_powlax')
    .select('category')
  
  if (categoryStats) {
    const categoryCount = categoryStats.reduce((acc: any, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1
      return acc
    }, {})
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} badges`)
    })
  }

  // 2. Show sample badges from each category
  console.log('\n📋 Sample badges by category:')
  const categories = ['attack', 'defense', 'midfield', 'wall_ball', 'lacrosse_iq', 'solid_start']
  
  for (const category of categories) {
    const { data: categoryBadges } = await supabase
      .from('badges_powlax')
      .select('id, title, description')
      .eq('category', category)
      .limit(2)
    
    if (categoryBadges && categoryBadges.length > 0) {
      console.log(`\n🏷️  ${category.toUpperCase()}:`)
      categoryBadges.forEach(badge => {
        console.log(`   ${badge.id}: ${badge.title}`)
        console.log(`      ${badge.description}`)
      })
    }
  }

  // 3. Get a sample user for badge awards
  console.log('\n👤 Getting sample user for badge awards...')
  const { data: users } = await supabase
    .from('users')
    .select('id, email, display_name')
    .limit(1)
  
  if (!users || users.length === 0) {
    console.log('❌ No users found for sample awards')
    return
  }

  const sampleUser = users[0]
  console.log(`✅ Using user: ${sampleUser.email} (${sampleUser.display_name})`)

  // 4. Award some sample badges
  console.log('\n🏆 Creating sample badge awards...')
  
  // Get some badges to award
  const { data: sampleBadges } = await supabase
    .from('badges_powlax')
    .select('id, title, category')
    .in('category', ['wall_ball', 'solid_start'])
    .limit(3)
  
  if (sampleBadges && sampleBadges.length > 0) {
    const badgeAwards = sampleBadges.map(badge => ({
      user_id: sampleUser.id,
      badge_key: `badge_${badge.id}`, // Create a unique badge key
      badge_name: badge.title,
      source: 'verification_script'
    }))
    
    const { data: awardedBadges, error: awardError } = await supabase
      .from('user_badges')
      .insert(badgeAwards)
      .select()
    
    if (awardError) {
      console.log('❌ Error awarding badges:', awardError.message)
    } else {
      console.log(`✅ Awarded ${awardedBadges?.length || 0} sample badges:`)
      awardedBadges?.forEach(award => {
        console.log(`   🏆 ${award.badge_name} (${award.badge_key})`)
      })
    }
  }

  // 5. Show final statistics
  console.log('\n📊 Final Statistics:')
  
  const { count: totalBadges } = await supabase
    .from('badges_powlax')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalAwards } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
  
  console.log(`   Total badges available: ${totalBadges}`)
  console.log(`   Total badge awards: ${totalAwards}`)
  
  // Show user's badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_key, badge_name, awarded_at')
    .eq('user_id', sampleUser.id)
  
  if (userBadges && userBadges.length > 0) {
    console.log(`\n🏆 ${sampleUser.display_name}'s badges:`)
    userBadges.forEach(badge => {
      console.log(`   ${badge.badge_name} - ${new Date(badge.awarded_at).toLocaleDateString()}`)
    })
  }
  
  console.log('\n✅ Badge verification complete!')
}

verifyBadgeImport().catch(console.error)