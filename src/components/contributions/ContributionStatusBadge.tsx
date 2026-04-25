import type { ContributionStatus } from '@/types/domain.types'

const CONFIG: Record<ContributionStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-gray-100 text-slate-500 border border-gray-300' },
  paid:      { label: 'Paid',      className: 'bg-teal-50 text-teal-700 border border-teal-200' },
  partial:   { label: 'Partial',   className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  late:      { label: 'Late',      className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  waived:    { label: 'Waived',    className: 'bg-purple-50 text-purple-700 border border-purple-200' },
  defaulted: { label: 'Defaulted', className: 'bg-red-50 text-red-700 border border-red-200' },
  reversed:  { label: 'Reversed',  className: 'bg-gray-100 text-slate-500 border border-gray-300 line-through' },
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
