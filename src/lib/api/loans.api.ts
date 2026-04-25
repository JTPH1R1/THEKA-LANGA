import { db, schemaRpc } from '@/lib/supabase'
import type {
  Loan, LoanGuarantor, LoanRepayment, LoanStatus,
  RepaymentPeriod, ProfileSummary,
} from '@/types/domain.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toProfileSummary(p: Record<string, unknown>): ProfileSummary {
  return {
    id:              p.id as string,
    fullLegalName:   p.full_legal_name as string,
    preferredName:   p.preferred_name as string | null,
    avatarUrl:       p.avatar_url as string | null,
    creditScore:     p.credit_score as number,
    creditScoreBand: p.credit_score_band as ProfileSummary['creditScoreBand'],
    kycLevel:        p.kyc_level as ProfileSummary['kycLevel'],
  }
}

async function fetchProfiles(ids: string[]): Promise<Map<string, ProfileSummary>> {
  if (!ids.length) return new Map()
  const { data } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name, avatar_url, credit_score, credit_score_band, kyc_level')
    .in('id', ids)
  const map = new Map<string, ProfileSummary>()
  for (const p of data ?? []) map.set(p.id, toProfileSummary(p as Record<string, unknown>))
  return map
}

function toLoan(row: Record<string, unknown>, profileMap: Map<string, ProfileSummary>): Loan {
  return {
    id:                 row.id as string,
    groupId:            row.group_id as string,
    borrowerId:         row.borrower_id as string,
    principal:          row.principal as number,
    processingFee:      row.processing_fee as number,
    totalInterest:      row.total_interest as number,
    totalRepayable:     row.total_repayable as number,
    amountRepaid:       row.amount_repaid as number,
    outstanding:        row.outstanding as number,
    interestRate:       row.interest_rate as number,
    interestType:       row.interest_type as Loan['interestType'],
    repaymentPeriods:   row.repayment_periods as number,
    repaymentSchedule:  (row.repayment_schedule ?? []) as RepaymentPeriod[],
    status:             row.status as LoanStatus,
    appliedAt:          row.applied_at as string,
    reviewedAt:         row.reviewed_at as string | null,
    approvedAt:         row.approved_at as string | null,
    disbursedAt:        row.disbursed_at as string | null,
    completedAt:        row.completed_at as string | null,
    dueDate:            row.due_date as string | null,
    reviewedBy:         row.reviewed_by as string | null,
    approvedBy:         row.approved_by as string | null,
    rejectionReason:    row.rejection_reason as string | null,
    creditScoreAtApply: row.credit_score_at_apply as number,
    notes:              row.notes as string | null,
    createdAt:          row.created_at as string,
    updatedAt:          row.updated_at as string,
    borrowerProfile:    profileMap.get(row.borrower_id as string),
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getGroupLoans(params: {
  groupId: string
  status?: LoanStatus
}): Promise<Loan[]> {
  let query = db.finance()
    .from('loans')
    .select('*')
    .eq('group_id', params.groupId)
    .order('applied_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const ids = [...new Set((data ?? []).map((r) => r.borrower_id as string))]
  const profiles = await fetchProfiles(ids)

  return (data ?? []).map((row) => toLoan(row as Record<string, unknown>, profiles))
}

export async function getMyGroupLoans(groupId: string): Promise<Loan[]> {
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await db.finance()
    .from('loans')
    .select('*')
    .eq('group_id', groupId)
    .eq('borrower_id', userId)
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)

  const profiles = await fetchProfiles([userId])
  return (data ?? []).map((row) => toLoan(row as Record<string, unknown>, profiles))
}

export async function getLoanGuarantors(loanId: string): Promise<LoanGuarantor[]> {
  const { data, error } = await db.finance()
    .from('loan_guarantors')
    .select('*')
    .eq('loan_id', loanId)

  if (error) throw new Error(error.message)

  const ids = [...new Set((data ?? []).map((r) => r.guarantor_id as string))]
  const profiles = await fetchProfiles(ids)

  return (data ?? []).map((row) => ({
    id:                    row.id as string,
    loanId:                row.loan_id as string,
    guarantorId:           row.guarantor_id as string,
    status:                row.status as LoanGuarantor['status'],
    respondedAt:           row.responded_at as string | null,
    creditScoreAtGuarantee:row.credit_score_at_guarantee as number | null,
    createdAt:             row.created_at as string,
    profile:               profiles.get(row.guarantor_id as string),
  }))
}

export async function getLoanRepayments(loanId: string): Promise<LoanRepayment[]> {
  const { data, error } = await db.finance()
    .from('loan_repayments')
    .select('*')
    .eq('loan_id', loanId)
    .order('paid_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id:             row.id as string,
    loanId:         row.loan_id as string,
    groupId:        row.group_id as string,
    borrowerId:     row.borrower_id as string,
    amountPaid:     row.amount_paid as number,
    paidAt:         row.paid_at as string,
    paymentRef:     row.payment_ref as string | null,
    paymentChannel: row.payment_channel as LoanRepayment['paymentChannel'],
    isReversal:     row.is_reversal as boolean,
    notes:          row.notes as string | null,
    createdAt:      row.created_at as string,
  }))
}

export async function getMyGuarantorRequests(): Promise<(LoanGuarantor & { loan?: Loan })[]> {
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) throw new Error('Not authenticated')

  const { data: gRows, error: gErr } = await db.finance()
    .from('loan_guarantors')
    .select('*')
    .eq('guarantor_id', userId)
    .eq('status', 'pending')

  if (gErr) throw new Error(gErr.message)
  if (!gRows?.length) return []

  const loanIds = [...new Set(gRows.map((r) => r.loan_id as string))]
  const { data: loanRows, error: lErr } = await db.finance()
    .from('loans')
    .select('*')
    .in('id', loanIds)

  if (lErr) throw new Error(lErr.message)

  const loanMap = new Map<string, Loan>()
  for (const row of loanRows ?? []) {
    loanMap.set(row.id as string, toLoan(row as Record<string, unknown>, new Map()))
  }

  return gRows.map((row) => ({
    id:                    row.id as string,
    loanId:                row.loan_id as string,
    guarantorId:           row.guarantor_id as string,
    status:                row.status as LoanGuarantor['status'],
    respondedAt:           row.responded_at as string | null,
    creditScoreAtGuarantee:row.credit_score_at_guarantee as number | null,
    createdAt:             row.created_at as string,
    loan:                  loanMap.get(row.loan_id as string),
  }))
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function applyForLoan(params: {
  groupId: string
  principal: number     // cents
  guarantorIds: string[]
  notes?: string
}): Promise<string> {
  const { data, error } = await schemaRpc<string>('finance', 'apply_for_loan', {
    p_group_id:      params.groupId,
    p_principal:     params.principal,
    p_guarantor_ids: params.guarantorIds,
    p_notes:         params.notes ?? null,
  })
  if (error) throw new Error(error.message)
  return data as string
}

export async function approveLoan(loanId: string): Promise<void> {
  const { error } = await schemaRpc('finance', 'approve_loan', { p_loan_id: loanId })
  if (error) throw new Error(error.message)
}

export async function rejectLoan(loanId: string, reason: string): Promise<void> {
  const { error } = await schemaRpc('finance', 'reject_loan', { p_loan_id: loanId, p_reason: reason })
  if (error) throw new Error(error.message)
}

export async function disburseLoan(loanId: string): Promise<void> {
  const { error } = await schemaRpc('finance', 'disburse_loan', { p_loan_id: loanId })
  if (error) throw new Error(error.message)
}

export async function recordLoanRepayment(params: {
  loanId: string
  amountPaid: number
  paymentRef: string
  paymentChannel: string
  notes?: string
}): Promise<void> {
  const { error } = await schemaRpc('finance', 'record_loan_repayment', {
    p_loan_id:         params.loanId,
    p_amount_paid:     params.amountPaid,
    p_payment_ref:     params.paymentRef,
    p_payment_channel: params.paymentChannel,
    p_notes:           params.notes ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function respondToGuarantor(loanId: string, accepted: boolean): Promise<void> {
  const { error } = await schemaRpc('finance', 'respond_to_guarantor', { p_loan_id: loanId, p_accepted: accepted })
  if (error) throw new Error(error.message)
}
