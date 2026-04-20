import type { LoanStatus } from '@/types/domain.types'

const CONFIG: Record<LoanStatus, { label: string; className: string }> = {
  applied:      { label: 'Applied',      className: 'bg-slate-800 text-slate-400 border border-slate-700' },
  under_review: { label: 'Under Review', className: 'bg-blue-900/60 text-blue-300 border border-blue-800' },
  approved:     { label: 'Approved',     className: 'bg-teal-900/60 text-teal-300 border border-teal-800' },
  rejected:     { label: 'Rejected',     className: 'bg-red-900/60 text-red-300 border border-red-800' },
  disbursed:    { label: 'Disbursed',    className: 'bg-indigo-900/60 text-indigo-300 border border-indigo-800' },
  repaying:     { label: 'Repaying',     className: 'bg-blue-900/60 text-blue-300 border border-blue-800' },
  completed:    { label: 'Completed',    className: 'bg-teal-900/60 text-teal-300 border border-teal-800' },
  defaulted:    { label: 'Defaulted',    className: 'bg-red-900/60 text-red-300 border border-red-800' },
  written_off:  { label: 'Written Off',  className: 'bg-slate-800 text-slate-500 border border-slate-700' },
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
