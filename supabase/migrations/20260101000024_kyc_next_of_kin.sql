CREATE TABLE kyc.next_of_kin (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid        NOT NULL REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  full_name        text        NOT NULL,
  relationship     text        NOT NULL CHECK (relationship IN (
                                 'spouse','parent','sibling','child','friend',
                                 'colleague','guardian','other'
                               )),
  phone            text        NOT NULL,
  email            text,
  id_number        text,
  physical_address text,
  is_primary       boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_nok_profile_idx ON kyc.next_of_kin (profile_id);

CREATE TRIGGER set_kyc_next_of_kin_updated_at
  BEFORE UPDATE ON kyc.next_of_kin
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
