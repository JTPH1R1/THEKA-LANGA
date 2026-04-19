CREATE TABLE system.notifications (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  recipient_id uuid        NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
  group_id     uuid        REFERENCES sacco.groups(id) ON DELETE CASCADE,
  type         text        NOT NULL,
  priority     text        NOT NULL DEFAULT 'normal'
                           CHECK (priority IN ('low','normal','high','urgent')),
  title        text        NOT NULL,
  body         text        NOT NULL,
  action_url   text,
  data         jsonb,
  read         boolean     NOT NULL DEFAULT false,
  read_at      timestamptz,
  sent_at      timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE system.notifications_2025 PARTITION OF system.notifications
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE system.notifications_2026 PARTITION OF system.notifications
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE system.notifications_2027 PARTITION OF system.notifications
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE system.notifications_2028 PARTITION OF system.notifications
  FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');

CREATE INDEX notif_recipient_unread_idx ON system.notifications (recipient_id, created_at DESC)
  WHERE read = false;
CREATE INDEX notif_group_idx            ON system.notifications (group_id) WHERE group_id IS NOT NULL;
CREATE INDEX notif_expires_idx          ON system.notifications (expires_at) WHERE expires_at IS NOT NULL;
