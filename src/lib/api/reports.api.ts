import { db } from '@/lib/supabase'
import type {
  CycleSummaryData, CycleSummaryRow,
  MemberStatementData, MemberStatementContribution, MemberStatementLoan,
  LoanBookData, LoanBookRow,
  ContributionStatus, LoanStatus,
} from '@/types/domain.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getGroupInfo(groupId: string): Promise<{ id: string; name: string; currency: string }> {
  const { data, error } = await db.sacco()
    .from('groups')
    .select('id, name, currency')
    .eq('id', groupId)
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id as string, name: data.name as string, currency: data.currency as string }
}

async function getProfileNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map()
  const { data } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name')
    .in('id', ids)
  const map = new Map<string, string>()
  for (const p of data ?? []) {
    map.set(
      p.id as string,
      ((p.preferred_name || p.full_legal_name) as string),
    )
  }
  return map
}

// ─── Cycle Summary ────────────────────────────────────────────────────────────

export async function getCycleSummaryData(
  groupId: string,
  cyclePeriod: string,
): Promise<CycleSummaryData> {
  const [group, contribResult] = await Promise.all([
    getGroupInfo(groupId),
    db.finance()
      .from('contributions')
      .select('member_id, expected_amount, paid_amount, fine_amount, status, paid_at')
      .eq('group_id', groupId)
      .eq('cycle_period', cyclePeriod)
      .order('status'),
  ])

  if (contribResult.error) throw new Error(contribResult.error.message)
  const rawRows = contribResult.data ?? []

  const memberIds = [...new Set(rawRows.map((r) => r.member_id as string))]
  const nameMap = await getProfileNames(memberIds)

  const rows: CycleSummaryRow[] = rawRows.map((r) => ({
    memberId:       r.member_id as string,
    memberName:     nameMap.get(r.member_id as string) ?? 'Unknown',
    expectedAmount: r.expected_amount as number,
    paidAmount:     r.paid_amount as number,
    fineAmount:     r.fine_amount as number,
    status:         r.status as ContributionStatus,
    paidAt:         r.paid_at as string | null,
  }))

  const totals = {
    expected:       rows.reduce((s, r) => s + r.expectedAmount, 0),
    collected:      rows.reduce((s, r) => s + r.paidAmount, 0),
    outstanding:    rows.reduce((s, r) => s + Math.max(0, r.expectedAmount - r.paidAmount), 0),
    membersPaid:    rows.filter((r) => r.status === 'paid').length,
    membersPartial: rows.filter((r) => r.status === 'partial').length,
    membersOverdue: rows.filter((r) => (['late', 'defaulted'] as ContributionStatus[]).includes(r.status)).length,
  }

  return { group, cyclePeriod, generatedAt: new Date().toISOString(), rows, totals }
}

// ─── Member Statement ─────────────────────────────────────────────────────────

export async function getMemberStatementData(
  groupId: string,
  memberId: string,
): Promise<MemberStatementData> {
  const [group, profileResult, contribResult, loanResult] = await Promise.all([
    getGroupInfo(groupId),
    db.core()
      .from('profiles')
      .select('full_legal_name, preferred_name, credit_score, credit_score_band')
      .eq('id', memberId)
      .single(),
    db.finance()
      .from('contributions')
      .select('cycle_period, due_date, expected_amount, paid_amount, fine_amount, status')
      .eq('group_id', groupId)
      .eq('member_id', memberId)
      .order('due_date', { ascending: false })
      .limit(24),
    db.finance()
      .from('loans')
      .select('applied_at, principal, total_repayable, amount_repaid, outstanding, interest_rate, status, disbursed_at')
      .eq('group_id', groupId)
      .eq('borrower_id', memberId)
      .order('applied_at', { ascending: false }),
  ])

  if (profileResult.error) throw new Error(profileResult.error.message)
  if (contribResult.error) throw new Error(contribResult.error.message)
  if (loanResult.error) throw new Error(loanResult.error.message)

  const p = profileResult.data
  const member = {
    name:            (p.preferred_name || p.full_legal_name) as string,
    creditScore:     p.credit_score as number,
    creditScoreBand: p.credit_score_band as string,
  }

  const contributions: MemberStatementContribution[] = (contribResult.data ?? []).map((r) => ({
    cyclePeriod:    r.cycle_period as string,
    dueDate:        r.due_date as string,
    expectedAmount: r.expected_amount as number,
    paidAmount:     r.paid_amount as number,
    fineAmount:     r.fine_amount as number,
    status:         r.status as ContributionStatus,
  }))

  const loans: MemberStatementLoan[] = (loanResult.data ?? []).map((r) => ({
    appliedAt:      r.applied_at as string,
    principal:      r.principal as number,
    totalRepayable: r.total_repayable as number,
    amountRepaid:   r.amount_repaid as number,
    outstanding:    r.outstanding as number,
    interestRate:   r.interest_rate as number,
    status:         r.status as LoanStatus,
    disbursedAt:    r.disbursed_at as string | null,
  }))

  const activeStatuses: LoanStatus[] = ['disbursed', 'repaying']
  const totals = {
    totalContributed: contributions.reduce((s, c) => s + c.paidAmount, 0),
    activeLoansCount: loans.filter((l) => activeStatuses.includes(l.status)).length,
    loanOutstanding:  loans
      .filter((l) => activeStatuses.includes(l.status))
      .reduce((s, l) => s + l.outstanding, 0),
  }

  return { group, member, generatedAt: new Date().toISOString(), contributions, loans, totals }
}

// ─── Loan Book ────────────────────────────────────────────────────────────────

export async function getLoanBookData(groupId: string): Promise<LoanBookData> {
  const [group, loanResult] = await Promise.all([
    getGroupInfo(groupId),
    db.finance()
      .from('loans')
      .select('borrower_id, applied_at, principal, outstanding, amount_repaid, interest_rate, status, disbursed_at, due_date')
      .eq('group_id', groupId)
      .order('applied_at', { ascending: false }),
  ])

  if (loanResult.error) throw new Error(loanResult.error.message)
  const rawLoans = loanResult.data ?? []

  const borrowerIds = [...new Set(rawLoans.map((r) => r.borrower_id as string))]
  const nameMap = await getProfileNames(borrowerIds)

  const loans: LoanBookRow[] = rawLoans.map((r) => ({
    borrowerName: nameMap.get(r.borrower_id as string) ?? 'Unknown',
    appliedAt:    r.applied_at as string,
    principal:    r.principal as number,
    outstanding:  r.outstanding as number,
    amountRepaid: r.amount_repaid as number,
    interestRate: r.interest_rate as number,
    status:       r.status as LoanStatus,
    disbursedAt:  r.disbursed_at as string | null,
    dueDate:      r.due_date as string | null,
  }))

  const activeStatuses: LoanStatus[] = ['disbursed', 'repaying']
  const activeLoans = loans.filter((l) => activeStatuses.includes(l.status))
  const totals = {
    activePrincipal:   activeLoans.reduce((s, l) => s + l.principal, 0),
    activeOutstanding: activeLoans.reduce((s, l) => s + l.outstanding, 0),
    completedCount:    loans.filter((l) => l.status === 'completed').length,
    defaultCount:      loans.filter((l) => l.status === 'defaulted').length,
  }

  return { group, generatedAt: new Date().toISOString(), loans, totals }
}
