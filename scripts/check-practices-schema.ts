#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://avvpyjwytcmtoiyrbibb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'
)

async function checkSchema() {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .limit(1)

  if (data && data.length > 0) {
    console.log('Practices table columns:', Object.keys(data[0]))
    console.log('Sample record:', data[0])
  } else {
    console.log('No practices found or error:', error)
  }
}

checkSchema()