#!/usr/bin/env npx tsx

/**
 * Test Magic Link Creation Directly
 * Replicate the exact API route logic to debug the issue
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function testMagicLinkDirect() {
  console.log('🔍 Testing Magic Link Creation Directly...')
  
  // Use exact same setup as API route
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  console.log('Environment check:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Set' : '❌ Missing')
  console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing')

  const supabase = createClient(supabaseUrl, serviceKey, { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  })

  const email = 'direct-test@powlax.com'
  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  console.log('\n📧 Creating magic link for:', email)
  console.log('Token:', token.substring(0, 20) + '...')

  // Test the exact same logic as the API route
  try {
    console.log('\n🔧 Step 1: Checking for existing Supabase user...')
    let supabaseUser = null
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      supabaseUser = existingUsers.users.find(u => u.email === email)
      console.log('Existing user found:', !!supabaseUser)
    } catch (error) {
      console.warn('Error checking existing Supabase users:', error)
    }

    console.log('\n🔧 Step 2: Creating Supabase Auth user if needed...')
    if (!supabaseUser) {
      try {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: '',
            first_name: '',
            last_name: ''
          }
        })
        
        if (createError) {
          console.error('Error creating Supabase user:', createError)
        } else {
          supabaseUser = newUser.user
          console.log('✅ Created new Supabase user:', supabaseUser.id)
        }
      } catch (error) {
        console.error('Failed to create Supabase user:', error)
      }
    }

    console.log('\n🔧 Step 3: Storing magic link in database...')
    const { error: insertError } = await supabase
      .from('magic_links')
      .insert({
        token,
        email,
        supabase_user_id: supabaseUser?.id || null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('❌ Error storing magic link:', insertError)
      return
    } else {
      console.log('✅ Magic link stored successfully')
    }

    console.log('\n📧 Step 4: Testing email service...')
    const { emailService } = await import('../src/lib/email-service.js')
    console.log('Email service configured:', emailService.isConfigured)
    
    if (emailService.isConfigured) {
      console.log('📤 Attempting to send email...')
      const sent = await emailService.sendMagicLink(email, token)
      console.log('Email sent:', sent ? '✅ Success' : '❌ Failed')
    } else {
      console.log('📤 Email not configured, would show debug URL:')
      const magicLinkUrl = `http://localhost:3000/auth/magic-link?token=${token}`
      console.log('🔗 Magic Link URL:', magicLinkUrl)
    }

    // Verify record was created
    console.log('\n🔍 Step 5: Verifying record in database...')
    const { data: verification, error: verifyError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
    } else {
      console.log('✅ Verification successful:', verification)
    }

  } catch (error) {
    console.error('❌ Overall error:', error)
  }
}

// Load environment variables properly
require('dotenv').config({ path: '.env.local' })

// Run if called directly
if (require.main === module) {
  testMagicLinkDirect().catch(console.error)
}

export { testMagicLinkDirect }
