CREATE TABLE kyc.phone_verifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid        NOT NULL REFERENCES kyc.profiles(profile_id),
  phone        text        NOT NULL,
  otp_hash     text        NOT NULL,
  attempts     smallint    NOT NULL DEFAULT 0,
  max_attempts smallint    NOT NULL DEFAULT 3,
  verified     boolean     NOT NULL DEFAULT false,
  verified_at  timestamptz,
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_phone_profile_idx ON kyc.phone_verifications (profile_id);
CREATE INDEX kyc_phone_expires_idx ON kyc.phone_verifications (expires_at);
