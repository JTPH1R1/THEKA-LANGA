import { useState } from 'react'
import { useParams, Link, NavLink } from 'react-router-dom'
import {
  ArrowLeft, Users, BarChart2, CreditCard, Vote,
  Settings, FileText, ClipboardList, LogIn, LogOut,
} from 'lucide-react'
import { toast } from 'sonner'

import { useGroupDetail, useGroupRules } from '@/hooks/useGroups'
import { useMyMembership, useRequestToJoin, useWithdrawJoinRequest, useExitGroup, useMyJoinRequest } from '@/hooks/useGroupMembers'
import { useSession } from '@/hooks/useSession'
import { GroupStatusBadge } from '@/components/groups/GroupStatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { MembersTab } from '@/app/groups/tabs/MembersTab'
import { ElectionsTab } from '@/app/groups/tabs/ElectionsTab'
import { ContributionsTab } from '@/app/groups/tabs/ContributionsTab'
import { formatCurrency, formatDate } from '@/lib/formatters'

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: BarChart2     },
  { id: 'members',       label: 'Members',       icon: Users         },
  { id: 'contributions', label: 'Contributions', icon: CreditCard    },
  { id: 'loans',         label: 'Loans',         icon: FileText      },
  { id: 'elections',     label: 'Elections',     icon: Vote          },
  { id: 'rules',         label: 'Rules',         icon: Settings      },
  { id: 'reports',       label: 'Reports',       icon: ClipboardList },
] as const

type TabId = typeof TABS[number]['id']

export function GroupDetailPage() {
  const { id: groupId, tab = 'overview' } = useParams<{ id: string; tab?: TabId }>()
  const { user } = useSession()

  const { data: group, isLoading } = useGroupDetail(groupId ?? '')
  const { data: rules } = useGroupRules(groupId ?? '')
  const { data: myMembership } = useMyMembership(groupId ?? '')
  const { data: myJoinRequest } = useMyJoinRequest(groupId ?? '')

  const requestToJoin = useRequestToJoin(groupId ?? '')
  const withdraw      = useWithdrawJoinRequest(groupId ?? '')
  const exitGroup     = useExitGroup(groupId ?? '')

  const [joinMessage, setJoinMessage] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)

  const isActiveMember = myMembership?.status === 'active'
  const hasPendingRequest = myJoinRequest?.status === 'pending'
  const canJoin = !isActiveMember && !hasPendingRequest && group?.status === 'active'

  async function handleJoinRequest() {
    try {
      await requestToJoin.mutateAsync(joinMessage || undefined)
      toast.success('Join request sent')
      setShowJoinForm(false)
      setJoinMessage('')
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleWithdraw() {
    if (!myJoinRequest) return
    try {
      await withdraw.mutateAsync(myJoinRequest.id)
      toast.success('Request withdrawn')
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleExit() {
    try {
      await exitGroup.mutateAsync()
      toast.success('You have left the group')
      setExitOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-48 mb-4" />
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-6 text-center text-slate-500">
        Group not found.{' '}
        <Link to="/groups" className="text-teal-400 hover:underline">Back to groups</Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <Link to="/groups" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors mb-4">
        <ArrowLeft size={13} /> All groups
      </Link>

      {/* Group header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-slate-100">{group.name}</h1>
              <GroupStatusBadge status={group.status} />
            </div>
            {group.description && (
              <p className="text-sm text-slate-400 mb-2">{group.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>{group.currency} · {group.timezone.split('/')[1]?.replace('_', ' ') ?? group.timezone}</span>
              {group.cycleStart && (
                <span>Cycle: {formatDate(group.cycleStart)} → {group.cycleEnd ? formatDate(group.cycleEnd) : 'ongoing'}</span>
              )}
              {rules && (
                <span>{formatCurrency(rules.contributionAmount, group.currency)} / {rules.contributionFrequency}</span>
              )}
            </div>
          </div>

          {/* Join / exit actions */}
          <div className="shrink-0">
            {isActiveMember && myMembership?.role === 'member' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExitOpen(true)}
                className="text-red-400 hover:text-red-300 gap-1.5 text-xs"
              >
                <LogOut size={13} /> Leave group
              </Button>
            )}
            {hasPendingRequest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWithdraw}
                disabled={withdraw.isPending}
                className="text-amber-400 hover:text-amber-300 gap-1.5 text-xs"
              >
                Withdraw request
              </Button>
            )}
            {canJoin && !showJoinForm && (
              <Button
                size="sm"
                onClick={() => setShowJoinForm(true)}
                className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5 text-xs"
              >
                <LogIn size={13} /> Request to join
              </Button>
            )}
          </div>
        </div>

        {/* Join request form */}
        {showJoinForm && (
          <div className="mt-4 border-t border-slate-800 pt-4 space-y-3">
            <textarea
              rows={2}
              placeholder="Optional message to the group officers…"
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 px-3 py-2 text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleJoinRequest}
                disabled={requestToJoin.isPending}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {requestToJoin.isPending ? 'Sending…' : 'Send request'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowJoinForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {hasPendingRequest && (
          <p className="mt-3 text-xs text-amber-400/80 border-t border-slate-800 pt-3">
            Your join request is pending review by the group officers.
          </p>
        )}
      </div>

      {/* Tab nav (only show full tabs to members) */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 border-b border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <NavLink
            key={id}
            to={id === 'overview' ? `/groups/${groupId}` : `/groups/${groupId}/${id}`}
            end={id === 'overview'}
            className={({ isActive }) =>
              [
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-teal-500 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              ].join(' ')
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rules && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Contribution</p>
                <p className="text-xl font-bold text-slate-100">{formatCurrency(rules.contributionAmount, group.currency)}</p>
                <p className="text-xs text-slate-500 capitalize">{rules.contributionFrequency}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Loan interest</p>
                <p className="text-xl font-bold text-slate-100">{rules.loanInterestRate}%</p>
                <p className="text-xs text-slate-500 capitalize">{rules.loanInterestType.replace('_', ' ')} / year</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Max loan</p>
                <p className="text-xl font-bold text-slate-100">{rules.maxLoanMultiplier}×</p>
                <p className="text-xs text-slate-500">total contributions</p>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'members' && (
        <MembersTab
          groupId={groupId ?? ''}
          myMembership={myMembership ?? null}
          currentUserId={user?.id ?? ''}
        />
      )}

      {tab === 'elections' && (
        <ElectionsTab groupId={groupId ?? ''} myMembership={myMembership ?? null} />
      )}

      {tab === 'contributions' && (
        <ContributionsTab
          groupId={groupId ?? ''}
          currency={group.currency}
          myMembership={myMembership ?? null}
        />
      )}

      {(tab === 'loans' || tab === 'rules' || tab === 'reports') && (
        <div className="text-center text-slate-500 text-sm py-12">
          {TABS.find((t) => t.id === tab)?.label} — coming in a future phase
        </div>
      )}

      {/* Exit group dialog */}
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="Leave this group?"
        description="You will lose access to group data. You may request to rejoin if the group allows it."
        confirmLabel="Leave group"
        destructive
        isPending={exitGroup.isPending}
        onConfirm={handleExit}
      />
    </div>
  )
}
