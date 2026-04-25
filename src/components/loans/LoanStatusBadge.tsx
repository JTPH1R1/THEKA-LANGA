import type { LoanStatus } from '@/types/domain.types'

const CONFIG: Record<LoanStatus, { label: string; className: string }> = {
  applied:      { label: 'Applied',      className: 'bg-gray-100 text-slate-500 border border-gray-300' },
  under_review: { label: 'Under Review', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  approved:     { label: 'Approved',     className: 'bg-teal-50 text-teal-700 border border-teal-200' },
  rejected:     { label: 'Rejected',     className: 'bg-red-50 text-red-700 border border-red-200' },
  disbursed:    { label: 'Disbursed',    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  repaying:     { label: 'Repaying',     className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  completed:    { label: 'Completed',    className: 'bg-teal-50 text-teal-700 border border-teal-200' },
  defaulted:    { label: 'Defaulted',    className: 'bg-red-50 text-red-700 border border-red-200' },
  written_off:  { label: 'Written Off',  className: 'bg-gray-100 text-slate-500 border border-gray-300' },
}

interface Props { status: LoanStatus }

export function LoanStatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status] ?? CONFIG.applied
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
