-- Dedicated table for credit score changes — queried often for member score timelines.
CREATE TABLE audit.credit_score_history (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid        NOT NULL REFERENCES core.profiles(id),
  score_before smallint    NOT NULL,
  score_after  smallint    NOT NULL,
  delta        smallint    GENERATED ALWAYS AS (score_after - score_before) STORED,
  event_type   text        NOT NULL,
  reference_id uuid,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX csh_profile_idx ON audit.credit_score_history (profile_id, calculated_at DESC);
CREATE INDEX csh_event_idx   ON audit.credit_score_history (event_type);
