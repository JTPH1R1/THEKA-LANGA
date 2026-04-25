-- Backfill core.profiles rows for any auth users that don't have one yet.
-- This covers cases where the handle_new_user trigger may have failed silently
-- before the row_security fix was applied (migration 105).

INSERT INTO core.profiles (id, email, full_legal_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_legal_name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM core.profiles p WHERE p.id = u.id
);
