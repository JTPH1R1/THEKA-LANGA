import { z } from 'zod'

// Amounts in the form are in display currency (e.g. KES 500).
// On submit, multiply by 100 to convert to cents for storage.

export const rulesContributionsSchema = z.object({
  contributionAmount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Amount must be greater than 0'),
  contributionFrequency: z.enum(['weekly', 'biweekly', 'monthly'], {
    errorMap: () => ({ message: 'Select frequency' }),
  }),
  contributionDay: z.number().int().min(1).max(31).optional(),
  gracePeriodDays: z.number().int().min(0).max(30).default(3),
  lateFineFlat: z.number().min(0).default(0),
  lateFineInterestRateDaily: z.number().min(0).max(100).default(0),
})

export const rulesMembershipSchema = z.object({
  initiationFee: z.number().min(0).default(0),
  lateJoiningFee: z.number().min(0).default(0),
  midJoinAllowed: z.boolean().default(true),
  midJoinDeadlineWeeks: z.number().int().min(1).max(52).default(4),
  maxMembers: z.number().int().min(2).max(500).optional(),
  minKycLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).default(1),
})

export const rulesLoansSchema = z.object({
  loanEnabled: z.boolean().default(true),
  maxLoanMultiplier: z.number().min(0.5).max(20).default(3),
  loanInterestRate: z.number().min(0).max(100).default(10),
  loanInterestType: z.enum(['flat', 'reducing_balance']).default('flat'),
  loanRepaymentPeriods: z.number().int().min(1).max(60).default(3),
  loanProcessingFeeRate: z.number().min(0).max(10).default(2),
  maxActiveLoansPerMember: z.number().int().min(1).max(5).default(1),
  guarantorRequired: z.boolean().default(true),
  guarantorsRequiredCount: z.number().int().min(1).max(5).default(2),
  minGuarantorCreditScore: z.number().int().min(300).max(850).optional(),
})

export const rulesDefaultsSchema = z.object({
  defaultThresholdDays: z.number().int().min(7).max(90).default(30),
  defaultPenaltyRate: z.number().min(0).max(50).default(5),
  blacklistRecommendationAfter: z.number().int().min(1).max(10).default(3),
})

export const rulesDistributionSchema = z.object({
  dividendDistribution: z.enum(['equal', 'proportional', 'none']).default('proportional'),
})

export const fullRulesSchema = rulesContributionsSchema
  .merge(rulesMembershipSchema)
  .merge(rulesLoansSchema)
  .merge(rulesDefaultsSchema)
  .merge(rulesDistributionSchema)

export type RulesContributionsValues = z.infer<typeof rulesContributionsSchema>
export type RulesMembershipValues    = z.infer<typeof rulesMembershipSchema>
export type RulesLoansValues         = z.infer<typeof rulesLoansSchema>
export type RulesDefaultsValues      = z.infer<typeof rulesDefaultsSchema>
export type RulesDistributionValues  = z.infer<typeof rulesDistributionSchema>
export type FullRulesValues          = z.infer<typeof fullRulesSchema>
