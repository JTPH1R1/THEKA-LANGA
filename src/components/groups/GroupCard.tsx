import { Link } from 'react-router-dom'
import { Users, Lock, Globe } from 'lucide-react'

import { GroupStatusBadge } from '@/components/groups/GroupStatusBadge'
import type { GroupWithMeta } from '@/types/domain.types'

interface GroupCardProps {
  group: GroupWithMeta
  showRole?: boolean
}

export function GroupCard({ group, showRole = false }: GroupCardProps) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {group.type === 'private' ? (
              <Lock size={13} className="text-slate-500 shrink-0" />
            ) : (
              <Globe size={13} className="text-slate-500 shrink-0" />
            )}
            <h3 className="text-sm font-semibold text-slate-100 truncate">{group.name}</h3>
          </div>
          {group.description && (
            <p className="text-xs text-slate-400 line-clamp-2">{group.description}</p>
          )}
        </div>
        <GroupStatusBadge status={group.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={11} />
          {group.memberCount !== undefined ? `${group.memberCount} members` : 'Members'}
        </span>
        <span>{group.currency}</span>
        {showRole && group.myRole && (
          <span className="ml-auto capitalize text-teal-400 font-medium">{group.myRole}</span>
        )}
      </div>
    </Link>
  )
}
