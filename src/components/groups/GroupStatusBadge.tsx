import { cn } from '@/lib/utils'
import type { GroupStatus } from '@/types/domain.types'

const CONFIG: Record<GroupStatus, { label: string; className: string }> = {
  forming:  { label: 'Forming',  className: 'border-blue-800 bg-blue-900/20 text-blue-400'    },
  active:   { label: 'Active',   className: 'border-teal-800 bg-teal-900/20 text-teal-400'    },
  frozen:   { label: 'Frozen',   className: 'border-amber-800 bg-amber-900/20 text-amber-400' },
  closed:   { label: 'Closed',   className: 'border-slate-700 bg-slate-800/50 text-slate-400' },
}

interface GroupStatusBadgeProps {
  status: GroupStatus
  className?: string
}

export function GroupStatusBadge({ status, className }: GroupStatusBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.closed
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  )
}
