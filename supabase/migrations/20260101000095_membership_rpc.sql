-- ============================================================
-- Phase 7 — Membership & Elections RPCs
-- ============================================================

-- Allow group co-members to read each other's basic profile info
-- (needed to render member lists)
CREATE POLICY "profiles: co-member read"
  ON core.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM sacco.group_members gm1
      JOIN sacco.group_members gm2
        ON gm1.group_id = gm2.group_id
      WHERE gm1.profile_id = auth.uid()
        AND gm2.profile_id = core.profiles.id
        AND gm1.status = 'active'
        AND gm2.status = 'active'
    )
  );

-- Allow members to read their own vote (to show "already voted" state in UI)
CREATE POLICY "votes: own read"
  ON sacco.election_votes FOR SELECT
  USING (voter_id = auth.uid());

-- ─── approve_join_request ─────────────────────────────────────────────────────
-- Atomically marks the request approved and inserts the new group_member.
-- SECURITY DEFINER so it can INSERT into group_members even though the new
-- member is not yet in the table (bypasses the "officer insert" RLS gate).
CREATE OR REPLACE FUNCTION sacco.approve_join_request(p_request_id uuid)
RETURNS void AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_req      sacco.group_join_requests%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_req FROM sacco.group_join_requests WHERE id = p_request_id;

  IF v_req IS NULL THEN
    RAISE EXCEPTION 'Join request not found';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request is no longer pending';
  END IF;

  -- Caller must be an officer of the group
  IF NOT sacco.is_officer(v_req.group_id) THEN
    RAISE EXCEPTION 'Only officers can approve join requests';
  END IF;

  -- Check requester meets min KYC level for the group
  IF NOT EXISTS (
    SELECT 1
    FROM core.profiles p
    JOIN sacco.group_rules r ON r.group_id = v_req.group_id
    WHERE p.id = v_req.requester_id
      AND p.kyc_level >= r.min_kyc_level
  ) THEN
    RAISE EXCEPTION 'Requester does not meet the minimum KYC level for this group';
  END IF;

  -- Mark request approved
  UPDATE sacco.group_join_requests
  SET status = 'approved', reviewed_by = v_uid, reviewed_at = now()
  WHERE id = p_request_id;

  -- Insert member (may already exist if previously exited — update instead)
  INSERT INTO sacco.group_members (
    group_id, profile_id, role, status, joined_at, credit_score_at_join
  )
  SELECT
    v_req.group_id, v_req.requester_id, 'member', 'active', now(), p.credit_score
  FROM core.profiles p
  WHERE p.id = v_req.requester_id
  ON CONFLICT (group_id, profile_id) DO UPDATE
    SET status = 'active', role = 'member', joined_at = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sacco.approve_join_request(uuid) TO authenticated;


-- ─── open_voting ──────────────────────────────────────────────────────────────
-- Transitions a nominations_open election to voting_open.
-- Validates at least one accepted candidate exists.
CREATE OR REPLACE FUNCTION sacco.open_voting(p_election_id uuid)
RETURNS void AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_election   sacco.elections%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_election FROM sacco.elections WHERE id = p_election_id;
  IF v_election IS NULL THEN RAISE EXCEPTION 'Election not found'; END IF;

  IF NOT sacco.is_chair(v_election.group_id) THEN
    RAISE EXCEPTION 'Only the chair can open voting';
  END IF;

  IF v_election.status <> 'nominations_open' THEN
    RAISE EXCEPTION 'Election is not in nominations_open state';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM sacco.election_candidates
    WHERE election_id = p_election_id AND accepted = true AND withdrew = false
  ) THEN
    RAISE EXCEPTION 'At least one candidate must have accepted their nomination';
  END IF;

  UPDATE sacco.elections
  SET status = 'voting_open', voting_open_at = now()
  WHERE id = p_election_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sacco.open_voting(uuid) TO authenticated;


-- ─── close_election ───────────────────────────────────────────────────────────
-- Counts votes, determines winner (most votes; ties broken by earliest acceptance),
-- assigns winner's new role, demotes previous holder if different person.
CREATE OR REPLACE FUNCTION sacco.close_election(p_election_id uuid)
RETURNS uuid AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_election   sacco.elections%ROWTYPE;
  v_winner_id  uuid;
  v_old_holder uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_election FROM sacco.elections WHERE id = p_election_id;
  IF v_election IS NULL THEN RAISE EXCEPTION 'Election not found'; END IF;

  IF NOT sacco.is_chair(v_election.group_id) AND NOT core.has_system_role('system_admin') THEN
    RAISE EXCEPTION 'Only the chair or system_admin can close an election';
  END IF;

  IF v_election.status <> 'voting_open' THEN
    RAISE EXCEPTION 'Election is not in voting_open state';
  END IF;

  -- Determine winner: most votes, tie-break = earliest acceptance
  SELECT ec.candidate_id INTO v_winner_id
  FROM sacco.election_candidates ec
  LEFT JOIN sacco.election_votes ev ON ev.candidate_id = ec.id
  WHERE ec.election_id = p_election_id
    AND ec.accepted = true
    AND ec.withdrew = false
  GROUP BY ec.candidate_id, ec.accepted_at
  ORDER BY COUNT(ev.id) DESC, ec.accepted_at ASC
  LIMIT 1;

  IF v_winner_id IS NULL THEN
    RAISE EXCEPTION 'No accepted candidates with votes found';
  END IF;

  -- Find current holder of this position (may be null if forming)
  SELECT profile_id INTO v_old_holder
  FROM sacco.group_members
  WHERE group_id = v_election.group_id
    AND role = v_election.position
    AND status = 'active';

  -- Demote old holder to member (if different from winner)
  IF v_old_holder IS NOT NULL AND v_old_holder <> v_winner_id THEN
    UPDATE sacco.group_members
    SET role = 'member'
    WHERE group_id = v_election.group_id AND profile_id = v_old_holder;
  END IF;

  -- Assign winner's new role
  UPDATE sacco.group_members
  SET role = v_election.position
  WHERE group_id = v_election.group_id AND profile_id = v_winner_id;

  -- Mark election closed
  UPDATE sacco.elections
  SET
    status          = 'closed',
    winner_id       = v_winner_id,
    voting_close_at = now(),
    closed_by       = v_uid
  WHERE id = p_election_id;

  RETURN v_winner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sacco.close_election(uuid) TO authenticated;
