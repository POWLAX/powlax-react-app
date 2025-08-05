import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import { stringify } from 'csv-stringify'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Column name mapping from original to snake_case
const columnMapping: Record<string, string> = {
  'id': 'id',
  'strategy_id': 'strategy_id', 
  'Reference ID': 'reference_id',
  'Strategy Categories': 'strategy_categories',
  'Strategy Name': 'strategy_name',
  'Lacrosse Lab Link (JSONB Array)': 'lacrosse_lab_links',
  'description (Combined)': 'description',
  'Paste Embed Code in This Column (JSONB Array)': 'embed_codes',
  'See It': 'see_it_ages',
  '5_Coach_It': 'coach_it_ages',
  '6_Own_It': 'own_it_ages',
  '7_PDF': 'has_pdf',
  '8_Target_Audience': 'target_audience',
  '9_Lesson_Category': 'lesson_category',
  'master': 'master_pdf_url',
  'Vimeo ID': 'vimeo_id',
  'Vimeo Link': 'vimeo_link',
  'POWLAX PDF Short Code': 'pdf_shortcode',
  'Thumbnail': 'thumbnail_urls'
}

// Function to parse JSONB array strings
function parseJsonbArray(value: string): any {
  if (!value || value === '[]' || value === '') return null
  
  try {
    // Already valid JSON array
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value)
    }
    // Single value that needs to be wrapped in array
    return [value]
  } catch (e) {
    console.error('Error parsing JSONB array:', value, e)
    return null
  }
}

// Function to clean and parse boolean/flag fields
function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'pdf_yes' || value?.toLowerCase() === 'yes' || value === '1'
}

// Function to clean age ranges
function parseAgeRange(value: string): string | null {
  if (!value || value === '') return null
  return value.trim()
}

// Function to clean URLs and handle multiple thumbnails
function parseThumbnailUrls(value: string): string[] | null {
  if (!value || value === '') return null
  
  // Split by semicolon if multiple URLs
  const urls = value.split(';').map(url => url.trim()).filter(url => url !== '')
  return urls.length > 0 ? urls : null
}

async function transformStrategiesCSV() {
  console.log('📊 Starting strategies CSV transformation...')
  
  const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/DEFINITIVE POWLAX STRATEGY INFORMATION - Sheet1.csv')
  const outputPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
  const sqlOutputPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_insert.sql')
  
  // Read and parse CSV
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true
  }, async (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err)
      return
    }
    
    console.log(`Found ${records.length} strategy records`)
    
    // Transform records
    const transformedRecords = records.map((row: any) => {
      const transformed: any = {}
      
      // Map columns to snake_case
      for (const [originalCol, newCol] of Object.entries(columnMapping)) {
        const value = row[originalCol]
        
        // Special handling for different column types
        switch (newCol) {
          case 'lacrosse_lab_links':
          case 'embed_codes':
            transformed[newCol] = parseJsonbArray(value)
            break
          
          case 'has_pdf':
            transformed[newCol] = parseBoolean(value)
            break
          
          case 'see_it_ages':
          case 'coach_it_ages':
          case 'own_it_ages':
            transformed[newCol] = parseAgeRange(value)
            break
          
          case 'thumbnail_urls':
            transformed[newCol] = parseThumbnailUrls(value)
            break
          
          case 'vimeo_id':
            transformed[newCol] = value ? parseInt(value) : null
            break
          
          case 'description':
            // Clean up multiline descriptions
            transformed[newCol] = value ? value.trim().replace(/\n\s*\n/g, '\n\n') : null
            break
          
          default:
            transformed[newCol] = value || null
        }
      }
      
      // Add metadata fields
      transformed.created_at = new Date().toISOString()
      transformed.updated_at = new Date().toISOString()
      
      return transformed
    })
    
    // Filter out empty rows
    const validRecords = transformedRecords.filter(record => 
      record.strategy_name && record.strategy_name !== '#REF!'
    )
    
    console.log(`Transformed ${validRecords.length} valid strategy records`)
    
    // Generate SQL INSERT statements
    const tableName = 'wp_strategies'
    const columns = Object.keys(validRecords[0]).filter(col => col !== 'id' && col !== 'strategy_id')
    
    let sqlStatements = `-- POWLAX Strategies Import SQL
-- Generated on ${new Date().toISOString()}
-- Total records: ${validRecords.length}

-- Create table if not exists
CREATE TABLE IF NOT EXISTS ${tableName} (
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
);

-- Insert statements
`
    
    validRecords.forEach((record, index) => {
      const values = columns.map(col => {
        const value = record[col]
        
        if (value === null || value === undefined) {
          return 'NULL'
        } else if (typeof value === 'boolean') {
          return value ? 'TRUE' : 'FALSE'
        } else if (typeof value === 'number') {
          return value
        } else if (Array.isArray(value) || (col === 'lacrosse_lab_links' || col === 'embed_codes' || col === 'thumbnail_urls')) {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
        } else {
          // Escape single quotes in strings
          return `'${String(value).replace(/'/g, "''")}'`
        }
      })
      
      sqlStatements += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n(${values.join(', ')});\n\n`
    })
    
    // Add indexes
    sqlStatements += `
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_strategy_name ON ${tableName}(strategy_name);
CREATE INDEX IF NOT EXISTS idx_${tableName}_strategy_categories ON ${tableName}(strategy_categories);
CREATE INDEX IF NOT EXISTS idx_${tableName}_vimeo_id ON ${tableName}(vimeo_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_lacrosse_lab_links ON ${tableName} USING gin(lacrosse_lab_links);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_${tableName}_search ON ${tableName} USING gin(
  to_tsvector('english', COALESCE(strategy_name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(strategy_categories, ''))
);
`
    
    // Write SQL file
    fs.writeFileSync(sqlOutputPath, sqlStatements)
    console.log(`✅ SQL file written to: ${sqlOutputPath}`)
    
    // Also create a clean CSV for potential CSV import
    const csvColumns = columns.map(col => {
      if (col === 'lacrosse_lab_links' || col === 'embed_codes' || col === 'thumbnail_urls') {
        return { key: col, header: col, stringify: (value: any) => JSON.stringify(value || []) }
      }
      return col
    })
    
    stringify(validRecords, {
      header: true,
      columns: csvColumns
    }, (err, output) => {
      if (err) {
        console.error('Error creating CSV:', err)
        return
      }
      
      fs.writeFileSync(outputPath, output)
      console.log(`✅ Transformed CSV written to: ${outputPath}`)
    })
    
    // Summary report
    console.log('\n📊 Transformation Summary:')
    console.log(`- Total records processed: ${records.length}`)
    console.log(`- Valid records: ${validRecords.length}`)
    console.log(`- Strategies with PDFs: ${validRecords.filter(r => r.has_pdf).length}`)
    console.log(`- Strategies with videos: ${validRecords.filter(r => r.vimeo_id).length}`)
    console.log(`- Strategies with Lacrosse Lab diagrams: ${validRecords.filter(r => r.lacrosse_lab_links && r.lacrosse_lab_links.length > 0).length}`)
    
    // Category breakdown
    const categories = new Set(validRecords.map(r => r.strategy_categories).filter(Boolean))
    console.log(`\n📂 Strategy Categories Found (${categories.size}):`)
    categories.forEach(cat => {
      const count = validRecords.filter(r => r.strategy_categories === cat).length
      console.log(`  - ${cat}: ${count} strategies`)
    })
  })
}

// Run the transformation
transformStrategiesCSV().catch(console.error)