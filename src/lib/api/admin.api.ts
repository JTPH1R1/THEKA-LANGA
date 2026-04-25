import { schemaRpc } from '@/lib/supabase'
import type {
  AdminStats, AdminUser, AdminGroup, AdminKycEntry,
  AdminAuditEvent, AdminJobEntry, AdminSystemError,
  SystemRole, KycLevel, ScoreBand, GroupStatus,
  KycVerificationStatus,
} from '@/types/domain.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

type DbSchema = 'core' | 'kyc' | 'sacco' | 'finance' | 'audit' | 'system'

function rpc<T>(fn: string, params: Record<string, unknown> = {}, schema: DbSchema = 'core') {
  return schemaRpc<T>(schema, fn, params)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await rpc<Record<string, unknown>>('admin_get_stats')
  if (error) throw new Error(error.message)
  const d = data as Record<string, unknown>
  return {
    totalUsers:       d.total_users as number,
    activeUsers:      d.active_users as number,
    blacklistedUsers: d.blacklisted_users as number,
    activeGroups:     d.active_groups as number,
    totalGroups:      d.total_groups as number,
    loanOutstanding:  d.loan_outstanding as number,
    totalDefaults:    d.total_defaults as number,
    kycQueueCount:    d.kyc_queue_count as number,
    unresolvedErrors: d.unresolved_errors as number,
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(params: {
  search?:      string
  kycLevel?:    number
  blacklisted?: boolean
} = {}): Promise<AdminUser[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_all_profiles', {
    p_search:      params.search      ?? null,
    p_kyc_level:   params.kycLevel    ?? null,
    p_blacklisted: params.blacklisted ?? null,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:              r.id as string,
    email:           r.email as string,
    fullLegalName:   r.full_legal_name as string,
    preferredName:   r.preferred_name as string | null,
    phone:           r.phone as string | null,
    systemRole:      r.system_role as SystemRole,
    kycLevel:        r.kyc_level as KycLevel,
    creditScore:     r.credit_score as number,
    creditScoreBand: r.credit_score_band as ScoreBand,
    isBlacklisted:   r.is_blacklisted as boolean,
    isActive:        r.is_active as boolean,
    createdAt:       r.created_at as string,
    groupCount:      r.group_count as number,
  }))
}

export async function blacklistUser(profileId: string, reason: string): Promise<void> {
  const { error } = await rpc<null>('admin_blacklist_user', { p_profile_id: profileId, p_reason: reason })
  if (error) throw new Error(error.message)
}

export async function unblacklistUser(profileId: string): Promise<void> {
  const { error } = await rpc<null>('admin_unblacklist_user', { p_profile_id: profileId })
  if (error) throw new Error(error.message)
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function getAdminGroups(status?: string): Promise<AdminGroup[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_all_groups', { p_status: status ?? null }, 'sacco')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:                 r.id as string,
    name:               r.name as string,
    slug:               r.slug as string,
    type:               r.type as 'public' | 'private',
    status:             r.status as GroupStatus,
    currency:           r.currency as string,
    createdAt:          r.created_at as string,
    memberCount:        r.member_count as number,
    totalContributions: r.total_contributions as number,
    activeLoanBook:     r.active_loan_book as number,
    totalDefaults:      r.total_defaults as number,
  }))
}

export async function freezeGroup(groupId: string): Promise<void> {
  const { error } = await rpc<null>('admin_freeze_group', { p_group_id: groupId }, 'sacco')
  if (error) throw new Error(error.message)
}

export async function unfreezeGroup(groupId: string): Promise<void> {
  const { error } = await rpc<null>('admin_unfreeze_group', { p_group_id: groupId }, 'sacco')
  if (error) throw new Error(error.message)
}

// ─── KYC queue ────────────────────────────────────────────────────────────────

export async function getKycQueue(): Promise<AdminKycEntry[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_kyc_queue', {}, 'kyc')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    profileId:          r.profile_id as string,
    fullLegalName:      r.full_legal_name as string,
    email:              r.email as string,
    phone:              r.phone as string | null,
    verificationStatus: r.verification_status as KycVerificationStatus,
    kycLevel:           r.kyc_level as KycLevel,
    submittedAt:        r.submitted_at as string | null,
    riskRating:         r.risk_rating as string,
  }))
}

export async function approveKyc(profileId: string): Promise<void> {
  const { error } = await rpc<null>('admin_approve_kyc', { p_profile_id: profileId }, 'kyc')
  if (error) throw new Error(error.message)
}

export async function rejectKyc(profileId: string, reason: string): Promise<void> {
  const { error } = await rpc<null>('admin_reject_kyc', { p_profile_id: profileId, p_reason: reason }, 'kyc')
  if (error) throw new Error(error.message)
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export async function getAuditLog(params: {
  tableName?: string
  action?:    string
  limit?:     number
  offset?:    number
} = {}): Promise<AdminAuditEvent[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_events', {
    p_table_name: params.tableName ?? null,
    p_action:     params.action    ?? null,
    p_limit:      params.limit     ?? 50,
    p_offset:     params.offset    ?? 0,
  }, 'audit')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:         r.id as string,
    schemaName: r.schema_name as string,
    tableName:  r.table_name as string,
    recordId:   r.record_id as string,
    action:     r.action as AdminAuditEvent['action'],
    changedAt:  r.changed_at as string,
    changedBy:  r.changed_by as string | null,
    actorName:  r.actor_name as string | null,
    diff:       r.diff as Record<string, unknown> | null,
  }))
}

// ─── System jobs ──────────────────────────────────────────────────────────────

export async function getJobLog(): Promise<AdminJobEntry[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_job_log', { p_limit: 50 }, 'system')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:               r.id as string,
    jobName:          r.job_name as string,
    status:           r.status as AdminJobEntry['status'],
    startedAt:        r.started_at as string,
    completedAt:      r.completed_at as string | null,
    durationMs:       r.duration_ms as number | null,
    recordsProcessed: r.records_processed as number,
    errorMessage:     r.error_message as string | null,
  }))
}

export async function getSystemErrors(): Promise<AdminSystemError[]> {
  const { data, error } = await rpc<Record<string, unknown>[]>('admin_get_errors', { p_limit: 50 }, 'system')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:        r.id as string,
    source:    r.source as string,
    errorCode: r.error_code as string | null,
    message:   r.message as string,
    profileId: r.profile_id as string | null,
    resolved:  r.resolved as boolean,
    createdAt: r.created_at as string,
  }))
}
