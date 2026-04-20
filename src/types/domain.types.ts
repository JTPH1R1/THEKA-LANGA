// Application domain types.
// These are the types that hooks, components, and the API layer actually use.
// Raw generated DB types from database.types.ts are not imported directly into
// components — they are composed into these cleaner shapes here.

// ─── Status unions — mirror DB CHECK constraints exactly ─────────────────────

export type ContributionStatus =
  | 'pending' | 'paid' | 'partial' | 'late' | 'waived' | 'defaulted' | 'reversed'

export type LoanStatus =
  | 'applied' | 'under_review' | 'approved' | 'rejected'
  | 'disbursed' | 'repaying' | 'completed' | 'defaulted' | 'written_off'

export type GroupStatus = 'forming' | 'active' | 'frozen' | 'closed'

export type GroupMemberRole = 'chair' | 'treasurer' | 'secretary' | 'member'

export type GroupMemberStatus = 'invited' | 'pending' | 'active' | 'suspended' | 'exited'

export type KycLevel = 0 | 1 | 2 | 3

export type KycVerificationStatus =
  | 'unverified' | 'pending_review' | 'verified'
  | 'requires_resubmission' | 'rejected' | 'suspended'

export type SystemRole = 'member' | 'system_admin' | 'support'

export type ScoreBand = 'excellent' | 'good' | 'fair' | 'poor' | 'high_risk'

export type PaymentChannel = 'mobile_money' | 'bank' | 'cash' | 'internal'

export type ContributionFrequency = 'weekly' | 'biweekly' | 'monthly'

export type LoanInterestType = 'flat' | 'reducing_balance'

export type DividendDistribution = 'equal' | 'proportional' | 'none'

export type ElectionStatus = 'nominations_open' | 'voting_open' | 'closed' | 'cancelled'

// ─── Core profile ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  fullLegalName: string
  preferredName: string | null
  phone: string | null
  phoneVerified: boolean
  avatarUrl: string | null
  systemRole: SystemRole
  kycLevel: KycLevel
  creditScore: number
  creditScoreBand: ScoreBand
  isBlacklisted: boolean
  isActive: boolean
  timezone: string
  locale: string
  createdAt: string
  updatedAt: string
}

// ─── Loan schedule (typed version of JSONB stored in finance.loans) ──────────

export interface RepaymentPeriod {
  period: number
  dueDate: string       // ISO date 'YYYY-MM-DD'
  principalDue: number  // cents
  interestDue: number   // cents
  totalDue: number      // cents
  status: 'pending' | 'paid' | 'late' | 'missed'
}

// ─── Utility types ────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  column: string
  direction: SortDirection
}

export interface DateRange {
  from: Date
  to: Date
}

// Safe profile subset for display in lists — never expose the full profile
export type ProfileSummary = Pick<
  Profile,
  'id' | 'fullLegalName' | 'preferredName' | 'avatarUrl' | 'creditScore' | 'creditScoreBand' | 'kycLevel'
>

// ─── Groups ───────────────────────────────────────────────────────────────────

export interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  type: 'public' | 'private'
  status: GroupStatus
  currency: string
  timezone: string
  cycleStart: string | null
  cycleEnd: string | null
  logoUrl: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface GroupRules {
  groupId: string
  contributionAmount: number        // cents
  contributionFrequency: ContributionFrequency
  contributionDay: number | null
  gracePeriodDays: number
  lateFineFlat: number              // cents
  lateFineInterestRateDaily: number
  initiationFee: number             // cents
  lateJoiningFee: number            // cents
  midJoinAllowed: boolean
  midJoinDeadlineWeeks: number
  maxMembers: number | null
  minKycLevel: KycLevel
  loanEnabled: boolean
  maxLoanMultiplier: number
  loanInterestRate: number
  loanInterestType: LoanInterestType
  loanRepaymentPeriods: number
  loanProcessingFeeRate: number
  maxActiveLoansPerMember: number
  guarantorRequired: boolean
  guarantorsRequiredCount: number
  minGuarantorCreditScore: number | null
  defaultThresholdDays: number
  defaultPenaltyRate: number
  blacklistRecommendationAfter: number
  dividendDistribution: DividendDistribution
  rulesVersion: number
  createdAt: string
  updatedAt: string
}

export interface GroupMember {
  id: string
  groupId: string
  profileId: string
  role: GroupMemberRole
  status: GroupMemberStatus
  joinedAt: string | null
  exitedAt: string | null
  midJoin: boolean
  midJoinCatchupAmount: number | null
  creditScoreAtJoin: number | null
  createdAt: string
  // Joined fields (when fetched with profile)
  profile?: ProfileSummary
}

export interface GroupWithMeta extends Group {
  rules?: GroupRules
  myRole?: GroupMemberRole | null
  myStatus?: GroupMemberStatus | null
  memberCount?: number
}
