-- Phase 10: Dashboard — activity feed RPC and next-contribution query

-- ─── RPC: activity feed ───────────────────────────────────────────────────────
-- Returns the 20 most recent events across all groups the caller belongs to.
-- Unions: contributions paid, loans disbursed/completed, members joined, elections closed.

CREATE OR REPLACE FUNCTION sacco.get_activity_feed(p_limit int DEFAULT 20)
RETURNS TABLE(
  event_type   text,
  group_id     uuid,
  group_name   text,
  actor_name   text,
  amount       bigint,
  currency     text,
  occurred_at  timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = sacco, finance, core, public AS $$
BEGIN
  RETURN QUERY
  (
    -- Contributions paid
    SELECT
      'contribution_paid'::text,
      c.group_id,
      g.name,
      COALESCE(p.preferred_name, p.full_legal_name),
      c.paid_amount,
      g.currency,
      c.paid_at
    FROM finance.contributions c
    JOIN sacco.groups    g ON g.id = c.group_id
    JOIN core.profiles   p ON p.id = c.member_id
    WHERE c.status = 'paid' AND c.paid_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sacco.group_members gm
        WHERE gm.group_id = c.group_id AND gm.profile_id = auth.uid() AND gm.status = 'active'
      )
  )
  UNION ALL
  (
    -- Loans disbursed
    SELECT
      'loan_disbursed'::text,
      l.group_id,
      g.name,
      COALESCE(p.preferred_name, p.full_legal_name),
      l.principal,
      g.currency,
      l.disbursed_at
    FROM finance.loans   l
    JOIN sacco.groups    g ON g.id = l.group_id
    JOIN core.profiles   p ON p.id = l.borrower_id
    WHERE l.disbursed_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sacco.group_members gm
        WHERE gm.group_id = l.group_id AND gm.profile_id = auth.uid() AND gm.status = 'active'
      )
  )
  UNION ALL
  (
    -- Loans completed (repaid)
    SELECT
      'loan_completed'::text,
      l.group_id,
      g.name,
      COALESCE(p.preferred_name, p.full_legal_name),
      l.principal,
      g.currency,
      l.completed_at
    FROM finance.loans   l
    JOIN sacco.groups    g ON g.id = l.group_id
    JOIN core.profiles   p ON p.id = l.borrower_id
    WHERE l.status = 'completed' AND l.completed_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sacco.group_members gm
        WHERE gm.group_id = l.group_id AND gm.profile_id = auth.uid() AND gm.status = 'active'
      )
  )
  UNION ALL
  (
    -- Members joined
    SELECT
      'member_joined'::text,
      gm.group_id,
      g.name,
      COALESCE(p.preferred_name, p.full_legal_name),
      NULL::bigint,
      g.currency,
      gm.joined_at
    FROM sacco.group_members gm
    JOIN sacco.groups        g ON g.id = gm.group_id
    JOIN core.profiles       p ON p.id = gm.profile_id
    WHERE gm.status = 'active' AND gm.joined_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sacco.group_members gm2
        WHERE gm2.group_id = gm.group_id AND gm2.profile_id = auth.uid() AND gm2.status = 'active'
      )
  )
  UNION ALL
  (
    -- Elections closed
    SELECT
      'election_closed'::text,
      e.group_id,
      g.name,
      COALESCE(pw.preferred_name, pw.full_legal_name, 'No winner'),
      NULL::bigint,
      g.currency,
      e.voting_close_at
    FROM sacco.elections  e
    JOIN sacco.groups     g  ON g.id  = e.group_id
    LEFT JOIN core.profiles pw ON pw.id = e.winner_id
    WHERE e.status = 'closed' AND e.voting_close_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sacco.group_members gm
        WHERE gm.group_id = e.group_id AND gm.profile_id = auth.uid() AND gm.status = 'active'
      )
  )
  ORDER BY occurred_at DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION sacco.get_activity_feed(int) TO authenticated;

-- ─── RPC: next contribution due for current user ──────────────────────────────

CREATE OR REPLACE FUNCTION finance.get_next_contribution_due()
RETURNS TABLE(
  group_id        uuid,
  group_name      text,
  expected_amount bigint,
  currency        text,
  due_date        date
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = finance, sacco, public AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.group_id,
    g.name,
    c.expected_amount,
    g.currency,
    c.due_date
  FROM finance.contributions c
  JOIN sacco.groups g ON g.id = c.group_id
  WHERE c.member_id = auth.uid()
    AND c.status = 'pending'
    AND c.due_date >= CURRENT_DATE
  ORDER BY c.due_date ASC
  LIMIT 3;
END;
$$;

GRANT EXECUTE ON FUNCTION finance.get_next_contribution_due() TO authenticated;
