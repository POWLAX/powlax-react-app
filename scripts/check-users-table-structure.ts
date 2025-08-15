#!/usr/bin/env npx tsx
/**
 * Check Users Table Structure
 * Verify actual column names in users table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsersTableStructure() {
  console.log('🔍 Checking Users Table Structure')
  console.log('='.repeat(40))
  
  try {
    // First, let's see all users with all available columns
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(3)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database')
      return
    }

    console.log(`✅ Found ${users.length} users`)
    console.log('\n📋 Available columns:')
    
    const firstUser = users[0]
    Object.keys(firstUser).forEach(key => {
      console.log(`   - ${key}: ${typeof firstUser[key]} = "${firstUser[key]}"`)
    })

    console.log('\n👥 All users:')
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`)
      Object.entries(user).forEach(([key, value]) => {
        console.log(`   ${key}: "${value}"`)
      })
    })

  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

checkUsersTableStructure().then(() => {
  console.log('\n🎯 Users table structure check complete')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Check failed:', error)
  process.exit(1)
})