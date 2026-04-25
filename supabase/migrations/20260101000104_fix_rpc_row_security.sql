-- Add SET row_security = off to every SECURITY DEFINER RPC function.
-- In Supabase (hosted), the postgres role does NOT have the BYPASSRLS attribute,
-- so SECURITY DEFINER alone does NOT bypass RLS. The explicit SET is required.
-- All functions below already perform their own authorization checks in the body.

-- ─── KYC RPCs ─────────────────────────────────────────────────────────────────

-- complete_level1 updates core.profiles.kyc_level which the owner-update RLS forbids.
ALTER FUNCTION kyc.complete_level1(date, text, text)
  SET row_security = off;

ALTER FUNCTION kyc.submit_level2(uuid, uuid)
  SET row_security = off;

ALTER FUNCTION kyc.submit_level3(uuid)
  SET row_security = off;

-- ─── SACCO RPCs ───────────────────────────────────────────────────────────────

ALTER FUNCTION sacco.create_group(
  text, text, text, text, text, text, date, date,
  bigint, text, smallint, smallint, bigint, numeric,
  bigint, bigint, boolean, smallint, smallint, smallint,
  boolean, numeric, numeric, text, smallint, numeric, smallint,
  boolean, smallint, smallint,
  smallint, numeric, smallint,
  text
) SET row_security = off;

ALTER FUNCTION sacco.approve_join_request(uuid)
  SET row_security = off;

ALTER FUNCTION sacco.open_voting(uuid)
  SET row_security = off;

-- close_election updates sacco.group_members.role for the election winner.
ALTER FUNCTION sacco.close_election(uuid)
  SET row_security = off;

ALTER FUNCTION sacco.get_activity_feed(int)
  SET row_security = off;

-- ─── Finance RPCs ─────────────────────────────────────────────────────────────

-- generate_contribution_schedule inserts rows for ALL group members, not just the caller.
ALTER FUNCTION finance.generate_contribution_schedule(uuid, text, date)
  SET row_security = off;

ALTER FUNCTION finance.record_contribution_payment(uuid, bigint, bigint, text, text, text)
  SET row_security = off;

ALTER FUNCTION finance.waive_contribution(uuid, text)
  SET row_security = off;

ALTER FUNCTION finance.apply_for_loan(uuid, bigint, uuid[], text)
  SET row_security = off;

ALTER FUNCTION finance.approve_loan(uuid)
  SET row_security = off;

ALTER FUNCTION finance.reject_loan(uuid, text)
  SET row_security = off;

ALTER FUNCTION finance.disburse_loan(uuid)
  SET row_security = off;

ALTER FUNCTION finance.record_loan_repayment(uuid, bigint, text, text, text)
  SET row_security = off;

ALTER FUNCTION finance.respond_to_guarantor(uuid, boolean)
  SET row_security = off;

ALTER FUNCTION finance.get_next_contribution_due()
  SET row_security = off;
