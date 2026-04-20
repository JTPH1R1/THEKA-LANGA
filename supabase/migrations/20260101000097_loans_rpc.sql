-- Phase 9: Loans — RLS policies and RPCs

-- ─── Enable RLS ──────────────────────────────────────────────────────────────

ALTER TABLE finance.loans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.loan_guarantors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.loan_repayments   ENABLE ROW LEVEL SECURITY;

-- ─── RLS: finance.loans ──────────────────────────────────────────────────────

-- Active group members can read loans for their group
CREATE POLICY "loans: group member read"
  ON finance.loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sacco.group_members gm
      WHERE gm.group_id  = loans.group_id
        AND gm.profile_id = auth.uid()
        AND gm.status     = 'active'
    )
  );

-- Borrowers can insert their own loan applications (officer approval handled by RPC)
CREATE POLICY "loans: borrower insert"
  ON finance.loans FOR INSERT
  WITH CHECK (borrower_id = auth.uid());

-- Officers and borrower can update loan status
CREATE POLICY "loans: officer update"
  ON finance.loans FOR UPDATE
  USING (
    borrower_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sacco.group_members gm
      WHERE gm.group_id  = loans.group_id
        AND gm.profile_id = auth.uid()
        AND gm.role       IN ('chair','treasurer')
        AND gm.status     = 'active'
    )
  );

-- ─── RLS: finance.loan_guarantors ────────────────────────────────────────────

CREATE POLICY "loan_guarantors: group member read"
  ON finance.loan_guarantors FOR SELECT
  USING (
    guarantor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM finance.loans l
      JOIN sacco.group_members gm ON gm.group_id = l.group_id
      WHERE l.id          = loan_guarantors.loan_id
        AND gm.profile_id = auth.uid()
        AND gm.status     = 'active'
    )
  );

CREATE POLICY "loan_guarantors: insert via rpc"
  ON finance.loan_guarantors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "loan_guarantors: guarantor update own"
  ON finance.loan_guarantors FOR UPDATE
  USING (guarantor_id = auth.uid());

-- ─── RLS: finance.loan_repayments ────────────────────────────────────────────

CREATE POLICY "loan_repayments: group member read"
  ON finance.loan_repayments FOR SELECT
  USING (
    borrower_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM sacco.group_members gm
      WHERE gm.group_id  = loan_repayments.group_id
        AND gm.profile_id = auth.uid()
        AND gm.status     = 'active'
    )
  );

CREATE POLICY "loan_repayments: officer insert"
  ON finance.loan_repayments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sacco.group_members gm
      WHERE gm.group_id  = loan_repayments.group_id
        AND gm.profile_id = auth.uid()
        AND gm.role       IN ('chair','treasurer')
        AND gm.status     = 'active'
    )
  );

-- ─── Helper: compute loan schedule ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance._build_loan_schedule(
  p_principal           bigint,
  p_interest_rate       numeric,  -- annual %
  p_interest_type       text,
  p_repayment_periods   smallint
) RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE
  v_schedule          jsonb := '[]'::jsonb;
  v_monthly_rate      numeric;
  v_monthly_payment   bigint;
  v_total_interest    bigint := 0;
  v_outstanding       bigint;
  v_interest_comp     bigint;
  v_principal_comp    bigint;
  v_due_date          date;
  v_i                 int;
BEGIN
  IF p_interest_type = 'flat' THEN
    v_total_interest  := ROUND(p_principal * p_interest_rate / 100.0 * p_repayment_periods / 12.0)::bigint;
    v_monthly_payment := ROUND((p_principal + v_total_interest)::numeric / p_repayment_periods)::bigint;

    FOR v_i IN 1..p_repayment_periods LOOP
      v_due_date      := (CURRENT_DATE + (v_i || ' months')::interval)::date;
      v_interest_comp := ROUND(v_total_interest::numeric / p_repayment_periods)::bigint;
      v_principal_comp := v_monthly_payment - v_interest_comp;
      v_schedule := v_schedule || jsonb_build_object(
        'period', v_i,
        'dueDate', v_due_date,
        'principalDue', v_principal_comp,
        'interestDue', v_interest_comp,
        'totalDue', v_monthly_payment,
        'status', 'pending'
      );
    END LOOP;
  ELSE
    -- Reducing balance
    v_monthly_rate    := p_interest_rate / 100.0 / 12.0;
    v_monthly_payment := ROUND(
      p_principal * v_monthly_rate * POWER(1.0 + v_monthly_rate, p_repayment_periods)
      / (POWER(1.0 + v_monthly_rate, p_repayment_periods) - 1.0)
    )::bigint;
    v_outstanding := p_principal;

    FOR v_i IN 1..p_repayment_periods LOOP
      v_due_date      := (CURRENT_DATE + (v_i || ' months')::interval)::date;
      v_interest_comp  := ROUND(v_outstanding * v_monthly_rate)::bigint;
      v_principal_comp := v_monthly_payment - v_interest_comp;
      -- Last period: clear remaining balance exactly
      IF v_i = p_repayment_periods THEN
        v_principal_comp := v_outstanding;
        v_monthly_payment := v_principal_comp + v_interest_comp;
      END IF;
      v_total_interest := v_total_interest + v_interest_comp;
      v_outstanding    := v_outstanding - v_principal_comp;
      v_schedule := v_schedule || jsonb_build_object(
        'period', v_i,
        'dueDate', v_due_date,
        'principalDue', v_principal_comp,
        'interestDue', v_interest_comp,
        'totalDue', v_monthly_payment,
        'status', 'pending'
      );
    END LOOP;
  END IF;

  RETURN v_schedule;
