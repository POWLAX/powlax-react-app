-- Resources Helper Functions
-- Functions to increment view and download counts atomically

-- Function to increment resource view count
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE powlax_resources 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = NOW()
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment resource download count
CREATE OR REPLACE FUNCTION increment_resource_downloads(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE powlax_resources 
  SET downloads_count = COALESCE(downloads_count, 0) + 1,
      updated_at = NOW()
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_resource_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_resource_downloads TO authenticated;
GRANT EXECUTE ON FUNCTION increment_resource_views TO anon;
GRANT EXECUTE ON FUNCTION increment_resource_downloads TO anon;