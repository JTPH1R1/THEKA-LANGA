CREATE TABLE personal.shopping_lists (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid        NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  planned_date    date,
  is_complete     boolean     NOT NULL DEFAULT false,
  completed_at    timestamptz,
  total_estimated bigint      DEFAULT 0,
  total_actual    bigint      DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE personal.shopping_items (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         uuid          NOT NULL REFERENCES personal.shopping_lists(id) ON DELETE CASCADE,
  name            text          NOT NULL,
  quantity        numeric(10,3) NOT NULL DEFAULT 1,
  unit            text,
  estimated_price bigint,
  actual_price    bigint,
  category        text,
  is_checked      boolean       NOT NULL DEFAULT false,
  checked_at      timestamptz,
  sort_order      smallint      NOT NULL DEFAULT 0,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX psl_profile_idx ON personal.shopping_lists (profile_id);
CREATE INDEX psi_list_idx    ON personal.shopping_items (list_id, sort_order);

CREATE TRIGGER set_personal_shopping_lists_updated_at
  BEFORE UPDATE ON personal.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
