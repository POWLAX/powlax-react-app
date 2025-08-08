-- Set sensible defaults for registration link expiry and capacity

ALTER TABLE registration_links
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '100 days'),
  ALTER COLUMN max_uses SET DEFAULT 100;


