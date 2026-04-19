CREATE TABLE kyc.selfies (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid        NOT NULL REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  image_path       text        NOT NULL,
  liveness_passed  boolean,
  liveness_score   numeric(5,2),
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','approved','rejected')),
  verified_by      uuid        REFERENCES core.profiles(id),
  verified_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_selfies_profile_idx ON kyc.selfies (profile_id);
CREATE INDEX kyc_selfies_status_idx  ON kyc.selfies (status);

CREATE TRIGGER set_kyc_selfies_updated_at
  BEFORE UPDATE ON kyc.selfies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
