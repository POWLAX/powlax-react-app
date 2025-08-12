-- Migration: 123_modify_point_types_for_skills_academy.sql
-- Purpose: Modify existing point_types_powlax table to match Skills Academy requirements
-- Date: 2025-08-12
-- Pattern: Supabase Permanence Pattern - Direct columns for Skills Academy point counter

-- Add the missing series_type column that's critical for Skills Academy
ALTER TABLE point_types_powlax ADD COLUMN IF NOT EXISTS series_type TEXT;

-- Add aliases for contract compliance (display_name -> title, icon_url -> image_url)
-- We'll keep both to maintain backward compatibility while adding contract compliance
ALTER TABLE point_types_powlax ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE point_types_powlax ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the new columns with existing data
UPDATE point_types_powlax SET 
  title = display_name,
  image_url = icon_url
WHERE title IS NULL OR image_url IS NULL;

-- Now update with the series_type mappings from CSV analysis
UPDATE point_types_powlax SET series_type = 'general' 
WHERE slug IN ('academy-points', 'academy-point', 'flex-point', 'lax-iq-point');

UPDATE point_types_powlax SET series_type = 'attack' 
WHERE slug = 'attack-token';

UPDATE point_types_powlax SET series_type = 'defense' 
WHERE slug = 'defense-dollar';

UPDATE point_types_powlax SET series_type = 'midfield' 
WHERE slug IN ('midfield-medal', 'midfield-metal');

UPDATE point_types_powlax SET series_type = 'goalie' 
WHERE slug IN ('rebound-reward', 'rebound-rewards');

-- Insert any missing point types from the CSV that aren't already in the table
INSERT INTO point_types_powlax (
  name, 
  display_name, 
  title,
  plural_name, 
  slug, 
  icon_url,
  image_url,
  series_type,
  description,
  conversion_rate,
  is_active,
  metadata
) 
SELECT 
  new_data.name,
  new_data.display_name,
  new_data.display_name, -- title = display_name
  new_data.plural_name,
  new_data.slug,
  new_data.icon_url,
  new_data.icon_url, -- image_url = icon_url
  new_data.series_type,
  new_data.description,
  1, -- conversion_rate
  true, -- is_active
  '{}'::jsonb -- metadata
FROM (
  VALUES
    ('lax_credit', 'Academy Point', 'Academy Points', 'lax-credit', 
     'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png', 
     'general', 'Universal currency earned from all activities (Lax Credits)'),
    ('defense_dollar', 'Defense Dollar', 'Defense Dollars', 'defense-dollar',
     'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
     'defense', 'Points earned from defense-focused drills'),
    ('midfield_medal', 'Midfield Medal', 'Midfield Medals', 'midfield-metal',
     'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
     'midfield', 'Points earned from midfield-focused drills'),
    ('rebound_reward', 'Rebound Reward', 'Rebound Rewards', 'rebound-rewards',
     'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
     'goalie', 'Points earned from goalie-focused drills'),
    ('flex_point', 'Flex Point', 'Flex Points', 'flex-point',
     'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png',
     'general', 'Flexible points for off-grid activities'),
    ('lax_iq_point', 'Lax IQ Point', 'Lax IQ Points', 'lax-iq-point',
     'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
     'general', 'Points earned from lacrosse IQ activities')
) AS new_data(name, display_name, plural_name, slug, icon_url, series_type, description)
WHERE NOT EXISTS (
  SELECT 1 FROM point_types_powlax existing 
  WHERE existing.slug = new_data.slug
);

-- Add indexes for performance on the new column
CREATE INDEX IF NOT EXISTS idx_point_types_series_type_skills_academy ON point_types_powlax(series_type);

-- Add not null constraints on critical columns for contract compliance
ALTER TABLE point_types_powlax ALTER COLUMN title SET NOT NULL;
ALTER TABLE point_types_powlax ALTER COLUMN image_url SET NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN point_types_powlax.title IS 'Display name for Skills Academy point counter (contract compliance)';
COMMENT ON COLUMN point_types_powlax.image_url IS 'Direct URL to point type image for Skills Academy (contract compliance)';
COMMENT ON COLUMN point_types_powlax.series_type IS 'Series type mapping for Skills Academy filtering: attack, defense, midfield, goalie, general';

-- Verify the changes
SELECT 
  id,
  title,
  image_url, 
  slug,
  series_type,
  created_at
FROM point_types_powlax 
ORDER BY id;