END;
$$;

-- ─── RPC: apply for loan ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.apply_for_loan(
  p_group_id      uuid,
  p_principal     bigint,     -- cents
  p_guarantor_ids uuid[],
  p_notes         text DEFAULT NULL
) RETURNS uuid               -- loan_id
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, core, public AS $$
DECLARE
  v_rules       sacco.group_rules%ROWTYPE;
  v_borrower    uuid := auth.uid();
  v_credit      smallint;
  v_contrib_sum bigint;
  v_max_eligible bigint;
  v_proc_fee    bigint;
  v_interest    bigint;
  v_total_repay bigint;
  v_schedule    jsonb;
  v_last_due    date;
  v_loan_id     uuid;
  v_g           uuid;
BEGIN
  -- Membership check
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = p_group_id AND profile_id = v_borrower AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'You must be an active member to apply for a loan';
  END IF;

  SELECT * INTO v_rules FROM sacco.group_rules WHERE group_id = p_group_id;
  IF NOT v_rules.loan_enabled THEN
    RAISE EXCEPTION 'Loans are not enabled for this group';
  END IF;

  -- Guarantor check
  IF v_rules.guarantor_required AND (
    p_guarantor_ids IS NULL OR array_length(p_guarantor_ids, 1) < v_rules.guarantors_required_count
  ) THEN
    RAISE EXCEPTION 'This group requires % guarantor(s)', v_rules.guarantors_required_count;
  END IF;

  -- Credit score
  SELECT credit_score INTO v_credit FROM core.profiles WHERE id = v_borrower;

  -- Contribution history for multiplier check
  SELECT COALESCE(SUM(paid_amount), 0) INTO v_contrib_sum
  FROM finance.contributions
  WHERE group_id = p_group_id AND member_id = v_borrower AND status IN ('paid','partial','late');

  v_max_eligible := ROUND(v_contrib_sum * v_rules.max_loan_multiplier)::bigint;
  IF v_max_eligible = 0 OR p_principal > v_max_eligible THEN
    RAISE EXCEPTION 'Loan amount exceeds maximum eligible (% × contributions = %)',
      v_rules.max_loan_multiplier, v_max_eligible;
  END IF;

  -- Active loan limit
  IF (
    SELECT COUNT(*) FROM finance.loans
    WHERE group_id = p_group_id AND borrower_id = v_borrower
      AND status IN ('applied','under_review','approved','disbursed','repaying')
  ) >= v_rules.max_active_loans_per_member THEN
    RAISE EXCEPTION 'You already have the maximum number of active loans for this group';
  END IF;

  -- Build schedule
  v_schedule := finance._build_loan_schedule(
    p_principal, v_rules.loan_interest_rate, v_rules.loan_interest_type, v_rules.loan_repayment_periods
  );

  -- Extract computed totals from schedule
  SELECT COALESCE(SUM((el->>'interestDue')::bigint), 0)
  INTO   v_interest
  FROM   jsonb_array_elements(v_schedule) el;

  v_proc_fee    := ROUND(p_principal * v_rules.loan_processing_fee_rate / 100.0)::bigint;
  v_total_repay := p_principal + v_interest + v_proc_fee;

  -- Last due date from schedule
  SELECT (el->>'dueDate')::date
  INTO   v_last_due
  FROM   jsonb_array_elements(v_schedule) el
  ORDER BY (el->>'period')::int DESC LIMIT 1;

  INSERT INTO finance.loans (
    group_id, borrower_id, principal, processing_fee, total_interest, total_repayable,
    interest_rate, interest_type, repayment_periods, repayment_schedule,
    status, applied_at, due_date, credit_score_at_apply, notes
  ) VALUES (
    p_group_id, v_borrower, p_principal, v_proc_fee, v_interest, v_total_repay,
    v_rules.loan_interest_rate, v_rules.loan_interest_type, v_rules.loan_repayment_periods, v_schedule,
    'applied', now(), v_last_due, v_credit, p_notes
  ) RETURNING id INTO v_loan_id;

  -- Insert guarantors
  IF p_guarantor_ids IS NOT NULL THEN
    FOREACH v_g IN ARRAY p_guarantor_ids LOOP
      INSERT INTO finance.loan_guarantors (loan_id, guarantor_id, credit_score_at_guarantee)
      SELECT v_loan_id, v_g, p.credit_score FROM core.profiles p WHERE p.id = v_g
      ON CONFLICT (loan_id, guarantor_id) DO NOTHING;
    END LOOP;
  END IF;

  RETURN v_loan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.apply_for_loan(uuid, bigint, uuid[], text) TO authenticated;

