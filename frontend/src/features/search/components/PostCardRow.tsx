import { Link } from 'react-router'
import { MapPin, Clock, CalendarDays } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { Post, PriceUnit, User } from '@/shared/types/domain'
import { QualificationChips } from './QualificationChips'
import { formatDateShort, formatEurRange } from '@/shared/i18n/format'
import { t } from '@/shared/i18n/strings'

interface Props {
  post: Post
  author?: User
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function unit(u: PriceUnit): string {
  switch (u) {
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

function dateLabel(post: Post): string {
  if (post.kind === 'CAREGIVER') return t.post.availableFrom(formatDateShort(post.earliestStartDate))
  return t.post.dateRange(formatDateShort(post.startDate), formatDateShort(post.endDate))
}

export function PostCardRow({ post, author }: Props) {
  const quals = post.kind === 'CAREGIVER' ? post.offeredQualifications : post.requiredQualifications

  return (
    <Link to={`/posts/${post.id}`} className="block focus:outline-none">
      <Card className="group flex flex-row items-start gap-5 p-5 transition hover:border-primary/50 hover:shadow-md sm:gap-8 sm:p-8">
        <Avatar className="size-20 shrink-0 rounded-2xl sm:size-28">
          {author?.photo ? <AvatarImage src={author.photo} alt={author.name} /> : null}
          <AvatarFallback className="rounded-2xl text-base">
            {author ? initials(author.name) : '…'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold leading-tight">
              {author?.name ?? '—'}
            </h3>
            <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {formatEurRange(post.priceRange.minCents, post.priceRange.maxCents)} {unit(post.priceRange.unit)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {post.location.concelho} · {post.location.freguesia}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {durationLabel(post)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {dateLabel(post)}
            </span>
          </div>
          {author?.description ? (
            <p className="line-clamp-2 text-sm text-foreground/85">{author.description}</p>
          ) : null}
          <QualificationChips qualifications={quals} limit={3} />
        </div>
      </Card>
    </Link>
  )
}

export function PostCardRowSkeleton() {
  return (
    <Card className="flex flex-row items-start gap-5 p-5 sm:gap-8 sm:p-8">
      <Skeleton className="size-20 shrink-0 rounded-2xl sm:size-28" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </Card>
  )
}
