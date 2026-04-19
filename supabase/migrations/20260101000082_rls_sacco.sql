-- ============================================================
-- RLS: sacco schema
-- ============================================================

ALTER TABLE sacco.groups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.group_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.group_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.elections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco.election_votes      ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an active member of a group?
CREATE OR REPLACE FUNCTION sacco.is_member(p_group_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = p_group_id
      AND profile_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: is the current user an officer (chair/treasurer/secretary) of a group?
CREATE OR REPLACE FUNCTION sacco.is_officer(p_group_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = p_group_id
      AND profile_id = auth.uid()
      AND status = 'active'
      AND role IN ('chair','treasurer','secretary')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: is the current user the chair of a group?
CREATE OR REPLACE FUNCTION sacco.is_chair(p_group_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = p_group_id
      AND profile_id = auth.uid()
      AND status = 'active'
      AND role = 'chair'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- sacco.groups: public groups visible to all authenticated users; private groups visible to members + admins
CREATE POLICY "groups: public read"
  ON sacco.groups FOR SELECT
  USING (type = 'public' OR sacco.is_member(id) OR core.has_system_role('system_admin'));

CREATE POLICY "groups: creator/admin write"
  ON sacco.groups FOR ALL
  USING (created_by = auth.uid() OR core.has_system_role('system_admin'));

-- sacco.group_rules: members can read; officers can update
CREATE POLICY "group_rules: member read"
  ON sacco.group_rules FOR SELECT
  USING (sacco.is_member(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "group_rules: officer write"
  ON sacco.group_rules FOR ALL
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- sacco.group_members: active members can see the member list
CREATE POLICY "group_members: member read"
  ON sacco.group_members FOR SELECT
  USING (sacco.is_member(group_id) OR profile_id = auth.uid() OR core.has_system_role('system_admin'));

CREATE POLICY "group_members: officer insert"
  ON sacco.group_members FOR INSERT
  WITH CHECK (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "group_members: officer update"
  ON sacco.group_members FOR UPDATE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "group_members: officer delete"
  ON sacco.group_members FOR DELETE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- sacco.group_join_requests: own request + officers of the group
CREATE POLICY "join_requests: own read"
  ON sacco.group_join_requests FOR SELECT
  USING (requester_id = auth.uid() OR sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "join_requests: own insert"
  ON sacco.group_join_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "join_requests: officer review"
  ON sacco.group_join_requests FOR UPDATE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "join_requests: own withdraw"
  ON sacco.group_join_requests FOR UPDATE
  USING (requester_id = auth.uid());

-- sacco.elections: members can read; chair manages
CREATE POLICY "elections: member read"
  ON sacco.elections FOR SELECT
  USING (sacco.is_member(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "elections: chair write"
  ON sacco.elections FOR ALL
  USING (sacco.is_chair(group_id) OR core.has_system_role('system_admin'));

-- sacco.election_candidates: members can read; members can nominate
CREATE POLICY "candidates: member read"
  ON sacco.election_candidates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM sacco.elections e WHERE e.id = election_id AND sacco.is_member(e.group_id))
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "candidates: member nominate"
  ON sacco.election_candidates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM sacco.elections e WHERE e.id = election_id AND sacco.is_member(e.group_id))
  );

CREATE POLICY "candidates: own accept/withdraw"
  ON sacco.election_candidates FOR UPDATE
  USING (candidate_id = auth.uid() OR sacco.is_chair(
    (SELECT group_id FROM sacco.elections WHERE id = election_id)
  ));

-- sacco.election_votes: members can insert their own vote; only aggregate counts are ever read
CREATE POLICY "votes: member insert"
  ON sacco.election_votes FOR INSERT
  WITH CHECK (
    voter_id = auth.uid()
    AND EXISTS (SELECT 1 FROM sacco.elections e WHERE e.id = election_id AND sacco.is_member(e.group_id))
  );

-- No SELECT on individual vote rows to protect ballot secrecy.
-- Counts are retrieved via RPC functions that run as SECURITY DEFINER.
CREATE POLICY "votes: chair/admin read"
  ON sacco.election_votes FOR SELECT
  USING (core.has_system_role('system_admin'));

-- Grants
GRANT SELECT                    ON sacco.groups              TO authenticated;
GRANT INSERT, UPDATE            ON sacco.groups              TO authenticated;
GRANT SELECT                    ON sacco.group_rules         TO authenticated;
GRANT INSERT, UPDATE            ON sacco.group_rules         TO authenticated;
GRANT SELECT                    ON sacco.group_members       TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON sacco.group_members       TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON sacco.group_join_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON sacco.elections           TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON sacco.election_candidates TO authenticated;
GRANT INSERT                    ON sacco.election_votes      TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA sacco TO service_role;
