CREATE TABLE kyc.payment_accounts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       uuid        NOT NULL REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  account_type     text        NOT NULL CHECK (account_type IN (
                                 'mobile_money','bank_account','sacco_internal'
                               )),
  mobile_provider  text        CHECK (mobile_provider IN ('mpesa','airtel_money','tkash','equitel','other')),
  mobile_number    text,
  bank_name        text,
  bank_branch      text,
  bank_code        text,
  account_number   text,
  account_name     text,
  swift_code       text,
  iban             text,
  is_verified      boolean     NOT NULL DEFAULT false,
  verified_method  text        CHECK (verified_method IN ('micro_deposit','statement','manual_review')),
  verified_at      timestamptz,
  verified_by      uuid        REFERENCES core.profiles(id),
  is_primary       boolean     NOT NULL DEFAULT false,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_accounts_profile_idx ON kyc.payment_accounts (profile_id);
CREATE INDEX kyc_accounts_mobile_idx  ON kyc.payment_accounts (mobile_number) WHERE mobile_number IS NOT NULL;
CREATE UNIQUE INDEX kyc_accounts_primary_idx ON kyc.payment_accounts (profile_id)
  WHERE is_primary = true AND is_active = true;

CREATE TRIGGER set_kyc_payment_accounts_updated_at
  BEFORE UPDATE ON kyc.payment_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
