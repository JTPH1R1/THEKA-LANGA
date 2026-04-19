import { describe, it, expect } from 'vitest'
import { getWeeksElapsed, isEligibleToJoin, getJoinRejectionReason } from '../mid-join'

describe('getWeeksElapsed', () => {
  it('returns 0 on cycle start day', () => {
    const start = new Date('2026-01-01')
    expect(getWeeksElapsed(start, start)).toBe(0)
  })

  it('returns 0 within first week', () => {
    const start = new Date('2026-01-01')
    const day6 = new Date('2026-01-07')
    expect(getWeeksElapsed(start, day6)).toBe(0)
  })

  it('returns 1 after exactly one week', () => {
    const start = new Date('2026-01-01')
    const week1 = new Date('2026-01-08')
    expect(getWeeksElapsed(start, week1)).toBe(1)
  })

  it('returns 4 after four weeks', () => {
    const start = new Date('2026-01-01')
    const week4 = new Date('2026-01-29')
    expect(getWeeksElapsed(start, week4)).toBe(4)
  })

  it('returns 0 if today is before cycle start', () => {
    const future = new Date('2026-06-01')
    const past = new Date('2026-01-01')
    expect(getWeeksElapsed(future, past)).toBe(0)
  })
})

describe('isEligibleToJoin', () => {
  it('allows joining on cycle start day', () => {
    const start = new Date('2026-01-01')
    expect(isEligibleToJoin(start, start, 4)).toBe(true)
  })

  it('allows joining within max weeks', () => {
    const start = new Date('2026-01-01')
    const week3 = new Date('2026-01-22')
    expect(isEligibleToJoin(start, week3, 4)).toBe(true)
  })

  it('allows joining exactly at max weeks', () => {
    const start = new Date('2026-01-01')
    const week4 = new Date('2026-01-29')
    expect(isEligibleToJoin(start, week4, 4)).toBe(true)
  })

  it('blocks joining after max weeks', () => {
    const start = new Date('2026-01-01')
    const week5 = new Date('2026-02-05')
    expect(isEligibleToJoin(start, week5, 4)).toBe(false)
  })
})

describe('getJoinRejectionReason', () => {
  it('returns null when eligible', () => {
    const start = new Date('2026-01-01')
    expect(getJoinRejectionReason(start, start, 4)).toBeNull()
  })

  it('returns reason string when ineligible', () => {
    const start = new Date('2026-01-01')
    const week8 = new Date('2026-02-26')
    const reason = getJoinRejectionReason(start, week8, 4)
    expect(reason).not.toBeNull()
    expect(reason).toContain('4 weeks')
  })

  it('includes elapsed weeks in rejection message', () => {
    const start = new Date('2026-01-01')
    const week6 = new Date('2026-02-12')
    const reason = getJoinRejectionReason(start, week6, 4)
    expect(reason).toContain('6 weeks')
  })
})
