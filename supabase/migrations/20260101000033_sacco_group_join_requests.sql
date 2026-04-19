CREATE TABLE sacco.group_join_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid        NOT NULL REFERENCES sacco.groups(id) ON DELETE CASCADE,
  requester_id uuid        NOT NULL REFERENCES core.profiles(id),
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','approved','denied','withdrawn')),
  message      text,
  reviewed_by  uuid        REFERENCES core.profiles(id),
  reviewed_at  timestamptz,
  denial_reason text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, requester_id)
);

CREATE INDEX gjr_group_idx     ON sacco.group_join_requests (group_id, status);
CREATE INDEX gjr_requester_idx ON sacco.group_join_requests (requester_id);

CREATE TRIGGER set_sacco_group_join_requests_updated_at
  BEFORE UPDATE ON sacco.group_join_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
