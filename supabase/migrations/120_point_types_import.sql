-- Migration: 120_point_types_import.sql
-- Purpose: Create point_types_powlax table and import point type images for Skills Academy live counter
-- Date: 2025-08-12
-- Source: docs/Wordpress CSV's/Gamipress Gamification Exports/Points-Types-Export-2025-July-31-1904 copy.csv

-- Create point_types_powlax table for gamification point type images
CREATE TABLE IF NOT EXISTS point_types_powlax (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert point types data from WordPress CSV export
INSERT INTO point_types_powlax (title, image_url, slug) VALUES
  ('Academy Point', 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png', 'academy-point'),
  ('Attack Token', 'https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png', 'attack-token'),
  ('Defense Dollar', 'https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png', 'defense-dollar'),
  ('Midfield Medal', 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png', 'midfield-medal'),
  ('Rebound Reward', 'https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png', 'rebound-reward'),
  ('Flex Point', 'https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png', 'flex-point'),
  ('Lax IQ Point', 'https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png', 'lax-iq-point')
ON CONFLICT (title) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_point_types_powlax_updated_at ON point_types_powlax;
CREATE TRIGGER update_point_types_powlax_updated_at
    BEFORE UPDATE ON point_types_powlax
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE point_types_powlax ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for read access
CREATE POLICY "Point types are viewable by everyone" ON point_types_powlax
    FOR SELECT USING (true);

-- Create policy for authenticated users to view (redundant but explicit)
CREATE POLICY "Authenticated users can view point types" ON point_types_powlax
    FOR SELECT TO authenticated USING (true);

-- Create policy for service role to manage data
CREATE POLICY "Service role can manage point types" ON point_types_powlax
    FOR ALL TO service_role USING (true);

-- Grant appropriate permissions
GRANT SELECT ON point_types_powlax TO authenticated;
GRANT SELECT ON point_types_powlax TO anon;
GRANT ALL ON point_types_powlax TO service_role;
GRANT USAGE ON SEQUENCE point_types_powlax_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE point_types_powlax_id_seq TO service_role;

-- Add comments for documentation
COMMENT ON TABLE point_types_powlax IS 'Point type definitions with images for Skills Academy gamification live counter';
COMMENT ON COLUMN point_types_powlax.title IS 'Display name of the point type (e.g., Academy Point, Attack Token)';
COMMENT ON COLUMN point_types_powlax.image_url IS 'URL to the point type icon image from WordPress media library';
COMMENT ON COLUMN point_types_powlax.slug IS 'URL-friendly identifier for the point type';