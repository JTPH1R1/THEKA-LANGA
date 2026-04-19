-- Create all application schemas. Auth schema is managed by Supabase.
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS kyc;
CREATE SCHEMA IF NOT EXISTS sacco;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS personal;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS system;

-- Grant usage so PostgREST can expose them
GRANT USAGE ON SCHEMA core     TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA kyc      TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA sacco    TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA finance  TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA personal TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA audit    TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA system   TO anon, authenticated, service_role;
