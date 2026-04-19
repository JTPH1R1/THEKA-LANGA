CREATE TABLE personal.budgets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid        NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
  month           text        NOT NULL,
  category        text        NOT NULL,
  budgeted_amount bigint      NOT NULL CHECK (budgeted_amount >= 0),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, month, category)
);

CREATE INDEX pb_profile_month_idx ON personal.budgets (profile_id, month);

CREATE TRIGGER set_personal_budgets_updated_at
  BEFORE UPDATE ON personal.budgets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
