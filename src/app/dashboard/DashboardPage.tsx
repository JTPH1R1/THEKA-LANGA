import { Link } from 'react-router-dom'
import { ShieldCheck, Users, Wallet, TrendingUp, Calendar, Plus } from 'lucide-react'

import { useMyProfile } from '@/hooks/useProfile'
import { useDashboardKpis, useMyGroupSummaries, useActivityFeed, useNextContributionsDue } from '@/hooks/useDashboard'
import { KycLevelBadge } from '@/components/kyc/KycLevelBadge'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { GroupSummaryCard } from '@/components/dashboard/GroupSummaryCard'
import { Badge } from '@/components/ui/badge'
import { KYC_LEVEL_LABELS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/formatters'

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, linkTo, loading = false,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  linkTo?: string
  loading?: boolean
}) {
  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start justify-between hover:border-slate-700 transition-colors">
      <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-800 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
        )}
        {sub && !loading && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-slate-800">
        <Icon size={18} className="text-teal-400" />
      </div>
    </div>
  )
  return linkTo ? <Link to={linkTo}>{content}</Link> : content
}

// ─── Next contributions due ───────────────────────────────────────────────────

function NextContributionsDue() {
  const { data: due = [], isLoading } = useNextContributionsDue()

  if (isLoading || !due.length) return null

  return (
    <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-amber-400" />
        <h3 className="text-xs font-medium text-amber-300">Upcoming contributions</h3>
      </div>
      <div className="space-y-2">
        {due.map((item) => (
          <Link
            key={item.groupId}
            to={`/groups/${item.groupId}/contributions`}
            className="flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div>
              <p className="text-sm text-slate-200">{item.groupName}</p>
              <p className="text-xs text-slate-500">Due {formatDate(item.dueDate)}</p>
            </div>
            <p className="text-sm font-semibold text-amber-300 tabular-nums">
              {formatCurrency(item.expectedAmount, item.currency)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: profile } = useMyProfile()
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis()
  const { data: groupSummaries = [], isLoading: groupsLoading } = useMyGroupSummaries()
  const { data: feed = [] } = useActivityFeed()

  const displayName = profile?.preferredName ?? profile?.fullLegalName ?? ''

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100">
          Welcome back{displayName ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Here's your financial snapshot</p>
      </div>

      {/* KYC upgrade prompt */}
      {profile && profile.kycLevel < 2 && (
        <Link
          to="/kyc"
          className="flex items-center gap-3 bg-teal-950/40 border border-teal-800/50 rounded-xl p-4 mb-6 hover:bg-teal-950/60 transition-colors"
        >
          <ShieldCheck size={20} className="text-teal-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-teal-300">Complete identity verification</p>
            <p className="text-xs text-teal-500 mt-0.5">
              {profile.kycLevel === 0
                ? 'Verify your phone and personal details to join groups'
                : 'Submit your ID documents to apply for loans'}
            </p>
          </div>
          <span className="ml-auto text-teal-400 text-xs">→</span>
        </Link>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="My groups"
          value={kpis ? String(kpis.groupCount) : '—'}
          sub={kpis?.groupCount === 0 ? 'Join a group to start' : `${kpis?.groupCount} active`}
          icon={Users}
          linkTo="/groups"
          loading={kpisLoading}
        />
        <KpiCard
          label="Total savings"
          value={kpis ? formatCurrency(kpis.totalContributed, 'KES') : '—'}
          sub="Across all groups"
          icon={Wallet}
          linkTo="/groups"
          loading={kpisLoading}
        />
        <KpiCard
          label="Loan outstanding"
          value={kpis ? (kpis.loanOutstanding > 0 ? formatCurrency(kpis.loanOutstanding, 'KES') : 'None') : '—'}
          sub={kpis ? `${kpis.activeLoans} active loan${kpis.activeLoans !== 1 ? 's' : ''}` : undefined}
          icon={TrendingUp}
          loading={kpisLoading}
        />
        <KpiCard
          label="Credit score"
          value={profile ? String(profile.creditScore) : '—'}
          sub={profile ? `${profile.creditScoreBand.replace('_', ' ')} · ${KYC_LEVEL_LABELS[profile.kycLevel]}` : undefined}
          icon={ShieldCheck}
          linkTo="/kyc"
        />
      </div>

      {/* Next contributions due */}
      <div className="mb-6">
        <NextContributionsDue />
      </div>

      {/* Two-column layout: Groups + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My groups */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">My groups</h2>
            <Link
              to="/groups/new"
              className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Plus size={12} /> New group
            </Link>
          </div>

          {groupsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl" />)}
            </div>
          ) : !groupSummaries.length ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <Users size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">You haven't joined any groups yet.</p>
              <Link to="/groups" className="text-xs text-teal-400 hover:underline mt-1 block">
                Discover groups →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groupSummaries.map((s) => (
                <GroupSummaryCard key={s.groupId} summary={s} />
              ))}
              <Link
                to="/groups"
                className="block text-center text-xs text-slate-400 hover:text-teal-400 transition-colors py-2"
              >
                View all groups →
              </Link>
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">Recent activity</h2>
            {feed.length > 0 && (
              <span className="text-xs text-slate-500">{feed.length} events</span>
            )}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-1">
            <ActivityFeed limit={12} />
          </div>
        </div>
      </div>

      {/* Profile strip */}
      {profile && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Your account</p>
              <p className="text-base font-semibold text-slate-100">{displayName}</p>
              <p className="text-sm text-slate-400">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <KycLevelBadge level={profile.kycLevel} size="sm" />
                <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                  Score {profile.creditScore}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs capitalize">
                  {profile.systemRole}
                </Badge>
              </div>
            </div>
            <Link to="/profile/edit" className="text-xs text-slate-400 hover:text-teal-400 transition-colors">
              Edit profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
