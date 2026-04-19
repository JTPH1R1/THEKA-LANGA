CREATE TABLE kyc.financial_declarations (
  id                            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                    uuid        NOT NULL UNIQUE REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  employment_status             text        NOT NULL CHECK (employment_status IN (
                                              'employed_full_time','employed_part_time','self_employed',
                                              'business_owner','unemployed','student','retired','other'
                                            )),
  employer_name                 text,
  job_title                     text,
  industry                      text,
  monthly_income_band           text        NOT NULL CHECK (monthly_income_band IN (
                                              'below_10k','10k_25k','25k_50k',
                                              '50k_100k','100k_250k','above_250k'
                                            )),
  source_of_funds               text[]      NOT NULL,
  source_of_funds_detail        text,
  annual_contribution_estimate  bigint,
  is_pep                        boolean     NOT NULL DEFAULT false,
  pep_details                   text,
  us_person                     boolean     NOT NULL DEFAULT false,
  tax_country                   text        NOT NULL DEFAULT 'KE',
  tax_id_number                 text,
  declaration_accepted          boolean     NOT NULL DEFAULT false,
  declaration_accepted_at       timestamptz,
  declaration_ip                inet,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_fin_profile_idx    ON kyc.financial_declarations (profile_id);
CREATE INDEX kyc_fin_employment_idx ON kyc.financial_declarations (employment_status);

CREATE TRIGGER set_kyc_financial_declarations_updated_at
  BEFORE UPDATE ON kyc.financial_declarations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
