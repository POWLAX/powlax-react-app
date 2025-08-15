import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMagicLinksTable() {
  console.log('🔍 Checking magic_links table structure...\n')
  
  // Check if magic_links table exists
  const { data: tableCheck, error: tableError } = await supabase
    .from('magic_links')
    .select('*')
    .limit(1)
  
  if (tableError) {
    console.log('❌ Error accessing magic_links table:', tableError.message)
    return
  }
  
  console.log('✅ magic_links table exists')
  
  // Get table structure using raw SQL
  const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
    table_name: 'magic_links'
  }).single()
  
  if (columnsError) {
    // Fallback: try to query the information_schema directly
    const { data: schemaData, error: schemaError } = await supabase
      .from('magic_links')
      .select('*')
      .limit(0)
    
    if (!schemaError) {
      console.log('\n📊 Table structure (inferred from query):')
      console.log('Table can be queried successfully')
    }
  } else {
    console.log('\n📊 Table columns:', columns)
  }
  
  // Check sample data
  const { data: sampleData, count, error: sampleError } = await supabase
    .from('magic_links')
    .select('*', { count: 'exact' })
    .limit(5)
    .order('created_at', { ascending: false })
  
  if (!sampleError) {
    console.log(`\n📈 Total records: ${count}`)
    if (sampleData && sampleData.length > 0) {
      console.log('\n🔍 Sample records (latest 5):')
      sampleData.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`)
        console.log('- ID:', record.id)
        console.log('- Email:', record.email)
        console.log('- Token:', record.token ? `${record.token.substring(0, 20)}...` : 'null')
        console.log('- Used:', record.used)
        console.log('- Expires At:', record.expires_at)
        console.log('- Created At:', record.created_at)
      })
    }
  }
  
  // Check Supabase Auth configuration
  console.log('\n🔐 Checking Supabase Auth integration...')
  
  // Check auth.users table (this is Supabase's built-in auth)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 5
  })
  
  if (authError) {
    console.log('⚠️  Cannot access auth.users (requires admin privileges):', authError.message)
  } else {
    console.log(`✅ Supabase Auth is configured - ${authUsers.users.length} users found`)
    if (authUsers.users.length > 0) {
      console.log('\nSample auth users:')
      authUsers.users.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`)
      })
    }
  }
  
  // Check if using custom users table
  const { data: customUsers, error: customUsersError } = await supabase
    .from('users')
    .select('id, email, full_name, role, auth_user_id')
    .limit(5)
  
  if (!customUsersError) {
    console.log('\n📋 Custom users table:')
    console.log(`Found ${customUsers?.length || 0} users`)
    if (customUsers && customUsers.length > 0) {
      customUsers.forEach(user => {
        console.log(`- ${user.email} (Role: ${user.role}, Auth ID: ${user.auth_user_id || 'none'})`)
      })
    }
  }
}

checkMagicLinksTable().catch(console.error)