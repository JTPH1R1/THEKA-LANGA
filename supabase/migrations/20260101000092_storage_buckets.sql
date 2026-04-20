-- ============================================================
-- Storage: create buckets + RLS policies
-- ============================================================

-- Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',  'avatars',  true,  2097152,   ARRAY['image/jpeg','image/png','image/webp']::text[]),
  ('kyc-docs', 'kyc-docs', false, 10485760,  ARRAY['image/jpeg','image/png','image/webp','application/pdf']::text[]),
  ('receipts', 'receipts', false, 5242880,   ARRAY['image/jpeg','image/png','image/webp','application/pdf']::text[]),
  ('reports',  'reports',  false, 20971520,  ARRAY['application/pdf']::text[]),
  ('logos',    'logos',    true,  1048576,   ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']::text[])
ON CONFLICT (id) DO NOTHING;

-- ── avatars (public) ────────────────────────────────────────
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── kyc-docs (private) ──────────────────────────────────────
CREATE POLICY "kyc-docs: owner/admin read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-docs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR core.has_system_role('system_admin')
      OR core.has_system_role('support')
    )
  );

CREATE POLICY "kyc-docs: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "kyc-docs: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'kyc-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── receipts (private — owner + group officers) ─────────────
CREATE POLICY "receipts: owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR core.has_system_role('system_admin')
    )
  );

CREATE POLICY "receipts: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── reports (private) ───────────────────────────────────────
CREATE POLICY "reports: owner read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR core.has_system_role('system_admin')
    )
  );

CREATE POLICY "reports: owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── logos (public) ───────────────────────────────────────────
CREATE POLICY "logos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "logos: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);
