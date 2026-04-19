-- Repayments are immutable — corrections are done via reversal records, not edits.
-- FK to finance.loans omitted: partitioned table PKs can't be FK targets without the partition key.
-- loan_id integrity enforced at the application/API layer.
CREATE TABLE finance.loan_repayments (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid(),
  loan_id              uuid        NOT NULL,
  group_id             uuid        NOT NULL REFERENCES sacco.groups(id),
  borrower_id          uuid        NOT NULL REFERENCES core.profiles(id),
  amount_paid          bigint      NOT NULL CHECK (amount_paid > 0),
  principal_component  bigint      NOT NULL DEFAULT 0,
  interest_component   bigint      NOT NULL DEFAULT 0,
  penalty_component    bigint      NOT NULL DEFAULT 0,
  schedule_period      smallint,
  paid_at              timestamptz NOT NULL DEFAULT now(),
  payment_ref          text,
  payment_channel      text        CHECK (payment_channel IN ('mobile_money','bank','cash','internal')),
  recorded_by          uuid        NOT NULL REFERENCES core.profiles(id),
  is_reversal          boolean     NOT NULL DEFAULT false,
  reversal_of          uuid,
  reversal_reason      text,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, paid_at)
) PARTITION BY RANGE (paid_at);

CREATE TABLE finance.loan_repayments_2025 PARTITION OF finance.loan_repayments
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE finance.loan_repayments_2026 PARTITION OF finance.loan_repayments
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE finance.loan_repayments_2027 PARTITION OF finance.loan_repayments
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE finance.loan_repayments_2028 PARTITION OF finance.loan_repayments
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

CREATE INDEX lr_loan_idx     ON finance.loan_repayments (loan_id);
CREATE INDEX lr_borrower_idx ON finance.loan_repayments (borrower_id);
CREATE INDEX lr_group_idx    ON finance.loan_repayments (group_id);
CREATE INDEX lr_paid_at_idx  ON finance.loan_repayments (paid_at DESC);
