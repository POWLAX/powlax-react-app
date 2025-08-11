-- Create powlax_player_ranks table
CREATE TABLE powlax_player_ranks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  rank_order INTEGER NOT NULL,
  lax_credits_required INTEGER DEFAULT 0,
  benefits JSONB,
  wordpress_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);