#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTables() {
  console.log('🛠️ Setting up Gamification Tables')
  console.log('================================')
  
  try {
    // Create point_types table
    const pointTypesSQL = `
      CREATE TABLE IF NOT EXISTS point_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          plural_name VARCHAR(100) NOT NULL,
          slug VARCHAR(50) UNIQUE NOT NULL,
          icon_url TEXT,
          description TEXT,
          conversion_rate DECIMAL(10,2) DEFAULT 1.0,
          is_active BOOLEAN DEFAULT TRUE,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      INSERT INTO point_types (name, display_name, plural_name, slug, description) VALUES
      ('lax_iq_point', 'Lax IQ Point', 'Lax IQ Points', 'lax-iq-point', 'Earned from knowledge-based activities')
      ON CONFLICT (name) DO NOTHING;
    `
    
    console.log('Creating point_types table...')
    const { error: pointTypesError } = await supabase.rpc('sql', { query: pointTypesSQL })
    if (pointTypesError) {
      console.error('Failed to create point_types:', pointTypesError)
    } else {
      console.log('✅ point_types table created')
    }

    // Create user_points_balance table  
    const userPointsBalanceSQL = `
      CREATE TABLE IF NOT EXISTS user_points_balance (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          point_type VARCHAR(50) REFERENCES point_types(name),
          balance INTEGER DEFAULT 0,
          total_earned INTEGER DEFAULT 0,
          total_spent INTEGER DEFAULT 0,
          last_earned_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, point_type)
      );
    `
    
    console.log('Creating user_points_balance table...')
    const { error: balanceError } = await supabase.rpc('sql', { query: userPointsBalanceSQL })
    if (balanceError) {
      console.error('Failed to create user_points_balance:', balanceError)
    } else {
      console.log('✅ user_points_balance table created')
    }

    // Create points_transactions table
    const transactionsSQL = `
      CREATE TABLE IF NOT EXISTS points_transactions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          point_type VARCHAR(50) REFERENCES point_types(name),
          amount INTEGER NOT NULL,
          transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'spent', 'admin_adjustment')),
          source_type VARCHAR(50),
          source_id INTEGER,
          description TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP DEFAULT NOW()
      );
    `
    
    console.log('Creating points_transactions table...')
    const { error: transactionsError } = await supabase.rpc('sql', { query: transactionsSQL })
    if (transactionsError) {
      console.error('Failed to create points_transactions:', transactionsError)
    } else {
      console.log('✅ points_transactions table created')
    }

    console.log('🎉 Basic gamification tables setup complete!')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupTables()