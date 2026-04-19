CREATE TABLE system.errors (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text        NOT NULL CHECK (source IN ('edge_function','trigger','rpc','client')),
  error_code  text,
  message     text        NOT NULL,
  stack       text,
  context     jsonb,
  profile_id  uuid        REFERENCES core.profiles(id),
  resolved    boolean     NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid        REFERENCES core.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX errors_source_idx     ON system.errors (source, created_at DESC);
CREATE INDEX errors_profile_idx    ON system.errors (profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX errors_unresolved_idx ON system.errors (created_at DESC) WHERE resolved = false;
