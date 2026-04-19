// Pure financial calculation functions for loans.
// No React, no Supabase, no side effects — these are math only.
// All amounts in and out are integers (cents). No floats.

export interface RepaymentPeriod {
  period: number
  dueDate: string       // ISO date 'YYYY-MM-DD'
  principalDue: number  // cents
  interestDue: number   // cents
  totalDue: number      // cents
  status: 'pending'
}

export interface LoanSchedule {
  principal: number      // cents
  processingFee: number  // cents
  totalInterest: number  // cents
  totalRepayable: number // cents — principal + interest + processingFee
  monthlyPayment: number // cents — approximate; last period absorbs rounding
  periods: RepaymentPeriod[]
}

interface FlatParams {
  principal: number        // cents
  annualRate: number       // e.g. 12 = 12% per year
  periods: number          // months
  processingFeeRate: number // e.g. 2 = 2% of principal
  startDate?: string       // ISO date — defaults to today
}

export function calculateFlatSchedule(params: FlatParams): LoanSchedule {
  const { principal, annualRate, periods, processingFeeRate, startDate } = params

  const processingFee = Math.round(principal * (processingFeeRate / 100))
  const totalInterest = Math.round(principal * (annualRate / 100) * (periods / 12))

  const repayable = principal + totalInterest
  const baseMonthly = Math.floor(repayable / periods)
  const remainder = repayable - baseMonthly * periods

  const start = startDate ? new Date(startDate) : new Date()
  const schedPeriods: RepaymentPeriod[] = []

  // Distribute interest evenly; absorb rounding difference in last period
  const baseInterest = Math.floor(totalInterest / periods)
  const interestRemainder = totalInterest - baseInterest * periods

  for (let i = 1; i <= periods; i++) {
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)

    const isLast = i === periods
    const interestDue = isLast ? baseInterest + interestRemainder : baseInterest
    const periodTotal = isLast ? baseMonthly + remainder : baseMonthly
    const principalDue = periodTotal - interestDue

    schedPeriods.push({
      period: i,
      dueDate: due.toISOString().split('T')[0],
      principalDue,
      interestDue,
      totalDue: periodTotal,
      status: 'pending',
    })
  }

  return {
    principal,
    processingFee,
    totalInterest,
    totalRepayable: principal + totalInterest + processingFee,
    monthlyPayment: baseMonthly,
    periods: schedPeriods,
  }
}

interface ReducingParams {
  principal: number
  annualRate: number
  periods: number
  processingFeeRate: number
  startDate?: string
}

export function calculateReducingSchedule(params: ReducingParams): LoanSchedule {
  const { principal, annualRate, periods, processingFeeRate, startDate } = params

  const processingFee = Math.round(principal * (processingFeeRate / 100))
  const monthlyRate = annualRate / 100 / 12

  // Monthly annuity formula: P × r(1+r)^n / ((1+r)^n - 1)
  let monthlyPayment: number
  if (monthlyRate === 0) {
    monthlyPayment = Math.round(principal / periods)
  } else {
    const factor = Math.pow(1 + monthlyRate, periods)
    monthlyPayment = Math.round((principal * (monthlyRate * factor)) / (factor - 1))
  }

  const start = startDate ? new Date(startDate) : new Date()
  const schedPeriods: RepaymentPeriod[] = []
  let outstanding = principal
  let totalInterest = 0

  for (let i = 1; i <= periods; i++) {
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)

    const interestDue = Math.round(outstanding * monthlyRate)
    // Last period clears the remaining balance exactly
    const principalDue = i === periods ? outstanding : Math.min(monthlyPayment - interestDue, outstanding)
    const periodTotal = principalDue + interestDue

    totalInterest += interestDue
    outstanding = Math.max(0, outstanding - principalDue)

    schedPeriods.push({
      period: i,
      dueDate: due.toISOString().split('T')[0],
      principalDue,
      interestDue,
      totalDue: periodTotal,
      status: 'pending',
    })
  }

  return {
    principal,
    processingFee,
    totalInterest,
    totalRepayable: principal + totalInterest + processingFee,
    monthlyPayment,
    periods: schedPeriods,
  }
}

export function calculateMaxLoanEligible(totalContributed: number, multiplier: number): number {
  return Math.floor(totalContributed * multiplier)
}

export function calculateOutstanding(
  schedule: RepaymentPeriod[],
  totalRepaid: number
): number {
  const totalDue = schedule.reduce((sum, p) => sum + p.totalDue, 0)
  return Math.max(0, totalDue - totalRepaid)
}
