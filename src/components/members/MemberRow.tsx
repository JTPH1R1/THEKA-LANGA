import { useState } from 'react'
import { UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSuspendMember, useReinstateMember } from '@/hooks/useGroupMembers'
import type { GroupMember } from '@/types/domain.types'

const ROLE_COLORS: Record<string, string> = {
  chair:     'border-amber-700 text-amber-400',
  treasurer: 'border-teal-700 text-teal-400',
  secretary: 'border-blue-700 text-blue-400',
  member:    'border-slate-700 text-slate-400',
}

interface MemberRowProps {
  member: GroupMember
  groupId: string
  isOfficer: boolean
  currentUserId: string
}

export function MemberRow({ member, groupId, isOfficer, currentUserId }: MemberRowProps) {
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reinstateOpen, setReinstateOpen] = useState(false)

  const suspend   = useSuspendMember(groupId)
  const reinstate = useReinstateMember(groupId)

  const displayName = member.profile?.preferredName ?? member.profile?.fullLegalName ?? 'Unknown'
  const initials    = displayName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
  const isCurrentUser = member.profileId === currentUserId
  const isSuspended   = member.status === 'suspended'

  async function handleSuspend() {
    try {
      await suspend.mutateAsync(member.profileId)
      toast.success(`${displayName} suspended`)
      setSuspendOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleReinstate() {
    try {
      await reinstate.mutateAsync(member.profileId)
      toast.success(`${displayName} reinstated`)
      setReinstateOpen(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <div className={[
      'flex items-center gap-3 py-3 border-b border-slate-800 last:border-0',
      isSuspended ? 'opacity-50' : '',
    ].join(' ')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-teal-900 text-teal-300 text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">{displayName}</span>
          {isCurrentUser && <span className="text-xs text-slate-500">(you)</span>}
          {isSuspended && <span className="text-xs text-amber-500">suspended</span>}
        </div>
        {member.profile && (
          <p className="text-xs text-slate-500">Score {member.profile.creditScore}</p>
        )}
      </div>

      <Badge
        variant="outline"
        className={`text-xs capitalize shrink-0 ${ROLE_COLORS[member.role] ?? ROLE_COLORS.member}`}
      >
        {member.role}
      </Badge>

      {isOfficer && !isCurrentUser && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-slate-200 shrink-0"
            onClick={() => isSuspended ? setReinstateOpen(true) : setSuspendOpen(true)}
            title={isSuspended ? 'Reinstate' : 'Suspend'}
          >
            {isSuspended ? <UserCheck size={15} /> : <UserX size={15} />}
          </Button>

          <ConfirmDialog
            open={suspendOpen}
            onOpenChange={setSuspendOpen}
            title="Suspend member?"
            description={`${displayName} will lose access to group activities while suspended.`}
            confirmLabel="Suspend"
            destructive
            isPending={suspend.isPending}
            onConfirm={handleSuspend}
          />
          <ConfirmDialog
            open={reinstateOpen}
            onOpenChange={setReinstateOpen}
            title="Reinstate member?"
            description={`${displayName} will regain full active membership.`}
            confirmLabel="Reinstate"
            isPending={reinstate.isPending}
            onConfirm={handleReinstate}
          />
        </>
      )}
    </div>
  )
}
