// Simple Node.js test for webhook database functions
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing webhook database connection...');
console.log('URL exists:', !!url);
console.log('Key exists:', !!key);

if (!url || !key) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function testDB() {
  try {
    // Check if webhook_queue table exists by trying to access it
    const { data: tables, error: tableError } = await supabase
      .from('webhook_queue')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error checking tables:', tableError);
      return;
    }
    
    console.log('📋 webhook_queue table accessible:', !tableError);
    
    // Test enqueue_webhook function
    const testId = 'test-function-' + Date.now();
    const { data: queueId, error: functionError } = await supabase.rpc('enqueue_webhook', {
      p_webhook_id: testId,
      p_event_type: 'test',
      p_payload: { test: true }
    });
    
    if (functionError) {
      console.error('❌ enqueue_webhook function error:', functionError);
      
      // Fallback: Try direct insert
      console.log('🔄 Trying direct insert as fallback...');
      const { data: insertData, error: insertError } = await supabase
        .from('webhook_queue')
        .insert({
          webhook_id: testId,
          event_type: 'test',
          payload: { test: true }
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('❌ Direct insert also failed:', insertError);
      } else {
        console.log('✅ Direct insert worked:', insertData.id);
      }
    } else {
      console.log('✅ enqueue_webhook function works:', queueId);
    }
    
    // Clean up
    await supabase.from('webhook_queue').delete().eq('webhook_id', testId);
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDB();