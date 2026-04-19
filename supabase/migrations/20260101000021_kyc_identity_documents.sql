CREATE TABLE kyc.identity_documents (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid        NOT NULL REFERENCES kyc.profiles(profile_id) ON DELETE CASCADE,
  doc_type            text        NOT NULL CHECK (doc_type IN (
                                    'national_id','passport','drivers_license',
                                    'alien_card','military_id','voters_card'
                                  )),
  doc_number          text        NOT NULL,
  doc_number_hash     text        NOT NULL,
  issuing_country     text        NOT NULL,
  issuing_authority   text,
  issue_date          date,
  expiry_date         date,
  doc_full_name       text        NOT NULL,
  doc_date_of_birth   date,
  front_image_path    text        NOT NULL,
  back_image_path     text,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','approved','rejected','expired','superseded')),
  verified_by         uuid        REFERENCES core.profiles(id),
  verified_at         timestamptz,
  rejection_reason    text,
  selfie_match_score  numeric(5,2),
  selfie_match_passed boolean,
  is_primary          boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_primary_per_profile UNIQUE NULLS NOT DISTINCT (profile_id, is_primary)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX kyc_doc_number_hash_type_idx ON kyc.identity_documents (doc_number_hash, doc_type);
CREATE INDEX kyc_doc_profile_idx   ON kyc.identity_documents (profile_id);
CREATE INDEX kyc_doc_status_idx    ON kyc.identity_documents (status);
CREATE INDEX kyc_doc_expiry_idx    ON kyc.identity_documents (expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX kyc_doc_type_idx      ON kyc.identity_documents (doc_type);

CREATE TRIGGER set_kyc_identity_documents_updated_at
  BEFORE UPDATE ON kyc.identity_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
