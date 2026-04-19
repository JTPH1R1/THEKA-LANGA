CREATE TABLE kyc.addresses (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid        NOT NULL REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  address_type     text        NOT NULL CHECK (address_type IN ('residential','postal','business')),
  line1            text        NOT NULL,
  line2            text,
  city             text        NOT NULL,
  county_province  text,
  postal_code      text,
  country          text        NOT NULL DEFAULT 'KE',
  proof_doc_type   text        CHECK (proof_doc_type IN (
                                 'utility_bill','bank_statement','lease_agreement',
                                 'official_letter','rates_receipt'
                               )),
  proof_image_path text,
  proof_period     text,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','approved','rejected')),
  verified_by      uuid        REFERENCES core.profiles(id),
  verified_at      timestamptz,
  rejection_reason text,
  is_primary       boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_addresses_profile_idx ON kyc.addresses (profile_id);
CREATE UNIQUE INDEX kyc_addresses_primary_idx ON kyc.addresses (profile_id, address_type)
  WHERE is_primary = true;

CREATE TRIGGER set_kyc_addresses_updated_at
  BEFORE UPDATE ON kyc.addresses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
