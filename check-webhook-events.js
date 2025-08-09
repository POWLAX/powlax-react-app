require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkWebhookEvents() {
  try {
    const { data, error } = await supabase
      .from('webhook_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('Recent webhook events:')
      data.forEach((event, i) => {
        console.log(`${i + 1}. Event: ${event.event_type}`)
        console.log(`   Source: ${event.source}`)
        console.log(`   Status: ${event.status}`)
        console.log(`   Received: ${event.received_at}`)
        console.log(`   Webhook ID: ${event.webhook_id}`)
        console.log('   ---')
      })
    } else {
      console.log('No webhook events found yet.')
    }
  } catch (err) {
    console.error('Connection error:', err.message)
  }
}

checkWebhookEvents()
