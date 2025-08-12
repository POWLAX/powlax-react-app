import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyPointTypesMigration() {
  try {
    console.log('🚀 Directly applying point types data using client operations...')
    return await directInsertPointTypes()
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Alternative direct insertion method if SQL execution fails
async function directInsertPointTypes() {
  try {
    console.log('🔄 Trying direct data insertion...')
    
    // First check if the table exists
    const { data: existingData, error: checkError } = await supabase
      .from('point_types_powlax')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.code === '42P01') {
      console.log('❌ Table point_types_powlax does not exist. Please run the SQL migration manually.')
      console.log('📄 Run the SQL from: /supabase/migrations/120_point_types_import.sql')
      throw new Error('Table does not exist')
    }
    
    console.log('✅ Table exists, proceeding with data insertion')
    
    // Insert data using Supabase client
    const pointTypes = [
      { title: 'Academy Point', image_url: 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png', slug: 'academy-point' },
      { title: 'Attack Token', image_url: 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png', slug: 'attack-token' },
      { title: 'Defense Dollar', image_url: 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png', slug: 'defense-dollar' },
      { title: 'Midfield Medal', image_url: 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png', slug: 'midfield-medal' },
      { title: 'Rebound Reward', image_url: 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png', slug: 'rebound-reward' },
      { title: 'Flex Point', image_url: 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png', slug: 'flex-point' },
      { title: 'Lax IQ Point', image_url: 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png', slug: 'lax-iq-point' }
    ]
    
    const { data, error: insertError } = await supabase
      .from('point_types_powlax')
      .upsert(pointTypes, { onConflict: 'title' })
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting data:', insertError)
      throw insertError
    }
    
    console.log(`✅ Inserted ${data?.length || 0} point types successfully`)
    
    console.log('ℹ️ Note: RLS policies should be set up manually via SQL migration')
    
    console.log('\n🎉 Direct insertion method completed successfully!')
    return data
    
  } catch (error) {
    console.error('💥 Direct insertion failed:', error)
    throw error
  }
}

// Run the migration
if (require.main === module) {
  applyPointTypesMigration()
    .catch(() => {
      console.log('\n🔄 Falling back to direct insertion method...')
      return directInsertPointTypes()
    })
    .catch((error) => {
      console.error('💥 All migration methods failed:', error)
      process.exit(1)
    })
}

export { applyPointTypesMigration, directInsertPointTypes }