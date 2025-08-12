// scripts/verify-point-types.ts
// Purpose: Verify point_types_powlax table exists and has correct data
// Pattern: Supabase Permanence Pattern verification script

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface PointType {
  id: number
  title: string
  image_url: string
  slug: string
  series_type: string
  created_at: string
  updated_at: string
}

async function verifyPointTypes() {
  console.log('🎯 Verifying point_types_powlax table (existing schema)...')
  
  try {
    // Test direct column reads with existing schema (permanence pattern)
    const { data: pointTypes, error } = await supabase
      .from('point_types_powlax')
      .select('*') // Direct column mapping - no extraction needed
      .eq('is_active', true)
      .order('id')

    if (error) {
      console.error('❌ Error fetching point types:', error)
      return
    }

    console.log('✅ Point types table exists and accessible')
    console.log(`📊 Found ${pointTypes?.length || 0} active point types`)

    // Expected point types from CSV (using existing schema mapping)
    const expectedSeries = ['attack', 'defense', 'midfield', 'goalie', 'general']

    if (pointTypes && pointTypes.length > 0) {
      console.log('\n📝 Point Types Data (Skills Academy Ready):')
      pointTypes.forEach((type: any) => {
        const series_type = type.metadata?.series_type || 'unknown'
        console.log(`  ${type.id}: ${type.display_name}`)
        console.log(`     Slug: ${type.slug}`)
        console.log(`     Series: ${series_type}`)
        console.log(`     Image: ${type.icon_url}`)
        console.log('')
      })

      // Test filtering by series_type from metadata (critical for live counter)
      console.log('\n🎯 Testing series_type filtering (from metadata):')
      
      for (const seriesType of expectedSeries) {
        // Filter by metadata.series_type
        const filteredTypes = pointTypes.filter(type => 
          type.metadata?.series_type === seriesType
        )

        console.log(`  ${seriesType}: ${filteredTypes.length} types`)
        if (filteredTypes.length > 0) {
          filteredTypes.forEach(type => console.log(`    - ${type.display_name}`))
        }
      }

    } else {
      console.log('⚠️  No active point types found.')
    }

    // Test permanence pattern compliance with existing schema
    console.log('\n🔍 Permanence Pattern Verification (Existing Schema):')
    if (pointTypes && pointTypes.length > 0) {
      const firstType = pointTypes[0]
      const hasDirectColumns = 
        typeof firstType.display_name === 'string' &&
        typeof firstType.icon_url === 'string' &&
        typeof firstType.slug === 'string' &&
        typeof firstType.metadata?.series_type === 'string'

      if (hasDirectColumns) {
        console.log('✅ Direct column mapping confirmed - using existing schema')
        console.log('✅ Mapping ready: display_name→title, icon_url→image_url, metadata.series_type→series_type')
        console.log('✅ Data ready for real-time point counter')
        
        // Test Skills Academy contract compliance
        const contractReady = pointTypes.filter(type => 
          type.display_name && 
          type.icon_url && 
          type.slug && 
          type.metadata?.skills_academy_enabled === true
        )
        
        console.log(`✅ Skills Academy ready: ${contractReady.length}/${pointTypes.length} point types`)
        
        if (contractReady.length === pointTypes.length) {
          console.log('🎉 All point types are Skills Academy contract compliant!')
        }
      } else {
        console.log('❌ Data structure issue - columns not properly mapped')
      }
    }

  } catch (error) {
    console.error('💥 Verification failed:', error)
  }
}

// Run verification
verifyPointTypes()
  .then(() => {
    console.log('\n🎯 Verification complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })