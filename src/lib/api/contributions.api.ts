import { db, schemaRpc } from '@/lib/supabase'
import type { Contribution, ContributionStatus, PaymentChannel, ProfileSummary } from '@/types/domain.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toContribution(row: Record<string, unknown>, profileMap: Map<string, ProfileSummary>): Contribution {
  return {
    id:              row.id as string,
    groupId:         row.group_id as string,
    memberId:        row.member_id as string,
    cyclePeriod:     row.cycle_period as string,
    dueDate:         row.due_date as string,
    expectedAmount:  row.expected_amount as number,
    paidAmount:      row.paid_amount as number,
    fineAmount:      row.fine_amount as number,
    totalPaid:       row.total_paid as number,
    status:          row.status as ContributionStatus,
    paidAt:          row.paid_at as string | null,
    paymentRef:      row.payment_ref as string | null,
    paymentChannel:  row.payment_channel as PaymentChannel | null,
    recordedBy:      row.recorded_by as string | null,
    notes:           row.notes as string | null,
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
    profile:         profileMap.get(row.member_id as string),
  }
}

async function fetchProfiles(profileIds: string[]): Promise<Map<string, ProfileSummary>> {
  if (!profileIds.length) return new Map()

  const { data } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name, avatar_url, credit_score, credit_score_band, kyc_level')
    .in('id', profileIds)

  const map = new Map<string, ProfileSummary>()
  for (const p of data ?? []) {
    map.set(p.id, {
      id:              p.id,
      fullLegalName:   p.full_legal_name,
      preferredName:   p.preferred_name,
      avatarUrl:       p.avatar_url,
      creditScore:     p.credit_score,
      creditScoreBand: p.credit_score_band as ProfileSummary['creditScoreBand'],
      kycLevel:        p.kyc_level as ProfileSummary['kycLevel'],
    })
  }
  return map
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getGroupContributions(params: {
  groupId: string
  cyclePeriod?: string
  status?: ContributionStatus
  memberId?: string
}): Promise<Contribution[]> {
  let query = db.finance()
    .from('contributions')
    .select('*')
    .eq('group_id', params.groupId)
    .order('due_date', { ascending: false })
    .order('member_id', { ascending: true })

  if (params.cyclePeriod) query = query.eq('cycle_period', params.cyclePeriod)
  if (params.status)      query = query.eq('status', params.status)
  if (params.memberId)    query = query.eq('member_id', params.memberId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const profileIds = [...new Set((data ?? []).map((r) => r.member_id as string))]
  const profileMap = await fetchProfiles(profileIds)

  return (data ?? []).map((row) => toContribution(row as Record<string, unknown>, profileMap))
}

export async function getMyGroupContributions(groupId: string): Promise<Contribution[]> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Not authenticated')

  return getGroupContributions({ groupId, memberId: userId })
}

export async function getDistinctPeriods(groupId: string): Promise<string[]> {
  const { data, error } = await db.finance()
    .from('contributions')
    .select('cycle_period')
    .eq('group_id', groupId)
    .order('cycle_period', { ascending: false })

  if (error) throw new Error(error.message)

  const periods = [...new Set((data ?? []).map((r) => r.cycle_period as string))]
  return periods
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function generateContributionSchedule(params: {
  groupId: string
  cyclePeriod: string
  dueDate: string
}): Promise<number> {
  const { data, error } = await schemaRpc<number>('finance', 'generate_contribution_schedule', {
    p_group_id:     params.groupId,
    p_cycle_period: params.cyclePeriod,
    p_due_date:     params.dueDate,
  })
  if (error) throw new Error(error.message)
  return data as number
}

export async function recordContributionPayment(params: {
  contributionId: string
  paidAmount:     number   // cents
  fineAmount:     number   // cents
  paymentRef:     string
  paymentChannel: string
  notes?:         string
}): Promise<void> {
  const { error } = await schemaRpc('finance', 'record_contribution_payment', {
    p_contribution_id: params.contributionId,
    p_paid_amount:     params.paidAmount,
    p_fine_amount:     params.fineAmount,
    p_payment_ref:     params.paymentRef,
    p_payment_channel: params.paymentChannel,
    p_notes:           params.notes ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function waiveContribution(params: {
  contributionId: string
  reason: string
}): Promise<void> {
  const { error } = await schemaRpc('finance', 'waive_contribution', {
    p_contribution_id: params.contributionId,
    p_reason:          params.reason,
  })
  if (error) throw new Error(error.message)
}
