// Status values — mirror database CHECK constraints exactly.
// Update here if the DB schema changes — TypeScript will catch all usages.

export const CONTRIBUTION_STATUSES = [
  'pending', 'paid', 'partial', 'late', 'waived', 'defaulted', 'reversed',
] as const

export const LOAN_STATUSES = [
  'applied', 'under_review', 'approved', 'rejected',
  'disbursed', 'repaying', 'completed', 'defaulted', 'written_off',
] as const

export const GROUP_STATUSES = [
  'forming', 'active', 'frozen', 'closed',
] as const

export const GROUP_MEMBER_ROLES = [
  'chair', 'treasurer', 'secretary', 'member',
] as const

export const GROUP_MEMBER_STATUSES = [
  'invited', 'pending', 'active', 'suspended', 'exited',
] as const

export const KYC_LEVELS = [0, 1, 2, 3] as const

export const SYSTEM_ROLES = [
  'member', 'system_admin', 'support',
] as const

export const PAYMENT_CHANNELS = [
  'mobile_money', 'bank', 'cash', 'internal',
] as const

export const CONTRIBUTION_FREQUENCIES = [
  'weekly', 'biweekly', 'monthly',
] as const

export const LOAN_INTEREST_TYPES = [
  'flat', 'reducing_balance',
] as const

export const DIVIDEND_DISTRIBUTIONS = [
  'equal', 'proportional', 'none',
] as const

export const ELECTION_POSITIONS = [
  'chair', 'treasurer', 'secretary',
] as const

// Credit score bands — mirrors core.profiles.credit_score_band GENERATED column
export const SCORE_BANDS = {
  excellent: { min: 750, max: 850, label: 'Excellent', color: 'indigo' as const },
  good:      { min: 600, max: 749, label: 'Good',      color: 'green'  as const },
  fair:      { min: 500, max: 599, label: 'Fair',      color: 'blue'   as const },
  poor:      { min: 400, max: 499, label: 'Poor',      color: 'amber'  as const },
  high_risk: { min: 300, max: 399, label: 'High Risk', color: 'red'    as const },
} as const

// KYC level labels
export const KYC_LEVEL_LABELS: Record<number, string> = {
  0: 'Unverified',
  1: 'Basic',
  2: 'Standard',
  3: 'Enhanced',
}

// KYC level requirements for display
export const KYC_LEVEL_REQUIREMENTS: Record<number, string[]> = {
  1: ['Verified email', 'Phone number verified via OTP'],
  2: ['Level 1 complete', 'Government ID approved', 'Selfie verified'],
  3: ['Level 2 complete', 'Address proof verified', 'Financial declaration submitted'],
}

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Financial defaults
export const CURRENCY_DEFAULT = 'KES'
export const LOCALE_DEFAULT = 'en-KE'
export const TIMEZONE_DEFAULT = 'Africa/Nairobi'
export const CREDIT_SCORE_DEFAULT = 500
export const CREDIT_SCORE_MIN = 300
export const CREDIT_SCORE_MAX = 850
