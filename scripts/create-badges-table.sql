-- Create badges_powlax table
CREATE TABLE badges_powlax (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(100),
  badge_type VARCHAR(50),
  sub_category VARCHAR(100),
  earned_by_type VARCHAR(50),
  points_type_required VARCHAR(50),
  points_required INTEGER DEFAULT 0,
  wordpress_id INTEGER,
  quest_id INTEGER,
  maximum_earnings INTEGER DEFAULT 1,
  is_hidden BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);