-- Fix infinite recursion in core.profiles RLS policies.
-- Root cause: has_system_role() queries core.profiles inside a policy on core.profiles.
-- Fix: add SET row_security = off to all SECURITY DEFINER helpers that query core.profiles.

-- 1. Fix has_system_role — add row_security = off so it bypasses RLS when called from a policy
CREATE OR REPLACE FUNCTION core.has_system_role(role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM core.profiles
    WHERE id = auth.uid() AND system_role = role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = core, public SET row_security = off;

-- 2. Helper used by owner update policy — avoids recursive subqueries in WITH CHECK
CREATE OR REPLACE FUNCTION core.get_profile_immutable_fields(p_id uuid, OUT p_system_role text, OUT p_kyc_level smallint, OUT p_credit_score smallint, OUT p_is_blacklisted boolean)
RETURNS record AS $$
  SELECT system_role, kyc_level, credit_score, is_blacklisted
  FROM core.profiles WHERE id = p_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = core, public SET row_security = off;

-- 3. Recreate owner update policy using the helper instead of inline subqueries
DROP POLICY IF EXISTS "profiles: owner update" ON core.profiles;

CREATE POLICY "profiles: owner update"
  ON core.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND system_role    = (SELECT p_system_role    FROM core.get_profile_immutable_fields(auth.uid()))
    AND kyc_level      = (SELECT p_kyc_level      FROM core.get_profile_immutable_fields(auth.uid()))
    AND credit_score   = (SELECT p_credit_score   FROM core.get_profile_immutable_fields(auth.uid()))
    AND is_blacklisted = (SELECT p_is_blacklisted FROM core.get_profile_immutable_fields(auth.uid()))
  );
