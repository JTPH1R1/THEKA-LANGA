import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Lock, ShieldCheck } from 'lucide-react'

import { useMyKycProfile } from '@/hooks/useKyc'
import { useMyProfile } from '@/hooks/useProfile'
import { KycLevelBadge } from '@/components/kyc/KycLevelBadge'
import { Level1Step } from '@/components/kyc/steps/Level1Step'
import { Level2Step } from '@/components/kyc/steps/Level2Step'
import { Level3Step } from '@/components/kyc/steps/Level3Step'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SectionHeader({
  level,
  title,
  subtitle,
  state,
}: {
  level: number
  title: string
  subtitle: string
  state: 'active' | 'complete' | 'pending_review' | 'locked'
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Level {level}
          </span>
          {state === 'complete' && (
            <span className="flex items-center gap-1 text-xs text-teal-400">
              <CheckCircle2 size={12} /> Verified
            </span>
          )}
          {state === 'pending_review' && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Clock size={12} /> Under review
            </span>
          )}
          {state === 'locked' && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Lock size={12} /> Locked
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

export function KycWizardPage() {
  const { data: kycProfile, isLoading: kycLoading } = useMyKycProfile()
  const { data: profile, isLoading: profileLoading } = useMyProfile()

  const isLoading = kycLoading || profileLoading

  const kycLevel = profile?.kycLevel ?? 0
  const verificationStatus = kycProfile?.verificationStatus ?? 'unverified'

  // Determine section states
  const l1State: 'active' | 'complete' | 'pending_review' | 'locked' =
    kycLevel >= 1 ? 'complete' : 'active'

  const l2State: 'active' | 'complete' | 'pending_review' | 'locked' =
    kycLevel >= 2
      ? 'complete'
      : kycLevel >= 1 && verificationStatus === 'pending_review'
        ? 'pending_review'
        : kycLevel >= 1
          ? 'active'
          : 'locked'

  const l3State: 'active' | 'complete' | 'pending_review' | 'locked' =
    kycLevel >= 3
      ? 'complete'
      : kycLevel >= 2 && verificationStatus === 'pending_review'
        ? 'pending_review'
        : kycLevel >= 2
          ? 'active'
          : 'locked'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-sm">Loading verification status…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-teal-400" />
              <h1 className="text-xl font-bold text-slate-100">Identity Verification</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete all levels to unlock full platform features
            </p>
          </div>
          <KycLevelBadge level={kycLevel} status={verificationStatus} />
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => {
            const done = kycLevel >= n
            const active =
              (n === 1 && l1State === 'active') ||
              (n === 2 && l2State === 'active') ||
              (n === 3 && l3State === 'active')
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
                    done
                      ? 'bg-teal-600 text-white'
                      : active
                        ? 'bg-teal-900/60 border-2 border-teal-500 text-teal-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-500',
                  ].join(' ')}
                >
                  {done ? <CheckCircle2 size={14} /> : n}
                </div>
                {n < 3 && (
                  <div
                    className={[
                      'h-px flex-1 transition-colors',
                      kycLevel >= n ? 'bg-teal-600' : 'bg-slate-800',
                    ].join(' ')}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* All done */}
        {kycLevel >= 3 && (
          <Alert className="border-teal-800 bg-teal-950/40 mb-6">
            <AlertDescription className="text-teal-300">
              <strong>All levels complete.</strong> Your identity has been fully verified.
            </AlertDescription>
          </Alert>
        )}

        {/* Level 1 */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
          <SectionHeader
            level={1}
            title="Basic Verification"
            subtitle="Confirm your date of birth, gender, and nationality"
            state={l1State}
          />
          {l1State === 'complete' ? (
            <p className="text-xs text-slate-500">
              Completed — phone and personal details confirmed.
            </p>
          ) : (
            <Level1Step email={profile?.email ?? ''} phone={profile?.phone ?? null} />
          )}
        </section>

        {/* Level 2 */}
        <section
          className={[
            'bg-slate-900 border rounded-xl p-6 mb-4 transition-opacity',
            l2State === 'locked' ? 'border-slate-800 opacity-50 pointer-events-none' : 'border-slate-800',
          ].join(' ')}
        >
          <SectionHeader
            level={2}
            title="Standard Verification"
            subtitle="Government-issued ID, selfie, and next of kin"
            state={l2State}
          />
          {l2State === 'complete' && (
            <p className="text-xs text-slate-500">
              Completed — ID document and selfie approved.
            </p>
          )}
          {l2State === 'pending_review' && (
            <p className="text-xs text-amber-400/80">
              Your documents have been submitted and are under review. You will be notified
              once they are approved (typically 1–2 business days).
            </p>
          )}
          {l2State === 'active' && <Level2Step />}
          {l2State === 'locked' && (
            <p className="text-xs text-slate-500">Complete Level 1 first to unlock this section.</p>
          )}
        </section>

        {/* Level 3 */}
        <section
          className={[
            'bg-slate-900 border rounded-xl p-6 transition-opacity',
            l3State === 'locked' ? 'border-slate-800 opacity-50 pointer-events-none' : 'border-slate-800',
          ].join(' ')}
        >
          <SectionHeader
            level={3}
            title="Enhanced Verification"
            subtitle="Proof of address and financial declaration"
            state={l3State}
          />
          {l3State === 'complete' && (
            <p className="text-xs text-slate-500">
              Completed — address and financial declaration approved.
            </p>
          )}
          {l3State === 'pending_review' && (
            <p className="text-xs text-amber-400/80">
              Your Level 3 documents are under review. This typically takes 2–5 business days.
            </p>
          )}
          {l3State === 'active' && <Level3Step />}
          {l3State === 'locked' && (
            <p className="text-xs text-slate-500">
              Level 2 must be approved before you can submit Level 3 documents.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
