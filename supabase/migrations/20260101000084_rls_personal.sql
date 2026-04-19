-- ============================================================
-- RLS: personal schema — strictly owner-only
-- ============================================================

ALTER TABLE personal.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal.budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal.shopping_items ENABLE ROW LEVEL SECURITY;

-- personal.transactions
CREATE POLICY "personal_tx: owner only"
  ON personal.transactions FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- personal.budgets
CREATE POLICY "personal_budgets: owner only"
  ON personal.budgets FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- personal.shopping_lists
CREATE POLICY "shopping_lists: owner only"
  ON personal.shopping_lists FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- personal.shopping_items — access via list ownership
CREATE POLICY "shopping_items: owner only"
  ON personal.shopping_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM personal.shopping_lists sl
      WHERE sl.id = list_id AND sl.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM personal.shopping_lists sl
      WHERE sl.id = list_id AND sl.profile_id = auth.uid()
    )
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON personal.transactions   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON personal.budgets        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON personal.shopping_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON personal.shopping_items TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA personal TO service_role;
