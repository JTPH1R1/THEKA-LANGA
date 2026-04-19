CREATE TABLE sacco.group_members (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id                 uuid        NOT NULL REFERENCES sacco.groups(id) ON DELETE CASCADE,
  profile_id               uuid        NOT NULL REFERENCES core.profiles(id),
  role                     text        NOT NULL DEFAULT 'member'
                                       CHECK (role IN ('chair','treasurer','secretary','member')),
  status                   text        NOT NULL DEFAULT 'pending'
                                       CHECK (status IN ('invited','pending','active','suspended','exited')),
  invited_by               uuid        REFERENCES core.profiles(id),
  joined_at                timestamptz,
  exited_at                timestamptz,
  exit_reason              text,
  mid_join                 boolean     NOT NULL DEFAULT false,
  mid_join_week            smallint,
  mid_join_catchup_amount  bigint,
  mid_join_catchup_paid    boolean     NOT NULL DEFAULT false,
  credit_score_at_join     smallint,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, profile_id)
);

CREATE INDEX gm_group_idx    ON sacco.group_members (group_id);
CREATE INDEX gm_profile_idx  ON sacco.group_members (profile_id);
CREATE INDEX gm_status_idx   ON sacco.group_members (group_id, status);
CREATE INDEX gm_role_idx     ON sacco.group_members (group_id, role);
CREATE INDEX gm_officers_idx ON sacco.group_members (group_id, profile_id, role)
  WHERE status = 'active' AND role IN ('chair','treasurer','secretary');

CREATE TRIGGER set_sacco_group_members_updated_at
  BEFORE UPDATE ON sacco.group_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
