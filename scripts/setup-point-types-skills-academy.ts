// scripts/setup-point-types-skills-academy.ts
// Purpose: Setup point types table for Skills Academy following permanence pattern
// Pattern: Direct column operations for contract compliance

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  console.log('Using anon key - some operations may fail')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function setupPointTypes() {
  console.log('🎯 Setting up point types for Skills Academy...')
  
  try {
    // First, let's manually update the existing records with the missing data
    // Update title and image_url columns from existing data
    console.log('📝 Step 1: Adding contract compliance columns...')
    
    // Get existing data first
    const { data: existing, error: fetchError } = await supabase
      .from('point_types_powlax')
      .select('id, display_name, icon_url, slug')
    
    if (fetchError) {
      console.error('❌ Error fetching existing data:', fetchError)
      return
    }
    
    console.log(`📊 Found ${existing?.length || 0} existing point types`)
    
    // Update records one by one to add missing contract fields
    if (existing && existing.length > 0) {
      for (const record of existing) {
        console.log(`📝 Updating record ${record.id}: ${record.display_name}...`)
        
        // Determine series_type based on slug
        let series_type = 'general' // default
        if (record.slug === 'attack-token') series_type = 'attack'
        if (record.slug === 'defense-dollar') series_type = 'defense'
        if (record.slug.includes('midfield')) series_type = 'midfield'
        if (record.slug.includes('rebound')) series_type = 'goalie'
        
        const { error: updateError } = await supabase
          .from('point_types_powlax')
          .update({
            title: record.display_name,
            image_url: record.icon_url,
            series_type: series_type
          })
          .eq('id', record.id)
        
        if (updateError) {
          console.error(`❌ Error updating record ${record.id}:`, updateError)
        } else {
          console.log(`✅ Updated record ${record.id} with series_type: ${series_type}`)
        }
      }
    }
    
    // Step 2: Insert missing point types from CSV
    console.log('\n📝 Step 2: Adding missing point types from CSV...')
    
    const requiredTypes = [
      {
        name: 'lax_credit',
        display_name: 'Academy Point',
        title: 'Academy Point',
        plural_name: 'Academy Points',
        slug: 'lax-credit',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
        image_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
        series_type: 'general',
        description: 'Universal currency earned from all activities (Lax Credits)',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      },
      {
        name: 'defense_dollar',
        display_name: 'Defense Dollar',
        title: 'Defense Dollar',
        plural_name: 'Defense Dollars',
        slug: 'defense-dollar',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
        image_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
        series_type: 'defense',
        description: 'Points earned from defense-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      },
      {
        name: 'midfield_medal',
        display_name: 'Midfield Medal',
        title: 'Midfield Medal',
        plural_name: 'Midfield Medals',
        slug: 'midfield-metal',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
        image_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
        series_type: 'midfield',
        description: 'Points earned from midfield-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      },
      {
        name: 'rebound_reward',
        display_name: 'Rebound Reward',
        title: 'Rebound Reward',
        plural_name: 'Rebound Rewards',
        slug: 'rebound-rewards',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
        image_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
        series_type: 'goalie',
        description: 'Points earned from goalie-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      },
      {
        name: 'flex_point',
        display_name: 'Flex Point',
        title: 'Flex Point',
        plural_name: 'Flex Points',
        slug: 'flex-point',
        icon_url: 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png',
        image_url: 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png',
        series_type: 'general',
        description: 'Flexible points for off-grid activities',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      },
      {
        name: 'lax_iq_point',
        display_name: 'Lax IQ Point',
        title: 'Lax IQ Point',
        plural_name: 'Lax IQ Points',
        slug: 'lax-iq-point',
        icon_url: 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
        image_url: 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
        series_type: 'general',
        description: 'Points earned from lacrosse IQ activities',
        conversion_rate: 1,
        is_active: true,
        metadata: {}
      }
    ]
    
    for (const pointType of requiredTypes) {
      // Check if it already exists
      const { data: existingType } = await supabase
        .from('point_types_powlax')
        .select('id')
        .eq('slug', pointType.slug)
        .single()
      
      if (!existingType) {
        console.log(`📝 Inserting missing point type: ${pointType.display_name}`)
        const { error: insertError } = await supabase
          .from('point_types_powlax')
          .insert(pointType)
        
        if (insertError) {
          console.error(`❌ Error inserting ${pointType.display_name}:`, insertError)
        } else {
          console.log(`✅ Inserted ${pointType.display_name}`)
        }
      } else {
        console.log(`⚠️  ${pointType.display_name} already exists, skipping`)
      }
    }
    
    // Step 3: Verify final state
    console.log('\n🔍 Step 3: Verifying final setup...')
    const { data: finalData, error: finalError } = await supabase
      .from('point_types_powlax')
      .select('id, title, image_url, slug, series_type')
      .order('series_type, id')
    
    if (finalError) {
      console.error('❌ Verification failed:', finalError)
    } else {
      console.log('✅ Final point types setup:')
      console.log(`📊 Total: ${finalData?.length || 0} point types`)
      
      if (finalData && finalData.length > 0) {
        const groupedBySeries = finalData.reduce((acc: Record<string, any[]>, type) => {
          const series = type.series_type || 'undefined'
          if (!acc[series]) acc[series] = []
          acc[series].push(type)
          return acc
        }, {})
        
        Object.entries(groupedBySeries).forEach(([series, types]) => {
          console.log(`\n📊 ${series.toUpperCase()} (${types.length} types):`)
          types.forEach(type => {
            console.log(`  ${type.id}: ${type.title} - ${type.slug}`)
          })
        })
        
        // Check contract compliance
        const hasRequiredFields = finalData.every(type => 
          type.title && type.image_url && type.slug && type.series_type
        )
        
        if (hasRequiredFields) {
          console.log('\n✅ Contract compliance verified: All required fields present')
          console.log('✅ Permanence pattern followed: Direct column mapping ready')
        } else {
          console.log('\n⚠️  Some records missing required fields')
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

setupPointTypes()
  .then(() => {
    console.log('\n🎯 Point types setup complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })