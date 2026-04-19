// Mid-cycle join eligibility and catchup calculation. Pure functions.

export function getWeeksElapsed(cycleStart: Date, today: Date): number {
  const msElapsed = today.getTime() - cycleStart.getTime()
  if (msElapsed < 0) return 0
  return Math.floor(msElapsed / (1000 * 60 * 60 * 24 * 7))
}

export function isEligibleToJoin(
  cycleStart: Date,
  today: Date,
  maxWeeks: number
): boolean {
  return getWeeksElapsed(cycleStart, today) <= maxWeeks
}

export function getJoinRejectionReason(
  cycleStart: Date,
  today: Date,
  maxWeeks: number
): string | null {
  const elapsed = getWeeksElapsed(cycleStart, today)
  if (elapsed <= maxWeeks) return null
  return `Joining window has closed. Maximum ${maxWeeks} week${maxWeeks !== 1 ? 's' : ''} after cycle start (${elapsed} weeks have elapsed).`
}
