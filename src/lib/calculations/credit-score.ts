// Credit score calculation — pure functions, no side effects.
// Score range: 300 (poor) → 850 (excellent). Default: 500.

export const SCORE_MIN = 300
export const SCORE_MAX = 850
export const SCORE_DEFAULT = 500

export type CreditEventType =
  | 'on_time_contribution'
  | 'late_contribution'
  | 'contribution_fine_paid'
  | 'loan_instalment_on_time'
  | 'loan_instalment_missed'
  | 'loan_completed'
  | 'formal_default'
  | 'blacklist_event'
  | 'exit_before_cycle_end'
  | 'active_membership_month'
  | 'kyc_level_upgrade'

export const SCORE_DELTAS: Record<CreditEventType, number> = {
  on_time_contribution:    +2,
  late_contribution:       -5,
  contribution_fine_paid:  -10,
  loan_instalment_on_time: +5,
  loan_instalment_missed:  -20,
  loan_completed:          +10,
  formal_default:          -50,
  blacklist_event:         -100,
  exit_before_cycle_end:   -15,
  active_membership_month: +1,
  kyc_level_upgrade:       +15,
}

export type ScoreBand = 'excellent' | 'good' | 'fair' | 'poor' | 'high_risk'

export function clampScore(score: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(score)))
}

export function scoreDelta(event: CreditEventType): number {
  return SCORE_DELTAS[event]
}

export function applyScoreDelta(currentScore: number, event: CreditEventType): number {
  return clampScore(currentScore + SCORE_DELTAS[event])
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 750) return 'excellent'
  if (score >= 600) return 'good'
  if (score >= 500) return 'fair'
  if (score >= 400) return 'poor'
  return 'high_risk'
}

export interface MemberFinancialHistory {
  onTimeContributions:   number
  lateContributions:     number
  finesPaid:             number
  instalmentsOnTime:     number
  instalmentsMissed:     number
  loansCompleted:        number
  formalDefaults:        number
  blacklistEvents:       number
  earlyGroupExits:       number
  activeMonths:          number
  kycUpgrades:           number
}

export function calculateCreditScore(history: MemberFinancialHistory): number {
  let score = SCORE_DEFAULT

  // Positive — on-time contribution bonus capped at +200 total
  score += Math.min(history.onTimeContributions * SCORE_DELTAS.on_time_contribution, 200)
  score += history.instalmentsOnTime  * SCORE_DELTAS.loan_instalment_on_time
  score += history.loansCompleted     * SCORE_DELTAS.loan_completed
  score += history.activeMonths       * SCORE_DELTAS.active_membership_month
  score += history.kycUpgrades        * SCORE_DELTAS.kyc_level_upgrade

  // Negative
  score += history.lateContributions  * SCORE_DELTAS.late_contribution
  score += history.finesPaid          * SCORE_DELTAS.contribution_fine_paid
  score += history.instalmentsMissed  * SCORE_DELTAS.loan_instalment_missed
  score += history.formalDefaults     * SCORE_DELTAS.formal_default
  score += history.blacklistEvents    * SCORE_DELTAS.blacklist_event
  score += history.earlyGroupExits    * SCORE_DELTAS.exit_before_cycle_end

  return clampScore(score)
}

export function getLoanEligibilityNote(score: number): string {
  if (score >= 750) return 'Priority approval — no mandatory guarantors'
  if (score >= 600) return 'Standard loan process applies'
  if (score >= 500) return 'Standard process — minimum 1 guarantor required'
  if (score >= 400) return 'Minimum 2 guarantors required regardless of group rules'
  return 'High risk — dual approval from chair and treasurer required'
}
