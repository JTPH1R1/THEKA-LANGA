import { describe, it, expect } from 'vitest'
import {
  calculateCreditScore,
  applyScoreDelta,
  clampScore,
  getScoreBand,
  getLoanEligibilityNote,
  SCORE_MIN,
  SCORE_MAX,
  SCORE_DEFAULT,
} from '../credit-score'
import type { MemberFinancialHistory } from '../credit-score'

const emptyHistory: MemberFinancialHistory = {
  onTimeContributions: 0,
  lateContributions: 0,
  finesPaid: 0,
  instalmentsOnTime: 0,
  instalmentsMissed: 0,
  loansCompleted: 0,
  formalDefaults: 0,
  blacklistEvents: 0,
  earlyGroupExits: 0,
  activeMonths: 0,
  kycUpgrades: 0,
}

describe('calculateCreditScore', () => {
  it('returns default score for empty history', () => {
    expect(calculateCreditScore(emptyHistory)).toBe(SCORE_DEFAULT)
  })

  it('increases score for on-time contributions', () => {
    const score = calculateCreditScore({ ...emptyHistory, onTimeContributions: 10 })
    expect(score).toBeGreaterThan(SCORE_DEFAULT)
  })

  it('caps on-time contribution bonus at +200', () => {
    const capped = calculateCreditScore({ ...emptyHistory, onTimeContributions: 200 })
    const overCapped = calculateCreditScore({ ...emptyHistory, onTimeContributions: 500 })
    expect(capped).toBe(overCapped)
  })

  it('decreases score for late contributions', () => {
    const score = calculateCreditScore({ ...emptyHistory, lateContributions: 5 })
    expect(score).toBeLessThan(SCORE_DEFAULT)
  })

  it('score drops heavily for formal defaults', () => {
    const oneDefault = calculateCreditScore({ ...emptyHistory, formalDefaults: 1 })
    expect(SCORE_DEFAULT - oneDefault).toBe(50)
  })

  it('score never goes below SCORE_MIN', () => {
    const score = calculateCreditScore({
      ...emptyHistory,
      formalDefaults: 20,
      blacklistEvents: 10,
      lateContributions: 100,
    })
    expect(score).toBeGreaterThanOrEqual(SCORE_MIN)
  })

  it('score never exceeds SCORE_MAX', () => {
    const score = calculateCreditScore({
      ...emptyHistory,
      onTimeContributions: 1000,
      loansCompleted: 100,
      instalmentsOnTime: 500,
      activeMonths: 120,
      kycUpgrades: 3,
    })
    expect(score).toBeLessThanOrEqual(SCORE_MAX)
  })
})

describe('clampScore', () => {
  it('clamps to minimum', () => {
    expect(clampScore(100)).toBe(SCORE_MIN)
  })
  it('clamps to maximum', () => {
    expect(clampScore(1000)).toBe(SCORE_MAX)
  })
  it('rounds to integer', () => {
    expect(Number.isInteger(clampScore(550.7))).toBe(true)
  })
  it('passes through valid score unchanged', () => {
    expect(clampScore(600)).toBe(600)
  })
})

describe('applyScoreDelta', () => {
  it('increases score for positive event', () => {
    expect(applyScoreDelta(500, 'on_time_contribution')).toBe(502)
  })
  it('decreases score for negative event', () => {
    expect(applyScoreDelta(500, 'late_contribution')).toBe(495)
  })
  it('clamps result to SCORE_MIN', () => {
    expect(applyScoreDelta(305, 'blacklist_event')).toBe(SCORE_MIN)
  })
  it('clamps result to SCORE_MAX', () => {
    expect(applyScoreDelta(848, 'kyc_level_upgrade')).toBe(SCORE_MAX)
  })
})

describe('getScoreBand', () => {
  it('returns excellent for 750+', () => {
    expect(getScoreBand(750)).toBe('excellent')
    expect(getScoreBand(850)).toBe('excellent')
  })
  it('returns good for 600–749', () => {
    expect(getScoreBand(600)).toBe('good')
    expect(getScoreBand(749)).toBe('good')
  })
  it('returns fair for 500–599', () => {
    expect(getScoreBand(500)).toBe('fair')
    expect(getScoreBand(599)).toBe('fair')
  })
  it('returns poor for 400–499', () => {
    expect(getScoreBand(400)).toBe('poor')
    expect(getScoreBand(499)).toBe('poor')
  })
  it('returns high_risk below 400', () => {
    expect(getScoreBand(399)).toBe('high_risk')
    expect(getScoreBand(300)).toBe('high_risk')
  })
})

describe('getLoanEligibilityNote', () => {
  it('returns priority note for excellent score', () => {
    expect(getLoanEligibilityNote(800)).toContain('Priority')
  })
  it('returns dual approval note for high risk', () => {
    expect(getLoanEligibilityNote(350)).toContain('dual approval')
  })
})
