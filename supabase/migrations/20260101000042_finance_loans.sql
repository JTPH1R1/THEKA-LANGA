CREATE TABLE finance.loans (
  id                       uuid         NOT NULL DEFAULT gen_random_uuid(),
  group_id                 uuid         NOT NULL REFERENCES sacco.groups(id),
  borrower_id              uuid         NOT NULL REFERENCES core.profiles(id),
  principal                bigint       NOT NULL CHECK (principal > 0),
  processing_fee           bigint       NOT NULL DEFAULT 0,
  total_interest           bigint       NOT NULL,
  total_repayable          bigint       NOT NULL,
  amount_repaid            bigint       NOT NULL DEFAULT 0,
  outstanding              bigint       GENERATED ALWAYS AS (total_repayable - amount_repaid) STORED,
  interest_rate            numeric(6,3) NOT NULL,
  interest_type            text         NOT NULL CHECK (interest_type IN ('flat','reducing_balance')),
  repayment_periods        smallint     NOT NULL,
  repayment_schedule       jsonb        NOT NULL,
  status                   text         NOT NULL DEFAULT 'applied'
                                        CHECK (status IN (
                                          'applied','under_review','approved','rejected',
                                          'disbursed','repaying','completed','defaulted','written_off'
                                        )),
  applied_at               timestamptz  NOT NULL DEFAULT now(),
  reviewed_at              timestamptz,
  approved_at              timestamptz,
  disbursed_at             timestamptz,
  completed_at             timestamptz,
  due_date                 date,
  reviewed_by              uuid         REFERENCES core.profiles(id),
  approved_by              uuid         REFERENCES core.profiles(id),
  rejection_reason         text,
  credit_score_at_apply    smallint     NOT NULL,
  first_missed_payment_at  timestamptz,
  default_notice_sent      boolean      NOT NULL DEFAULT false,
  default_notice_sent_at   timestamptz,
  written_off_at           timestamptz,
  written_off_by           uuid         REFERENCES core.profiles(id),
  notes                    text,
  created_at               timestamptz  NOT NULL DEFAULT now(),
  updated_at               timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (id, applied_at)
) PARTITION BY RANGE (applied_at);

CREATE TABLE finance.loans_2025 PARTITION OF finance.loans
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE finance.loans_2026 PARTITION OF finance.loans
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE finance.loans_2027 PARTITION OF finance.loans
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE finance.loans_2028 PARTITION OF finance.loans
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

CREATE INDEX loans_group_idx    ON finance.loans (group_id);
CREATE INDEX loans_borrower_idx ON finance.loans (borrower_id);
CREATE INDEX loans_status_idx   ON finance.loans (status);
CREATE INDEX loans_due_date_idx ON finance.loans (due_date);
CREATE INDEX loans_active_idx   ON finance.loans (group_id, borrower_id)
  WHERE status IN ('disbursed','repaying');

CREATE TRIGGER set_finance_loans_updated_at
  BEFORE UPDATE ON finance.loans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
