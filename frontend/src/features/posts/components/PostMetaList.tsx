import { MapPin, Clock, CalendarDays, Coins } from 'lucide-react'
import type { Post, PriceUnit } from '@/shared/types/domain'
import { formatDate, formatEurRange } from '@/shared/i18n/format'
import { t } from '@/shared/i18n/strings'

interface Props {
  post: Post
}

function priceUnitLabel(unit: PriceUnit): string {
  switch (unit) {
    case 'PER_HOUR':
      return t.post.unitPerHour
    case 'PER_DAY':
      return t.post.unitPerDay
    case 'PER_WEEK':
      return t.post.unitPerWeek
    case 'PER_MONTH':
      return t.post.unitPerMonth
  }
}

function durationLabel(post: Post): string {
  if (post.duration.unit === 'MONTH') return t.post.durationMonths(post.duration.amount)
  return t.post.durationWeeks(post.duration.amount)
}

export function PostMetaList({ post }: Props) {
  const { location, priceRange } = post
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Row icon={<MapPin className="size-5" aria-hidden />} label={t.geo.distrito}>
        {location.distrito} · {location.concelho} · {location.freguesia}
        {location.postalCode ? ` · ${location.postalCode}` : ''}
      </Row>
      <Row icon={<Coins className="size-5" aria-hidden />} label={t.search.price}>
        {formatEurRange(priceRange.minCents, priceRange.maxCents)} {priceUnitLabel(priceRange.unit)}
      </Row>
      <Row icon={<Clock className="size-5" aria-hidden />} label={t.search.duration}>
        {durationLabel(post)}
      </Row>
      <Row icon={<CalendarDays className="size-5" aria-hidden />} label={t.search.date}>
        {post.kind === 'CAREGIVER'
          ? t.post.availableFrom(formatDate(post.earliestStartDate))
          : t.post.dateRange(formatDate(post.startDate), post.endDate ? formatDate(post.endDate) : '—')}
      </Row>
      {post.kind === 'CARETAKER' ? (
        <Row icon={<Clock className="size-5" aria-hidden />} label={t.post.availabilityHeading}>
          {t.post.dailyWindow(post.dailyTimeWindow.startTime, post.dailyTimeWindow.endTime)}
        </Row>
      ) : null}
    </dl>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-base">{children}</dd>
      </div>
    </div>
  )
}
