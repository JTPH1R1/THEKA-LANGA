-- core.is_admin() queries core.profiles inside SECURITY DEFINER context but without
-- row_security = off, which causes recursion when called from admin RPC functions
-- that are themselves triggered by RLS-protected queries.

CREATE OR REPLACE FUNCTION core.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = core, public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT system_role IN ('system_admin','support')
     FROM core.profiles WHERE id = auth.uid()),
    false
  )
$$;
