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
    ? { icon: ShieldX, color: 'text-red-700 border-red-200 bg-red-50' }
    : isPending
    ? { icon: ShieldAlert, color: 'text-amber-700 border-amber-200 bg-amber-50' }
    : level >= 3
    ? { icon: ShieldCheck, color: 'text-indigo-700 border-indigo-200 bg-indigo-50' }
    : level >= 2
    ? { icon: ShieldCheck, color: 'text-teal-700 border-teal-200 bg-teal-50' }
    : level >= 1
    ? { icon: Shield, color: 'text-blue-700 border-blue-200 bg-blue-50' }
    : { icon: ShieldAlert, color: 'text-slate-500 border-gray-200 bg-gray-50' }

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
