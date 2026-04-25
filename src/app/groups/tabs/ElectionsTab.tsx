import { useState } from 'react'
import { toast } from 'sonner'
import { Vote, Crown, ChevronDown } from 'lucide-react'

import {
  useGroupElections,
  useElectionCandidates,
  useMyVote,
  useOpenElection,
  useNominateCandidate,
  useAcceptNomination,
  useDeclineNomination,
  useCastVote,
  useOpenVoting,
  useCloseElection,
} from '@/hooks/useElections'
import { useSession } from '@/hooks/useSession'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/formatters'
import type { Election, ElectionCandidate, GroupMember } from '@/types/domain.types'

const POSITION_LABELS: Record<string, string> = {
  chair: 'Chairperson',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
}

function ElectionCard({
  election,
  groupId,
  myMembership,
}: {
  election: Election
  groupId: string
  myMembership: GroupMember | null
}) {
  const { user } = useSession()
  const [expanded, setExpanded]      = useState(election.status !== 'closed')
  const [nominateOpen, setNominateOpen] = useState(false)
  const [voteTarget, setVoteTarget]  = useState<ElectionCandidate | null>(null)
  const [closeOpen, setCloseOpen]    = useState(false)
  const [openVotingOpen, setOpenVotingOpen] = useState(false)

  const isChair = myMembership?.role === 'chair'
  const isMember = !!myMembership && myMembership.status === 'active'

  const { data: candidates = [] } = useElectionCandidates(election.id)
  const { data: myVotedCandidateId } = useMyVote(election.id)

  const nominate   = useNominateCandidate(election.id, groupId)
  const accept     = useAcceptNomination(election.id, groupId)
  const decline    = useDeclineNomination(election.id, groupId)
  const castVote   = useCastVote(election.id, groupId)
  const openVoting = useOpenVoting(election.id, groupId)
  const close      = useCloseElection(election.id, groupId)

  const myNomination = candidates.find((c) => c.candidateId === user?.id)
  const hasVoted     = !!myVotedCandidateId

  const accepted = candidates.filter((c) => c.accepted && !c.withdrew)
  const pending  = candidates.filter((c) => c.accepted === null && !c.withdrew)

  const statusColors: Record<string, string> = {
    nominations_open: 'text-blue-600',
    voting_open:      'text-teal-600',
    closed:           'text-slate-400',
    cancelled:        'text-red-400',
  }

  async function handleNominateSelf() {
    try {
      await nominate.mutateAsync({ candidateId: user!.id })
      toast.success('You have been nominated')
      setNominateOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleAccept() {
    try {
      await accept.mutateAsync()
      toast.success('Nomination accepted')
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleVote() {
    if (!voteTarget) return
    try {
      await castVote.mutateAsync(voteTarget.id)
      toast.success(`Vote cast for ${voteTarget.profile?.preferredName ?? voteTarget.profile?.fullLegalName ?? 'candidate'}`)
      setVoteTarget(null)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleOpenVoting() {
    try {
      await openVoting.mutateAsync()
      toast.success('Voting is now open')
      setOpenVotingOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleClose() {
    try {
      await close.mutateAsync()
      toast.success('Election closed — winner assigned')
      setCloseOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  const winnerProfile = election.winnerId
    ? candidates.find((c) => c.candidateId === election.winnerId)?.profile
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {POSITION_LABELS[election.position]} Election
            </span>
            <span className={`text-xs font-medium ${statusColors[election.status] ?? 'text-slate-400'}`}>
              {election.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {election.status === 'nominations_open' && `Nominations close ${formatDate(election.nominationsCloseAt)}`}
            {election.status === 'voting_open'      && `Voting open — ${accepted.length} candidates`}
            {election.status === 'closed'           && `Winner: ${winnerProfile?.preferredName ?? winnerProfile?.fullLegalName ?? '—'}`}
          </p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">

          {/* Candidates */}
          <div className="space-y-2 pt-3">
            {accepted.length === 0 && pending.length === 0 && (
              <p className="text-xs text-slate-400">No candidates yet.</p>
            )}
            {[...accepted, ...pending].map((c) => {
              const name = c.profile?.preferredName ?? c.profile?.fullLegalName ?? 'Unknown'
              const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
              const isWinner = election.winnerId === c.candidateId
              const myVoteHere = myVotedCandidateId === c.id

              return (
                <div key={c.id} className="flex items-center gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-gray-200 text-slate-700 text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-800">{name}</span>
                      {isWinner && <Crown size={13} className="text-amber-600" />}
                      {c.accepted === null && <span className="text-xs text-amber-600">pending acceptance</span>}
                      {myVoteHere && <span className="text-xs text-teal-600">✓ your vote</span>}
                    </div>
                  </div>
                  {election.status === 'voting_open' && isMember && !hasVoted && c.accepted && !c.withdrew && (
                    <Button
                      size="sm"
                      onClick={() => setVoteTarget(c)}
                      className="h-7 px-3 bg-teal-700 hover:bg-teal-600 text-white text-xs"
                    >
                      Vote
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Nominate self */}
            {election.status === 'nominations_open' && isMember && !myNomination && (
              <Button
                size="sm"
                onClick={() => setNominateOpen(true)}
                className="h-7 px-3 bg-gray-200 hover:text-slate-500 text-slate-800 text-xs"
              >
                Nominate myself
              </Button>
            )}

            {/* Accept / decline own nomination */}
            {election.status === 'nominations_open' && myNomination?.accepted === null && (
              <>
                <Button size="sm" onClick={handleAccept} disabled={accept.isPending}
                  className="h-7 px-3 bg-teal-700 hover:bg-teal-600 text-white text-xs">
                  Accept nomination
                </Button>
                <Button size="sm" variant="ghost" onClick={() => decline.mutate()}
                  className="h-7 px-3 text-red-400 hover:text-red-300 text-xs">
                  Decline
                </Button>
              </>
            )}

            {/* Chair: open voting */}
            {election.status === 'nominations_open' && isChair && (
              <Button size="sm" onClick={() => setOpenVotingOpen(true)}
                className="h-7 px-3 bg-blue-700 hover:bg-blue-600 text-white text-xs">
                Open voting
              </Button>
            )}

            {/* Chair: close election */}
            {election.status === 'voting_open' && isChair && (
              <Button size="sm" onClick={() => setCloseOpen(true)}
                className="h-7 px-3 bg-amber-700 hover:bg-amber-600 text-white text-xs">
                Close election
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={nominateOpen} onOpenChange={setNominateOpen}
        title="Nominate yourself?"
        description={`You will be added as a candidate for ${POSITION_LABELS[election.position]}.`}
        confirmLabel="Nominate me"
        isPending={nominate.isPending}
        onConfirm={handleNominateSelf}
      />
      <ConfirmDialog
        open={!!voteTarget} onOpenChange={(v) => !v && setVoteTarget(null)}
        title="Confirm your vote"
        description={`Vote for ${voteTarget?.profile?.preferredName ?? voteTarget?.profile?.fullLegalName ?? 'this candidate'}? You cannot change your vote.`}
        confirmLabel="Cast vote"
        isPending={castVote.isPending}
        onConfirm={handleVote}
      />
      <ConfirmDialog
        open={openVotingOpen} onOpenChange={setOpenVotingOpen}
        title="Open voting?"
        description="Nominations will close and members will be able to cast their votes."
        confirmLabel="Open voting"
        isPending={openVoting.isPending}
        onConfirm={handleOpenVoting}
      />
      <ConfirmDialog
        open={closeOpen} onOpenChange={setCloseOpen}
        title="Close election?"
        description="The candidate with the most votes will be assigned the position. This cannot be undone."
        confirmLabel="Close & assign winner"
        destructive
        isPending={close.isPending}
        onConfirm={handleClose}
      />
    </div>
  )
}

interface OpenElectionFormProps {
  groupId: string
  onDone: () => void
}

function OpenElectionForm({ groupId, onDone }: OpenElectionFormProps) {
  const [position, setPosition] = useState<'chair' | 'treasurer' | 'secretary'>('chair')
  const [closeDate, setCloseDate] = useState('')
  const open = useOpenElection(groupId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!closeDate) return
    try {
      await open.mutateAsync({ position, nominationsCloseAt: new Date(closeDate).toISOString() })
      toast.success('Election opened')
      onDone()
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-medium text-slate-800">Open new election</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-700">Position</Label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as typeof position)}
            className="w-full rounded-md bg-gray-100 border border-gray-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="chair">Chairperson</option>
            <option value="treasurer">Treasurer</option>
            <option value="secretary">Secretary</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700">Nominations close</Label>
          <Input
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="bg-gray-100 border-gray-300 text-slate-900 focus-visible:ring-teal-500"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={open.isPending || !closeDate}
          className="bg-teal-600 hover:bg-teal-500 text-white text-sm">
          {open.isPending ? 'Opening…' : 'Open election'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}
          className="text-slate-400 hover:text-slate-800 text-sm">
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface ElectionsTabProps {
  groupId: string
  myMembership: GroupMember | null
}

export function ElectionsTab({ groupId, myMembership }: ElectionsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const { data: elections = [], isLoading } = useGroupElections(groupId)
  const isChair = myMembership?.role === 'chair'

  return (
    <div className="space-y-4">
      {isChair && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white gap-2"
        >
          <Vote size={15} /> Open new election
        </Button>
      )}

      {showForm && <OpenElectionForm groupId={groupId} onDone={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl" />)}
        </div>
      ) : !elections.length ? (
        <EmptyState icon={Vote} title="No elections yet" description="The group chair can open elections for officer positions." />
      ) : (
        elections.map((el) => (
          <ElectionCard key={el.id} election={el} groupId={groupId} myMembership={myMembership} />
        ))
      )}
    </div>
  )
}
