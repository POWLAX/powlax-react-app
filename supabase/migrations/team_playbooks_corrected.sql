-- Team Playbooks Migration - CORRECTED VERSION
-- Creates team playbook system for strategy collections

BEGIN;

-- Create team_playbooks table
CREATE TABLE IF NOT EXISTS team_playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    strategy_id TEXT NOT NULL, -- References strategies by ID (both powlax and user)
    strategy_source TEXT DEFAULT 'powlax' CHECK (strategy_source IN ('powlax', 'user')),
    custom_name TEXT,
    team_notes TEXT,
    added_by UUID REFERENCES users(id), -- CORRECTED: users not user_profiles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_playbooks_team_id ON team_playbooks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_playbooks_strategy_id ON team_playbooks(strategy_id);
CREATE INDEX IF NOT EXISTS idx_team_playbooks_added_by ON team_playbooks(added_by);
CREATE INDEX IF NOT EXISTS idx_team_playbooks_created_at ON team_playbooks(created_at);

-- Add unique constraint to prevent duplicate strategies per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_playbooks_unique_strategy 
ON team_playbooks(team_id, strategy_id, strategy_source);

-- Add RLS (Row Level Security) policies
ALTER TABLE team_playbooks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read playbooks for teams they're members of
CREATE POLICY "Users can read team playbooks for their teams" ON team_playbooks
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert playbooks for teams they're members of
CREATE POLICY "Users can add to team playbooks for their teams" ON team_playbooks
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
        AND added_by = auth.uid()
    );

-- Policy: Users can update playbooks they added for teams they're members of
CREATE POLICY "Users can update team playbooks they added" ON team_playbooks
    FOR UPDATE USING (
        added_by = auth.uid()
        AND team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        added_by = auth.uid()
        AND team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete playbooks they added for teams they're members of
CREATE POLICY "Users can delete team playbooks they added" ON team_playbooks
    FOR DELETE USING (
        added_by = auth.uid()
        AND team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Create function only if it doesn't exist (avoiding conflicts)
CREATE OR REPLACE FUNCTION update_team_playbooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_team_playbooks_updated_at_trigger
    BEFORE UPDATE ON team_playbooks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_team_playbooks_updated_at();

COMMIT;