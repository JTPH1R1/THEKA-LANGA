import { supabase, db, schemaRpc } from '@/lib/supabase'
import type { GroupMember, GroupJoinRequest, ProfileSummary } from '@/types/domain.types'

function mapProfileSummary(row: Record<string, unknown>): ProfileSummary {
  return {
    id:              row.id as string,
    fullLegalName:   row.full_legal_name as string,
    preferredName:   row.preferred_name as string | null,
    avatarUrl:       row.avatar_url as string | null,
    creditScore:     row.credit_score as number,
    creditScoreBand: row.credit_score_band as ProfileSummary['creditScoreBand'],
    kycLevel:        row.kyc_level as ProfileSummary['kycLevel'],
  }
}

function mapMember(row: Record<string, unknown>, profile?: ProfileSummary): GroupMember {
  return {
    id:                  row.id as string,
    groupId:             row.group_id as string,
    profileId:           row.profile_id as string,
    role:                row.role as GroupMember['role'],
    status:              row.status as GroupMember['status'],
    joinedAt:            row.joined_at as string | null,
    exitedAt:            row.exited_at as string | null,
    midJoin:             row.mid_join as boolean,
    midJoinCatchupAmount:row.mid_join_catchup_amount as number | null,
    creditScoreAtJoin:   row.credit_score_at_join as number | null,
    createdAt:           row.created_at as string,
    profile,
  }
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data: members, error: mErr } = await db.sacco()
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .in('status', ['active', 'suspended'])
    .order('role')
    .order('created_at')

  if (mErr) throw { message: mErr.message }
  if (!members?.length) return []

  const profileIds = members.map((m) => (m as Record<string, unknown>).profile_id as string)

  const { data: profiles, error: pErr } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name, avatar_url, credit_score, credit_score_band, kyc_level')
    .in('id', profileIds)

  if (pErr) throw { message: pErr.message }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [(p as Record<string, unknown>).id as string, mapProfileSummary(p as Record<string, unknown>)])
  )

  return members.map((m) =>
    mapMember(m as Record<string, unknown>, profileMap.get((m as Record<string, unknown>).profile_id as string))
  )
}

export async function getMyMembership(
  groupId: string,
): Promise<GroupMember | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await db.sacco()
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('profile_id', user.id)
    .maybeSingle()

  if (error) throw { message: error.message }
  if (!data) return null
  return mapMember(data as Record<string, unknown>)
}

export async function getJoinRequests(groupId: string): Promise<GroupJoinRequest[]> {
  const { data: reqs, error: rErr } = await db.sacco()
    .from('group_join_requests')
    .select('*')
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('created_at')

  if (rErr) throw { message: rErr.message }
  if (!reqs?.length) return []

  const profileIds = reqs.map((r) => (r as Record<string, unknown>).requester_id as string)
  const { data: profiles, error: pErr } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name, avatar_url, credit_score, credit_score_band, kyc_level')
    .in('id', profileIds)

  if (pErr) throw { message: pErr.message }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [(p as Record<string, unknown>).id as string, mapProfileSummary(p as Record<string, unknown>)])
  )

  return reqs.map((r) => {
    const row = r as Record<string, unknown>
    return {
      id:               row.id as string,
      groupId:          row.group_id as string,
      requesterId:      row.requester_id as string,
      status:           row.status as GroupJoinRequest['status'],
      message:          row.message as string | null,
      reviewedBy:       row.reviewed_by as string | null,
      reviewedAt:       row.reviewed_at as string | null,
      denialReason:     row.denial_reason as string | null,
      createdAt:        row.created_at as string,
      requesterProfile: profileMap.get(row.requester_id as string),
    }
  })
}

export async function getMyJoinRequest(
  groupId: string,
): Promise<GroupJoinRequest | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await db.sacco()
    .from('group_join_requests')
    .select('*')
    .eq('group_id', groupId)
    .eq('requester_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) throw { message: error.message }
  if (!data) return null
  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    groupId: row.group_id as string,
    requesterId: row.requester_id as string,
    status: row.status as GroupJoinRequest['status'],
    message: row.message as string | null,
    reviewedBy: row.reviewed_by as string | null,
    reviewedAt: row.reviewed_at as string | null,
    denialReason: row.denial_reason as string | null,
    createdAt: row.created_at as string,
  }
}

export async function requestToJoin(groupId: string, message?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('group_join_requests')
    .insert({ group_id: groupId, requester_id: user.id, message: message ?? null })

  if (error) throw { message: error.message }
}

export async function withdrawJoinRequest(requestId: string): Promise<void> {
  const { error } = await db.sacco()
    .from('group_join_requests')
    .update({ status: 'withdrawn' })
    .eq('id', requestId)

  if (error) throw { message: error.message }
}

export async function approveJoinRequest(requestId: string): Promise<void> {
  const { error } = await schemaRpc('sacco', 'approve_join_request', { p_request_id: requestId })
  if (error) throw { message: error.message }
}

export async function denyJoinRequest(
  requestId: string,
  reason: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('group_join_requests')
    .update({ status: 'denied', reviewed_by: user.id, reviewed_at: new Date().toISOString(), denial_reason: reason })
    .eq('id', requestId)

  if (error) throw { message: error.message }
}

export async function exitGroup(groupId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('group_members')
    .update({ status: 'exited', exited_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('profile_id', user.id)

  if (error) throw { message: error.message }
}

export async function suspendMember(
  groupId: string,
  profileId: string,
): Promise<void> {
  const { error } = await db.sacco()
    .from('group_members')
    .update({ status: 'suspended' })
    .eq('group_id', groupId)
    .eq('profile_id', profileId)

  if (error) throw { message: error.message }
}

export async function reinstateMember(
  groupId: string,
  profileId: string,
): Promise<void> {
  const { error } = await db.sacco()
    .from('group_members')
    .update({ status: 'active' })
    .eq('group_id', groupId)
    .eq('profile_id', profileId)

  if (error) throw { message: error.message }
}
