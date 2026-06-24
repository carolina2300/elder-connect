import type { WeeklyAvailability } from '@/shared/types/domain'
import { DAYS_OF_WEEK, DAY_LABELS_SHORT } from '@/shared/constants/days'
import { t } from '@/shared/i18n/strings'

interface Props {
  availability: WeeklyAvailability
}

export function WeeklyAvailabilityView({ availability }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map((day) => {
        const slots = availability[day]
        const has = slots && slots.length > 0
        return (
          <div
            key={day}
            className={`rounded-lg border p-3 text-center ${has ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/40'}`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {DAY_LABELS_SHORT[day]}
            </div>
            <div className="mt-2 space-y-1 text-sm">
              {has
                ? slots.map((s, i) => (
                    <div key={i} className="font-medium">
                      {s.startTime}–{s.endTime}
                    </div>
                  ))
                : <span className="text-muted-foreground">{t.post.unavailable}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
