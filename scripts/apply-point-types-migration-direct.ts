import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Environment check:')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyPointTypesMigration() {
  console.log('🚀 Applying point types migration...')
  
  try {
    // Step 1: Update existing table with point types data using the correct schema
    console.log('📊 Updating point types data in existing table...')
    const pointTypes = [
      { 
        name: 'academy_point', 
        display_name: 'Academy Point', 
        plural_name: 'Academy Points',
        slug: 'academy-point',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
        description: 'Universal currency earned from all activities',
        is_active: true
      },
      { 
        name: 'attack_token', 
        display_name: 'Attack Token', 
        plural_name: 'Attack Tokens',
        slug: 'attack-token',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png',
        description: 'Points earned from attack-focused drills',
        is_active: true
      },
      { 
        name: 'defense_dollar', 
        display_name: 'Defense Dollar', 
        plural_name: 'Defense Dollars',
        slug: 'defense-dollar',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
        description: 'Points earned from defensive drills',
        is_active: true
      },
      { 
        name: 'midfield_medal', 
        display_name: 'Midfield Medal', 
        plural_name: 'Midfield Medals',
        slug: 'midfield-medal',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
        description: 'Points earned from midfield drills',
        is_active: true
      },
      { 
        name: 'rebound_reward', 
        display_name: 'Rebound Reward', 
        plural_name: 'Rebound Rewards',
        slug: 'rebound-reward',
        icon_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
        description: 'Points earned from wall ball workouts',
        is_active: true
      },
      { 
        name: 'flex_point', 
        display_name: 'Flex Point', 
        plural_name: 'Flex Points',
        slug: 'flex-point',
        icon_url: 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png',
        description: 'Points earned from flexible skill development',
        is_active: true
      },
      { 
        name: 'lax_iq_point', 
        display_name: 'Lax IQ Point', 
        plural_name: 'Lax IQ Points',
        slug: 'lax-iq-point',
        icon_url: 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
        description: 'Points earned from knowledge and strategy activities',
        is_active: true
      }
    ]
    
    // Try to insert one record to test the schema
    const { data: testInsert, error: insertError } = await supabase
      .from('point_types_powlax')
      .upsert([pointTypes[0]], { onConflict: 'name' })
      .select()
    
    if (insertError) {
      if (insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
        console.log('❌ Table does not exist. You need to run the SQL migration manually.')
        console.log('📋 Run this command in your Supabase SQL editor:')
        console.log('')
        console.log('```sql')
        console.log('-- Create point_types_powlax table')
        console.log('CREATE TABLE IF NOT EXISTS point_types_powlax (')
        console.log('  id BIGSERIAL PRIMARY KEY,')
        console.log('  title VARCHAR(255) NOT NULL UNIQUE,')
        console.log('  image_url TEXT NOT NULL,')
        console.log('  slug VARCHAR(255) NOT NULL UNIQUE,')
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
        console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
        console.log(');')
        console.log('')
        console.log('-- Enable RLS')
        console.log('ALTER TABLE point_types_powlax ENABLE ROW LEVEL SECURITY;')
        console.log('')
        console.log('-- Create read policy')
        console.log('CREATE POLICY "Point types are viewable by everyone" ON point_types_powlax')
        console.log('  FOR SELECT USING (true);')
        console.log('```')
        console.log('')
        return
      } else {
        console.error('❌ Error inserting data:', insertError)
        return
      }
    }
    
    console.log('✅ Table exists! Continuing with full data insert...')
    
    // Insert all point types
    const { error: fullInsertError } = await supabase
      .from('point_types_powlax')
      .upsert(pointTypes, { onConflict: 'name' })
    
    if (fullInsertError) {
      console.error('❌ Error inserting all data:', fullInsertError)
      return
    }
    
    console.log('✅ Point types data inserted successfully')
    
    // Verify the setup
    console.log('🧪 Verifying setup...')
    const { data: pointTypesData, error: verifyError } = await supabase
      .from('point_types_powlax')
      .select('*')
      .order('id')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }
    
    console.log(`✅ Verification complete: ${pointTypesData.length} point types imported`)
    pointTypesData.forEach(pt => {
      console.log(`  • ${pt.display_name} (${pt.name}) - ${pt.icon_url ? '🎨' : '❌'} Icon`)
    })
    
    console.log('\n🎉 Point types migration applied successfully!')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

applyPointTypesMigration()