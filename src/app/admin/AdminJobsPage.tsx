import { AdminNav } from '@/components/admin/AdminNav'
import { useJobLog, useSystemErrors } from '@/hooks/useAdmin'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { formatDateTime } from '@/lib/formatters'

const JOB_STATUS_CONFIG = {
  completed: { icon: CheckCircle,  color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:    { icon: XCircle,      color: 'text-rose-600',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  partial:   { icon: AlertTriangle,color: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  started:   { icon: Loader2,      color: 'text-teal-600',    badge: 'bg-teal-50 text-teal-600 border-teal-200' },
} as const

export function AdminJobsPage() {
  const { data: jobs = [],   isLoading: jobsLoading   } = useJobLog()
  const { data: errors = [], isLoading: errorsLoading } = useSystemErrors()

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Job log */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Edge Function Jobs</h1>
          <p className="text-sm text-slate-400">Recent scheduled and on-demand job executions</p>
        </div>

        <div className="rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Job</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Started</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-right">Duration</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-right">Records</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {jobsLoading && [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
                  </td>
                </tr>
              ))}
              {!jobsLoading && jobs.map((j) => {
                const cfg = JOB_STATUS_CONFIG[j.status] ?? JOB_STATUS_CONFIG.started
                const Icon = cfg.icon
                return (
                  <tr key={j.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-mono text-xs text-slate-800">{j.jobName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className={cfg.color} />
                        <Badge className={`text-xs ${cfg.badge}`}>{j.status}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(j.startedAt)}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400">
                      {j.durationMs != null ? `${j.durationMs}ms` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400">{j.recordsProcessed}</td>
                    <td className="px-4 py-3 text-xs text-rose-600 max-w-xs truncate">{j.errorMessage ?? '—'}</td>
                  </tr>
                )
              })}
              {!jobsLoading && jobs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">No job records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* System errors */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Unresolved System Errors</h2>
          <p className="text-sm text-slate-400">{errorsLoading ? '…' : `${errors.length} open`}</p>
        </div>

        {!errorsLoading && errors.length === 0 && (
          <div className="rounded-xl border border-gray-300 bg-gray-100/20 p-8 text-center">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No unresolved errors</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl border border-rose-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-50 text-left">
                  <th className="px-4 py-3 text-xs text-rose-700/70 font-medium">Source</th>
                  <th className="px-4 py-3 text-xs text-rose-700/70 font-medium">Message</th>
                  <th className="px-4 py-3 text-xs text-rose-700/70 font-medium">Code</th>
                  <th className="px-4 py-3 text-xs text-rose-700/70 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.id} className="border-t border-rose-200">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.source}</td>
                    <td className="px-4 py-3 text-sm text-rose-800 max-w-sm">{e.message}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.errorCode ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
