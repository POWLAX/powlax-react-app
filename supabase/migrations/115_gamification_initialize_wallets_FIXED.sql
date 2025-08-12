-- Migration 115: Initialize user_points_wallets for all users (FIXED)
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md
-- Created: 2025-01-11
-- Purpose: Ensure all users have wallet records for all 6 point currencies

-- First, check if flex_points exists in the currency column
-- If point_types_powlax exists, add flex_points if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'point_types_powlax') THEN
        -- Try to insert flex_points (assuming 'currency' is the column name based on user_points_wallets)
        INSERT INTO point_types_powlax (currency, display_name, description)
        VALUES ('flex_points', 'Flex Points', 'Bonus points for special activities')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Initialize user_points_wallets for all users with all 6 point types
-- The 'currency' column in user_points_wallets expects these values
INSERT INTO user_points_wallets (user_id, currency, balance, updated_at)
SELECT 
  u.id,
  pt.currency_type,
  0,
  NOW()
FROM users u
CROSS JOIN (
  VALUES 
    ('lax_credit'),
    ('attack_token'), 
    ('defense_dollar'),
    ('midfield_medal'),
    ('rebound_reward'),
    ('flex_points')
) AS pt(currency_type)
ON CONFLICT (user_id, currency) DO NOTHING;

-- Verify the initialization
SELECT 
  'Wallet initialization complete' as status,
  COUNT(*) as total_wallet_records,
  COUNT(DISTINCT user_id) as users_with_wallets,
  COUNT(DISTINCT currency) as currencies_in_use
FROM user_points_wallets
WHERE currency IN (
  'lax_credit', 'attack_token', 'defense_dollar',
  'midfield_medal', 'rebound_reward', 'flex_points'
);