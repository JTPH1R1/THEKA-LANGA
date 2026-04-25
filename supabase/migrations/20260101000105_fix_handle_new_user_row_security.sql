-- core.handle_new_user() runs as SECURITY DEFINER when a new auth user signs up.
-- Without SET row_security = off, RLS is still enforced for the function owner role,
-- which can block the INSERT into core.profiles if no INSERT policy matches.
-- Adding row_security = off guarantees the trigger can always create the profile row.

CREATE OR REPLACE FUNCTION core.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO core.profiles (id, email, full_legal_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_legal_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, public
SET row_security = off;
