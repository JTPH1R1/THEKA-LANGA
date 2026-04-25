import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { GroupStatusBadge } from '@/components/groups/GroupStatusBadge'
import { formatCurrency } from '@/lib/formatters'
import type { GroupSummaryRow } from '@/types/domain.types'

const ROLE_COLORS: Record<string, string> = {
  chair:     'text-amber-600',
  treasurer: 'text-teal-600',
  secretary: 'text-blue-600',
  member:    'text-slate-400',
}

interface Props {
  summary: GroupSummaryRow
}

export function GroupSummaryCard({ summary }: Props) {
  return (
    <Link
      to={`/groups/${summary.groupId}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{summary.name}</h3>
          {summary.myRole && (
            <span className={`text-xs capitalize ${ROLE_COLORS[summary.myRole] ?? ROLE_COLORS.member}`}>
              {summary.myRole}
            </span>
          )}
        </div>
        <GroupStatusBadge status={summary.status as 'forming' | 'active' | 'frozen' | 'closed'} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-slate-400">My savings</p>
          <p className="text-sm font-semibold text-teal-700 tabular-nums">
            {summary.myContributed != null
              ? formatCurrency(summary.myContributed, summary.currency)
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">My loan</p>
          <p className={`text-sm font-semibold tabular-nums ${(summary.myLoanOutstanding ?? 0) > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {(summary.myLoanOutstanding ?? 0) > 0
              ? formatCurrency(summary.myLoanOutstanding!, summary.currency)
              : 'None'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Members</p>
          <p className="text-sm text-slate-700 flex items-center gap-1">
            <Users size={11} /> {summary.activeMembers}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Loan book</p>
          <p className="text-sm text-slate-700 tabular-nums">
            {formatCurrency(summary.activeLoanBook, summary.currency)}
          </p>
        </div>
      </div>

      {summary.totalDefaults > 0 && (
        <p className="text-xs text-red-400 mt-2">{summary.totalDefaults} default{summary.totalDefaults > 1 ? 's' : ''}</p>
      )}
    </Link>
  )
}
