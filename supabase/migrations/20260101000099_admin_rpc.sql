-- ─── Admin helper ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION core.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = core
AS $$
  SELECT COALESCE(
    (SELECT system_role IN ('system_admin','support') FROM core.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- ─── Admin stats ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION core.admin_get_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, sacco, finance, kyc, system
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN jsonb_build_object(
    'total_users',       (SELECT COUNT(*)::int  FROM core.profiles),
    'active_users',      (SELECT COUNT(*)::int  FROM core.profiles WHERE is_active = true),
    'blacklisted_users', (SELECT COUNT(*)::int  FROM core.profiles WHERE is_blacklisted = true),
    'active_groups',     (SELECT COUNT(*)::int  FROM sacco.groups WHERE status = 'active'),
    'total_groups',      (SELECT COUNT(*)::int  FROM sacco.groups),
    'loan_outstanding',  (SELECT COALESCE(SUM(outstanding),0)::bigint FROM finance.loans WHERE status IN ('disbursed','repaying')),
    'total_defaults',    (SELECT COUNT(*)::int  FROM finance.loans WHERE status = 'defaulted'),
    'kyc_queue_count',   (SELECT COUNT(*)::int  FROM kyc.profiles WHERE verification_status = 'pending_review'),
    'unresolved_errors', (SELECT COUNT(*)::int  FROM system.errors WHERE resolved = false)
  );
END;
$$;

-- ─── Admin users ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION core.admin_get_all_profiles(
  p_search      text    DEFAULT NULL,
  p_kyc_level   int     DEFAULT NULL,
  p_blacklisted boolean DEFAULT NULL
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, sacco
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'id',                p.id,
    'email',             p.email,
    'full_legal_name',   p.full_legal_name,
    'preferred_name',    p.preferred_name,
    'phone',             p.phone,
    'system_role',       p.system_role,
    'kyc_level',         p.kyc_level,
    'credit_score',      p.credit_score,
    'credit_score_band', p.credit_score_band,
    'is_blacklisted',    p.is_blacklisted,
    'is_active',         p.is_active,
    'created_at',        p.created_at,
    'group_count',       (
      SELECT COUNT(*)::int FROM sacco.group_members gm
      WHERE gm.profile_id = p.id AND gm.status = 'active'
    )
  )
  FROM core.profiles p
  WHERE (p_search IS NULL
    OR p.full_legal_name ILIKE '%' || p_search || '%'
    OR p.email ILIKE '%' || p_search || '%')
  AND (p_kyc_level IS NULL OR p.kyc_level = p_kyc_level)
  AND (p_blacklisted IS NULL OR p.is_blacklisted = p_blacklisted)
  ORDER BY p.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION core.admin_blacklist_user(p_profile_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core
AS $$
BEGIN
  IF NOT (SELECT system_role = 'system_admin' FROM core.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only system_admin can blacklist users';
  END IF;
  UPDATE core.profiles
  SET is_blacklisted = true, blacklisted_at = now(), blacklisted_reason = p_reason
  WHERE id = p_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION core.admin_unblacklist_user(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core
AS $$
BEGIN
  IF NOT (SELECT system_role = 'system_admin' FROM core.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only system_admin can unblacklist users';
  END IF;
  UPDATE core.profiles
  SET is_blacklisted = false, blacklisted_at = NULL, blacklisted_reason = NULL
  WHERE id = p_profile_id;
END;
$$;

-- ─── Admin groups ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sacco.admin_get_all_groups(p_status text DEFAULT NULL)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, sacco
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'id',                  g.id,
    'name',                g.name,
    'slug',                g.slug,
    'type',                g.type,
    'status',              g.status,
    'currency',            g.currency,
    'created_at',          g.created_at,
    'member_count',        COALESCE(gs.active_members, 0),
    'total_contributions', COALESCE(gs.total_contributions, 0),
    'active_loan_book',    COALESCE(gs.active_loan_book, 0),
    'total_defaults',      COALESCE(gs.total_defaults, 0)
  )
  FROM sacco.groups g
  LEFT JOIN sacco.group_summaries gs ON gs.group_id = g.id
  WHERE (p_status IS NULL OR g.status = p_status)
  ORDER BY g.created_at DESC
  LIMIT 200;
END;
$$;

CREATE OR REPLACE FUNCTION sacco.admin_freeze_group(p_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, sacco
AS $$
BEGIN
  IF NOT (SELECT system_role = 'system_admin' FROM core.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only system_admin can freeze groups';
  END IF;
  UPDATE sacco.groups SET status = 'frozen' WHERE id = p_group_id AND status = 'active';
END;
$$;

CREATE OR REPLACE FUNCTION sacco.admin_unfreeze_group(p_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, sacco
AS $$
BEGIN
  IF NOT (SELECT system_role = 'system_admin' FROM core.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only system_admin can unfreeze groups';
  END IF;
  UPDATE sacco.groups SET status = 'active' WHERE id = p_group_id AND status = 'frozen';
END;
$$;

-- ─── Admin KYC queue ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION kyc.admin_get_kyc_queue()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, kyc
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'profile_id',          kp.profile_id,
    'full_legal_name',     kp.full_legal_name,
    'verification_status', kp.verification_status,
    'kyc_level',           kp.kyc_level,
    'submitted_at',        kp.submitted_at,
    'risk_rating',         kp.risk_rating,
    'email',               cp.email,
    'phone',               cp.phone
  )
  FROM kyc.profiles kp
  JOIN core.profiles cp ON cp.id = kp.profile_id
  WHERE kp.verification_status = 'pending_review'
  ORDER BY kp.submitted_at ASC NULLS LAST
  LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION kyc.admin_approve_kyc(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, kyc
AS $$
DECLARE
  v_level smallint;
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT kyc_level INTO v_level FROM kyc.profiles WHERE profile_id = p_profile_id;
  IF v_level IS NULL THEN RAISE EXCEPTION 'KYC profile not found'; END IF;
  IF v_level >= 3 THEN RAISE EXCEPTION 'Already at maximum KYC level'; END IF;

  UPDATE kyc.profiles
  SET verification_status    = 'verified',
      kyc_level              = v_level + 1,
      reviewed_at            = now(),
      level2_completed_at    = CASE WHEN v_level = 1 THEN now() ELSE level2_completed_at END,
      level3_completed_at    = CASE WHEN v_level = 2 THEN now() ELSE level3_completed_at END,
      level2_verified_by     = CASE WHEN v_level = 1 THEN auth.uid() ELSE level2_verified_by END,
      level3_verified_by     = CASE WHEN v_level = 2 THEN auth.uid() ELSE level3_verified_by END
  WHERE profile_id = p_profile_id;

  UPDATE core.profiles SET kyc_level = v_level + 1 WHERE id = p_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION kyc.admin_reject_kyc(p_profile_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, kyc
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  UPDATE kyc.profiles
  SET verification_status = 'rejected',
      reviewed_at         = now(),
      internal_notes      = p_reason
  WHERE profile_id = p_profile_id;
END;
$$;

-- ─── Admin audit log ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION audit.admin_get_events(
  p_table_name text DEFAULT NULL,
  p_action     text DEFAULT NULL,
  p_limit      int  DEFAULT 50,
  p_offset     int  DEFAULT 0
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, audit
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'id',          ae.id,
    'schema_name', ae.schema_name,
    'table_name',  ae.table_name,
    'record_id',   ae.record_id,
    'action',      ae.action,
    'changed_at',  ae.changed_at,
    'changed_by',  ae.changed_by,
    'actor_name',  cp.preferred_name,
    'diff',        ae.diff
  )
  FROM audit.events ae
  LEFT JOIN core.profiles cp ON cp.id = ae.changed_by
  WHERE (p_table_name IS NULL OR ae.table_name = p_table_name)
  AND (p_action IS NULL OR ae.action = p_action)
  ORDER BY ae.changed_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ─── Admin system jobs ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION system.admin_get_job_log(p_limit int DEFAULT 50)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, system
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'id',                jl.id,
    'job_name',          jl.job_name,
    'status',            jl.status,
    'started_at',        jl.started_at,
    'completed_at',      jl.completed_at,
    'duration_ms',       jl.duration_ms,
    'records_processed', jl.records_processed,
    'error_message',     jl.error_message
  )
  FROM system.job_log jl
  ORDER BY jl.started_at DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION system.admin_get_errors(p_limit int DEFAULT 50)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, system
AS $$
BEGIN
  IF NOT core.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  RETURN QUERY
  SELECT jsonb_build_object(
    'id',         se.id,
    'source',     se.source,
    'error_code', se.error_code,
    'message',    se.message,
    'profile_id', se.profile_id,
    'resolved',   se.resolved,
    'created_at', se.created_at
  )
  FROM system.errors se
  WHERE se.resolved = false
  ORDER BY se.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute to authenticated role on all admin functions
GRANT EXECUTE ON FUNCTION core.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION core.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION core.admin_get_all_profiles(text, int, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION core.admin_blacklist_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION core.admin_unblacklist_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION sacco.admin_get_all_groups(text) TO authenticated;
GRANT EXECUTE ON FUNCTION sacco.admin_freeze_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION sacco.admin_unfreeze_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION kyc.admin_get_kyc_queue() TO authenticated;
GRANT EXECUTE ON FUNCTION kyc.admin_approve_kyc(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION kyc.admin_reject_kyc(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION audit.admin_get_events(text, text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION system.admin_get_job_log(int) TO authenticated;
GRANT EXECUTE ON FUNCTION system.admin_get_errors(int) TO authenticated;
