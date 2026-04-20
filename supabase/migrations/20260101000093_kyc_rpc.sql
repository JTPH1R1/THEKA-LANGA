-- ============================================================
-- KYC RPC functions — run as SECURITY DEFINER to bypass RLS
-- on kyc_level and verification_status updates
-- ============================================================

-- Complete KYC Level 1
-- Requirements: email verified + phone set in profile
-- Upserts kyc.profiles and upgrades core.profiles.kyc_level to 1
CREATE OR REPLACE FUNCTION kyc.complete_level1(
  p_date_of_birth   date,
  p_gender          text,
  p_nationality     text
)
RETURNS void AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_profile core.profiles%ROWTYPE;
  v_fname   text;
  v_lname   text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile FROM core.profiles WHERE id = v_uid;

  IF v_profile.phone IS NULL THEN
    RAISE EXCEPTION 'Phone number must be set before completing Level 1';
  END IF;

  -- Parse first/last name from full_legal_name
  v_fname := split_part(v_profile.full_legal_name, ' ', 1);
  v_lname := CASE
    WHEN array_length(string_to_array(trim(v_profile.full_legal_name), ' '), 1) > 1
    THEN trim(split_part(v_profile.full_legal_name, ' ', array_length(string_to_array(trim(v_profile.full_legal_name), ' '), 1)))
    ELSE v_fname
  END;

  INSERT INTO kyc.profiles (
    profile_id,
    full_legal_name,
    first_name,
    last_name,
    date_of_birth,
    gender,
    nationality,
    primary_phone,
    kyc_level,
    verification_status,
    level1_completed_at,
    submitted_at
  )
  VALUES (
    v_uid,
    v_profile.full_legal_name,
    v_fname,
    v_lname,
    p_date_of_birth,
    p_gender,
    p_nationality,
    v_profile.phone,
    1,
    'verified',
    now(),
    now()
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    date_of_birth       = p_date_of_birth,
    gender              = p_gender,
    nationality         = p_nationality,
    kyc_level           = GREATEST(kyc.profiles.kyc_level, 1),
    verification_status = CASE
      WHEN kyc.profiles.kyc_level >= 1 THEN kyc.profiles.verification_status
      ELSE 'verified'
    END,
    level1_completed_at = COALESCE(kyc.profiles.level1_completed_at, now());

  -- Upgrade core.profiles.kyc_level (bypasses user RLS — SECURITY DEFINER)
  UPDATE core.profiles
  SET kyc_level = GREATEST(kyc_level, 1)
  WHERE id = v_uid;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION kyc.complete_level1(date, text, text) TO authenticated;


-- Submit Level 2 documents — sets status to pending_review
-- Called after client uploads ID + selfie to storage
CREATE OR REPLACE FUNCTION kyc.submit_level2(
  p_doc_id          uuid,
  p_selfie_id       uuid
)
RETURNS void AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure kyc.profiles exists and is at least Level 1
  IF NOT EXISTS (
    SELECT 1 FROM kyc.profiles WHERE profile_id = v_uid AND kyc_level >= 1
  ) THEN
    RAISE EXCEPTION 'Complete Level 1 before submitting Level 2 documents';
  END IF;

  UPDATE kyc.profiles
  SET
    verification_status = 'pending_review',
    submitted_at        = now()
  WHERE profile_id = v_uid
    AND kyc_level < 2;

  -- Log verification event
  INSERT INTO kyc.verification_events (
    profile_id, event_type, triggered_by, reference_table, reference_id
  ) VALUES (
    v_uid, 'document_submitted', v_uid, 'kyc.identity_documents', p_doc_id
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION kyc.submit_level2(uuid, uuid) TO authenticated;


-- Submit Level 3 documents — sets status to pending_review for L3
CREATE OR REPLACE FUNCTION kyc.submit_level3(
  p_address_id uuid
)
RETURNS void AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM kyc.profiles WHERE profile_id = v_uid AND kyc_level >= 2
  ) THEN
    RAISE EXCEPTION 'Level 2 must be approved before submitting Level 3';
  END IF;

  UPDATE kyc.profiles
  SET
    verification_status = 'pending_review',
    submitted_at        = now()
  WHERE profile_id = v_uid
    AND kyc_level < 3;

  INSERT INTO kyc.verification_events (
    profile_id, event_type, triggered_by, reference_table, reference_id
  ) VALUES (
    v_uid, 'document_submitted', v_uid, 'kyc.addresses', p_address_id
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION kyc.submit_level3(uuid) TO authenticated;
