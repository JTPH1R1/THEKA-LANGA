CREATE TABLE core.system_config (
  key         text  PRIMARY KEY,
  value       jsonb NOT NULL,
  description text,
  updated_by  uuid  REFERENCES core.profiles(id),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_core_system_config_updated_at
  BEFORE UPDATE ON core.system_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
