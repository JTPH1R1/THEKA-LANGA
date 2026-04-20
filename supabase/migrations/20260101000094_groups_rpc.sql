-- ============================================================
-- sacco.create_group — atomically creates a group, adds the
-- caller as active chair, and inserts the initial rules.
-- SECURITY DEFINER so it can bypass RLS for the bootstrap
-- (creator is not yet a member when inserting group_members).
-- ============================================================
CREATE OR REPLACE FUNCTION sacco.create_group(
  -- Group identity
  p_name                        text,
  p_slug                        text,
  p_type                        text,
  p_description                 text,
  p_currency                    text,
  p_timezone                    text,
  p_cycle_start                 date,
  p_cycle_end                   date,
  -- Contributions
  p_contribution_amount         bigint,
  p_contribution_frequency      text,
  p_contribution_day            smallint,
  p_grace_period_days           smallint,
  p_late_fine_flat              bigint,
  p_late_fine_interest_rate_daily numeric,
  -- Membership
  p_initiation_fee              bigint,
  p_late_joining_fee            bigint,
  p_mid_join_allowed            boolean,
  p_mid_join_deadline_weeks     smallint,
  p_max_members                 smallint,
  p_min_kyc_level               smallint,
  -- Loans
  p_loan_enabled                boolean,
  p_max_loan_multiplier         numeric,
  p_loan_interest_rate          numeric,
  p_loan_interest_type          text,
  p_loan_repayment_periods      smallint,
  p_loan_processing_fee_rate    numeric,
  p_max_active_loans_per_member smallint,
  p_guarantor_required          boolean,
  p_guarantors_required_count   smallint,
  p_min_guarantor_credit_score  smallint,
  -- Defaults
  p_default_threshold_days      smallint,
  p_default_penalty_rate        numeric,
  p_blacklist_recommendation_after smallint,
  -- Returns
  p_dividend_distribution       text
)
RETURNS uuid AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_group_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify KYC level ≥ 1 (system config minimum for group creation)
  IF NOT EXISTS (
    SELECT 1 FROM core.profiles WHERE id = v_uid AND kyc_level >= 1
  ) THEN
    RAISE EXCEPTION 'KYC Level 1 required to create a group';
  END IF;

  -- Check slug uniqueness
  IF EXISTS (SELECT 1 FROM sacco.groups WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'A group with this name/slug already exists';
  END IF;

  -- Create group
  INSERT INTO sacco.groups (
    name, slug, type, description, currency, timezone,
    cycle_start, cycle_end, created_by
  ) VALUES (
    p_name, p_slug, p_type, p_description, p_currency, p_timezone,
    p_cycle_start, p_cycle_end, v_uid
  )
  RETURNING id INTO v_group_id;

  -- Add creator as active chair
  INSERT INTO sacco.group_members (
    group_id, profile_id, role, status, joined_at,
    credit_score_at_join
  )
  SELECT
    v_group_id, v_uid, 'chair', 'active', now(),
    credit_score
  FROM core.profiles
  WHERE id = v_uid;

  -- Insert initial rules
  INSERT INTO sacco.group_rules (
    group_id,
    contribution_amount, contribution_frequency, contribution_day,
    grace_period_days, late_fine_flat, late_fine_interest_rate_daily,
    initiation_fee, late_joining_fee, mid_join_allowed,
    mid_join_deadline_weeks, max_members, min_kyc_level,
    loan_enabled, max_loan_multiplier, loan_interest_rate,
    loan_interest_type, loan_repayment_periods, loan_processing_fee_rate,
    max_active_loans_per_member, guarantor_required,
    guarantors_required_count, min_guarantor_credit_score,
    default_threshold_days, default_penalty_rate,
    blacklist_recommendation_after, dividend_distribution,
    last_changed_by
  ) VALUES (
    v_group_id,
    p_contribution_amount, p_contribution_frequency, p_contribution_day,
    p_grace_period_days, p_late_fine_flat, p_late_fine_interest_rate_daily,
    p_initiation_fee, p_late_joining_fee, p_mid_join_allowed,
    p_mid_join_deadline_weeks, p_max_members, p_min_kyc_level,
    p_loan_enabled, p_max_loan_multiplier, p_loan_interest_rate,
    p_loan_interest_type, p_loan_repayment_periods, p_loan_processing_fee_rate,
    p_max_active_loans_per_member, p_guarantor_required,
    p_guarantors_required_count, p_min_guarantor_credit_score,
    p_default_threshold_days, p_default_penalty_rate,
    p_blacklist_recommendation_after, p_dividend_distribution,
    v_uid
  );

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sacco.create_group(
  text, text, text, text, text, text, date, date,
  bigint, text, smallint, smallint, bigint, numeric,
  bigint, bigint, boolean, smallint, smallint, smallint,
  boolean, numeric, numeric, text, smallint, numeric,
  smallint, boolean, smallint, smallint,
  smallint, numeric, smallint,
  text
) TO authenticated;
