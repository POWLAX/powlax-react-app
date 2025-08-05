-- POWLAX Strategies Import SQL
-- Generated on 2025-08-05T04:08:10.824Z
-- Total records: 221

-- Create table if not exists
CREATE TABLE IF NOT EXISTS wp_strategies (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER,
  reference_id INTEGER,
  strategy_categories TEXT,
  strategy_name TEXT NOT NULL,
  lacrosse_lab_links JSONB,
  description TEXT,
  embed_codes JSONB,
  see_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT false,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id BIGINT,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert statements
