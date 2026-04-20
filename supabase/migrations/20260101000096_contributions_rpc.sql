-- Phase 8: Contributions — RPCs
-- RLS policies are defined in 20260101000083_rls_finance.sql

-- ─── RPC: generate contribution schedule ─────────────────────────────────────
-- Creates one pending contribution row per active member for the given period.
-- Idempotent — skips members who already have a row for this period.

CREATE OR REPLACE FUNCTION finance.generate_contribution_schedule(
  p_group_id     uuid,
  p_cycle_period text,   -- 'YYYY-MM' for monthly, 'YYYY-W##' for weekly
  p_due_date     date
) RETURNS integer        -- rows created
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE
  v_expected_amount bigint;
  v_rows_created    integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id  = p_group_id
      AND profile_id = auth.uid()
      AND role       IN ('chair','treasurer')
      AND status     = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can generate a contribution schedule';
  END IF;

  SELECT gr.contribution_amount INTO v_expected_amount
  FROM sacco.group_rules gr WHERE gr.group_id = p_group_id;

  IF v_expected_amount IS NULL THEN
    RAISE EXCEPTION 'Group rules not found for group %', p_group_id;
  END IF;

  INSERT INTO finance.contributions
    (group_id, member_id, cycle_period, due_date, expected_amount, status)
  SELECT
    p_group_id,
    gm.profile_id,
    p_cycle_period,
    p_due_date,
    v_expected_amount,
    'pending'
  FROM sacco.group_members gm
  WHERE gm.group_id  = p_group_id
    AND gm.status    = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM finance.contributions c2
      WHERE c2.group_id    = p_group_id
        AND c2.member_id   = gm.profile_id
        AND c2.cycle_period = p_cycle_period
    );

  GET DIAGNOSTICS v_rows_created = ROW_COUNT;
  RETURN v_rows_created;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.generate_contribution_schedule(uuid, text, date) TO authenticated;

-- ─── RPC: record contribution payment ────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.record_contribution_payment(
  p_contribution_id uuid,
  p_paid_amount     bigint,   -- cents
  p_fine_amount     bigint,   -- cents
  p_payment_ref     text,
  p_payment_channel text,
  p_notes           text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE
  v_group_id uuid;
  v_expected bigint;
  v_new_status text;
BEGIN
  SELECT group_id, expected_amount
  INTO   v_group_id, v_expected
  FROM   finance.contributions
  WHERE  id = p_contribution_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Contribution not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id  = v_group_id
      AND profile_id = auth.uid()
      AND role       IN ('chair','treasurer')
      AND status     = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can record payments';
  END IF;

  IF p_paid_amount <= 0 THEN
    RAISE EXCEPTION 'Paid amount must be greater than zero';
  END IF;

  v_new_status := CASE
    WHEN p_paid_amount >= v_expected THEN 'paid'
    ELSE 'partial'
  END;

  UPDATE finance.contributions SET
    paid_amount     = p_paid_amount,
    fine_amount     = p_fine_amount,
    status          = v_new_status,
    paid_at         = now(),
    payment_ref     = p_payment_ref,
    payment_channel = p_payment_channel,
    recorded_by     = auth.uid(),
    notes           = p_notes,
    updated_at      = now()
  WHERE id = p_contribution_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.record_contribution_payment(uuid, bigint, bigint, text, text, text) TO authenticated;

-- ─── RPC: waive contribution ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.waive_contribution(
  p_contribution_id uuid,
  p_reason          text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE
  v_group_id uuid;
BEGIN
  SELECT group_id INTO v_group_id
  FROM   finance.contributions
  WHERE  id = p_contribution_id;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Contribution not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id  = v_group_id
      AND profile_id = auth.uid()
      AND role       IN ('chair','treasurer')
      AND status     = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can waive contributions';
  END IF;

  UPDATE finance.contributions SET
    status     = 'waived',
    notes      = COALESCE(p_reason, 'Waived by officer'),
    updated_at = now()
  WHERE id     = p_contribution_id
    AND status IN ('pending','partial','late');
END;
$$;

GRANT EXECUTE ON FUNCTION finance.waive_contribution(uuid, text) TO authenticated;
