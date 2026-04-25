import { Link } from 'react-router-dom'
import { Users, Building2, ShieldCheck, AlertTriangle, TrendingUp, ServerCog } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'
import { useAdminStats } from '@/hooks/useAdmin'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { useSystemErrors } from '@/hooks/useAdmin'

function StatCard({ label, value, sub, icon: Icon, to, color = 'text-slate-100' }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; to: string; color?: string
}) {
  return (
    <Link to={to} className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <Icon size={16} className="text-slate-500" />
      </div>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Link>
  )
}

export function AdminPage() {
  const { data: stats, isLoading, isError } = useAdminStats()
  const { data: errors = [] } = useSystemErrors()

  const skeleton = <div className="h-7 w-20 bg-slate-700 animate-pulse rounded" />

  if (!stats && isError) return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Could not load admin stats</p>
        <p className="text-slate-500 text-sm mt-1">Check that your account has system_admin role and the API schemas are exposed in Supabase.</p>
      </div>
    </div>
  )

  return (
    <div>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">System-wide health at a glance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Users"
            value={isLoading ? '—' : (stats?.totalUsers ?? 0)}
            sub={isLoading ? undefined : `${stats?.activeUsers ?? 0} active · ${stats?.blacklistedUsers ?? 0} blacklisted`}
            icon={Users}
            to="/admin/users"
          />
          <StatCard
            label="Groups"
            value={isLoading ? '—' : (stats?.totalGroups ?? 0)}
            sub={isLoading ? undefined : `${stats?.activeGroups ?? 0} active`}
            icon={Building2}
            to="/admin/groups"
          />
          <StatCard
            label="Loan Book"
            value={isLoading ? '—' : formatCurrency(stats?.loanOutstanding ?? 0, 'KES')}
            sub={isLoading ? undefined : `${stats?.totalDefaults ?? 0} defaults`}
            icon={TrendingUp}
            to="/admin/groups"
          />
          <StatCard
            label="KYC Queue"
            value={isLoading ? '—' : (stats?.kycQueueCount ?? 0)}
            sub="pending review"
            icon={ShieldCheck}
            to="/admin/kyc"
            color={(stats?.kycQueueCount ?? 0) > 0 ? 'text-amber-400' : 'text-slate-100'}
          />
          <StatCard
            label="System Errors"
            value={isLoading ? '—' : (stats?.unresolvedErrors ?? 0)}
            sub="unresolved"
            icon={AlertTriangle}
            to="/admin/jobs"
            color={(stats?.unresolvedErrors ?? 0) > 0 ? 'text-rose-400' : 'text-slate-100'}
          />
          <StatCard
            label="Job Monitor"
            value="View logs"
            sub="edge function health"
            icon={ServerCog}
            to="/admin/jobs"
          />
        </div>

        {/* Recent errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-5">
            <h2 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Recent Unresolved Errors
            </h2>
            <div className="space-y-2">
              {errors.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-slate-400 mr-2">[{e.source}]</span>
                    <span className="text-sm text-rose-200">{e.message}</span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{formatDateTime(e.createdAt)}</span>
                </div>
              ))}
            </div>
            {errors.length > 5 && (
              <Link to="/admin/jobs" className="text-xs text-rose-400 hover:underline mt-2 block">
                View all {errors.length} errors →
              </Link>
            )}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
                {skeleton}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
