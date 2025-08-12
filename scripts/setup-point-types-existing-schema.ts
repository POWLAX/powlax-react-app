// scripts/setup-point-types-existing-schema.ts
// Purpose: Work with existing point_types_powlax schema and add series_type mapping
// Pattern: Permanence pattern with existing column mapping

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function setupExistingSchema() {
  console.log('🎯 Setting up point types with existing schema...')
  
  try {
    // Step 1: Get current data and see what we can work with
    console.log('📊 Step 1: Analyzing existing data...')
    const { data: existing, error: fetchError } = await supabase
      .from('point_types_powlax')
      .select('*')
      .order('id')
    
    if (fetchError) {
      console.error('❌ Error fetching data:', fetchError)
      return
    }
    
    console.log(`📊 Found ${existing?.length || 0} existing point types`)
    if (existing && existing.length > 0) {
      console.log('📝 Existing schema columns:', Object.keys(existing[0]))
      
      existing.forEach(type => {
        console.log(`  ${type.id}: ${type.display_name} - ${type.slug}`)
      })
    }
    
    // Step 2: Add series_type mapping to metadata field (since we can't add columns)
    console.log('\n📝 Step 2: Adding series_type mapping via metadata...')
    
    const seriesMapping = {
      'academy-points': 'general',
      'academy-point': 'general',
      'attack-token': 'attack',
      'defense-dollar': 'defense',
      'midfield-medal': 'midfield',
      'midfield-metal': 'midfield',
      'rebound-reward': 'goalie',
      'rebound-rewards': 'goalie',
      'flex-point': 'general',
      'lax-iq-point': 'general',
      'lax-credit': 'general'
    }
    
    if (existing && existing.length > 0) {
      for (const record of existing) {
        const series_type = seriesMapping[record.slug as keyof typeof seriesMapping] || 'general'
        const updatedMetadata = {
          ...record.metadata,
          series_type: series_type,
          skills_academy_enabled: true,
          contract_compliant: true
        }
        
        console.log(`📝 Updating ${record.display_name} with series_type: ${series_type}`)
        
        const { error: updateError } = await supabase
          .from('point_types_powlax')
          .update({ 
            metadata: updatedMetadata 
          })
          .eq('id', record.id)
        
        if (updateError) {
          console.error(`❌ Error updating ${record.display_name}:`, updateError)
        } else {
          console.log(`✅ Updated ${record.display_name}`)
        }
      }
    }
    
    // Step 3: Insert missing point types from CSV requirements
    console.log('\n📝 Step 3: Ensuring all required point types exist...')
    
    const requiredTypes = [
      {
        name: 'lax_credit',
        display_name: 'Academy Point',
        plural_name: 'Academy Points', 
        slug: 'lax-credit',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
        description: 'Universal currency earned from all activities (Lax Credits)',
        conversion_rate: 1,
        is_active: true,
        metadata: {
          series_type: 'general',
          skills_academy_enabled: true,
          contract_compliant: true
        }
      },
      {
        name: 'defense_dollar',
        display_name: 'Defense Dollar',
        plural_name: 'Defense Dollars',
        slug: 'defense-dollar', 
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
        description: 'Points earned from defense-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {
          series_type: 'defense',
          skills_academy_enabled: true,
          contract_compliant: true
        }
      },
      {
        name: 'midfield_medal',
        display_name: 'Midfield Medal', 
        plural_name: 'Midfield Medals',
        slug: 'midfield-metal',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
        description: 'Points earned from midfield-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {
          series_type: 'midfield',
          skills_academy_enabled: true,
          contract_compliant: true
        }
      },
      {
        name: 'rebound_reward',
        display_name: 'Rebound Reward',
        plural_name: 'Rebound Rewards',
        slug: 'rebound-rewards',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
        description: 'Points earned from goalie-focused drills',
        conversion_rate: 1,
        is_active: true,
        metadata: {
          series_type: 'goalie',
          skills_academy_enabled: true,
          contract_compliant: true
        }
      }
    ]
    
    for (const pointType of requiredTypes) {
      // Check if it already exists
      const { data: existingType } = await supabase
        .from('point_types_powlax')
        .select('id, slug')
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
        console.log(`✅ ${pointType.display_name} already exists`)
      }
    }
    
    // Step 4: Final verification with permanence pattern compliance
    console.log('\n🔍 Step 4: Final verification...')
    const { data: finalData, error: finalError } = await supabase
      .from('point_types_powlax')
      .select('id, display_name, icon_url, slug, metadata')
      .eq('is_active', true)
      .order('id')
    
    if (finalError) {
      console.error('❌ Verification failed:', finalError)
    } else {
      console.log('✅ Final point types for Skills Academy:')
      console.log(`📊 Total active: ${finalData?.length || 0} point types`)
      
      if (finalData && finalData.length > 0) {
        // Group by series_type from metadata
        const groupedBySeries = finalData.reduce((acc: Record<string, any[]>, type) => {
          const series = type.metadata?.series_type || 'unknown'
          if (!acc[series]) acc[series] = []
          acc[series].push(type)
          return acc
        }, {})
        
        console.log('\n📊 Point types by series (Skills Academy ready):')
        Object.entries(groupedBySeries).forEach(([series, types]) => {
          console.log(`\n🎯 ${series.toUpperCase()} (${types.length} types):`)
          types.forEach(type => {
            console.log(`  ${type.id}: ${type.display_name}`)
            console.log(`      Image: ${type.icon_url}`)
            console.log(`      Slug: ${type.slug}`)
          })
        })
        
        // Permanence pattern compliance check
        const contractCompliantTypes = finalData.filter(type => 
          type.display_name && type.icon_url && type.slug && type.metadata?.series_type
        )
        
        console.log(`\n✅ Contract compliance: ${contractCompliantTypes.length}/${finalData.length} types ready`)
        console.log('✅ Permanence pattern: Using existing columns (display_name, icon_url, metadata.series_type)')
        console.log('✅ Skills Academy mapping ready: display_name→title, icon_url→image_url, metadata.series_type→series_type')
        
        if (contractCompliantTypes.length === finalData.length) {
          console.log('\n🎉 All point types are Skills Academy ready!')
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

setupExistingSchema()
  .then(() => {
    console.log('\n🎯 Point types setup complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })