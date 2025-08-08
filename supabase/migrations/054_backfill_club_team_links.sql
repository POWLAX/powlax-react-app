-- Backfill team_teams.club_id relationships using heuristics

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='team_teams'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='club_organizations'
  ) THEN
    WITH candidate_clubs AS (
      SELECT id
      FROM club_organizations
      WHERE lower(name) LIKE '%club os%'
      ORDER BY created_at
    ), first_club AS (
      SELECT id FROM candidate_clubs LIMIT 1
    )
    UPDATE team_teams t
    SET club_id = fc.id
    FROM first_club fc
    WHERE t.club_id IS NULL
      AND (
        lower(t.name) LIKE '%team hq%'
        OR lower(t.name) LIKE '%varsity%'
        OR lower(t.name) LIKE '%jv%'
        OR lower(t.name) LIKE '%8th%'
      );
  END IF;
END $$;


