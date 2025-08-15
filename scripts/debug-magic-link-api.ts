#!/usr/bin/env npx tsx

/**
 * Debug Magic Link API Issues
 * Test the magic link creation directly to see where it's failing
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function debugMagicLinkAPI() {
  const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔍 Debugging Magic Link API...')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Service Key (first 20 chars):', serviceKey.substring(0, 20) + '...')

  const email = 'debug-test@powlax.com'
  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  console.log('\n📧 Test Data:')
  console.log('Email:', email)
  console.log('Token:', token.substring(0, 20) + '...')
  console.log('Expires At:', expiresAt.toISOString())

  // Step 1: Test direct database insertion
  console.log('\n🔧 Step 1: Testing direct database insertion...')
  try {
    const { data: insertData, error: insertError } = await supabase
      .from('magic_links')
      .insert({
        token,
        email,
        supabase_user_id: null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      console.error('❌ Direct insert failed:', insertError)
    } else {
      console.log('✅ Direct insert successful:', insertData)
    }
  } catch (error) {
    console.error('❌ Direct insert exception:', error)
  }

  // Step 2: Check if record exists
  console.log('\n🔍 Step 2: Checking if record exists...')
  try {
    const { data: checkData, error: checkError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (checkError) {
      console.error('❌ Check failed:', checkError)
    } else {
      console.log('✅ Records found:', checkData?.length || 0)
      if (checkData && checkData.length > 0) {
        console.log('Latest record:', checkData[0])
      }
    }
  } catch (error) {
    console.error('❌ Check exception:', error)
  }

  // Step 3: Test email service
  console.log('\n📧 Step 3: Testing email service...')
  try {
    const { EmailService } = await import('../src/lib/email-service.js')
    const emailService = new EmailService()
    console.log('Email service configured:', emailService.isConfigured)
    
    // Note: We won't actually send email in debug mode
    console.log('Email service ready for testing')
  } catch (error) {
    console.error('❌ Email service error:', error)
  }

  // Step 4: Check all magic links in database
  console.log('\n📊 Step 4: All magic links in database:')
  try {
    const { data: allLinks, error: allError } = await supabase
      .from('magic_links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (allError) {
      console.error('❌ Failed to fetch all links:', allError)
    } else {
      console.log(`✅ Total magic links found: ${allLinks?.length || 0}`)
      allLinks?.forEach((link, index) => {
        console.log(`${index + 1}. ${link.email} - ${link.created_at} - Token: ${link.token.substring(0, 10)}...`)
      })
    }
  } catch (error) {
    console.error('❌ All links exception:', error)
  }

  // Clean up test record
  await supabase
    .from('magic_links')
    .delete()
    .eq('token', token)

  console.log('\n🎉 Debug completed!')
}

// Run if called directly
if (require.main === module) {
  debugMagicLinkAPI().catch(console.error)
}

export { debugMagicLinkAPI }
