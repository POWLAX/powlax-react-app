import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMagicLinksRLS() {
  console.log('🔍 Checking magic_links table RLS and structure...\n')
  
  // 1. Check table structure
  const { data: tableInfo, error: tableError } = await supabase
    .from('magic_links')
    .select('*')
    .limit(0)
  
  if (tableError) {
    console.log('❌ Error accessing magic_links table:', tableError.message)
    return
  }
  
  console.log('✅ magic_links table is accessible\n')
  
  // 2. Check recent records with detailed info
  const { data: recentLinks, error: recentError } = await supabase
    .from('magic_links')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (!recentError && recentLinks) {
    console.log(`📊 Recent magic links (${recentLinks.length} records):\n`)
    recentLinks.forEach((link, index) => {
      console.log(`Record ${index + 1}:`)
      console.log('  ID:', link.id)
      console.log('  Email:', link.email)
      console.log('  Token:', link.token ? `${link.token.substring(0, 10)}...` : 'NULL')
      console.log('  Used:', link.used || 'false/undefined')
      console.log('  Created:', link.created_at)
      console.log('  Expires:', link.expires_at)
      console.log('  Supabase User ID:', link.supabase_user_id || 'NULL')
      
      // Check if expired
      const expiresAt = new Date(link.expires_at)
      const now = new Date()
      if (expiresAt < now) {
        console.log('  ⚠️  STATUS: EXPIRED')
      } else {
        console.log('  ✅ STATUS: VALID')
      }
      console.log('')
    })
  }
  
  // 3. Check for duplicate tokens
  const { data: allLinks, error: allError } = await supabase
    .from('magic_links')
    .select('token, email, created_at')
    .order('created_at', { ascending: false })
  
  if (!allError && allLinks) {
    const tokenMap = new Map<string, number>()
    allLinks.forEach(link => {
      if (link.token) {
        tokenMap.set(link.token, (tokenMap.get(link.token) || 0) + 1)
      }
    })
    
    const duplicates = Array.from(tokenMap.entries()).filter(([_, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log('⚠️  WARNING: Duplicate tokens found:')
      duplicates.forEach(([token, count]) => {
        console.log(`  Token ${token.substring(0, 10)}... appears ${count} times`)
      })
    } else {
      console.log('✅ No duplicate tokens found\n')
    }
  }
  
  // 4. Check RLS policies using raw SQL
  try {
    const { data: policies, error: policyError } = await supabase.rpc('get_policies_for_table', {
      table_name: 'magic_links'
    }).single()
    
    if (!policyError && policies) {
      console.log('📋 RLS Policies:', policies)
    }
  } catch (e) {
    // Try alternative approach
    console.log('\n🔍 Checking RLS status...')
    
    // Test if we can insert (should work with service role key)
    const testToken = `test-${Date.now()}`
    const { error: insertError } = await supabase
      .from('magic_links')
      .insert({
        email: 'test@example.com',
        token: testToken,
        expires_at: new Date(Date.now() + 60000).toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.log('❌ Cannot insert into magic_links:', insertError.message)
      console.log('   This might indicate RLS is blocking inserts')
    } else {
      console.log('✅ Can insert into magic_links table')
      
      // Clean up test record
      await supabase
        .from('magic_links')
        .delete()
        .eq('token', testToken)
    }
  }
  
  // 5. Check if 'used' column exists and is being tracked
  const { data: usedLinks, error: usedError } = await supabase
    .from('magic_links')
    .select('*')
    .eq('used', true)
    .limit(5)
  
  if (usedError) {
    console.log('\n⚠️  Issue with "used" column:', usedError.message)
    console.log('   The "used" column might not exist or might not be properly typed')
  } else {
    console.log(`\n📊 Used magic links: ${usedLinks?.length || 0} found`)
  }
  
  // 6. Check table columns structure
  console.log('\n📋 Attempting to get table structure...')
  const { data: sampleRecord } = await supabase
    .from('magic_links')
    .select('*')
    .limit(1)
    .single()
  
  if (sampleRecord) {
    console.log('Table columns:', Object.keys(sampleRecord))
  }
}

checkMagicLinksRLS().catch(console.error)