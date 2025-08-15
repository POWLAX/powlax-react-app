import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLatestMagicLink() {
  // Get the most recent magic link for patrick@powlax.com
  const { data: links, error } = await supabase
    .from('magic_links')
    .select('*')
    .eq('email', 'patrick@powlax.com')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (error) {
    console.log('❌ Error:', error.message)
    return
  }
  
  if (links && links.length > 0) {
    const link = links[0]
    console.log('\n📊 Latest Magic Link for patrick@powlax.com:')
    console.log('============================================')
    console.log('Token:', link.token)
    console.log('Created:', link.created_at)
    console.log('Expires:', link.expires_at)
    console.log('Used At:', link.used_at || 'NOT USED')
    console.log('Supabase User ID:', link.supabase_user_id || 'Not linked')
    
    // Check if expired
    const expiresAt = new Date(link.expires_at)
    const now = new Date()
    if (link.used_at) {
      console.log('\n✅ Status: USED')
    } else if (expiresAt < now) {
      console.log('\n❌ Status: EXPIRED (not used)')
    } else {
      console.log('\n✅ Status: VALID')
      console.log('\n🔗 Correct URL to use:')
      console.log(`http://localhost:3000/api/auth/magic-link?token=${link.token}`)
    }
  }
}

checkLatestMagicLink().catch(console.error)