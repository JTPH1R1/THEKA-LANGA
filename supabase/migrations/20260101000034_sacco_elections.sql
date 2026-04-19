CREATE TABLE sacco.elections (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id             uuid        NOT NULL REFERENCES sacco.groups(id) ON DELETE CASCADE,
  position             text        NOT NULL CHECK (position IN ('chair','treasurer','secretary')),
  status               text        NOT NULL DEFAULT 'nominations_open'
                                   CHECK (status IN ('nominations_open','voting_open','closed','cancelled')),
  nominations_open_at  timestamptz NOT NULL DEFAULT now(),
  nominations_close_at timestamptz NOT NULL,
  voting_open_at       timestamptz,
  voting_close_at      timestamptz,
  winner_id            uuid        REFERENCES core.profiles(id),
  opened_by            uuid        NOT NULL REFERENCES core.profiles(id),
  closed_by            uuid        REFERENCES core.profiles(id),
  tie_broken_by        uuid        REFERENCES core.profiles(id),
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX elections_group_idx  ON sacco.elections (group_id);
CREATE INDEX elections_status_idx ON sacco.elections (group_id, status);

CREATE TRIGGER set_sacco_elections_updated_at
  BEFORE UPDATE ON sacco.elections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
