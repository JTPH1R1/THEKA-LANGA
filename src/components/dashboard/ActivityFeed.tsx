import { CreditCard, TrendingUp, CheckCircle2, UserPlus, Vote } from 'lucide-react'
import { useActivityFeed } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/formatters'
import type { ActivityEvent } from '@/types/domain.types'

function timeAgo(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1)   return 'just now'
  if (diffMin < 60)  return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)    return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7)     return `${diffD}d ago`
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

const EVENT_CONFIG: Record<string, {
  icon: React.ElementType
  iconClass: string
  label: (e: ActivityEvent) => string
}> = {
  contribution_paid: {
    icon: CreditCard, iconClass: 'text-teal-600 bg-teal-50',
    label: (e) => `${e.actorName} paid ${e.amount != null ? formatCurrency(e.amount, e.currency) : ''} contribution`,
  },
  loan_disbursed: {
    icon: TrendingUp, iconClass: 'text-indigo-600 bg-indigo-50',
    label: (e) => `${e.actorName} received ${e.amount != null ? formatCurrency(e.amount, e.currency) : ''} loan`,
  },
  loan_completed: {
    icon: CheckCircle2, iconClass: 'text-teal-600 bg-teal-50',
    label: (e) => `${e.actorName} fully repaid ${e.amount != null ? formatCurrency(e.amount, e.currency) : ''} loan`,
  },
  member_joined: {
    icon: UserPlus, iconClass: 'text-blue-600 bg-blue-50',
    label: (e) => `${e.actorName} joined the group`,
  },
  election_closed: {
    icon: Vote, iconClass: 'text-amber-600 bg-amber-50',
    label: (e) => `${e.actorName} elected as officer`,
  },
}

interface Props {
  limit?: number
}

export function ActivityFeed({ limit = 15 }: Props) {
  const { data: events = [], isLoading } = useActivityFeed()
  const visible = events.slice(0, limit)

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!visible.length) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No recent activity — activity will appear here as your groups get going.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {visible.map((event, i) => {
        const config = EVENT_CONFIG[event.eventType] ?? EVENT_CONFIG.contribution_paid
        const Icon   = config.icon
        return (
          <div
            key={`${event.eventType}-${event.occurredAt}-${i}`}
            className="flex items-start gap-3 py-3 border-b border-gray-200 last:border-0"
          >
            <div className={`p-1.5 rounded-full shrink-0 mt-0.5 ${config.iconClass}`}>
              <Icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800">{config.label(event)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{event.groupName}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 mt-0.5">
              {timeAgo(event.occurredAt)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
