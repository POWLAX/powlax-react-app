#!/usr/bin/env npx tsx
/**
 * Check Role Constraint
 * Investigate what role values are allowed in the database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoleConstraint() {
  console.log('🔍 Checking Role Constraint')
  console.log('='.repeat(30))
  
  try {
    // Get all unique role values currently in the database
    const { data: uniqueRoles, error: rolesError } = await supabase
      .from('users')
      .select('role')
      .not('role', 'is', null)

    if (rolesError) {
      console.error('❌ Error querying roles:', rolesError.message)
    } else {
      const roleSet = new Set(uniqueRoles?.map(r => r.role) || [])
      console.log('✅ Current role values in database:')
      Array.from(roleSet).sort().forEach(role => {
        console.log(`   - "${role}"`)
      })
    }

    // Check table constraints using information_schema
    console.log('\n🔍 Checking table constraints...')
    const { data: constraints, error: constraintError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          constraint_name, 
          constraint_type,
          check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.check_constraints cc 
          ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'users' 
          AND tc.table_schema = 'public'
          AND (tc.constraint_type = 'CHECK' OR tc.constraint_name ILIKE '%role%')
      `
    })

    if (constraintError) {
      console.log('⚠️  Could not query constraints directly, trying alternative method...')
      
      // Try to test what values are allowed by attempting inserts
      console.log('\n🧪 Testing role values by attempting updates...')
      
      const testRoles = ['administrator', 'coach', 'player', 'director', 'parent', 'club_director', 'team_coach']
      
      for (const testRole of testRoles) {
        try {
          // Try to update Patrick to this role
          const { error: testError } = await supabase
            .from('users')
            .update({ role: testRole })
            .eq('email', 'patrick@powlax.com')
            .select('role')

          if (testError) {
            console.log(`❌ "${testRole}": ${testError.message}`)
          } else {
            console.log(`✅ "${testRole}": Allowed`)
            // Revert back to admin for next test
            await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('email', 'patrick@powlax.com')
          }
        } catch (e) {
          console.log(`❌ "${testRole}": ${e}`)
        }
      }
      
    } else {
      console.log('✅ Table constraints:')
      constraints?.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`)
        if (constraint.check_clause) {
          console.log(`     Check: ${constraint.check_clause}`)
        }
      })
    }

    // Try a direct SQL query to get constraint info
    console.log('\n🔍 Getting constraint definition...')
    const { data: checkConstraints, error: checkError } = await supabase.rpc('sql', {
      query: `
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
          AND contype = 'c'
          AND conname ILIKE '%role%'
      `
    })

    if (checkError) {
      console.log('⚠️  Could not query pg_constraint')
    } else {
      console.log('📋 Role check constraints:')
      checkConstraints?.forEach(constraint => {
        console.log(`   - ${constraint.conname}:`)
        console.log(`     ${constraint.definition}`)
      })
    }

  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

checkRoleConstraint().then(() => {
  console.log('\n🎯 Role constraint check complete')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Check failed:', error)
  process.exit(1)
})