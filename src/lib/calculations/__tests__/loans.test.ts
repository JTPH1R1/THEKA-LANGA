import { describe, it, expect } from 'vitest'
import {
  calculateFlatSchedule,
  calculateReducingSchedule,
  calculateMaxLoanEligible,
  calculateOutstanding,
} from '../loans'

describe('calculateFlatSchedule', () => {
  it('calculates total interest correctly', () => {
    // 100,000 KES × 12% p.a. × 1 year = 12,000 interest
    const result = calculateFlatSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 0 })
    expect(result.totalInterest).toBe(12_000_00)
  })

  it('calculates processing fee correctly', () => {
    const result = calculateFlatSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 2 })
    expect(result.processingFee).toBe(2_000_00)
  })

  it('calculates total repayable = principal + interest + fee', () => {
    const result = calculateFlatSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 2 })
    expect(result.totalRepayable).toBe(114_000_00)
  })

  it('generates the correct number of periods', () => {
    const result = calculateFlatSchedule({ principal: 50_000_00, annualRate: 10, periods: 6, processingFeeRate: 2 })
    expect(result.periods).toHaveLength(6)
  })

  it('all period amounts are integers — no floating point', () => {
    const result = calculateFlatSchedule({ principal: 100_001, annualRate: 7.5, periods: 3, processingFeeRate: 1.5 })
    result.periods.forEach((p) => {
      expect(Number.isInteger(p.principalDue)).toBe(true)
      expect(Number.isInteger(p.interestDue)).toBe(true)
      expect(Number.isInteger(p.totalDue)).toBe(true)
    })
  })

  it('period totals sum to principal + interest within 1 cent rounding', () => {
    const result = calculateFlatSchedule({ principal: 500_000_00, annualRate: 12, periods: 6, processingFeeRate: 0 })
    const sum = result.periods.reduce((acc, p) => acc + p.totalDue, 0)
    expect(Math.abs(sum - (result.principal + result.totalInterest))).toBeLessThanOrEqual(
      result.periods.length
    )
  })

  it('all periods have status "pending"', () => {
    const result = calculateFlatSchedule({ principal: 10_000_00, annualRate: 10, periods: 3, processingFeeRate: 0 })
    result.periods.forEach((p) => expect(p.status).toBe('pending'))
  })

  it('handles zero processing fee', () => {
    const result = calculateFlatSchedule({ principal: 10_000_00, annualRate: 10, periods: 3, processingFeeRate: 0 })
    expect(result.processingFee).toBe(0)
  })

  it('handles zero interest rate', () => {
    const result = calculateFlatSchedule({ principal: 12_000_00, annualRate: 0, periods: 12, processingFeeRate: 0 })
    expect(result.totalInterest).toBe(0)
    expect(result.totalRepayable).toBe(12_000_00)
  })

  it('due dates advance by one month each period', () => {
    const result = calculateFlatSchedule({
      principal: 10_000_00,
      annualRate: 10,
      periods: 3,
      processingFeeRate: 0,
      startDate: '2026-01-01',
    })
    expect(result.periods[0].dueDate).toBe('2026-02-01')
    expect(result.periods[1].dueDate).toBe('2026-03-01')
    expect(result.periods[2].dueDate).toBe('2026-04-01')
  })

  it('principal components sum to original principal within 1 cent', () => {
    const result = calculateFlatSchedule({ principal: 99_999, annualRate: 10, periods: 4, processingFeeRate: 0 })
    const principalSum = result.periods.reduce((acc, p) => acc + p.principalDue, 0)
    expect(Math.abs(principalSum - result.principal)).toBeLessThanOrEqual(result.periods.length)
  })
})

describe('calculateReducingSchedule', () => {
  it('generates the correct number of periods', () => {
    const result = calculateReducingSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 0 })
    expect(result.periods).toHaveLength(12)
  })

  it('principal components sum to original principal', () => {
    const result = calculateReducingSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 0 })
    const totalPrincipal = result.periods.reduce((acc, p) => acc + p.principalDue, 0)
    expect(Math.abs(totalPrincipal - result.principal)).toBeLessThanOrEqual(1)
  })

  it('has lower total interest than flat for same terms', () => {
    const params = { principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 0 }
    const flat = calculateFlatSchedule(params)
    const reducing = calculateReducingSchedule(params)
    expect(reducing.totalInterest).toBeLessThan(flat.totalInterest)
  })

  it('all amounts are positive integers', () => {
    const result = calculateReducingSchedule({ principal: 50_000_00, annualRate: 10, periods: 6, processingFeeRate: 1 })
    result.periods.forEach((p) => {
      expect(p.principalDue).toBeGreaterThan(0)
      expect(p.interestDue).toBeGreaterThanOrEqual(0)
      expect(p.totalDue).toBeGreaterThan(0)
      expect(Number.isInteger(p.principalDue)).toBe(true)
      expect(Number.isInteger(p.interestDue)).toBe(true)
    })
  })

  it('handles zero annual rate — equal principal splits', () => {
    const result = calculateReducingSchedule({ principal: 12_000_00, annualRate: 0, periods: 12, processingFeeRate: 0 })
    expect(result.totalInterest).toBe(0)
    result.periods.forEach((p) => expect(p.interestDue).toBe(0))
  })

  it('last period interest is lower than first (reducing balance property)', () => {
    const result = calculateReducingSchedule({ principal: 100_000_00, annualRate: 12, periods: 12, processingFeeRate: 0 })
    expect(result.periods[result.periods.length - 1].interestDue).toBeLessThan(result.periods[0].interestDue)
  })
})

describe('calculateMaxLoanEligible', () => {
  it('returns contribution × multiplier', () => {
    expect(calculateMaxLoanEligible(100_000_00, 3)).toBe(300_000_00)
  })

  it('floors the result — no fractional cents', () => {
    expect(calculateMaxLoanEligible(100_001, 2.5)).toBe(250_002)
  })

  it('handles zero contributions', () => {
    expect(calculateMaxLoanEligible(0, 3)).toBe(0)
  })
})

describe('calculateOutstanding', () => {
  const schedule = [
    { period: 1, dueDate: '2026-01-01', principalDue: 50_000, interestDue: 5_000, totalDue: 55_000, status: 'pending' as const },
    { period: 2, dueDate: '2026-02-01', principalDue: 50_000, interestDue: 4_000, totalDue: 54_000, status: 'pending' as const },
  ]

  it('returns full amount when nothing repaid', () => {
    expect(calculateOutstanding(schedule, 0)).toBe(109_000)
  })

  it('returns zero when fully repaid', () => {
    expect(calculateOutstanding(schedule, 109_000)).toBe(0)
  })

  it('returns partial outstanding', () => {
    expect(calculateOutstanding(schedule, 55_000)).toBe(54_000)
  })

  it('never returns negative', () => {
    expect(calculateOutstanding(schedule, 999_999)).toBe(0)
  })
})