-- ─── RPC: approve loan ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.approve_loan(p_loan_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE v_group_id uuid;
BEGIN
  SELECT group_id INTO v_group_id FROM finance.loans WHERE id = p_loan_id AND status = 'applied';
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Loan not found or not in applied status';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = v_group_id AND profile_id = auth.uid()
      AND role IN ('chair','treasurer') AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can approve loans';
  END IF;
  UPDATE finance.loans SET
    status = 'approved', reviewed_at = now(), approved_at = now(),
    reviewed_by = auth.uid(), approved_by = auth.uid(), updated_at = now()
  WHERE id = p_loan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.approve_loan(uuid) TO authenticated;

-- ─── RPC: reject loan ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.reject_loan(p_loan_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE v_group_id uuid;
BEGIN
  SELECT group_id INTO v_group_id FROM finance.loans WHERE id = p_loan_id AND status IN ('applied','approved');
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Loan not found or cannot be rejected at this stage';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = v_group_id AND profile_id = auth.uid()
      AND role IN ('chair','treasurer') AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can reject loans';
  END IF;
  UPDATE finance.loans SET
    status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(),
    rejection_reason = p_reason, updated_at = now()
  WHERE id = p_loan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.reject_loan(uuid, text) TO authenticated;

-- ─── RPC: disburse loan ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.disburse_loan(p_loan_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE v_group_id uuid;
BEGIN
  SELECT group_id INTO v_group_id FROM finance.loans WHERE id = p_loan_id AND status = 'approved';
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Loan not found or not in approved status';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = v_group_id AND profile_id = auth.uid()
      AND role IN ('chair','treasurer') AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can disburse loans';
  END IF;
  UPDATE finance.loans SET
    status = 'disbursed', disbursed_at = now(), updated_at = now()
  WHERE id = p_loan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.disburse_loan(uuid) TO authenticated;

-- ─── RPC: record loan repayment ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.record_loan_repayment(
  p_loan_id        uuid,
  p_amount_paid    bigint,   -- cents
  p_payment_ref    text,
  p_payment_channel text,
  p_notes          text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
DECLARE
  v_loan      finance.loans%ROWTYPE;
  v_new_repaid bigint;
  v_new_status text;
BEGIN
  SELECT * INTO v_loan FROM finance.loans WHERE id = p_loan_id AND status IN ('disbursed','repaying');
  IF v_loan.id IS NULL THEN
    RAISE EXCEPTION 'Loan not found or not yet disbursed';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM sacco.group_members
    WHERE group_id = v_loan.group_id AND profile_id = auth.uid()
      AND role IN ('chair','treasurer') AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only chair or treasurer can record repayments';
  END IF;
  IF p_amount_paid <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  v_new_repaid := v_loan.amount_repaid + p_amount_paid;
  v_new_status := CASE WHEN v_new_repaid >= v_loan.total_repayable THEN 'completed' ELSE 'repaying' END;

  INSERT INTO finance.loan_repayments (
    loan_id, group_id, borrower_id, amount_paid,
    paid_at, payment_ref, payment_channel, recorded_by, notes
  ) VALUES (
    p_loan_id, v_loan.group_id, v_loan.borrower_id, p_amount_paid,
    now(), p_payment_ref, p_payment_channel, auth.uid(), p_notes
  );

  UPDATE finance.loans SET
    amount_repaid = v_new_repaid,
    status        = v_new_status,
    completed_at  = CASE WHEN v_new_status = 'completed' THEN now() END,
    updated_at    = now()
  WHERE id = p_loan_id;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.record_loan_repayment(uuid, bigint, text, text, text) TO authenticated;

-- ─── RPC: respond to guarantor request ───────────────────────────────────────

CREATE OR REPLACE FUNCTION finance.respond_to_guarantor(
  p_loan_id  uuid,
  p_accepted boolean
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, public AS $$
BEGIN
  UPDATE finance.loan_guarantors SET
    status       = CASE WHEN p_accepted THEN 'accepted' ELSE 'declined' END,
    responded_at = now()
  WHERE loan_id     = p_loan_id
    AND guarantor_id = auth.uid()
    AND status       = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending guarantor request found for this loan';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.respond_to_guarantor(uuid, boolean) TO authenticated;
