import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY')
  console.log('Run: source .env.local && SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY npx tsx scripts/get-magic-link.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function getMagicLink() {
  console.log('🔍 Retrieving magic links for patrick@powlax.com...\n')
  
  try {
    // Get the most recent magic link
    const { data: magicLinks, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('email', 'patrick@powlax.com')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching magic links:', error.message)
      return
    }
    
    if (!magicLinks || magicLinks.length === 0) {
      console.log('❌ No magic links found for patrick@powlax.com')
      console.log('   Try requesting a new one with: curl -X POST http://localhost:3000/api/auth/magic-link -H "Content-Type: application/json" -d \'{"email":"patrick@powlax.com"}\'')
      return
    }
    
    console.log(`✅ Found ${magicLinks.length} magic link(s):\n`)
    
    magicLinks.forEach((link, index) => {
      const createdAt = new Date(link.created_at)
      const expiresAt = new Date(link.expires_at)
      const now = new Date()
      const isExpired = expiresAt < now
      const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / 60000)
      
      console.log(`Link #${index + 1}:`)
      console.log('  Created:', minutesAgo, 'minutes ago')
      console.log('  Expires:', isExpired ? '❌ EXPIRED' : `✅ Valid for ${Math.floor((expiresAt.getTime() - now.getTime()) / 60000)} more minutes`)
      console.log('  Token:', link.token)
      console.log('  User ID:', link.supabase_user_id || 'Not linked to auth user yet')
      
      if (!isExpired && index === 0) {
        const magicLinkUrl = `http://localhost:3000/auth/magic-link?token=${link.token}`
        console.log('\n🔗 Click this link to login:')
        console.log('  ', magicLinkUrl)
        console.log('\n  Or use direct link:')
        console.log('  ', `http://localhost:3000/api/auth/magic-link?token=${link.token}`)
      }
      console.log('---')
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

getMagicLink().catch(console.error)