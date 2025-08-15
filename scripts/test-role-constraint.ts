import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRoleConstraint() {
  console.log('🔍 Testing Role Constraint')
  console.log('=========================')
  
  try {
    // Create a test user to check constraint
    console.log('\n1. Testing current role constraints...')
    
    const testRoles = ['admin', 'administrator', 'director', 'coach', 'player', 'parent', 'invalid_role']
    
    for (const role of testRoles) {
      console.log(`\nTesting role: ${role}`)
      
      try {
        // Try to create a test user with this role
        const testEmail = `test-${role}-${Date.now()}@constraint-test.com`
        
        const { data: createResult, error: createError } = await supabase
          .from('users')
          .insert({
            email: testEmail,
            role: role,
            display_name: `Test ${role}`,
            account_type: 'individual'
          })
          .select('id, email, role')
        
        if (createError) {
          if (createError.message.includes('check constraint')) {
            console.log(`❌ Role '${role}' is NOT allowed by constraint`)
          } else {
            console.log(`⚠️  Role '${role}' failed for other reason: ${createError.message}`)
          }
        } else {
          console.log(`✅ Role '${role}' is allowed by constraint`)
          
          // Clean up test user
          if (createResult && createResult.length > 0) {
            await supabase
              .from('users')
              .delete()
              .eq('id', createResult[0].id)
            console.log(`   (Test user cleaned up)`)
          }
        }
        
      } catch (error) {
        console.log(`❌ Role '${role}' test failed: ${error}`)
      }
    }
    
    // Check what roles actually exist in the database
    console.log('\n2. Current roles in database...')
    const { data: existingRoles, error: rolesError } = await supabase
      .from('users')
      .select('role')
    
    if (rolesError) {
      console.error('❌ Error fetching existing roles:', rolesError)
    } else {
      const roleCounts = existingRoles?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      
      console.log('📊 Existing roles in database:')
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`)
      })
    }
    
    // Try to understand the constraint better
    console.log('\n3. Attempting to understand constraint...')
    
    // Check if 'administrator' already exists (which would mean constraint allows it)
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'administrator')
    
    if (adminError) {
      console.log('❌ Cannot query administrator role')
    } else {
      console.log(`✅ Found ${adminUsers?.length || 0} users with 'administrator' role`)
      if (adminUsers && adminUsers.length > 0) {
        console.log('This means the constraint DOES allow "administrator" role')
        console.log('The issue might be something else...')
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Execute the test
testRoleConstraint()