-- Enforces that audit.events can never be updated or deleted — not even by service_role.
CREATE OR REPLACE FUNCTION audit.prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit.events is immutable — no UPDATE or DELETE permitted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_modify_audit_events
  BEFORE UPDATE OR DELETE ON audit.events
  FOR EACH ROW EXECUTE FUNCTION audit.prevent_modification();

CREATE TRIGGER no_modify_audit_credit_score_history
  BEFORE UPDATE OR DELETE ON audit.credit_score_history
  FOR EACH ROW EXECUTE FUNCTION audit.prevent_modification();
