-- GamiPress Migration - Point Types and Sync System
-- Agent 1: Database schema updates and point type setup
-- Contract: POWLAX-GAM-001

-- First, enhance the existing powlax_points_currencies table with WordPress fields
ALTER TABLE powlax_points_currencies
ADD COLUMN IF NOT EXISTS wordpress_id BIGINT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS notification_pattern TEXT,
ADD COLUMN IF NOT EXISTS points_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS limit_recurrence TEXT DEFAULT 'lifetime',
ADD COLUMN IF NOT EXISTS is_workout_specific BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint on slug
ALTER TABLE powlax_points_currencies
ADD CONSTRAINT unique_points_currency_slug UNIQUE (slug);

-- Create index for WordPress ID lookups
CREATE INDEX IF NOT EXISTS idx_points_currencies_wp_id ON powlax_points_currencies(wordpress_id);

-- Create gamipress_sync_log table for tracking sync operations
CREATE TABLE IF NOT EXISTS gamipress_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'point_types', 'badges', 'ranks', etc.
  wordpress_id BIGINT NOT NULL,
  supabase_id TEXT, -- Could be UUID or text depending on target table
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted', 'failed')),
  sync_data JSONB, -- Store the full sync data for debugging
  error_message TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_entity_type ON gamipress_sync_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_wordpress_id ON gamipress_sync_log(wordpress_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_action_type ON gamipress_sync_log(action_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_synced_at ON gamipress_sync_log(synced_at);

-- Update existing records with slug mappings based on current naming patterns
UPDATE powlax_points_currencies 
SET slug = CASE 
  WHEN currency = 'lax_credits' THEN 'lax-credit'
  WHEN currency = 'attack_tokens' THEN 'attack-token' 
  WHEN currency = 'defense_dollars' THEN 'defense-dollar'
  WHEN currency = 'midfield_medals' THEN 'midfield-metal'
  WHEN currency = 'flex_points' THEN 'flex-points'
  WHEN currency = 'rebound_rewards' THEN 'rebound-rewards'
  WHEN currency = 'lax_iq_points' THEN 'lax-iq-points'
END,
notification_pattern = 'You earned {points} {points_type} {image}',
updated_at = NOW()
WHERE slug IS NULL;

-- Insert new point types from WordPress that don't exist in current 7 records
-- These will be inserted by the setup script, but we prepare the structure

-- Workout-specific point types (these are new from CSV)
INSERT INTO powlax_points_currencies (currency, display_name, slug, wordpress_id, is_workout_specific, notification_pattern) VALUES
  ('crease_crawler_workouts', 'Crease Crawler Workouts', 'crease-crawlers-coin', 27929, true, 'You earned {points} {points_type} {image}'),
  ('fully_fancy_freddy_workouts', 'Fully Fancy Freddy Workouts', 'fully-fancy-freddy', 27943, true, 'You earned {points} {points_type} {image}'),
  ('independent_improver_workouts', 'Independent Improver Workouts', 'independent-improver', 27945, true, 'You earned {points} {points_type} {image}'),
  ('fast_break_finisher_workouts', 'Fast Break Finisher Workouts', 'fast-break-finisher', 27950, true, 'You earned {points} {points_type} {image}'),
  ('ankle_breaker_workouts', 'Ankle Breaker Workouts', 'ankle-breaker-coin', 27959, true, 'You earned {points} {points_type} {image}'),
  ('rough_rider_workouts', 'Rough Rider Workouts', 'rough-rider-workout', 28058, true, 'You earned {points} {points_type} {image}'),
  ('time_room_terror_workouts', 'Time and Room Terror Workouts', 'time-and-room-token', 28060, true, 'You earned {points} {points_type} {image}'),
  ('on_run_rocketeer_workouts', 'On the Run Rocketeer Workouts', 'on-the-run-reward', 28061, true, 'You earned {points} {points_type} {image}'),
  ('island_isolator_workouts', 'Island Isolator Workouts', 'island-isolator-i', 28062, true, 'You earned {points} {points_type} {image}'),
  ('goalies_nightmare_workouts', 'Goalies Nightmare Workouts', 'goalies-nightmare-t', 28066, true, 'You earned {points} {points_type} {image}'),
  ('foundation_ace_workouts', 'Foundation Ace Workouts', 'foundation-ace-coin', 28084, true, 'You earned {points} {points_type} {image}'),
  ('dominant_dodger_workouts', 'Dominant Dodger Workouts', 'dominant-dodger', 28090, true, 'You earned {points} {points_type} {image}'),
  ('hip_hitter_workouts', 'Hip Hitter Workouts', 'hip-hitter-workout', 28095, true, 'You earned {points} {points_type} {image}'),
  ('footwork_fortress_workouts', 'Footwork Fortress Workouts', 'footwork-fortress-wo', 28097, true, 'You earned {points} {points_type} {image}'),
  ('slide_master_workouts', 'Slide Master Workouts', 'slide-master-workout', 28098, true, 'You earned {points} {points_type} {image}'),
  ('close_quarters_crusher_workouts', 'Close Quarters Crusher Workouts', 'close-quarters-crus', 28099, true, 'You earned {points} {points_type} {image}'),
  ('silky_smooth_workouts', 'Silky Smooth Workouts', 'silky-smooth', 28100, true, 'You earned {points} {points_type} {image}'),
  ('consistent_clear_workouts', 'Consistent Clear Workouts', 'consistent-clear-w', 28101, true, 'You earned {points} {points_type} {image}'),
  ('turnover_titan_workouts', 'Turnover Titan Workouts', 'turnover-titan-worko', 28102, true, 'You earned {points} {points_type} {image}'),
  ('great_wall_workouts', 'The Great Wall Workouts', 'the-great-wall-work', 28103, true, 'You earned {points} {points_type} {image}'),
  ('determined_dmid_workouts', 'Determined DMid Workouts', 'determined-dmid-work', 28111, true, 'You earned {points} {points_type} {image}'),
  ('two_way_tornado_workouts', 'Two-Way Tornado Workouts', 'two-way-tornado-wor', 28112, true, 'You earned {points} {points_type} {image}'),
  ('wing_warrior_workouts', 'Wing Warrior Workouts', 'wing-warrior-workout', 28113, true, 'You earned {points} {points_type} {image}')
ON CONFLICT (currency) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  slug = EXCLUDED.slug,
  wordpress_id = EXCLUDED.wordpress_id,
  is_workout_specific = EXCLUDED.is_workout_specific,
  notification_pattern = EXCLUDED.notification_pattern,
  updated_at = NOW();

-- Log the migration in sync log
INSERT INTO gamipress_sync_log (entity_type, wordpress_id, supabase_id, action_type, sync_data)
VALUES ('point_types', 0, 'migration_063', 'created', jsonb_build_object(
  'migration_file', '063_gamipress_migration.sql',
  'description', 'Initial GamiPress point types migration',
  'existing_records', 7,
  'new_records_added', 23,
  'total_point_types', 30
));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_points_currencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_points_currencies_updated_at_trigger ON powlax_points_currencies;
CREATE TRIGGER update_points_currencies_updated_at_trigger
  BEFORE UPDATE ON powlax_points_currencies
  FOR EACH ROW
  EXECUTE FUNCTION update_points_currencies_updated_at();

-- Create a view for easy access to point type information
CREATE OR REPLACE VIEW gamipress_point_types_view AS
SELECT 
  currency,
  display_name,
  slug,
  wordpress_id,
  icon_url,
  is_workout_specific,
  notification_pattern,
  points_limit,
  limit_recurrence,
  created_at,
  updated_at
FROM powlax_points_currencies
ORDER BY 
  CASE WHEN is_workout_specific THEN 1 ELSE 0 END,
  display_name;

COMMENT ON VIEW gamipress_point_types_view IS 'Easy access view for GamiPress point types with WordPress integration';
COMMENT ON TABLE gamipress_sync_log IS 'Tracks all sync operations between WordPress GamiPress and Supabase';
COMMENT ON TABLE powlax_points_currencies IS 'Enhanced point currencies table with WordPress GamiPress integration';