-- ============================================================
-- RLS: finance schema
-- ============================================================

ALTER TABLE finance.contributions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.contribution_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.loans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.loan_guarantors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.loan_repayments    ENABLE ROW LEVEL SECURITY;

-- finance.contributions
CREATE POLICY "contributions: member read own"
  ON finance.contributions FOR SELECT
  USING (
    member_id = auth.uid()
    OR sacco.is_officer(group_id)
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "contributions: officer insert"
  ON finance.contributions FOR INSERT
  WITH CHECK (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "contributions: officer update"
  ON finance.contributions FOR UPDATE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- finance.contribution_fines
CREATE POLICY "fines: member read own"
  ON finance.contribution_fines FOR SELECT
  USING (
    member_id = auth.uid()
    OR sacco.is_officer(group_id)
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "fines: officer insert"
  ON finance.contribution_fines FOR INSERT
  WITH CHECK (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

CREATE POLICY "fines: officer update"
  ON finance.contribution_fines FOR UPDATE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- finance.loans
CREATE POLICY "loans: borrower read own"
  ON finance.loans FOR SELECT
  USING (
    borrower_id = auth.uid()
    OR sacco.is_officer(group_id)
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "loans: member apply"
  ON finance.loans FOR INSERT
  WITH CHECK (
    borrower_id = auth.uid()
    AND sacco.is_member(group_id)
  );

CREATE POLICY "loans: officer review/approve"
  ON finance.loans FOR UPDATE
  USING (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- finance.loan_guarantors
CREATE POLICY "guarantors: own/officer read"
  ON finance.loan_guarantors FOR SELECT
  USING (
    guarantor_id = auth.uid()
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "guarantors: officer insert"
  ON finance.loan_guarantors FOR INSERT
  WITH CHECK (core.has_system_role('system_admin') OR auth.uid() IS NOT NULL);

CREATE POLICY "guarantors: own respond"
  ON finance.loan_guarantors FOR UPDATE
  USING (guarantor_id = auth.uid() OR core.has_system_role('system_admin'));

-- finance.loan_repayments
CREATE POLICY "repayments: borrower/officer read"
  ON finance.loan_repayments FOR SELECT
  USING (
    borrower_id = auth.uid()
    OR sacco.is_officer(group_id)
    OR core.has_system_role('system_admin')
  );

CREATE POLICY "repayments: officer record"
  ON finance.loan_repayments FOR INSERT
  WITH CHECK (sacco.is_officer(group_id) OR core.has_system_role('system_admin'));

-- Grants
GRANT SELECT, INSERT, UPDATE ON finance.contributions      TO authenticated;
GRANT SELECT, INSERT, UPDATE ON finance.contribution_fines TO authenticated;
GRANT SELECT, INSERT, UPDATE ON finance.loans              TO authenticated;
GRANT SELECT, INSERT, UPDATE ON finance.loan_guarantors    TO authenticated;
GRANT SELECT, INSERT         ON finance.loan_repayments    TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA finance TO service_role;
