import { ShieldCheck, ShieldAlert, Shield, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KYC_LEVEL_LABELS } from '@/lib/constants'

interface KycLevelBadgeProps {
  level: number
  status?: string
  size?: 'sm' | 'md'
}

export function KycLevelBadge({ level, status, size = 'md' }: KycLevelBadgeProps) {
  const isPending = status === 'pending_review'
  const isRejected = status === 'rejected' || status === 'requires_resubmission'

  const config = isRejected
    ? { icon: ShieldX, color: 'text-red-400 border-red-800 bg-red-900/20' }
    : isPending
    ? { icon: ShieldAlert, color: 'text-amber-400 border-amber-800 bg-amber-900/20' }
    : level >= 3
    ? { icon: ShieldCheck, color: 'text-indigo-400 border-indigo-800 bg-indigo-900/20' }
    : level >= 2
    ? { icon: ShieldCheck, color: 'text-teal-400 border-teal-800 bg-teal-900/20' }
    : level >= 1
    ? { icon: Shield, color: 'text-blue-400 border-blue-800 bg-blue-900/20' }
    : { icon: ShieldAlert, color: 'text-slate-400 border-slate-700 bg-slate-800/50' }

  const Icon = config.icon
  const label = isRejected
    ? 'Resubmit required'
    : isPending
    ? 'Under review'
    : KYC_LEVEL_LABELS[level] ?? 'Unknown'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      KYC {label}
    </span>
  )
}
