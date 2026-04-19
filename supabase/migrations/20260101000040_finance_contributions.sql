CREATE TABLE finance.contributions (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  group_id         uuid        NOT NULL REFERENCES sacco.groups(id),
  member_id        uuid        NOT NULL REFERENCES core.profiles(id),
  cycle_period     text        NOT NULL,
  due_date         date        NOT NULL,
  expected_amount  bigint      NOT NULL,
  paid_amount      bigint      NOT NULL DEFAULT 0,
  fine_amount      bigint      NOT NULL DEFAULT 0,
  total_paid       bigint      GENERATED ALWAYS AS (paid_amount + fine_amount) STORED,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','paid','partial','late','waived','defaulted','reversed')),
  paid_at          timestamptz,
  payment_ref      text,
  payment_channel  text        CHECK (payment_channel IN ('mobile_money','bank','cash','internal')),
  recorded_by      uuid        REFERENCES core.profiles(id),
  reversal_of      uuid,
  reversal_reason  text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, due_date)
) PARTITION BY RANGE (due_date);

CREATE TABLE finance.contributions_2025 PARTITION OF finance.contributions
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE finance.contributions_2026 PARTITION OF finance.contributions
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE finance.contributions_2027 PARTITION OF finance.contributions
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE finance.contributions_2028 PARTITION OF finance.contributions
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

CREATE INDEX contrib_group_period_idx ON finance.contributions (group_id, cycle_period);
CREATE INDEX contrib_member_idx       ON finance.contributions (member_id);
CREATE INDEX contrib_status_idx       ON finance.contributions (status);
CREATE INDEX contrib_due_idx          ON finance.contributions (due_date);
CREATE INDEX contrib_pending_due_idx  ON finance.contributions (due_date, group_id)
  WHERE status IN ('pending','partial','late');

CREATE TRIGGER set_finance_contributions_updated_at
  BEFORE UPDATE ON finance.contributions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
