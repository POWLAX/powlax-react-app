-- Seed: One Club OS and three Team HQs with sample members from existing users
-- Safe/idempotent: checks by name and avoids duplicate team_members

DO $$
DECLARE
  v_club UUID;
  v_team1 UUID;
  v_team2 UUID;
  v_team3 UUID;
BEGIN
  -- Ensure Club OS exists
  SELECT id INTO v_club FROM club_organizations WHERE lower(name) = 'your club os' LIMIT 1;
  IF v_club IS NULL THEN
    INSERT INTO club_organizations(name) VALUES ('Your Club OS') RETURNING id INTO v_club;
  END IF;

  -- Ensure 3 teams exist
  SELECT id INTO v_team1 FROM team_teams WHERE lower(name) = 'your varsity team hq' LIMIT 1;
  IF v_team1 IS NULL THEN
    INSERT INTO team_teams(club_id, name) VALUES (v_club, 'Your Varsity Team HQ') RETURNING id INTO v_team1;
  END IF;

  SELECT id INTO v_team2 FROM team_teams WHERE lower(name) = 'your jv team hq' LIMIT 1;
  IF v_team2 IS NULL THEN
    INSERT INTO team_teams(club_id, name) VALUES (v_club, 'Your JV Team HQ') RETURNING id INTO v_team2;
  END IF;

  SELECT id INTO v_team3 FROM team_teams WHERE lower(name) = 'your 8th grade team hq' LIMIT 1;
  IF v_team3 IS NULL THEN
    INSERT INTO team_teams(club_id, name) VALUES (v_club, 'Your 8th Grade Team HQ') RETURNING id INTO v_team3;
  END IF;

  -- Distribute first 18 users as sample members (6 per team)
  WITH u AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS rn
    FROM users
  )
  INSERT INTO team_members (team_id, user_id, role)
  SELECT v_team1, id, 'player' FROM u WHERE rn BETWEEN 1 AND 6
  ON CONFLICT (team_id, user_id) DO NOTHING;

  WITH u AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS rn
    FROM users
  )
  INSERT INTO team_members (team_id, user_id, role)
  SELECT v_team2, id, 'player' FROM u WHERE rn BETWEEN 7 AND 12
  ON CONFLICT (team_id, user_id) DO NOTHING;

  WITH u AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS rn
    FROM users
  )
  INSERT INTO team_members (team_id, user_id, role)
  SELECT v_team3, id, 'player' FROM u WHERE rn BETWEEN 13 AND 18
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Promote first member of each team to head_coach for demo
  UPDATE team_members tm SET role = 'head_coach'
  WHERE tm.team_id = v_team1 AND tm.user_id = (
    SELECT user_id FROM team_members WHERE team_id = v_team1 ORDER BY created_at, user_id LIMIT 1
  );

  UPDATE team_members tm SET role = 'head_coach'
  WHERE tm.team_id = v_team2 AND tm.user_id = (
    SELECT user_id FROM team_members WHERE team_id = v_team2 ORDER BY created_at, user_id LIMIT 1
  );

  UPDATE team_members tm SET role = 'head_coach'
  WHERE tm.team_id = v_team3 AND tm.user_id = (
    SELECT user_id FROM team_members WHERE team_id = v_team3 ORDER BY created_at, user_id LIMIT 1
  );
END $$;


