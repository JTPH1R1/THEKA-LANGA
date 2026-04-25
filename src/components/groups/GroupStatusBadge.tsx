import { cn } from '@/lib/utils'
import type { GroupStatus } from '@/types/domain.types'

const CONFIG: Record<GroupStatus, { label: string; className: string }> = {
  forming:  { label: 'Forming',  className: 'border-blue-200 bg-blue-50 text-blue-700'    },
  active:   { label: 'Active',   className: 'border-teal-200 bg-teal-50 text-teal-700'    },
  frozen:   { label: 'Frozen',   className: 'border-amber-200 bg-amber-50 text-amber-700' },
  closed:   { label: 'Closed',   className: 'border-gray-200 bg-gray-50 text-slate-500'   },
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
