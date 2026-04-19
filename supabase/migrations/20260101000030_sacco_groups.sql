CREATE TABLE sacco.groups (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text  NOT NULL,
  slug        text  NOT NULL UNIQUE,
  description text,
  type        text  NOT NULL CHECK (type IN ('public','private')),
  status      text  NOT NULL DEFAULT 'forming'
                    CHECK (status IN ('forming','active','frozen','closed')),
  currency    text  NOT NULL DEFAULT 'KES',
  timezone    text  NOT NULL DEFAULT 'Africa/Nairobi',
  cycle_start date,
  cycle_end   date,
  logo_url    text,
  created_by  uuid  NOT NULL REFERENCES core.profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_cycle CHECK (cycle_end IS NULL OR cycle_end > cycle_start)
);

CREATE UNIQUE INDEX groups_slug_idx        ON sacco.groups (slug);
CREATE INDEX        groups_type_idx        ON sacco.groups (type);
CREATE INDEX        groups_status_idx      ON sacco.groups (status);
CREATE INDEX        groups_creator_idx     ON sacco.groups (created_by);
CREATE INDEX        groups_public_active_idx ON sacco.groups (created_at DESC)
  WHERE type = 'public' AND status = 'active';

CREATE TRIGGER set_sacco_groups_updated_at
  BEFORE UPDATE ON sacco.groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
