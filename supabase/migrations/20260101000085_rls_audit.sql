-- ============================================================
-- RLS: audit schema — read-only for users; write via service_role only
-- No user or application code may INSERT directly — all writes are
-- done by SECURITY DEFINER functions or Edge Functions using service_role.
-- ============================================================

ALTER TABLE audit.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.credit_score_history ENABLE ROW LEVEL SECURITY;

-- audit.events: owner sees events about their own records; admin sees all
CREATE POLICY "audit_events: own read"
  ON audit.events FOR SELECT
  USING (changed_by = auth.uid() OR core.has_system_role('system_admin'));

-- No INSERT/UPDATE/DELETE policy for authenticated users — service_role bypasses RLS

-- audit.credit_score_history: owner sees own history; admin sees all
CREATE POLICY "credit_score_history: own read"
  ON audit.credit_score_history FOR SELECT
  USING (profile_id = auth.uid() OR core.has_system_role('system_admin'));

-- Grants
GRANT SELECT ON audit.events               TO authenticated;
GRANT SELECT ON audit.credit_score_history TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA audit TO service_role;
