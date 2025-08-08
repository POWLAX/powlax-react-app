-- Store raw webhook requests for troubleshooting
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'memberpress',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  headers JSONB,
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_time ON webhook_events(received_at DESC);


