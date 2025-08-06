import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// IMPORTANT: Use SERVICE ROLE KEY for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.log('\n📝 To get your service role key:')
  console.log('1. Go to https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/settings/api')
  console.log('2. Find "service_role" under Project API keys')
  console.log('3. Add to .env.local as: SUPABASE_SERVICE_ROLE_KEY=your_key_here')
  console.log('\n⚠️  IMPORTANT: Never expose the service role key in client-side code!')
  process.exit(1)
}

// Create client with SERVICE ROLE key for full admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function importStrategiesWithServiceRole() {
  console.log('🔐 Using Service Role Key for admin access...')
  console.log('📊 Starting strategies import to strategies_powlax table...\n')
  
  try {
    // Step 1: Create table if it doesn't exist
    console.log('Step 1: Creating table if needed...')
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS strategies_powlax (
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
    `
    
    // Execute raw SQL using service role privileges
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })
    
    if (createError && !createError.message?.includes('already exists')) {
      console.error('Error creating table:', createError)
    } else {
      console.log('✅ Table ready')
    }
    
    // Step 2: Disable RLS for bulk import
    console.log('\nStep 2: Disabling RLS for import...')
    await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE strategies_powlax DISABLE ROW LEVEL SECURITY;' 
    })
    console.log('✅ RLS disabled')
    
    // Step 3: Read and parse CSV
    console.log('\nStep 3: Reading CSV data...')
    const csvPath = path.join(__dirname, '../docs/Wordpress CSV\'s/Strategies and Concepts to LL/strategies_transformed.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = await new Promise<any[]>((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    
    console.log(`✅ Parsed ${records.length} records`)
    
    // Step 4: Transform and insert data
    console.log('\nStep 4: Importing strategies...')
    const strategies = records.map((row: any) => ({
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
    }))
    
    // Batch insert with service role privileges
    const batchSize = 50
    let imported = 0
    
    for (let i = 0; i < strategies.length; i += batchSize) {
      const batch = strategies.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('strategies_powlax')
        .insert(batch)
      
      if (error) {
        console.error(`Error in batch ${i}-${i + batchSize}:`, error)
      } else {
        imported += batch.length
        process.stdout.write(`\r✓ Progress: ${imported}/${strategies.length}`)
      }
    }
    
    console.log('\n✅ Data import complete!')
    
    // Step 5: Re-enable RLS with policies
    console.log('\nStep 5: Re-enabling RLS with policies...')
    
    // Enable RLS
    await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE strategies_powlax ENABLE ROW LEVEL SECURITY;' 
    })
    
    // Create policies
    const policies = [
      {
        name: 'Allow anonymous read access',
        sql: `CREATE POLICY "Allow anonymous read access" ON strategies_powlax
              FOR SELECT TO anon USING (true);`
      },
      {
        name: 'Allow authenticated users full access',
        sql: `CREATE POLICY "Allow authenticated users full access" ON strategies_powlax
              FOR ALL TO authenticated USING (true) WITH CHECK (true);`
      },
      {
        name: 'Service role has full access',
        sql: `CREATE POLICY "Service role has full access" ON strategies_powlax
              FOR ALL TO service_role USING (true) WITH CHECK (true);`
      }
    ]
    
    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.sql })
        console.log(`✅ Created policy: ${policy.name}`)
      } catch (e) {
        // Policy might already exist
      }
    }
    
    // Step 6: Create indexes
    console.log('\nStep 6: Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_strategies_powlax_strategy_name ON strategies_powlax(strategy_name);',
      'CREATE INDEX IF NOT EXISTS idx_strategies_powlax_strategy_categories ON strategies_powlax(strategy_categories);',
      'CREATE INDEX IF NOT EXISTS idx_strategies_powlax_vimeo_id ON strategies_powlax(vimeo_id);',
      'CREATE INDEX IF NOT EXISTS idx_strategies_powlax_lacrosse_lab_links ON strategies_powlax USING gin(lacrosse_lab_links);'
    ]
    
    for (const index of indexes) {
      await supabase.rpc('exec_sql', { sql: index })
    }
    console.log('✅ Indexes created')
    
    // Verify import
    const { count } = await supabase
      .from('strategies_powlax')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n✅ Import Complete! ${count} strategies in database.`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

// Add helper to check if we have service role key
async function checkServiceRoleAccess() {
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .single()
  
  if (error) {
    console.log('❌ Cannot access system tables - service role key may be invalid')
    return false
  }
  
  console.log('✅ Service role key is valid')
  return true
}

// Run the import
async function main() {
  // First check if service role key works
  const hasAccess = await checkServiceRoleAccess()
  if (!hasAccess) {
    process.exit(1)
  }
  
  // Run the import
  await importStrategiesWithServiceRole()
}

main().catch(console.error)