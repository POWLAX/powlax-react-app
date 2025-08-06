import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function importStrategies() {
  console.log('🚀 Starting strategies import to Supabase...')
  console.log('Supabase URL:', supabaseUrl)
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_insert.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    
    // Extract just the INSERT statements (skip CREATE TABLE and indexes)
    const insertStatements = sqlContent
      .split('INSERT INTO wp_strategies')
      .slice(1) // Skip the part before first INSERT
      .map(stmt => 'INSERT INTO wp_strategies' + stmt.split(';')[0] + ';')
      .filter(stmt => stmt.includes('VALUES'))
    
    console.log(`Found ${insertStatements.length} strategy records to import`)
    
    // First, let's check if the table exists and create it if needed
    const createTableMatch = sqlContent.match(/CREATE TABLE IF NOT EXISTS[\s\S]+?\);/m)
    if (createTableMatch) {
      console.log('Creating table structure...')
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableMatch[0]
      }).single()
      
      if (createError && !createError.message.includes('already exists')) {
        console.error('Error creating table:', createError)
      }
    }
    
    // Process records in batches
    const batchSize = 10
    let imported = 0
    let errors = 0
    
    // Parse the transformed CSV instead for easier processing
    const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Simple CSV parsing for our use case
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const records = []
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      
      // Handle CSV parsing with nested JSON
      const record: any = {}
      let currentField = ''
      let fieldIndex = 0
      let inQuotes = false
      let inJson = false
      
      for (let char of lines[i] + ',') {
        if (char === '"' && !inJson) {
          inQuotes = !inQuotes
        } else if (char === '[' && inQuotes) {
          inJson = true
          currentField += char
        } else if (char === ']' && inJson) {
          inJson = false
          currentField += char
        } else if (char === ',' && !inQuotes) {
          // End of field
          const fieldName = headers[fieldIndex]
          let value = currentField.trim()
          
          // Remove surrounding quotes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1)
          }
          
          // Parse based on field type
          if (fieldName === 'lacrosse_lab_links' || fieldName === 'embed_codes' || fieldName === 'thumbnail_urls') {
            record[fieldName] = value ? JSON.parse(value.replace(/""/g, '"')) : null
          } else if (fieldName === 'has_pdf') {
            record[fieldName] = value === '1'
          } else if (fieldName === 'vimeo_id' || fieldName === 'reference_id') {
            record[fieldName] = value ? parseInt(value) : null
          } else if (value === '') {
            record[fieldName] = null
          } else {
            record[fieldName] = value
          }
          
          currentField = ''
          fieldIndex++
        } else {
          currentField += char
        }
      }
      
      if (Object.keys(record).length > 0) {
        records.push(record)
      }
    }
    
    console.log(`Parsed ${records.length} records from CSV`)
    
    // Import in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      // Remove fields that shouldn't be in insert
      const cleanBatch = batch.map(record => {
        const { id, strategy_id, created_at, updated_at, ...rest } = record
        return rest
      })
      
      const { error } = await supabase
        .from('wp_strategies')
        .insert(cleanBatch)
      
      if (error) {
        console.error(`Error importing batch ${i}-${i + batchSize}:`, error)
        errors += batch.length
      } else {
        imported += batch.length
        console.log(`✓ Imported ${imported}/${records.length} strategies`)
      }
    }
    
    // Create indexes
    console.log('\n📊 Creating indexes...')
    const indexStatements = sqlContent.match(/CREATE INDEX[\s\S]+?;/gm)
    if (indexStatements) {
      for (const indexStmt of indexStatements) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: indexStmt
        }).single()
        
        if (error && !error.message.includes('already exists')) {
          console.error('Error creating index:', error.message)
        }
      }
    }
    
    // Summary
    console.log('\n✅ Import Summary:')
    console.log(`- Total records: ${records.length}`)
    console.log(`- Successfully imported: ${imported}`)
    console.log(`- Errors: ${errors}`)
    
    // Verify import
    const { count } = await supabase
      .from('wp_strategies')
      .select('*', { count: 'exact', head: true })
    
    console.log(`- Total in database: ${count}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Alternative: Direct batch insert without RPC
async function importStrategiesDirectly() {
  console.log('🚀 Using direct insert method...')
  
  const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
  const { parse } = await import('csv-parse')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true
    }, async (err, records) => {
      if (err) {
        reject(err)
        return
      }
      
      // Transform records
      const strategies = records.map((row: any) => ({
        reference_id: row.reference_id ? parseInt(row.reference_id) : null,
        strategy_categories: row.strategy_categories || null,
        strategy_name: row.strategy_name || null,
        lacrosse_lab_links: row.lacrosse_lab_links ? JSON.parse(row.lacrosse_lab_links) : null,
        description: row.description || null,
        embed_codes: row.embed_codes ? JSON.parse(row.embed_codes) : null,
        see_it_ages: row.see_it_ages || null,
        coach_it_ages: row.coach_it_ages || null,
        own_it_ages: row.own_it_ages || null,
        has_pdf: row.has_pdf === '1',
        target_audience: row.target_audience || null,
        lesson_category: row.lesson_category || null,
        master_pdf_url: row.master_pdf_url || null,
        vimeo_id: row.vimeo_id ? parseInt(row.vimeo_id) : null,
        vimeo_link: row.vimeo_link || null,
        pdf_shortcode: row.pdf_shortcode || null,
        thumbnail_urls: row.thumbnail_urls ? JSON.parse(row.thumbnail_urls) : null
      }))
      
      console.log(`Importing ${strategies.length} strategies...`)
      
      // Batch insert
      const batchSize = 50
      let imported = 0
      
      for (let i = 0; i < strategies.length; i += batchSize) {
        const batch = strategies.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from('wp_strategies')
          .insert(batch)
        
        if (error) {
          console.error(`Error in batch ${i}-${i + batchSize}:`, error)
        } else {
          imported += batch.length
          console.log(`✓ Progress: ${imported}/${strategies.length}`)
        }
      }
      
      console.log(`\n✅ Import complete! Imported ${imported} strategies.`)
      resolve(imported)
    })
  })
}

// Run the import
importStrategiesDirectly()
  .then(() => {
    console.log('\n🎯 Next steps:')
    console.log('1. Verify data in Supabase dashboard')
    console.log('2. Test strategy queries')
    console.log('3. Create drill-strategy mappings')
    process.exit(0)
  })
  .catch(err => {
    console.error('Import error:', err)
    process.exit(1)
  })