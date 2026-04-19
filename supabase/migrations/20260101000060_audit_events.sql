-- The immutable financial event ledger. No UPDATE or DELETE is ever permitted.
CREATE TABLE audit.events (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  schema_name text        NOT NULL,
  table_name  text        NOT NULL,
  record_id   uuid        NOT NULL,
  action      text        NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by  uuid        REFERENCES core.profiles(id),
  changed_at  timestamptz NOT NULL DEFAULT now(),
  old_data    jsonb,
  new_data    jsonb,
  diff        jsonb,
  ip_address  inet,
  user_agent  text,
  session_id  text,
  request_id  text,
  PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);

CREATE TABLE audit.events_2025 PARTITION OF audit.events
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE audit.events_2026 PARTITION OF audit.events
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE audit.events_2027 PARTITION OF audit.events
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE audit.events_2028 PARTITION OF audit.events
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

-- BRIN is very cheap on append-only time-series data
CREATE INDEX audit_events_time_brin  ON audit.events USING BRIN (changed_at);
CREATE INDEX audit_events_table_idx  ON audit.events (table_name, changed_at DESC);
CREATE INDEX audit_events_record_idx ON audit.events (record_id);
CREATE INDEX audit_events_actor_idx  ON audit.events (changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX audit_events_action_idx ON audit.events (action);
