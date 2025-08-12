import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function updatePointTypesIcons() {
  try {
    console.log('🚀 Updating point types with icon URLs from CSV data...')
    
    // First, get existing point types
    const { data: existingTypes, error: fetchError } = await supabase
      .from('point_types_powlax')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching existing point types:', fetchError)
      throw fetchError
    }
    
    console.log(`📊 Found ${existingTypes?.length || 0} existing point types:`)
    existingTypes?.forEach((type) => {
      console.log(`  - ${type.display_name} (${type.slug}) - icon: ${type.icon_url || 'none'}`)
    })
    
    // Map from CSV data to existing slugs/names
    const iconMappings = [
      { slug: 'academy-point', name: 'academy_point', display_name: 'Academy Point', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png' },
      { slug: 'attack-token', name: 'attack_token', display_name: 'Attack Token', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png' },
      { slug: 'defense-dollar', name: 'defense_dollar', display_name: 'Defense Dollar', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png' },
      { slug: 'midfield-medal', name: 'midfield_medal', display_name: 'Midfield Medal', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png' },
      { slug: 'rebound-reward', name: 'rebound_reward', display_name: 'Rebound Reward', icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png' },
      { slug: 'flex-point', name: 'flex_point', display_name: 'Flex Point', icon_url: 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png' },
      { slug: 'lax-iq-point', name: 'lax_iq_point', display_name: 'Lax IQ Point', icon_url: 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png' }
    ]
    
    // Update existing point types with icon URLs
    for (const mapping of iconMappings) {
      const existing = existingTypes?.find(type => 
        type.slug === mapping.slug || 
        type.name === mapping.name ||
        type.display_name === mapping.display_name
      )
      
      if (existing) {
        console.log(`\n⚡ Updating ${existing.display_name} with icon URL...`)
        
        const { error: updateError } = await supabase
          .from('point_types_powlax')
          .update({ 
            icon_url: mapping.icon_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        
        if (updateError) {
          console.error(`❌ Error updating ${existing.display_name}:`, updateError)
        } else {
          console.log(`✅ Updated ${existing.display_name}`)
        }
      } else {
        console.log(`\n➕ Creating new point type: ${mapping.display_name}...`)
        
        const { error: insertError } = await supabase
          .from('point_types_powlax')
          .insert({
            name: mapping.name,
            display_name: mapping.display_name,
            plural_name: mapping.display_name + 's',
            slug: mapping.slug,
            icon_url: mapping.icon_url,
            description: `Earned from ${mapping.display_name.toLowerCase()}-specific activities`,
            conversion_rate: 1,
            is_active: true,
            metadata: {}
          })
        
        if (insertError) {
          console.error(`❌ Error creating ${mapping.display_name}:`, insertError)
        } else {
          console.log(`✅ Created ${mapping.display_name}`)
        }
      }
    }
    
    // Verify final state
    console.log('\n🔍 Verifying final point types state...')
    const { data: finalTypes, error: finalError } = await supabase
      .from('point_types_powlax')
      .select('*')
      .order('display_name')
    
    if (finalError) {
      console.error('❌ Error fetching final state:', finalError)
    } else {
      console.log(`\n📊 Final point types (${finalTypes?.length || 0} total):`)
      finalTypes?.forEach((type, index) => {
        const hasIcon = type.icon_url ? '🖼️' : '❌'
        console.log(`  ${index + 1}. ${hasIcon} ${type.display_name} - ${type.slug}`)
        if (type.icon_url) {
          console.log(`     Icon: ${type.icon_url}`)
        }
      })
    }
    
    console.log('\n🎉 Point types icon update completed successfully!')
    
  } catch (error) {
    console.error('💥 Update failed:', error)
    process.exit(1)
  }
}

updatePointTypesIcons()