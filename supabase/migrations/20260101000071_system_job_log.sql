CREATE TABLE system.job_log (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name           text        NOT NULL,
  status             text        NOT NULL CHECK (status IN ('started','completed','failed','partial')),
  started_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz,
  duration_ms        integer,
  records_processed  integer     DEFAULT 0,
  error_message      text,
  error_detail       jsonb,
  metadata           jsonb
);

CREATE INDEX job_log_name_idx   ON system.job_log (job_name, started_at DESC);
CREATE INDEX job_log_status_idx ON system.job_log (status) WHERE status IN ('failed','partial');
