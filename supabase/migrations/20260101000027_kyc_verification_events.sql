-- INSERT-only table — no updated_at column, no UPDATE trigger
CREATE TABLE kyc.verification_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid        NOT NULL REFERENCES kyc.profiles(profile_id),
  event_type      text        NOT NULL CHECK (event_type IN (
                                'kyc_started','document_submitted','document_approved',
                                'document_rejected','selfie_submitted','selfie_approved',
                                'address_verified','financial_declaration_submitted',
                                'level_upgraded','level_downgraded',
                                'pep_flagged','sanctions_checked','blacklisted',
                                'blacklist_lifted','manual_review_requested',
                                'note_added','status_changed'
                              )),
  triggered_by    uuid        REFERENCES core.profiles(id),
  reference_table text,
  reference_id    uuid,
  old_value       jsonb,
  new_value       jsonb,
  notes           text,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_events_profile_idx ON kyc.verification_events (profile_id);
CREATE INDEX kyc_events_type_idx    ON kyc.verification_events (event_type);
CREATE INDEX kyc_events_time_idx    ON kyc.verification_events (created_at DESC);
CREATE INDEX kyc_events_actor_idx   ON kyc.verification_events (triggered_by) WHERE triggered_by IS NOT NULL;
