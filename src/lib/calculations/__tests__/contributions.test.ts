import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateLateFine,
  calculateMidJoinCatchup,
  getDaysLate,
  isContributionLate,
  getContributionDueDate,
} from '../contributions'

describe('calculateLateFine', () => {
  it('returns zero fine when not late', () => {
    const result = calculateLateFine({ amount: 100_000, fineFlat: 500, dailyInterestRate: 0.5, daysLate: 0 })
    expect(result.totalFine).toBe(0)
    expect(result.flatFine).toBe(0)
    expect(result.interestFine).toBe(0)
  })

  it('applies flat fine only when daily rate is zero', () => {
    const result = calculateLateFine({ amount: 100_000, fineFlat: 5_000, dailyInterestRate: 0, daysLate: 7 })
    expect(result.flatFine).toBe(5_000)
    expect(result.interestFine).toBe(0)
    expect(result.totalFine).toBe(5_000)
  })

  it('calculates daily interest correctly', () => {
    // 100,000 × 0.5% × 10 days = 5,000
    const result = calculateLateFine({ amount: 100_000, fineFlat: 0, dailyInterestRate: 0.5, daysLate: 10 })
    expect(result.interestFine).toBe(5_000)
  })

  it('combines flat fine and daily interest', () => {
    const result = calculateLateFine({ amount: 100_000, fineFlat: 2_000, dailyInterestRate: 0.5, daysLate: 5 })
    // interest: 100_000 × 0.5% × 5 = 2_500
    expect(result.flatFine).toBe(2_000)
    expect(result.interestFine).toBe(2_500)
    expect(result.totalFine).toBe(4_500)
  })

  it('result is always an integer', () => {
    const result = calculateLateFine({ amount: 333, fineFlat: 0, dailyInterestRate: 0.5, daysLate: 3 })
    expect(Number.isInteger(result.interestFine)).toBe(true)
    expect(Number.isInteger(result.totalFine)).toBe(true)
  })

  it('handles negative daysLate as not late', () => {
    const result = calculateLateFine({ amount: 100_000, fineFlat: 1_000, dailyInterestRate: 1, daysLate: -3 })
    expect(result.totalFine).toBe(0)
  })
})

describe('calculateMidJoinCatchup', () => {
  it('calculates catchup with all components for first-time member', () => {
    const result = calculateMidJoinCatchup({
      weeksElapsed: 3,
      weeklyAmount: 10_000,
      lateFee: 5_000,
      initiationFee: 2_000,
      isFirstTime: true,
    })
    expect(result.contributionCatchup).toBe(30_000)  // 3 × 10,000
    expect(result.lateFee).toBe(5_000)
    expect(result.initiationFee).toBe(2_000)
    expect(result.total).toBe(37_000)
  })

  it('excludes initiation fee for returning member', () => {
    const result = calculateMidJoinCatchup({
      weeksElapsed: 2,
      weeklyAmount: 10_000,
      lateFee: 3_000,
      initiationFee: 2_000,
      isFirstTime: false,
    })
    expect(result.initiationFee).toBe(0)
    expect(result.total).toBe(23_000)  // 20,000 + 3,000 + 0
  })

  it('returns zero total for week 0 join (no catchup)', () => {
    const result = calculateMidJoinCatchup({
      weeksElapsed: 0,
      weeklyAmount: 10_000,
      lateFee: 0,
      initiationFee: 0,
      isFirstTime: false,
    })
    expect(result.total).toBe(0)
    expect(result.contributionCatchup).toBe(0)
  })

  it('reports correct weeksElapsed', () => {
    const result = calculateMidJoinCatchup({ weeksElapsed: 5, weeklyAmount: 5_000, lateFee: 0, initiationFee: 0, isFirstTime: false })
    expect(result.weeksElapsed).toBe(5)
  })
})

describe('getDaysLate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 when within grace period', () => {
    vi.setSystemTime(new Date('2026-04-20'))
    const dueDate = new Date('2026-04-20')
    expect(getDaysLate(dueDate, 3)).toBe(0)
  })

  it('returns 0 on last day of grace period', () => {
    vi.setSystemTime(new Date('2026-04-23'))
    const dueDate = new Date('2026-04-20')
    expect(getDaysLate(dueDate, 3)).toBe(0)
  })

  it('returns 1 the day after grace period', () => {
    vi.setSystemTime(new Date('2026-04-24'))
    const dueDate = new Date('2026-04-20')
    expect(getDaysLate(dueDate, 3)).toBe(1)
  })
})

describe('isContributionLate', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns false within grace period', () => {
    vi.setSystemTime(new Date('2026-04-22'))
    expect(isContributionLate(new Date('2026-04-20'), 3)).toBe(false)
  })

  it('returns true after grace period', () => {
    vi.setSystemTime(new Date('2026-04-30'))
    expect(isContributionLate(new Date('2026-04-20'), 3)).toBe(true)
  })
})

describe('getContributionDueDate', () => {
  const start = new Date('2026-01-01')

  it('advances weekly correctly', () => {
    expect(getContributionDueDate(start, 'weekly', 1).toISOString().split('T')[0]).toBe('2026-01-01')
    expect(getContributionDueDate(start, 'weekly', 2).toISOString().split('T')[0]).toBe('2026-01-08')
    expect(getContributionDueDate(start, 'weekly', 5).toISOString().split('T')[0]).toBe('2026-01-29')
  })

  it('advances monthly correctly', () => {
    expect(getContributionDueDate(start, 'monthly', 1).toISOString().split('T')[0]).toBe('2026-01-01')
    expect(getContributionDueDate(start, 'monthly', 3).toISOString().split('T')[0]).toBe('2026-03-01')
  })

  it('advances biweekly correctly', () => {
    expect(getContributionDueDate(start, 'biweekly', 1).toISOString().split('T')[0]).toBe('2026-01-01')
    expect(getContributionDueDate(start, 'biweekly', 2).toISOString().split('T')[0]).toBe('2026-01-15')
  })
})
