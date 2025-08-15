#!/usr/bin/env npx tsx

/**
 * Fix Magic Links RLS Policy Issue
 * The service role is being blocked by RLS policies, preventing magic link creation
 */

import { createClient } from '@supabase/supabase-js'

async function fixMagicLinksRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔧 Fixing Magic Links RLS Policies...')

  try {
    // First, check current policies
    console.log('\n📋 Current policies on magic_links table:')
    const { data: policies, error: policiesError } = await supabase.rpc('sql', {
      query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd 
        FROM pg_policies 
        WHERE tablename = 'magic_links';
      `
    })
    
    if (policiesError) {
      console.log('Cannot check policies (this is normal):', policiesError.message)
    } else {
      console.log('Policies:', policies)
    }

    // Drop existing policies and recreate
    console.log('\n🗑️ Dropping existing policies...')
    const dropResult = await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "magic_links_service_only" ON magic_links;
        DROP POLICY IF EXISTS "service_role_magic_links_full_access" ON magic_links;
      `
    })
    
    console.log('Drop result:', dropResult)

    // Create new policy
    console.log('\n✨ Creating new service role policy...')
    const createResult = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "service_role_magic_links_access" ON magic_links
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
      `
    })
    
    console.log('Create result:', createResult)

    // Test insertion
    console.log('\n🧪 Testing magic link insertion...')
    const testToken = 'test-rls-fix-' + Date.now()
    const { data: insertData, error: insertError } = await supabase
      .from('magic_links')
      .insert({
        token: testToken,
        email: 'test-rls-fix@example.com',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', insertError)
    } else {
      console.log('✅ Insert successful:', insertData)
    }

    // Check if record exists
    const { data: checkData, error: checkError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('email', 'test-rls-fix@example.com')

    if (checkError) {
      console.error('❌ Check failed:', checkError)
    } else {
      console.log('✅ Record found:', checkData)
    }

    // Clean up test record
    await supabase
      .from('magic_links')
      .delete()
      .eq('token', testToken)

    console.log('\n🎉 Magic Links RLS fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error)
  }
}

// Run if called directly
if (require.main === module) {
  fixMagicLinksRLS().catch(console.error)
}

export { fixMagicLinksRLS }
