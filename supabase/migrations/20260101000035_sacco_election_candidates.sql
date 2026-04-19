CREATE TABLE sacco.election_candidates (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  uuid        NOT NULL REFERENCES sacco.elections(id) ON DELETE CASCADE,
  candidate_id uuid        NOT NULL REFERENCES core.profiles(id),
  nominated_by uuid        NOT NULL REFERENCES core.profiles(id),
  accepted     boolean,
  accepted_at  timestamptz,
  manifesto    text,
  withdrew     boolean     NOT NULL DEFAULT false,
  withdrew_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, candidate_id)
);

CREATE INDEX ec_election_idx  ON sacco.election_candidates (election_id);
CREATE INDEX ec_candidate_idx ON sacco.election_candidates (candidate_id);
