#!/usr/bin/env npx tsx

/**
 * Create Immediate Working Magic Link
 * Bypass the broken API route and create a magic link directly
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function createImmediateMagicLink() {
  require('dotenv').config({ path: '.env.local' })
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const email = 'chaplalacrosse22@gmail.com'
  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  console.log('🔧 Creating immediate magic link for:', email)

  try {
    // Create magic link record
    const { data: insertData, error: insertError } = await supabase
      .from('magic_links')
      .insert({
        token,
        email,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      console.error('❌ Failed to create magic link:', insertError)
      return
    }

    console.log('✅ Magic link created successfully!')
    console.log('📧 Email:', email)
    console.log('🔗 Magic Link URL:')
    console.log(`http://localhost:3000/auth/magic-link?token=${token}`)
    console.log('')
    console.log('⏰ Expires at:', expiresAt.toLocaleString())
    console.log('')
    console.log('🎯 COPY AND PASTE THIS URL INTO YOUR BROWSER:')
    console.log(`http://localhost:3000/auth/magic-link?token=${token}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run if called directly
if (require.main === module) {
  createImmediateMagicLink().catch(console.error)
}

export { createImmediateMagicLink }
