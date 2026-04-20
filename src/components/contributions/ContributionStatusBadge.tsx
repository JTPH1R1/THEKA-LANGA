import type { ContributionStatus } from '@/types/domain.types'

const CONFIG: Record<ContributionStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-slate-800 text-slate-400 border border-slate-700' },
  paid:      { label: 'Paid',      className: 'bg-teal-900/60 text-teal-300 border border-teal-800' },
  partial:   { label: 'Partial',   className: 'bg-blue-900/60 text-blue-300 border border-blue-800' },
  late:      { label: 'Late',      className: 'bg-amber-900/60 text-amber-300 border border-amber-800' },
  waived:    { label: 'Waived',    className: 'bg-purple-900/60 text-purple-300 border border-purple-800' },
  defaulted: { label: 'Defaulted', className: 'bg-red-900/60 text-red-300 border border-red-800' },
  reversed:  { label: 'Reversed',  className: 'bg-slate-800 text-slate-500 border border-slate-700 line-through' },
}

interface Props {
  status: ContributionStatus
}

export function ContributionStatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status] ?? CONFIG.pending
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
