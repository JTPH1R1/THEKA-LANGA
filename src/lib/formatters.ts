// Single source of truth for all display formatting.
// All monetary amounts are stored as integers (cents). Divide by 100 to display.
// Never format money inline in components — always use these functions.

export function formatCurrency(
  cents: number,
  currency = 'KES',
  locale = 'en-KE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatCurrencyCompact(cents: number, currency = 'KES', locale = 'en-KE'): string {
  const amount = cents / 100
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(cents, currency, locale)
}

export function centsToDisplay(cents: number): number {
  return cents / 100
}

export function displayToCents(display: number): number {
  return Math.round(display * 100)
}

export function formatDate(date: string | Date, locale = 'en-KE'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date))
}

export function formatDateShort(date: string | Date, locale = 'en-KE'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(new Date(date))
}

export function formatDateTime(date: string | Date, locale = 'en-KE'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = new Date(date).getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    if (Math.abs(diffHours) < 1) {
      const diffMins = Math.round(diffMs / (1000 * 60))
      return rtf.format(diffMins, 'minute')
    }
    return rtf.format(diffHours, 'hour')
  }
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day')
  const diffMonths = Math.round(diffDays / 30)
  return rtf.format(diffMonths, 'month')
}

export function formatPercent(rate: number, decimals = 2): string {
  return `${rate.toFixed(decimals)}%`
}

export function formatPhone(phone: string): string {
  // +254712345678 → +254 712 345 678
  return phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
}

export function formatCreditScore(score: number): string {
  return score.toLocaleString('en-KE')
}

export function formatPeriod(period: string): string {
  // 'YYYY-MM' → 'April 2026'
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-KE', {
      month: 'long',
      year: 'numeric',
    })
  }
  return period
}
