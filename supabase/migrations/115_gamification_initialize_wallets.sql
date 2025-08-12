-- Migration 115: Initialize user_points_wallets for all users
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md
-- Created: 2025-01-11
-- Purpose: Ensure all users have wallet records for all 6 point currencies

-- First, ensure flex_points exists in point_types_powlax
INSERT INTO point_types_powlax (currency_code, display_name, description)
VALUES ('flex_points', 'Flex Points', 'Bonus points for special activities')
ON CONFLICT (currency_code) DO NOTHING;

-- Initialize user_points_wallets for all users with all 6 point types
INSERT INTO user_points_wallets (user_id, currency, balance)
SELECT 
  u.id,
  pt.currency_code,
  0
FROM users u
CROSS JOIN point_types_powlax pt
WHERE pt.currency_code IN (
  'lax_credit', 'attack_token', 'defense_dollar',
  'midfield_medal', 'rebound_reward', 'flex_points'
)
ON CONFLICT (user_id, currency) DO NOTHING;

-- Verify the initialization
-- This should show 6 records per user (one for each currency)
SELECT 
  COUNT(*) as total_wallet_records,
  COUNT(DISTINCT user_id) as users_with_wallets,
  COUNT(DISTINCT currency) as currencies_in_use
FROM user_points_wallets
WHERE currency IN (
  'lax_credit', 'attack_token', 'defense_dollar',
  'midfield_medal', 'rebound_reward', 'flex_points'
);