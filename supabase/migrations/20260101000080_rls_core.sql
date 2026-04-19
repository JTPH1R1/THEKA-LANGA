-- ============================================================
-- RLS: core schema
-- ============================================================

ALTER TABLE core.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.system_config ENABLE ROW LEVEL SECURITY;

-- Helper: returns true if the current user has the given system_role
CREATE OR REPLACE FUNCTION core.has_system_role(role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM core.profiles
    WHERE id = auth.uid() AND system_role = role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- core.profiles
-- Anyone can read their own profile
CREATE POLICY "profiles: owner read"
  ON core.profiles FOR SELECT
  USING (id = auth.uid());

-- system_admin can read all profiles
CREATE POLICY "profiles: admin read"
  ON core.profiles FOR SELECT
  USING (core.has_system_role('system_admin'));

-- support can read all profiles
CREATE POLICY "profiles: support read"
  ON core.profiles FOR SELECT
  USING (core.has_system_role('support'));

-- Owner can update their own non-privileged fields
CREATE POLICY "profiles: owner update"
  ON core.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-escalation: cannot change system_role, kyc_level, credit_score, blacklist
    AND system_role = (SELECT system_role FROM core.profiles WHERE id = auth.uid())
    AND kyc_level   = (SELECT kyc_level   FROM core.profiles WHERE id = auth.uid())
    AND credit_score = (SELECT credit_score FROM core.profiles WHERE id = auth.uid())
    AND is_blacklisted = (SELECT is_blacklisted FROM core.profiles WHERE id = auth.uid())
  );

-- system_admin can update any profile
CREATE POLICY "profiles: admin update"
  ON core.profiles FOR UPDATE
  USING (core.has_system_role('system_admin'));

-- INSERT handled by trigger (handle_new_user) — no direct INSERT policy for users
-- service_role bypasses RLS for system operations

-- core.system_config
CREATE POLICY "system_config: all read"
  ON core.system_config FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "system_config: admin write"
  ON core.system_config FOR ALL
  USING (core.has_system_role('system_admin'));

-- Grant table permissions to roles
GRANT SELECT, UPDATE ON core.profiles    TO authenticated;
GRANT SELECT         ON core.system_config TO authenticated;
GRANT ALL            ON core.profiles    TO service_role;
GRANT ALL            ON core.system_config TO service_role;
