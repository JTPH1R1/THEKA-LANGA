import { Link } from 'react-router-dom'
import { ShieldCheck, Users, Wallet, TrendingUp } from 'lucide-react'

import { useMyProfile } from '@/hooks/useProfile'
import { Badge } from '@/components/ui/badge'
import { KYC_LEVEL_LABELS } from '@/lib/constants'
import { KycLevelBadge } from '@/components/kyc/KycLevelBadge'

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  linkTo,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  linkTo?: string
}) {
  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start justify-between hover:border-slate-700 transition-colors">
      <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-slate-800">
        <Icon size={18} className="text-teal-400" />
      </div>
    </div>
  )
  return linkTo ? <Link to={linkTo}>{content}</Link> : content
}

export function DashboardPage() {
  const { data: profile } = useMyProfile()

  const displayName = profile?.preferredName ?? profile?.fullLegalName ?? ''

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
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
            <p className="text-sm font-medium text-teal-300">
              Complete identity verification
            </p>
            <p className="text-xs text-teal-500 mt-0.5">
              {profile.kycLevel === 0
                ? 'Verify your phone and personal details to join groups'
                : 'Submit your ID documents to apply for loans'}
            </p>
          </div>
          <span className="ml-auto text-teal-400 text-xs">→</span>
        </Link>
      )}

      {/* KPI grid — Phase 10 will populate with real data from materialized views */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="My groups"    value="—"  sub="Join a group to start"    icon={Users}     linkTo="/groups"  />
        <KpiCard label="Total savings" value="—" sub="Across all groups"        icon={Wallet}    linkTo="/groups"  />
        <KpiCard label="Active loans"  value="—" sub="Outstanding balance"      icon={TrendingUp} />
        <KpiCard
          label="Credit score"
          value={profile ? String(profile.creditScore) : '—'}
          sub={profile ? KYC_LEVEL_LABELS[profile.kycLevel] : undefined}
          icon={ShieldCheck}
          linkTo="/kyc"
        />
      </div>

      {/* Profile status card */}
      {profile && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
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
            <Link
              to="/profile/edit"
              className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
            >
              Edit profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
