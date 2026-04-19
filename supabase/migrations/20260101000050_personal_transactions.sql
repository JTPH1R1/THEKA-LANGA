CREATE TABLE personal.transactions (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  profile_id      uuid        NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
  type            text        NOT NULL CHECK (type IN ('income','expense','transfer')),
  category        text        NOT NULL,
  subcategory     text,
  amount          bigint      NOT NULL CHECK (amount > 0),
  description     text,
  date            date        NOT NULL,
  tags            text[],
  receipt_path    text,
  payment_method  text        CHECK (payment_method IN ('cash','mobile_money','bank','card','other')),
  is_recurring    boolean     NOT NULL DEFAULT false,
  recurrence_rule text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

CREATE TABLE personal.transactions_2025 PARTITION OF personal.transactions
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE personal.transactions_2026 PARTITION OF personal.transactions
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE personal.transactions_2027 PARTITION OF personal.transactions
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE personal.transactions_2028 PARTITION OF personal.transactions
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

CREATE INDEX pt_profile_date_idx ON personal.transactions (profile_id, date DESC);
CREATE INDEX pt_category_idx     ON personal.transactions (profile_id, category);
CREATE INDEX pt_type_idx         ON personal.transactions (profile_id, type);
CREATE INDEX pt_tags_idx         ON personal.transactions USING GIN (tags);

CREATE TRIGGER set_personal_transactions_updated_at
  BEFORE UPDATE ON personal.transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
