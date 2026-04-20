import { supabase, db } from '@/lib/supabase'
import type { Group, GroupRules, GroupWithMeta } from '@/types/domain.types'
import type { GroupInfoValues } from '@/lib/validators/group.schema'
import type { FullRulesValues } from '@/lib/validators/group-rules.schema'

function mapGroup(row: Record<string, unknown>): Group {
  return {
    id:          row.id as string,
    name:        row.name as string,
    slug:        row.slug as string,
    description: row.description as string | null,
    type:        row.type as Group['type'],
    status:      row.status as Group['status'],
    currency:    row.currency as string,
    timezone:    row.timezone as string,
    cycleStart:  row.cycle_start as string | null,
    cycleEnd:    row.cycle_end as string | null,
    logoUrl:     row.logo_url as string | null,
    createdBy:   row.created_by as string,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  }
}

function mapRules(row: Record<string, unknown>): GroupRules {
  return {
    groupId:                     row.group_id as string,
    contributionAmount:          row.contribution_amount as number,
    contributionFrequency:       row.contribution_frequency as GroupRules['contributionFrequency'],
    contributionDay:             row.contribution_day as number | null,
    gracePeriodDays:             row.grace_period_days as number,
    lateFineFlat:                row.late_fine_flat as number,
    lateFineInterestRateDaily:   Number(row.late_fine_interest_rate_daily),
    initiationFee:               row.initiation_fee as number,
    lateJoiningFee:              row.late_joining_fee as number,
    midJoinAllowed:              row.mid_join_allowed as boolean,
    midJoinDeadlineWeeks:        row.mid_join_deadline_weeks as number,
    maxMembers:                  row.max_members as number | null,
    minKycLevel:                 row.min_kyc_level as GroupRules['minKycLevel'],
    loanEnabled:                 row.loan_enabled as boolean,
    maxLoanMultiplier:           Number(row.max_loan_multiplier),
    loanInterestRate:            Number(row.loan_interest_rate),
    loanInterestType:            row.loan_interest_type as GroupRules['loanInterestType'],
    loanRepaymentPeriods:        row.loan_repayment_periods as number,
    loanProcessingFeeRate:       Number(row.loan_processing_fee_rate),
    maxActiveLoansPerMember:     row.max_active_loans_per_member as number,
    guarantorRequired:           row.guarantor_required as boolean,
    guarantorsRequiredCount:     row.guarantors_required_count as number,
    minGuarantorCreditScore:     row.min_guarantor_credit_score as number | null,
    defaultThresholdDays:        row.default_threshold_days as number,
    defaultPenaltyRate:          Number(row.default_penalty_rate),
    blacklistRecommendationAfter:row.blacklist_recommendation_after as number,
    dividendDistribution:        row.dividend_distribution as GroupRules['dividendDistribution'],
    rulesVersion:                row.rules_version as number,
    createdAt:                   row.created_at as string,
    updatedAt:                   row.updated_at as string,
  }
}

/** My groups (all I am an active member of) */
export async function getMyGroups(): Promise<GroupWithMeta[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.sacco()
    .from('group_members')
    .select(`
      role, status,
      groups:group_id (
        id, name, slug, description, type, status, currency,
        timezone, cycle_start, cycle_end, logo_url, created_by,
        created_at, updated_at
      )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')

  if (error) throw { message: error.message }

  return (data ?? [])
    .filter((row) => row.groups)
    .map((row) => ({
      ...mapGroup(row.groups as Record<string, unknown>),
      myRole: row.role as GroupWithMeta['myRole'],
      myStatus: row.status as GroupWithMeta['myStatus'],
    }))
}

/** Public groups — discoverable by any authenticated user */
export async function getPublicGroups(filters?: {
  search?: string
  status?: string
}): Promise<GroupWithMeta[]> {
  let query = db.sacco()
    .from('groups')
    .select('id, name, slug, description, type, status, currency, timezone, cycle_start, cycle_end, logo_url, created_by, created_at, updated_at')
    .eq('type', 'public')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw { message: error.message }
  return (data ?? []).map((row) => mapGroup(row as Record<string, unknown>))
}

/** Fetch a single group by ID */
export async function getGroupById(groupId: string): Promise<Group> {
  const { data, error } = await db.sacco()
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error) throw { message: error.message }
  return mapGroup(data as Record<string, unknown>)
}

/** Fetch group rules */
export async function getGroupRules(groupId: string): Promise<GroupRules> {
  const { data, error } = await db.sacco()
    .from('group_rules')
    .select('*')
    .eq('group_id', groupId)
    .single()

  if (error) throw { message: error.message }
  return mapRules(data as Record<string, unknown>)
}

/** Atomically create group + add creator as chair + insert rules */
export async function createGroup(
  info: GroupInfoValues & { slug: string },
  rules: FullRulesValues,
): Promise<string> {
  const toCents = (v: number) => Math.round(v * 100)

  const { data, error } = await supabase.rpc('create_group' as never, {
    // Group identity
    p_name:        info.name,
    p_slug:        info.slug,
    p_type:        info.type,
    p_description: info.description ?? null,
    p_currency:    info.currency,
    p_timezone:    info.timezone,
    p_cycle_start: info.cycleStart ?? null,
    p_cycle_end:   info.cycleEnd ?? null,
    // Contributions
    p_contribution_amount:              toCents(rules.contributionAmount),
    p_contribution_frequency:           rules.contributionFrequency,
    p_contribution_day:                 rules.contributionDay ?? null,
    p_grace_period_days:                rules.gracePeriodDays,
    p_late_fine_flat:                   toCents(rules.lateFineFlat),
    p_late_fine_interest_rate_daily:    rules.lateFineInterestRateDaily,
    // Membership
    p_initiation_fee:                   toCents(rules.initiationFee),
    p_late_joining_fee:                 toCents(rules.lateJoiningFee),
    p_mid_join_allowed:                 rules.midJoinAllowed,
    p_mid_join_deadline_weeks:          rules.midJoinDeadlineWeeks,
    p_max_members:                      rules.maxMembers ?? null,
    p_min_kyc_level:                    rules.minKycLevel,
    // Loans
    p_loan_enabled:                     rules.loanEnabled,
    p_max_loan_multiplier:              rules.maxLoanMultiplier,
    p_loan_interest_rate:               rules.loanInterestRate,
    p_loan_interest_type:               rules.loanInterestType,
    p_loan_repayment_periods:           rules.loanRepaymentPeriods,
    p_loan_processing_fee_rate:         rules.loanProcessingFeeRate,
    p_max_active_loans_per_member:      rules.maxActiveLoansPerMember,
    p_guarantor_required:               rules.guarantorRequired,
    p_guarantors_required_count:        rules.guarantorsRequiredCount,
    p_min_guarantor_credit_score:       rules.minGuarantorCreditScore ?? null,
    // Defaults
    p_default_threshold_days:           rules.defaultThresholdDays,
    p_default_penalty_rate:             rules.defaultPenaltyRate,
    p_blacklist_recommendation_after:   rules.blacklistRecommendationAfter,
    // Returns
    p_dividend_distribution:            rules.dividendDistribution,
  } as never)

  if (error) throw { message: error.message }
  return data as string
}

/** Update group rules (caller must be an officer) */
export async function updateGroupRules(
  groupId: string,
  rules: Partial<FullRulesValues>,
): Promise<void> {
  const toCents = (v?: number) => (v !== undefined ? Math.round(v * 100) : undefined)

  const patch: Record<string, unknown> = {}
  if (rules.contributionAmount      !== undefined) patch.contribution_amount             = toCents(rules.contributionAmount)
  if (rules.contributionFrequency   !== undefined) patch.contribution_frequency          = rules.contributionFrequency
  if (rules.contributionDay         !== undefined) patch.contribution_day                = rules.contributionDay
  if (rules.gracePeriodDays         !== undefined) patch.grace_period_days               = rules.gracePeriodDays
  if (rules.lateFineFlat            !== undefined) patch.late_fine_flat                  = toCents(rules.lateFineFlat)
  if (rules.lateFineInterestRateDaily !== undefined) patch.late_fine_interest_rate_daily = rules.lateFineInterestRateDaily
  if (rules.initiationFee           !== undefined) patch.initiation_fee                  = toCents(rules.initiationFee)
  if (rules.lateJoiningFee          !== undefined) patch.late_joining_fee                = toCents(rules.lateJoiningFee)
  if (rules.midJoinAllowed          !== undefined) patch.mid_join_allowed                = rules.midJoinAllowed
  if (rules.midJoinDeadlineWeeks    !== undefined) patch.mid_join_deadline_weeks         = rules.midJoinDeadlineWeeks
  if (rules.maxMembers              !== undefined) patch.max_members                     = rules.maxMembers
  if (rules.minKycLevel             !== undefined) patch.min_kyc_level                   = rules.minKycLevel
  if (rules.loanEnabled             !== undefined) patch.loan_enabled                    = rules.loanEnabled
  if (rules.maxLoanMultiplier       !== undefined) patch.max_loan_multiplier             = rules.maxLoanMultiplier
  if (rules.loanInterestRate        !== undefined) patch.loan_interest_rate              = rules.loanInterestRate
  if (rules.loanInterestType        !== undefined) patch.loan_interest_type              = rules.loanInterestType
  if (rules.loanRepaymentPeriods    !== undefined) patch.loan_repayment_periods          = rules.loanRepaymentPeriods
  if (rules.loanProcessingFeeRate   !== undefined) patch.loan_processing_fee_rate        = rules.loanProcessingFeeRate
  if (rules.maxActiveLoansPerMember !== undefined) patch.max_active_loans_per_member     = rules.maxActiveLoansPerMember
  if (rules.guarantorRequired       !== undefined) patch.guarantor_required              = rules.guarantorRequired
  if (rules.guarantorsRequiredCount !== undefined) patch.guarantors_required_count       = rules.guarantorsRequiredCount
  if (rules.minGuarantorCreditScore !== undefined) patch.min_guarantor_credit_score      = rules.minGuarantorCreditScore
  if (rules.defaultThresholdDays    !== undefined) patch.default_threshold_days          = rules.defaultThresholdDays
  if (rules.defaultPenaltyRate      !== undefined) patch.default_penalty_rate            = rules.defaultPenaltyRate
  if (rules.blacklistRecommendationAfter !== undefined) patch.blacklist_recommendation_after = rules.blacklistRecommendationAfter
  if (rules.dividendDistribution    !== undefined) patch.dividend_distribution           = rules.dividendDistribution

  const { error } = await db.sacco()
    .from('group_rules')
    .update(patch as never)
    .eq('group_id', groupId)

  if (error) throw { message: error.message }
}
