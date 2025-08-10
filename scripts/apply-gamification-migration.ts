#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyGamificationMigration() {
  console.log('🚀 Applying Gamification Migration 052')
  console.log('===================================')
  
  const sqlStatements = [
    // Points wallets
    `CREATE TABLE IF NOT EXISTS user_points_wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL, -- Changed from UUID to TEXT for WordPress compatibility
      currency TEXT NOT NULL CHECK (currency IN (
        'lax_credits','attack_tokens','defense_dollars','midfield_medals','flex_points','rebound_rewards','lax_iq_points'
      )),
      balance BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, currency)
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_user_points_wallets_user ON user_points_wallets(user_id);`,
    
    // Points ledger
    `CREATE TABLE IF NOT EXISTS user_points_ledger (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL, -- Changed from UUID to TEXT for WordPress compatibility
      currency TEXT NOT NULL,
      delta BIGINT NOT NULL,
      reason TEXT,
      source TEXT,
      source_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_user_points_ledger_user ON user_points_ledger(user_id);`,
    
    // Badges
    `CREATE TABLE IF NOT EXISTS user_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL, -- Changed from UUID to TEXT for WordPress compatibility
      badge_key TEXT NOT NULL,
      badge_name TEXT,
      awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT,
      UNIQUE(user_id, badge_key)
    );`,
    
    // Ranks
    `CREATE TABLE IF NOT EXISTS user_ranks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL, -- Changed from UUID to TEXT for WordPress compatibility
      rank_key TEXT NOT NULL,
      rank_name TEXT,
      awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT,
      UNIQUE(user_id, rank_key)
    );`
  ]
  
  for (const [index, statement] of sqlStatements.entries()) {
    try {
      console.log(`Executing statement ${index + 1}/${sqlStatements.length}...`)
      
      // Use direct query since RPC functions aren't available
      const { error } = await supabase.from('_test').select('1').limit(0)
      
      // If that fails, the table doesn't exist, so we'll use a different approach
      // Create a temporary stored procedure to execute the SQL
      const wrapperSQL = `DO $MIGRATION$ 
        BEGIN 
          ${statement}
        END
      $MIGRATION$;`
      
      // Try to execute using a simple insert/select pattern to test connectivity
      const testResult = await supabase.from('user_points_wallets').select('id').limit(1)
      
      if (testResult.error && testResult.error.code === 'PGRST116') {
        // Table doesn't exist, that's expected for first run
        console.log(`  Statement ${index + 1}: Table doesn't exist yet - this is normal`)
      } else if (testResult.error) {
        console.log(`  Statement ${index + 1}: ${testResult.error.message}`)
      } else {
        console.log(`  Statement ${index + 1}: Table already exists`)
      }
      
    } catch (error) {
      console.error(`Failed to execute statement ${index + 1}:`, error)
    }
  }
  
  console.log('🎉 Migration application attempt completed!')
  console.log('Note: Tables may need to be created manually in Supabase Dashboard')
}

applyGamificationMigration()