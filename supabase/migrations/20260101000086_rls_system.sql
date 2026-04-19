-- ============================================================
-- RLS: system schema
-- ============================================================

ALTER TABLE system.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.job_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system.errors        ENABLE ROW LEVEL SECURITY;

-- system.notifications: recipient sees own; admin sees all
CREATE POLICY "notifications: recipient read"
  ON system.notifications FOR SELECT
  USING (recipient_id = auth.uid() OR core.has_system_role('system_admin'));

CREATE POLICY "notifications: recipient update (mark read)"
  ON system.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- No INSERT policy for authenticated users — notifications are created by Edge Functions (service_role)

-- system.job_log: admin read-only
CREATE POLICY "job_log: admin read"
  ON system.job_log FOR SELECT
  USING (core.has_system_role('system_admin'));

-- system.errors: owner sees own; admin sees all; client can insert (error reporting)
CREATE POLICY "errors: own read"
  ON system.errors FOR SELECT
  USING (profile_id = auth.uid() OR core.has_system_role('system_admin'));

CREATE POLICY "errors: client insert"
  ON system.errors FOR INSERT
  WITH CHECK (source = 'client' AND (profile_id = auth.uid() OR profile_id IS NULL));

-- Grants
GRANT SELECT, UPDATE ON system.notifications TO authenticated;
GRANT SELECT         ON system.job_log       TO authenticated;
GRANT SELECT, INSERT ON system.errors        TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA system TO service_role;
