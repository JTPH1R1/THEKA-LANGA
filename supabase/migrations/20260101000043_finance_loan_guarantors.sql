CREATE TABLE finance.loan_guarantors (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id                    uuid        NOT NULL,
  guarantor_id               uuid        NOT NULL REFERENCES core.profiles(id),
  status                     text        NOT NULL DEFAULT 'pending'
                                         CHECK (status IN ('pending','accepted','declined')),
  responded_at               timestamptz,
  credit_score_at_guarantee  smallint,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  UNIQUE (loan_id, guarantor_id)
);

CREATE INDEX lg_loan_idx      ON finance.loan_guarantors (loan_id);
CREATE INDEX lg_guarantor_idx ON finance.loan_guarantors (guarantor_id);
