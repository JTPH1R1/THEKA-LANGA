import { supabase, db, schemaRpc } from '@/lib/supabase'
import type { Election, ElectionCandidate, ProfileSummary } from '@/types/domain.types'

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

function mapElection(row: Record<string, unknown>): Election {
  return {
    id:                  row.id as string,
    groupId:             row.group_id as string,
    position:            row.position as Election['position'],
    status:              row.status as Election['status'],
    nominationsOpenAt:   row.nominations_open_at as string,
    nominationsCloseAt:  row.nominations_close_at as string,
    votingOpenAt:        row.voting_open_at as string | null,
    votingCloseAt:       row.voting_close_at as string | null,
    winnerId:            row.winner_id as string | null,
    openedBy:            row.opened_by as string,
    closedBy:            row.closed_by as string | null,
    createdAt:           row.created_at as string,
  }
}

export async function getGroupElections(groupId: string): Promise<Election[]> {
  const { data, error } = await db.sacco()
    .from('elections')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) throw { message: error.message }
  return (data ?? []).map((r) => mapElection(r as Record<string, unknown>))
}

export async function getElectionCandidates(
  electionId: string,
): Promise<ElectionCandidate[]> {
  const { data: candidates, error: cErr } = await db.sacco()
    .from('election_candidates')
    .select('*')
    .eq('election_id', electionId)
    .order('created_at')

  if (cErr) throw { message: cErr.message }
  if (!candidates?.length) return []

  const profileIds = candidates.map((c) => (c as Record<string, unknown>).candidate_id as string)
  const { data: profiles, error: pErr } = await db.core()
    .from('profiles')
    .select('id, full_legal_name, preferred_name, avatar_url, credit_score, credit_score_band, kyc_level')
    .in('id', profileIds)

  if (pErr) throw { message: pErr.message }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [(p as Record<string, unknown>).id as string, mapProfileSummary(p as Record<string, unknown>)])
  )

  return candidates.map((c) => {
    const row = c as Record<string, unknown>
    return {
      id:           row.id as string,
      electionId:   row.election_id as string,
      candidateId:  row.candidate_id as string,
      nominatedBy:  row.nominated_by as string,
      accepted:     row.accepted as boolean | null,
      acceptedAt:   row.accepted_at as string | null,
      manifesto:    row.manifesto as string | null,
      withdrew:     row.withdrew as boolean,
      createdAt:    row.created_at as string,
      profile:      profileMap.get(row.candidate_id as string),
    }
  })
}

export async function getMyVote(
  electionId: string,
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await db.sacco()
    .from('election_votes')
    .select('candidate_id')
    .eq('election_id', electionId)
    .eq('voter_id', user.id)
    .maybeSingle()

  if (error) return null
  return (data as Record<string, unknown> | null)?.candidate_id as string | null ?? null
}

export async function openElection(params: {
  groupId: string
  position: 'chair' | 'treasurer' | 'secretary'
  nominationsCloseAt: string
}): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.sacco()
    .from('elections')
    .insert({
      group_id:              params.groupId,
      position:              params.position,
      status:                'nominations_open',
      nominations_open_at:   new Date().toISOString(),
      nominations_close_at:  params.nominationsCloseAt,
      opened_by:             user.id,
    })
    .select('id')
    .single()

  if (error) throw { message: error.message }
  return (data as Record<string, unknown>).id as string
}

export async function nominateCandidate(
  electionId: string,
  candidateId: string,
  manifesto?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('election_candidates')
    .insert({
      election_id:  electionId,
      candidate_id: candidateId,
      nominated_by: user.id,
      manifesto:    manifesto ?? null,
    })

  if (error) throw { message: error.message }
}

export async function acceptNomination(
  electionId: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('election_candidates')
    .update({ accepted: true, accepted_at: new Date().toISOString() })
    .eq('election_id', electionId)
    .eq('candidate_id', user.id)

  if (error) throw { message: error.message }
}

export async function declineNomination(electionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('election_candidates')
    .update({ accepted: false })
    .eq('election_id', electionId)
    .eq('candidate_id', user.id)

  if (error) throw { message: error.message }
}

export async function castVote(
  electionId: string,
  candidateId: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { error } = await db.sacco()
    .from('election_votes')
    .insert({ election_id: electionId, candidate_id: candidateId, voter_id: user.id })

  if (error) throw { message: error.message }
}

export async function openVoting(electionId: string): Promise<void> {
  const { error } = await schemaRpc('sacco', 'open_voting', { p_election_id: electionId })
  if (error) throw { message: error.message }
}

export async function closeElection(electionId: string): Promise<string> {
  const { data, error } = await schemaRpc<string>('sacco', 'close_election', { p_election_id: electionId })
  if (error) throw { message: error.message }
  return data as string
}
