// Pure contribution calculation functions. No React, no Supabase.

export interface FineSummary {
  flatFine: number      // cents — fixed fine amount
  interestFine: number  // cents — accrued daily interest
  totalFine: number     // cents — flatFine + interestFine
  daysLate: number
}

export function calculateLateFine(params: {
  amount: number            // contribution amount in cents
  fineFlat: number          // fixed fine in cents (0 = no flat fine)
  dailyInterestRate: number // % per day e.g. 0.5 means 0.5%
  daysLate: number
}): FineSummary {
  const { amount, fineFlat, dailyInterestRate, daysLate } = params

  if (daysLate <= 0) {
    return { flatFine: 0, interestFine: 0, totalFine: 0, daysLate: 0 }
  }

  const interestFine =
    dailyInterestRate > 0
      ? Math.round(amount * (dailyInterestRate / 100) * daysLate)
      : 0

  const totalFine = fineFlat + interestFine
  return { flatFine: fineFlat, interestFine, totalFine, daysLate }
}

export interface CatchupSummary {
  contributionCatchup: number  // cents — weeks × weekly amount
  lateFee: number              // cents
  initiationFee: number        // cents — 0 if not first time
  total: number                // cents
  weeksElapsed: number
}

export function calculateMidJoinCatchup(params: {
  weeksElapsed: number
  weeklyAmount: number   // cents
  lateFee: number        // cents
  initiationFee: number  // cents
  isFirstTime: boolean   // true if first time joining this group
}): CatchupSummary {
  const { weeksElapsed, weeklyAmount, lateFee, initiationFee, isFirstTime } = params

  const contributionCatchup = weeksElapsed * weeklyAmount
  const initiation = isFirstTime ? initiationFee : 0
  const total = contributionCatchup + lateFee + initiation

  return { contributionCatchup, lateFee, initiationFee: initiation, total, weeksElapsed }
}

export function getDaysLate(dueDate: Date, gracePeriodDays: number): number {
  const graceCutoff = new Date(dueDate)
  graceCutoff.setDate(graceCutoff.getDate() + gracePeriodDays)
  const msLate = Date.now() - graceCutoff.getTime()
  return msLate > 0 ? Math.floor(msLate / (1000 * 60 * 60 * 24)) : 0
}

export function isContributionLate(dueDate: Date, gracePeriodDays: number): boolean {
  return getDaysLate(dueDate, gracePeriodDays) > 0
}

export function getContributionDueDate(
  cycleStart: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  periodNumber: number  // 1-indexed
): Date {
  const date = new Date(cycleStart)
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (periodNumber - 1) * 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + (periodNumber - 1) * 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + (periodNumber - 1))
      break
  }
  return date
}

export function getCyclePeriodLabel(
  cycleStart: Date,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  periodNumber: number
): string {
  const date = getContributionDueDate(cycleStart, frequency, periodNumber)
  if (frequency === 'monthly') {
    return date.toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit' }).replace('/', '-')
  }
  const year = date.getFullYear()
  const week = Math.ceil(date.getDate() / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}
