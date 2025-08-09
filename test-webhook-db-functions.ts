import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function testWebhookDBFunctions() {
  console.log('🔍 Testing webhook database functions...')
  
  try {
    // 1. Check if webhook_queue table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%webhook%')
    
    console.log('📋 Webhook tables found:', tables?.map(t => t.table_name) || [])
    
    // 2. Check if enqueue_webhook function exists
    const { data: functions } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'enqueue_webhook')
    
    console.log('⚙️ enqueue_webhook function exists:', functions?.length > 0)
    
    // 3. Try to call the function
    if (functions?.length > 0) {
      console.log('🧪 Testing enqueue_webhook function...')
      const { data, error } = await supabase.rpc('enqueue_webhook', {
        p_webhook_id: 'test-webhook-' + Date.now(),
        p_event_type: 'test',
        p_payload: { test: true }
      })
      
      if (error) {
        console.error('❌ Function call failed:', error)
      } else {
        console.log('✅ Function call succeeded, queue_id:', data)
      }
    }
    
    // 4. Check if webhook_queue table has any data
    const { data: queueData, error: queueError } = await supabase
      .from('webhook_queue')
      .select('id, webhook_id, status, created_at')
      .limit(5)
    
    if (queueError) {
      console.error('❌ Cannot access webhook_queue table:', queueError)
    } else {
      console.log('📊 Recent webhook queue entries:', queueData?.length || 0)
      if (queueData?.length > 0) {
        console.log('   Sample entries:', queueData)
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testWebhookDBFunctions()