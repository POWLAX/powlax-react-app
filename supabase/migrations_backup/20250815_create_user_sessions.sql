-- Create user_sessions table for storing authentication sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_data JSONB NOT NULL,
    wp_credentials TEXT, -- Encrypted in production
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (sessions should only be managed server-side)
CREATE POLICY "Service role can manage sessions" ON public.user_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired sessions
-- This requires pg_cron extension (available in Supabase)
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();');