-- ============================================================
-- RLS: kyc schema — strictest policies in the system
-- Group officers NEVER see raw KYC data. Only profile owner +
-- system_admin/support can access kyc.* tables.
-- ============================================================

ALTER TABLE kyc.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.identity_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.selfies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.next_of_kin          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.financial_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.payment_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.verification_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc.phone_verifications  ENABLE ROW LEVEL SECURITY;

-- Reusable helper: is the current user a KYC reviewer?
CREATE OR REPLACE FUNCTION kyc.is_reviewer()
RETURNS boolean AS $$
  SELECT core.has_system_role('system_admin') OR core.has_system_role('support');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- kyc.profiles
CREATE POLICY "kyc_profiles: owner"
  ON kyc.profiles FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_profiles: reviewer read"
  ON kyc.profiles FOR SELECT
  USING (kyc.is_reviewer());

CREATE POLICY "kyc_profiles: reviewer update"
  ON kyc.profiles FOR UPDATE
  USING (kyc.is_reviewer());

-- kyc.identity_documents
CREATE POLICY "kyc_docs: owner"
  ON kyc.identity_documents FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_docs: reviewer"
  ON kyc.identity_documents FOR ALL
  USING (kyc.is_reviewer());

-- kyc.selfies
CREATE POLICY "kyc_selfies: owner"
  ON kyc.selfies FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_selfies: reviewer"
  ON kyc.selfies FOR ALL
  USING (kyc.is_reviewer());

-- kyc.addresses
CREATE POLICY "kyc_addresses: owner"
  ON kyc.addresses FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_addresses: reviewer"
  ON kyc.addresses FOR ALL
  USING (kyc.is_reviewer());

-- kyc.next_of_kin
CREATE POLICY "kyc_nok: owner"
  ON kyc.next_of_kin FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_nok: reviewer"
  ON kyc.next_of_kin FOR ALL
  USING (kyc.is_reviewer());

-- kyc.financial_declarations
CREATE POLICY "kyc_fin: owner"
  ON kyc.financial_declarations FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_fin: reviewer"
  ON kyc.financial_declarations FOR ALL
  USING (kyc.is_reviewer());

-- kyc.payment_accounts
CREATE POLICY "kyc_accounts: owner"
  ON kyc.payment_accounts FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "kyc_accounts: reviewer"
  ON kyc.payment_accounts FOR ALL
  USING (kyc.is_reviewer());

-- kyc.verification_events (INSERT-only for users, full read for reviewers)
CREATE POLICY "kyc_events: owner read"
  ON kyc.verification_events FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "kyc_events: reviewer"
  ON kyc.verification_events FOR ALL
  USING (kyc.is_reviewer());

-- kyc.phone_verifications (owner only)
CREATE POLICY "kyc_phone: owner"
  ON kyc.phone_verifications FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON kyc.profiles             TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.identity_documents   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.selfies              TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.addresses            TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.next_of_kin          TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.financial_declarations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kyc.payment_accounts     TO authenticated;
GRANT SELECT, INSERT         ON kyc.verification_events  TO authenticated;
GRANT SELECT, INSERT         ON kyc.phone_verifications  TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA kyc TO service_role;
