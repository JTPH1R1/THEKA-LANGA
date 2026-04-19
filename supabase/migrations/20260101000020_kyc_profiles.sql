CREATE TABLE kyc.profiles (
  profile_id              uuid        PRIMARY KEY REFERENCES core.profiles(id) ON DELETE CASCADE,
  full_legal_name         text        NOT NULL,
  first_name              text        NOT NULL,
  middle_name             text,
  last_name               text        NOT NULL,
  date_of_birth           date        NOT NULL,
  gender                  text        NOT NULL CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  nationality             text        NOT NULL,
  country_of_birth        text,
  primary_phone           text        NOT NULL,
  secondary_phone         text,
  verification_status     text        NOT NULL DEFAULT 'unverified'
                                      CHECK (verification_status IN (
                                        'unverified','pending_review','verified',
                                        'requires_resubmission','rejected','suspended'
                                      )),
  kyc_level               smallint    NOT NULL DEFAULT 0 CHECK (kyc_level IN (0,1,2,3)),
  level1_completed_at     timestamptz,
  level2_completed_at     timestamptz,
  level2_verified_by      uuid        REFERENCES core.profiles(id),
  level3_completed_at     timestamptz,
  level3_verified_by      uuid        REFERENCES core.profiles(id),
  risk_rating             text        NOT NULL DEFAULT 'unknown'
                                      CHECK (risk_rating IN ('low','medium','high','unknown')),
  pep_status              boolean     NOT NULL DEFAULT false,
  sanctions_checked       boolean     NOT NULL DEFAULT false,
  sanctions_cleared       boolean,
  sanctions_checked_at    timestamptz,
  internal_notes          text,
  submitted_at            timestamptz,
  reviewed_at             timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_profiles_status_idx ON kyc.profiles (verification_status);
CREATE INDEX kyc_profiles_level_idx  ON kyc.profiles (kyc_level);
CREATE INDEX kyc_profiles_risk_idx   ON kyc.profiles (risk_rating);
CREATE INDEX kyc_profiles_pep_idx    ON kyc.profiles (pep_status) WHERE pep_status = true;

CREATE TRIGGER set_kyc_profiles_updated_at
  BEFORE UPDATE ON kyc.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
