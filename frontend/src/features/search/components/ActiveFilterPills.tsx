import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useSearchFilters } from '../hooks/useSearchFilters'
import { QUALIFICATION_LABELS } from '@/shared/constants/qualifications'
import { formatEur, formatDateShort } from '@/shared/i18n/format'
import { t } from '@/shared/i18n/strings'

export function ActiveFilterPills() {
  const { filters, clearFilter, toggleQualification, clearAll, hasAnyFilter } = useSearchFilters()

  if (!hasAnyFilter) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.distrito ? (
        <Pill label={t.search.pillDistrito(filters.distrito)} onRemove={() => clearFilter('distrito')} />
      ) : null}
      {filters.concelho ? (
        <Pill label={t.search.pillConcelho(filters.concelho)} onRemove={() => clearFilter('concelho')} />
      ) : null}
      {filters.freguesia ? (
        <Pill label={t.search.pillFreguesia(filters.freguesia)} onRemove={() => clearFilter('freguesia')} />
      ) : null}
      {filters.qualifications.map((q) => (
        <Pill key={q} label={QUALIFICATION_LABELS[q]} onRemove={() => toggleQualification(q)} />
      ))}
      {filters.date ? (
        <Pill label={t.search.pillDate(formatDateShort(filters.date))} onRemove={() => clearFilter('date')} />
      ) : null}
      {filters.priceMinCents !== undefined ? (
        <Pill
          label={t.search.pillPriceMin(formatEur(filters.priceMinCents))}
          onRemove={() => clearFilter('priceMinCents')}
        />
      ) : null}
      {filters.priceMaxCents !== undefined ? (
        <Pill
          label={t.search.pillPriceMax(formatEur(filters.priceMaxCents))}
          onRemove={() => clearFilter('priceMaxCents')}
        />
      ) : null}
      {filters.durationMinMonths !== undefined ? (
        <Pill
          label={t.search.pillDurationMin(filters.durationMinMonths)}
          onRemove={() => clearFilter('durationMinMonths')}
        />
      ) : null}
      {filters.durationMaxMonths !== undefined ? (
        <Pill
          label={t.search.pillDurationMax(filters.durationMaxMonths)}
          onRemove={() => clearFilter('durationMaxMonths')}
        />
      ) : null}
      <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
        {t.search.clearAll}
      </Button>
    </div>
  )
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm">
      {label}
      <button
        type="button"
        aria-label={t.search.removeFilter}
        onClick={onRemove}
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full hover:bg-muted-foreground/20"
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}
