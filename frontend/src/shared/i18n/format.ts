const LOCALE = 'pt-PT'

const eurFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const dateShortFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatEur(cents: number): string {
  return eurFormatter.format(cents / 100)
}

export function formatEurRange(minCents: number, maxCents: number): string {
  if (minCents === maxCents) return formatEur(minCents)
  return `${formatEur(minCents)} – ${formatEur(maxCents)}`
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatDateShort(iso: string): string {
  return dateShortFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}
