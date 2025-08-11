/**
 * POWLAX User Migration to Supabase Auth
 * Created: 2025-01-16
 * Purpose: Migrate existing 12 users from WordPress-only to Supabase Auth integration
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface ExistingUser {
  id: string
  wordpress_id: number | null
  email: string
  username: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  roles: string[] | null
  auth_user_id: string | null
  subscription_status: string | null
}

interface MigrationResult {
  userId: string
  email: string
  status: 'success' | 'error' | 'skipped'
  authUserId?: string
  magicLink?: string
  error?: string
}

async function migrateUsersToSupabaseAuth(): Promise<void> {
  console.log('🚀 Starting POWLAX User Migration to Supabase Auth...\n')

  try {
    // Step 1: Get all existing users
    console.log('📋 Step 1: Fetching existing users...')
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select(`
        id, wordpress_id, email, username,
        first_name, last_name, full_name,
        roles, auth_user_id, subscription_status
      `)
      .order('created_at')

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`)
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.log('❌ No users found in database')
      return
    }

    console.log(`✅ Found ${existingUsers.length} users to migrate\n`)

    // Step 2: Migrate each user
    const results: MigrationResult[] = []
    
    for (const user of existingUsers as ExistingUser[]) {
      console.log(`🔄 Migrating user: ${user.email}`)
      
      try {
        // Skip if already has Supabase Auth account
        if (user.auth_user_id) {
          console.log(`   ⏭️  Already has Supabase Auth ID: ${user.auth_user_id}`)
          results.push({
            userId: user.id,
            email: user.email,
            status: 'skipped',
            authUserId: user.auth_user_id
          })
          continue
        }

        // Create Supabase Auth user
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true, // Skip email verification for migrated users
          user_metadata: {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            wordpress_id: user.wordpress_id,
            username: user.username,
            roles: user.roles || [],
            migrated_from: 'wordpress',
            migration_date: new Date().toISOString()
          }
        })

        if (createError) {
          console.log(`   ❌ Failed to create Supabase Auth user: ${createError.message}`)
          results.push({
            userId: user.id,
            email: user.email,
            status: 'error',
            error: createError.message
          })
          continue
        }

        // Link Supabase Auth user to existing user record
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            auth_user_id: authUser.user.id,
            account_type: 'individual', // Default, will be updated for families
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.log(`   ❌ Failed to link auth user: ${updateError.message}`)
          results.push({
            userId: user.id,
            email: user.email,
            status: 'error',
            error: updateError.message
          })
          continue
        }

        // Generate magic link for user onboarding
        const { data: magicLinkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: user.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
          }
        })

        const magicLink = magicLinkData?.properties?.action_link

        console.log(`   ✅ Created Supabase Auth user: ${authUser.user.id}`)
        if (magicLink) {
          console.log(`   🔗 Magic link generated for onboarding`)
        }

        results.push({
          userId: user.id,
          email: user.email,
          status: 'success',
          authUserId: authUser.user.id,
          magicLink
        })

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error}`)
        results.push({
          userId: user.id,
          email: user.email,
          status: 'error',
          error: String(error)
        })
      }
    }

    // Step 3: Report results
    console.log('\n📊 Migration Results:')
    console.log('=' .repeat(50))
    
    const successful = results.filter(r => r.status === 'success')
    const skipped = results.filter(r => r.status === 'skipped')
    const failed = results.filter(r => r.status === 'error')

    console.log(`✅ Successfully migrated: ${successful.length} users`)
    console.log(`⏭️  Already migrated: ${skipped.length} users`)
    console.log(`❌ Failed migrations: ${failed.length} users`)

    if (successful.length > 0) {
      console.log('\n🎉 Successfully Migrated Users:')
      successful.forEach(result => {
        console.log(`   📧 ${result.email} → Auth ID: ${result.authUserId}`)
      })
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Migrations:')
      failed.forEach(result => {
        console.log(`   📧 ${result.email}: ${result.error}`)
      })
    }

    // Step 4: Generate magic links summary
    console.log('\n🔗 Magic Links for User Onboarding:')
    console.log('=' .repeat(50))
    console.log('Send these links to users for their first Supabase Auth login:')
    
    successful.forEach(result => {
      if (result.magicLink) {
        console.log(`\n📧 ${result.email}:`)
        console.log(`   ${result.magicLink}`)
      }
    })

    // Step 5: Next steps guidance
    console.log('\n🎯 Next Steps:')
    console.log('=' .repeat(50))
    console.log('1. ✅ Run migration script 084_enhance_user_profiles_and_family_accounts.sql')
    console.log('2. 📧 Send magic links to users for onboarding')
    console.log('3. 👨‍👩‍👧‍👦 Set up parent-child relationships using createFamilyAccount()')
    console.log('4. 🔄 Test authentication flow with migrated users')
    console.log('5. 📱 Update app to handle family account switching')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Helper function to create family relationships
async function createFamilyAccount(
  parentEmail: string, 
  familyName: string, 
  childEmails: string[]
): Promise<void> {
  console.log(`👨‍👩‍👧‍👦 Creating family account: ${familyName}`)
  
  try {
    const { data, error } = await supabase.rpc('create_family_account', {
      p_primary_parent_email: parentEmail,
      p_family_name: familyName,
      p_child_emails: childEmails
    })

    if (error) {
      console.error(`❌ Failed to create family account: ${error.message}`)
      return
    }

    console.log(`✅ Family account created: ${data}`)
    console.log(`   👨‍👩‍👧‍👦 Parent: ${parentEmail}`)
    console.log(`   👶 Children: ${childEmails.join(', ')}`)
    
  } catch (error) {
    console.error(`💥 Family account creation failed:`, error)
  }
}

// Example usage for family account creation
async function setupExampleFamilyAccounts(): Promise<void> {
  console.log('\n👨‍👩‍👧‍👦 Setting up example family accounts...')
  
  // Example family setups - replace with your actual data
  const exampleFamilies = [
    {
      parentEmail: 'parent1@example.com',
      familyName: 'Smith Family',
      childEmails: ['player1@example.com', 'player2@example.com']
    },
    {
      parentEmail: 'parent2@example.com', 
      familyName: 'Johnson Family',
      childEmails: ['player3@example.com']
    }
  ]

  for (const family of exampleFamilies) {
    await createFamilyAccount(family.parentEmail, family.familyName, family.childEmails)
  }
}

// Run migration
if (require.main === module) {
  migrateUsersToSupabaseAuth()
    .then(() => {
      console.log('\n🎉 User migration completed!')
      console.log('\n💡 To set up family accounts, run:')
      console.log('   node scripts/migrations/migrate-users-to-supabase-auth.ts --families')
    })
    .catch(console.error)
}

// Export functions for use in other scripts
export { migrateUsersToSupabaseAuth, createFamilyAccount }
