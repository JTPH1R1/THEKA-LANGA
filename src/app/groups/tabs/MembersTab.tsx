import { useState } from 'react'
import { toast } from 'sonner'
import { Users, CheckCircle2, XCircle } from 'lucide-react'

import { useGroupMembers, useJoinRequests, useApproveJoinRequest, useDenyJoinRequest } from '@/hooks/useGroupMembers'
import { MemberRow } from '@/components/members/MemberRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/formatters'
import type { GroupMember } from '@/types/domain.types'

interface MembersTabProps {
  groupId: string
  myMembership: GroupMember | null
  currentUserId: string
}

export function MembersTab({ groupId, myMembership, currentUserId }: MembersTabProps) {
  const isOfficer = myMembership?.role === 'chair' || myMembership?.role === 'treasurer' || myMembership?.role === 'secretary'

  const { data: members = [], isLoading } = useGroupMembers(groupId)
  const { data: requests = [] } = useJoinRequests(groupId)
  const approve = useApproveJoinRequest(groupId)
  const deny    = useDenyJoinRequest(groupId)

  const [, setDenyingId] = useState<string | null>(null)

  async function handleApprove(requestId: string, name: string) {
    try {
      await approve.mutateAsync(requestId)
      toast.success(`${name} approved`)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  async function handleDeny(requestId: string) {
    try {
      await deny.mutateAsync({ requestId, reason: 'Declined by officer' })
      setDenyingId(null)
      toast.success('Request denied')
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Join request queue — officers only */}
      {isOfficer && requests.length > 0 && (
        <div className="bg-slate-900 border border-amber-800/40 rounded-xl p-5">
          <h3 className="text-sm font-medium text-amber-400 mb-4">
            Join requests ({requests.length})
          </h3>
          <div className="space-y-3">
            {requests.map((req) => {
              const name = req.requesterProfile?.preferredName ?? req.requesterProfile?.fullLegalName ?? 'Unknown'
              const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
              return (
                <div key={req.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
                    {req.message && <p className="text-xs text-slate-400 truncate">{req.message}</p>}
                    <p className="text-xs text-slate-500">{formatDate(req.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req.id, name)}
                      disabled={approve.isPending}
                      className="h-7 px-2 bg-teal-700 hover:bg-teal-600 text-white gap-1 text-xs"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeny(req.id)}
                      disabled={deny.isPending}
                      className="h-7 px-2 text-red-400 hover:text-red-300 gap-1 text-xs"
                    >
                      <XCircle size={13} /> Deny
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4">
          Members ({members.length})
        </h3>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-800 rounded" />)}
          </div>
        ) : !members.length ? (
          <EmptyState icon={Users} title="No members yet" />
        ) : (
          members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              groupId={groupId}
              isOfficer={isOfficer}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}
