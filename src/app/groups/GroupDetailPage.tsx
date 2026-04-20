import { useParams, Link, NavLink } from 'react-router-dom'
import { ArrowLeft, Users, BarChart2, CreditCard, Vote, Settings, FileText, ClipboardList } from 'lucide-react'

import { useGroupDetail, useGroupRules } from '@/hooks/useGroups'
import { GroupStatusBadge } from '@/components/groups/GroupStatusBadge'
import { formatCurrency, formatDate } from '@/lib/formatters'

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: BarChart2    },
  { id: 'members',       label: 'Members',       icon: Users        },
  { id: 'contributions', label: 'Contributions', icon: CreditCard   },
  { id: 'loans',         label: 'Loans',         icon: FileText     },
  { id: 'elections',     label: 'Elections',     icon: Vote         },
  { id: 'rules',         label: 'Rules',         icon: Settings     },
  { id: 'reports',       label: 'Reports',       icon: ClipboardList },
] as const

type TabId = typeof TABS[number]['id']

export function GroupDetailPage() {
  const { id: groupId, tab = 'overview' } = useParams<{ id: string; tab?: TabId }>()
  const { data: group, isLoading } = useGroupDetail(groupId ?? '')
  const { data: rules } = useGroupRules(groupId ?? '')

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
      {/* Back */}
      <Link
        to="/groups"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors mb-4"
      >
        <ArrowLeft size={13} /> All groups
      </Link>

      {/* Group header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
                <span>
                  {formatCurrency(rules.contributionAmount, group.currency)} / {rules.contributionFrequency}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
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

      {/* Tab content — phases 7-9 will replace these placeholders */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rules && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Contribution</p>
                <p className="text-lg font-bold text-slate-100">
                  {formatCurrency(rules.contributionAmount, group.currency)}
                </p>
                <p className="text-xs text-slate-500 capitalize">{rules.contributionFrequency}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Loan interest</p>
                <p className="text-lg font-bold text-slate-100">{rules.loanInterestRate}%</p>
                <p className="text-xs text-slate-500 capitalize">{rules.loanInterestType.replace('_', ' ')} / year</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Max loan</p>
                <p className="text-lg font-bold text-slate-100">{rules.maxLoanMultiplier}×</p>
                <p className="text-xs text-slate-500">contributions</p>
              </div>
            </>
          )}
        </div>
      )}

      {tab !== 'overview' && (
        <div className="text-center text-slate-500 text-sm py-12">
          {TABS.find((t) => t.id === tab)?.label} — coming in a future phase
        </div>
      )}
    </div>
  )
}
