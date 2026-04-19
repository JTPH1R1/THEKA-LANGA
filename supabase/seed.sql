-- ============================================================
-- THEKA LANGA — Development seed data
-- Run: pnpm db:seed
-- WARNING: Never run against production
-- ============================================================

-- Seed a system admin user (password: Admin1234!)
-- The auth user must be created via Supabase Auth first.
-- This seed patches the profile row that handle_new_user creates.

-- After running `supabase start`, create the admin via:
--   supabase auth add-user --email admin@theka.local --password Admin1234!
-- Then this seed will patch the resulting profile.

UPDATE core.profiles
SET
  full_legal_name = 'System Administrator',
  preferred_name  = 'Admin',
  system_role     = 'system_admin',
  kyc_level       = 3,
  credit_score    = 800,
  phone           = '+254700000001',
  phone_verified  = true
WHERE email = 'admin@theka.local';

-- Sample group (created after admin profile exists)
-- Uncomment and adjust UUIDs after running the admin auth setup above.

-- INSERT INTO sacco.groups (id, name, slug, description, type, status, currency, created_by)
-- SELECT
--   'a0000000-0000-0000-0000-000000000001',
--   'Theka Demo Group',
--   'theka-demo',
--   'Demonstration group for development testing',
--   'public',
--   'active',
--   'KES',
--   p.id
-- FROM core.profiles p WHERE p.email = 'admin@theka.local'
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO sacco.group_rules (group_id, contribution_amount, contribution_frequency)
-- VALUES (
--   'a0000000-0000-0000-0000-000000000001',
--   100000,   -- 1,000 KES in cents
--   'monthly'
-- )
-- ON CONFLICT (group_id) DO NOTHING;
