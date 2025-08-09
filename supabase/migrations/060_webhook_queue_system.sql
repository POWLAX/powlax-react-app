-- Webhook Queue System for reliable processing with retry logic
-- This ensures webhook processing doesn't block and can be retried on failure

-- 1. Webhook Queue Table
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE NOT NULL, -- Unique identifier from MemberPress
  source TEXT NOT NULL DEFAULT 'memberpress',
  event_type TEXT NOT NULL, -- subscription.created, subscription.canceled, etc.
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Waiting to be processed
    'processing',   -- Currently being processed
    'completed',    -- Successfully processed
    'failed',       -- Failed after max retries
    'dead_letter'   -- Moved to dead letter queue for manual review
  )),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB -- Additional tracking data
);

-- Indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_webhook_queue_processing 
  ON webhook_queue(status, next_retry_at) 
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_webhook_queue_status 
  ON webhook_queue(status);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_created 
  ON webhook_queue(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_webhook_id 
  ON webhook_queue(webhook_id);

-- 2. Webhook Processing Log (audit trail)
CREATE TABLE IF NOT EXISTS webhook_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES webhook_queue(id) ON DELETE CASCADE,
  attempt INT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_log_queue 
  ON webhook_processing_log(queue_id);

-- 3. Function to enqueue webhook
CREATE OR REPLACE FUNCTION enqueue_webhook(
  p_webhook_id TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_source TEXT DEFAULT 'memberpress'
) RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- Check if webhook already exists (idempotency)
  SELECT id INTO v_queue_id
  FROM webhook_queue
  WHERE webhook_id = p_webhook_id;
  
  IF v_queue_id IS NOT NULL THEN
    -- Already queued, return existing ID
    RETURN v_queue_id;
  END IF;
  
  -- Insert new webhook
  INSERT INTO webhook_queue (
    webhook_id,
    source,
    event_type,
    payload,
    status,
    next_retry_at
  ) VALUES (
    p_webhook_id,
    p_source,
    p_event_type,
    p_payload,
    'pending',
    NOW() -- Process immediately
  )
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get next webhook to process
CREATE OR REPLACE FUNCTION get_next_webhook_to_process()
RETURNS webhook_queue AS $$
DECLARE
  v_webhook webhook_queue;
BEGIN
  -- Lock and return the next pending webhook
  SELECT * INTO v_webhook
  FROM webhook_queue
  WHERE status = 'pending'
    AND (next_retry_at IS NULL OR next_retry_at <= NOW())
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- Mark as processing
  IF v_webhook.id IS NOT NULL THEN
    UPDATE webhook_queue
    SET status = 'processing',
        started_at = NOW(),
        attempts = attempts + 1
    WHERE id = v_webhook.id;
  END IF;
  
  RETURN v_webhook;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to mark webhook as completed
CREATE OR REPLACE FUNCTION complete_webhook(
  p_queue_id UUID,
  p_processing_time_ms INT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE webhook_queue
  SET status = 'completed',
      completed_at = NOW()
  WHERE id = p_queue_id;
  
  -- Log the completion
  INSERT INTO webhook_processing_log (
    queue_id,
    attempt,
    status,
    processing_time_ms
  )
  SELECT 
    id,
    attempts,
    'completed',
    p_processing_time_ms
  FROM webhook_queue
  WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to retry webhook with exponential backoff
CREATE OR REPLACE FUNCTION retry_webhook(
  p_queue_id UUID,
  p_error_message TEXT
) RETURNS VOID AS $$
DECLARE
  v_webhook webhook_queue;
  v_backoff_minutes INT;
BEGIN
  SELECT * INTO v_webhook
  FROM webhook_queue
  WHERE id = p_queue_id;
  
  -- Calculate exponential backoff: 1, 2, 4, 8... minutes
  v_backoff_minutes := POWER(2, LEAST(v_webhook.attempts, 6));
  
  -- Check if we've exceeded max attempts
  IF v_webhook.attempts >= v_webhook.max_attempts THEN
    -- Move to dead letter
    UPDATE webhook_queue
    SET status = 'dead_letter',
        last_error = p_error_message
    WHERE id = p_queue_id;
    
    -- Log the failure
    INSERT INTO webhook_processing_log (
      queue_id,
      attempt,
      status,
      error_message
    ) VALUES (
      p_queue_id,
      v_webhook.attempts,
      'dead_letter',
      p_error_message
    );
  ELSE
    -- Schedule retry
    UPDATE webhook_queue
    SET status = 'pending',
        last_error = p_error_message,
        next_retry_at = NOW() + (v_backoff_minutes || ' minutes')::INTERVAL
    WHERE id = p_queue_id;
    
    -- Log the retry
    INSERT INTO webhook_processing_log (
      queue_id,
      attempt,
      status,
      error_message
    ) VALUES (
      p_queue_id,
      v_webhook.attempts,
      'retry_scheduled',
      p_error_message
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. View for monitoring webhook queue health
CREATE OR REPLACE VIEW webhook_queue_stats AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest,
  AVG(attempts) as avg_attempts
FROM webhook_queue
GROUP BY status;

-- 8. View for recent failures
CREATE OR REPLACE VIEW webhook_recent_failures AS
SELECT 
  wq.id,
  wq.webhook_id,
  wq.event_type,
  wq.attempts,
  wq.last_error,
  wq.created_at,
  wq.next_retry_at
FROM webhook_queue wq
WHERE status IN ('failed', 'dead_letter')
ORDER BY created_at DESC
LIMIT 100;

-- 9. Enable RLS
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_processing_log ENABLE ROW LEVEL SECURITY;

-- Admin can read all webhooks
CREATE POLICY webhook_queue_admin_read ON webhook_queue
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY webhook_log_admin_read ON webhook_processing_log
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON webhook_queue_stats TO anon, authenticated;
GRANT SELECT ON webhook_recent_failures TO authenticated;