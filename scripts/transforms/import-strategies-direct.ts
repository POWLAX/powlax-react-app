import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

// Create client with SERVICE ROLE key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function importStrategies() {
  console.log('🚀 Starting direct import with service role key...')
  console.log('📊 Target table: strategies_powlax\n')
  
  try {
    // Step 1: Test connection with a simple query
    console.log('Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('strategies_powlax')
      .select('id')
      .limit(1)
    
    if (testError && !testError.message.includes('does not exist')) {
      console.error('Connection test failed:', testError)
      console.log('\n📝 Please ensure the table is created first using the SQL Editor')
      return
    }
    
    console.log('✅ Connection successful')
    
    // Step 2: Clear any existing data (optional)
    if (testData && testData.length > 0) {
      console.log('Found existing data. Clearing...')
      const { error: deleteError } = await supabase
        .from('strategies_powlax')
        .delete()
        .gte('id', 0) // Delete all rows
      
      if (deleteError) {
        console.error('Error clearing data:', deleteError)
      }
    }
    
    // Step 3: Parse CSV
    console.log('\nReading CSV file...')
    const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = await new Promise<any[]>((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        cast: false // Don't auto-cast to prevent issues
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    
    console.log(`✅ Parsed ${records.length} records from CSV`)
    
    // Step 4: Transform data
    console.log('\nTransforming data...')
    const strategies = records.map((row: any) => {
      try {
        return {
          reference_id: row.reference_id ? parseInt(row.reference_id) : null,
          strategy_categories: row.strategy_categories || null,
          strategy_name: row.strategy_name || null,
          lacrosse_lab_links: row.lacrosse_lab_links && row.lacrosse_lab_links !== '' 
            ? JSON.parse(row.lacrosse_lab_links) 
            : null,
          description: row.description || null,
          embed_codes: row.embed_codes && row.embed_codes !== ''
            ? JSON.parse(row.embed_codes)
            : null,
          see_it_ages: row.see_it_ages || null,
          coach_it_ages: row.coach_it_ages || null,
          own_it_ages: row.own_it_ages || null,
          has_pdf: row.has_pdf === '1' || row.has_pdf === 'true' || row.has_pdf === true,
          target_audience: row.target_audience || null,
          lesson_category: row.lesson_category || null,
          master_pdf_url: row.master_pdf_url || null,
          vimeo_id: row.vimeo_id ? parseInt(row.vimeo_id) : null,
          vimeo_link: row.vimeo_link || null,
          pdf_shortcode: row.pdf_shortcode || null,
          thumbnail_urls: row.thumbnail_urls && row.thumbnail_urls !== ''
            ? JSON.parse(row.thumbnail_urls)
            : null
        }
      } catch (e) {
        console.error('Error transforming row:', row.reference_id, e)
        return null
      }
    }).filter(Boolean) // Remove any null entries
    
    console.log(`✅ Transformed ${strategies.length} valid strategies`)
    
    // Step 5: Import in batches
    console.log('\nImporting to Supabase...')
    const batchSize = 50
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []
    
    for (let i = 0; i < strategies.length; i += batchSize) {
      const batch = strategies.slice(i, i + batchSize)
      const batchEnd = Math.min(i + batchSize, strategies.length)
      
      process.stdout.write(`\rImporting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(strategies.length/batchSize)} (${i}-${batchEnd})...`)
      
      const { data, error } = await supabase
        .from('strategies_powlax')
        .insert(batch)
        .select()
      
      if (error) {
        errorCount += batch.length
        errors.push({ batch: `${i}-${batchEnd}`, error: error.message })
        console.error(`\n❌ Error in batch ${i}-${batchEnd}:`, error.message)
      } else {
        successCount += data.length
      }
    }
    
    console.log('\n')
    
    // Step 6: Verify final count
    const { count } = await supabase
      .from('strategies_powlax')
      .select('*', { count: 'exact', head: true })
    
    // Summary
    console.log('\n📊 Import Summary:')
    console.log(`- Total records in CSV: ${records.length}`)
    console.log(`- Successfully imported: ${successCount}`)
    console.log(`- Failed: ${errorCount}`)
    console.log(`- Final count in database: ${count}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:')
      errors.forEach(e => console.log(`  Batch ${e.batch}: ${e.error}`))
    }
    
    if (successCount > 0) {
      console.log('\n✅ Import successful!')
      console.log('\n🎯 Next steps:')
      console.log('1. Verify data in Supabase Table Editor')
      console.log('2. Test queries from your application')
      console.log('3. Create drill-strategy mappings')
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error)
  }
}

// First, let's just make sure we can create the table
async function ensureTableExists() {
  console.log('📋 Checking if strategies_powlax table exists...\n')
  
  const { data, error } = await supabase
    .from('strategies_powlax')
    .select('id')
    .limit(1)
  
  if (error && error.message.includes('does not exist')) {
    console.log('❌ Table does not exist!')
    console.log('\n📝 Please run this SQL in Supabase SQL Editor first:')
    console.log('----------------------------------------')
    console.log(`CREATE TABLE IF NOT EXISTS strategies_powlax (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER,
  reference_id INTEGER,
  strategy_categories TEXT,
  strategy_name TEXT NOT NULL,
  lacrosse_lab_links JSONB,
  description TEXT,
  embed_codes JSONB,
  see_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT false,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id BIGINT,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)
    console.log('----------------------------------------')
    console.log('\nThen run this script again.')
    return false
  }
  
  console.log('✅ Table exists or will be created')
  return true
}

// Main execution
async function main() {
  const tableExists = await ensureTableExists()
  if (!tableExists) {
    return
  }
  
  await importStrategies()
}

main().catch(console.error)