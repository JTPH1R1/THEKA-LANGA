-- ============================================================
-- Materialized views for dashboard KPI performance.
-- Never aggregate on the fly — always query these views.
-- Refreshed every 15 minutes by the refresh-views Edge Function
-- and on-demand after significant write operations.
-- ============================================================

-- Group financial summary
CREATE MATERIALIZED VIEW sacco.group_summaries AS
SELECT
  g.id                                                                              AS group_id,
  g.name,
  g.status,
  g.currency,
  COUNT(DISTINCT gm.profile_id) FILTER (WHERE gm.status = 'active')                AS active_members,
  COALESCE(SUM(c.paid_amount) FILTER (WHERE c.status IN ('paid','late')), 0)        AS total_contributions,
  COALESCE(SUM(l.principal)   FILTER (WHERE l.status IN ('disbursed','repaying')), 0) AS active_loan_book,
  COALESCE(SUM(l.outstanding) FILTER (WHERE l.status IN ('disbursed','repaying')), 0) AS outstanding_loans,
  COUNT(l.id) FILTER (WHERE l.status = 'defaulted')                                 AS total_defaults,
  g.cycle_start,
  g.cycle_end,
  now() AS refreshed_at
FROM sacco.groups g
LEFT JOIN sacco.group_members   gm ON gm.group_id = g.id
LEFT JOIN finance.contributions  c ON c.group_id  = g.id
LEFT JOIN finance.loans          l ON l.group_id  = g.id
GROUP BY g.id;

CREATE UNIQUE INDEX gsummary_group_idx ON sacco.group_summaries (group_id);

-- Member portfolio summary (per person per group)
CREATE MATERIALIZED VIEW sacco.member_portfolios AS
SELECT
  gm.group_id,
  gm.profile_id,
  gm.role,
  gm.status,
  gm.joined_at,
  COALESCE(SUM(c.paid_amount), 0)                                                       AS total_contributed,
  COUNT(c.id) FILTER (WHERE c.status = 'paid')                                          AS on_time_payments,
  COUNT(c.id) FILTER (WHERE c.status = 'late')                                          AS late_payments,
  COUNT(c.id) FILTER (WHERE c.status = 'defaulted')                                     AS defaulted_payments,
  COUNT(l.id) FILTER (WHERE l.status IN ('disbursed','repaying'))                       AS active_loans,
  COALESCE(SUM(l.outstanding) FILTER (WHERE l.status IN ('disbursed','repaying')), 0)  AS loan_outstanding,
  COUNT(l.id) FILTER (WHERE l.status = 'completed')                                    AS loans_repaid,
  COUNT(l.id) FILTER (WHERE l.status = 'defaulted')                                    AS loans_defaulted,
  now() AS refreshed_at
FROM sacco.group_members gm
LEFT JOIN finance.contributions c ON c.group_id = gm.group_id AND c.member_id  = gm.profile_id
LEFT JOIN finance.loans         l ON l.group_id = gm.group_id AND l.borrower_id = gm.profile_id
GROUP BY gm.group_id, gm.profile_id, gm.role, gm.status, gm.joined_at;

CREATE UNIQUE INDEX mportfolio_idx         ON sacco.member_portfolios (group_id, profile_id);
CREATE INDEX        mportfolio_profile_idx ON sacco.member_portfolios (profile_id);

-- Refresh function — called by Edge Function on schedule and after significant writes
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY sacco.group_summaries;
  REFRESH MATERIALIZED VIEW CONCURRENTLY sacco.member_portfolios;
END;
$$;

-- Grant read access
GRANT SELECT ON sacco.group_summaries   TO authenticated;
GRANT SELECT ON sacco.member_portfolios TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_materialized_views() TO service_role;
