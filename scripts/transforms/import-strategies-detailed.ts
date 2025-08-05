import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSingleInsert() {
  console.log('🧪 Testing single insert...')
  
  const testRecord = {
    reference_id: 999,
    strategy_name: 'Test Strategy',
    strategy_categories: 'Test Category',
    description: 'This is a test strategy',
    has_pdf: false,
    see_it_ages: '09-10',
    coach_it_ages: '11-14',
    own_it_ages: '13-14'
  }
  
  const { data, error } = await supabase
    .from('wp_strategies')
    .insert(testRecord)
    .select()
  
  if (error) {
    console.error('❌ Test insert failed:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ Test insert successful:', data)
    
    // Clean up test record
    if (data && data[0]) {
      await supabase
        .from('wp_strategies')
        .delete()
        .eq('id', data[0].id)
    }
  }
}

async function importStrategiesWithDetails() {
  console.log('📊 Importing strategies with detailed error reporting...\n')
  
  // First test if we can insert
  await testSingleInsert()
  
  const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    cast: true,
    cast_date: false
  }, async (err, records) => {
    if (err) {
      console.error('CSV Parse error:', err)
      return
    }
    
    console.log(`\n📁 Parsed ${records.length} records from CSV`)
    
    // Show first record structure
    if (records.length > 0) {
      console.log('\n📋 First record structure:')
      console.log(JSON.stringify(records[0], null, 2))
    }
    
    // Process one by one for detailed error reporting
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []
    
    for (let i = 0; i < Math.min(5, records.length); i++) {
      const row = records[i]
      
      try {
        // Transform the record
        const strategy = {
          reference_id: row.reference_id ? parseInt(row.reference_id) : null,
          strategy_categories: row.strategy_categories || null,
          strategy_name: row.strategy_name || null,
          lacrosse_lab_links: row.lacrosse_lab_links && row.lacrosse_lab_links !== '[]' 
            ? JSON.parse(row.lacrosse_lab_links) 
            : null,
          description: row.description || null,
          embed_codes: row.embed_codes && row.embed_codes !== '[]'
            ? JSON.parse(row.embed_codes)
            : null,
          see_it_ages: row.see_it_ages || null,
          coach_it_ages: row.coach_it_ages || null,
          own_it_ages: row.own_it_ages || null,
          has_pdf: row.has_pdf === '1' || row.has_pdf === 'true',
          target_audience: row.target_audience || null,
          lesson_category: row.lesson_category || null,
          master_pdf_url: row.master_pdf_url || null,
          vimeo_id: row.vimeo_id ? parseInt(row.vimeo_id) : null,
          vimeo_link: row.vimeo_link || null,
          pdf_shortcode: row.pdf_shortcode || null,
          thumbnail_urls: row.thumbnail_urls && row.thumbnail_urls !== '[]'
            ? JSON.parse(row.thumbnail_urls)
            : null
        }
        
        console.log(`\n🔄 Inserting record ${i + 1}: ${strategy.strategy_name}`)
        
        const { data, error } = await supabase
          .from('wp_strategies')
          .insert(strategy)
          .select()
        
        if (error) {
          errorCount++
          console.error(`❌ Error:`, error.message)
          errors.push({ record: i + 1, name: strategy.strategy_name, error: error.message })
        } else {
          successCount++
          console.log(`✅ Success: Inserted with ID ${data[0].id}`)
        }
        
      } catch (e) {
        errorCount++
        console.error(`❌ Transform error for record ${i + 1}:`, e)
        errors.push({ record: i + 1, error: e })
      }
    }
    
    console.log('\n📊 Import Summary:')
    console.log(`- Attempted: ${Math.min(5, records.length)} records`)
    console.log(`- Successful: ${successCount}`)
    console.log(`- Failed: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Error Details:')
      errors.forEach(e => {
        console.log(`  Record ${e.record} (${e.name || 'unknown'}): ${e.error}`)
      })
    }
    
    if (successCount > 0) {
      console.log('\n✅ Import successful! To import all records, modify the loop limit.')
    }
  })
}

// Run the import
importStrategiesWithDetails().catch(console.error)