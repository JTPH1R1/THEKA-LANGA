CREATE TABLE core.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text        NOT NULL UNIQUE,
  full_legal_name     text        NOT NULL,
  preferred_name      text,
  phone               text        UNIQUE,
  phone_verified      boolean     NOT NULL DEFAULT false,
  avatar_url          text,
  system_role         text        NOT NULL DEFAULT 'member'
                                  CHECK (system_role IN ('member','system_admin','support')),
  kyc_level           smallint    NOT NULL DEFAULT 0
                                  CHECK (kyc_level IN (0,1,2,3)),
  credit_score        smallint    NOT NULL DEFAULT 500
                                  CHECK (credit_score BETWEEN 300 AND 850),
  credit_score_band   text        GENERATED ALWAYS AS (
                                    CASE
                                      WHEN credit_score >= 750 THEN 'excellent'
                                      WHEN credit_score >= 600 THEN 'good'
                                      WHEN credit_score >= 500 THEN 'fair'
                                      WHEN credit_score >= 400 THEN 'poor'
                                      ELSE 'high_risk'
                                    END
                                  ) STORED,
  is_blacklisted      boolean     NOT NULL DEFAULT false,
  blacklisted_at      timestamptz,
  blacklisted_reason  text,
  is_active           boolean     NOT NULL DEFAULT true,
  last_seen_at        timestamptz,
  timezone            text        NOT NULL DEFAULT 'Africa/Nairobi',
  locale              text        NOT NULL DEFAULT 'en-KE',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX profiles_email_idx     ON core.profiles (email);
CREATE UNIQUE INDEX profiles_phone_idx     ON core.profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX        profiles_kyc_level_idx ON core.profiles (kyc_level);
CREATE INDEX        profiles_blacklist_idx ON core.profiles (is_blacklisted) WHERE is_blacklisted = true;
CREATE INDEX        profiles_score_idx     ON core.profiles (credit_score);
CREATE INDEX        profiles_role_idx      ON core.profiles (system_role);

CREATE TRIGGER set_core_profiles_updated_at
  BEFORE UPDATE ON core.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO core.profiles (id, email, full_legal_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_legal_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION core.handle_new_user();
