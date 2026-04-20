import { supabase, db } from '@/lib/supabase'
import type {
  DashboardKpis, GroupSummaryRow, ActivityEvent, NextContributionDue,
} from '@/types/domain.types'

export type { DashboardKpis, GroupSummaryRow, ActivityEvent, NextContributionDue }

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) throw new Error('Not authenticated')

  const { data: portfolios, error } = await db.sacco()
    .from('member_portfolios')
    .select('total_contributed, active_loans, loan_outstanding, on_time_payments, late_payments')
    .eq('profile_id', userId)
    .eq('status', 'active')

  if (error) throw new Error(error.message)

  const rows = portfolios ?? []
  return {
    groupCount:       rows.length,
    totalContributed: rows.reduce((s, r) => s + Number(r.total_contributed ?? 0), 0),
    loanOutstanding:  rows.reduce((s, r) => s + Number(r.loan_outstanding ?? 0), 0),
    activeLoans:      rows.reduce((s, r) => s + Number(r.active_loans ?? 0), 0),
    onTimePayments:   rows.reduce((s, r) => s + Number(r.on_time_payments ?? 0), 0),
    latePayments:     rows.reduce((s, r) => s + Number(r.late_payments ?? 0), 0),
  }
}

export async function getMyGroupSummaries(): Promise<GroupSummaryRow[]> {
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) throw new Error('Not authenticated')

  // My active memberships with roles
  const { data: memberships, error: mErr } = await db.sacco()
    .from('group_members')
    .select('group_id, role')
    .eq('profile_id', userId)
    .eq('status', 'active')

  if (mErr) throw new Error(mErr.message)
  if (!memberships?.length) return []

  const groupIds = memberships.map((m) => m.group_id as string)
  const roleMap  = new Map(memberships.map((m) => [m.group_id as string, m.role as string]))

  // Group summaries from materialized view
  const { data: summaries, error: sErr } = await db.sacco()
    .from('group_summaries')
    .select('*')
    .in('group_id', groupIds)

  if (sErr) throw new Error(sErr.message)

  // My portfolios
  const { data: portfolios } = await db.sacco()
    .from('member_portfolios')
    .select('group_id, total_contributed, loan_outstanding')
    .eq('profile_id', userId)
    .in('group_id', groupIds)

  const portfolioMap = new Map(
    (portfolios ?? []).map((p) => [
      p.group_id as string,
      { contributed: Number(p.total_contributed ?? 0), outstanding: Number(p.loan_outstanding ?? 0) },
    ])
  )

  return (summaries ?? []).map((s) => ({
    groupId:            s.group_id as string,
    name:               s.name as string,
    status:             s.status as GroupSummaryRow['status'],
    currency:           s.currency as string,
    activeMembers:      Number(s.active_members ?? 0),
    totalContributions: Number(s.total_contributions ?? 0),
    activeLoanBook:     Number(s.active_loan_book ?? 0),
    outstandingLoans:   Number(s.outstanding_loans ?? 0),
    totalDefaults:      Number(s.total_defaults ?? 0),
    myRole:             roleMap.get(s.group_id as string) as GroupSummaryRow['myRole'],
    myContributed:      portfolioMap.get(s.group_id as string)?.contributed,
    myLoanOutstanding:  portfolioMap.get(s.group_id as string)?.outstanding,
  }))
}

export async function getActivityFeed(limit = 20): Promise<ActivityEvent[]> {
  const { data, error } = await supabase.rpc(
    'get_activity_feed' as never,
    { p_limit: limit } as never,
    { schema: 'sacco' } as never,
  )
  if (error) throw new Error(error.message)

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    eventType:  row.event_type as string,
    groupId:    row.group_id as string,
    groupName:  row.group_name as string,
    actorName:  row.actor_name as string,
    amount:     row.amount != null ? Number(row.amount) : null,
    currency:   row.currency as string,
    occurredAt: row.occurred_at as string,
  }))
}

export async function getNextContributionsDue(): Promise<NextContributionDue[]> {
  const { data, error } = await supabase.rpc(
    'get_next_contribution_due' as never,
    {} as never,
    { schema: 'finance' } as never,
  )
  if (error) throw new Error(error.message)

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    groupId:        row.group_id as string,
    groupName:      row.group_name as string,
    expectedAmount: Number(row.expected_amount),
    currency:       row.currency as string,
    dueDate:        row.due_date as string,
  }))
}
