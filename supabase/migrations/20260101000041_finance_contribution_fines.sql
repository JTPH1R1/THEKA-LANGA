CREATE TABLE finance.contribution_fines (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id uuid        NOT NULL,
  group_id        uuid        NOT NULL REFERENCES sacco.groups(id),
  member_id       uuid        NOT NULL REFERENCES core.profiles(id),
  fine_type       text        NOT NULL CHECK (fine_type IN ('flat','daily_interest','penalty')),
  amount          bigint      NOT NULL,
  days_late       smallint,
  applied_at      timestamptz NOT NULL DEFAULT now(),
  applied_by      uuid        REFERENCES core.profiles(id),
  waived          boolean     NOT NULL DEFAULT false,
  waived_by       uuid        REFERENCES core.profiles(id),
  waived_at       timestamptz,
  waiver_reason   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cf_contribution_idx ON finance.contribution_fines (contribution_id);
CREATE INDEX cf_member_idx       ON finance.contribution_fines (member_id);
CREATE INDEX cf_group_idx        ON finance.contribution_fines (group_id);
