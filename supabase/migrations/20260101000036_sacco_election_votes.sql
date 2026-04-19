CREATE TABLE sacco.election_votes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  uuid        NOT NULL REFERENCES sacco.elections(id) ON DELETE CASCADE,
  voter_id     uuid        NOT NULL REFERENCES core.profiles(id),
  candidate_id uuid        NOT NULL REFERENCES sacco.election_candidates(id),
  voted_at     timestamptz NOT NULL DEFAULT now(),
  ip_address   inet,
  UNIQUE (election_id, voter_id)
);

-- No index on voter_id — prevents reconstructing who voted for whom.
-- Only aggregate counts are ever queried.
CREATE INDEX ev_election_idx  ON sacco.election_votes (election_id);
CREATE INDEX ev_candidate_idx ON sacco.election_votes (candidate_id);
