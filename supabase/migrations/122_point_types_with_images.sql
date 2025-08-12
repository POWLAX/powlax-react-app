-- Migration: 122_point_types_with_images.sql
-- Purpose: Create point_types_powlax table with direct column mapping (no nested JSON)
-- Date: 2025-08-12
-- Pattern: Supabase Permanence Pattern - Direct columns for Skills Academy point counter

-- Create point_types_powlax table with direct column mapping
CREATE TABLE IF NOT EXISTS point_types_powlax (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  series_type TEXT, -- attack, defense, midfield, goalie, general
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert the 7 point types from CSV with proper series_type mapping
INSERT INTO point_types_powlax (title, image_url, slug, series_type) VALUES
  (
    'Academy Point',
    'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png',
    'lax-credit',
    'general'
  ),
  (
    'Attack Token',
    'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png',
    'attack-token',
    'attack'
  ),
  (
    'Defense Dollar',
    'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png',
    'defense-dollar',
    'defense'
  ),
  (
    'Midfield Medal',
    'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png',
    'midfield-metal',
    'midfield'
  ),
  (
    'Rebound Reward',
    'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png',
    'rebound-rewards',
    'goalie'
  ),
  (
    'Flex Point',
    'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png',
    'flex-point',
    'general'
  ),
  (
    'Lax IQ Point',
    'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png',
    'lax-iq-point',
    'general'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  series_type = EXCLUDED.series_type,
  updated_at = NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_types_series_type ON point_types_powlax(series_type);
CREATE INDEX IF NOT EXISTS idx_point_types_slug ON point_types_powlax(slug);

-- Enable RLS
ALTER TABLE point_types_powlax ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated read access
CREATE POLICY "Allow authenticated users to read point types" ON point_types_powlax
  FOR SELECT TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON point_types_powlax TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE point_types_powlax_id_seq TO authenticated;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_point_types_updated_at
  BEFORE UPDATE ON point_types_powlax
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE point_types_powlax IS 'Point types for Skills Academy live counter with direct column mapping following permanence pattern';
COMMENT ON COLUMN point_types_powlax.title IS 'Display name of the point type (e.g., "Attack Token")';
COMMENT ON COLUMN point_types_powlax.image_url IS 'Direct URL to point type image from POWLAX WordPress';
COMMENT ON COLUMN point_types_powlax.slug IS 'Unique identifier slug for the point type';
COMMENT ON COLUMN point_types_powlax.series_type IS 'Series type mapping: attack, defense, midfield, goalie, general';