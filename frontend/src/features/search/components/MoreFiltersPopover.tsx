import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { ComboBox } from './GeoCascade'
import { PriceRangeSlider } from './PriceRangeSlider'
import { DurationFilter } from './DurationFilter'
import { t } from '@/shared/i18n/strings'
import type { SearchFilters } from '../hooks/useSearchFilters'

interface Props {
  filters: SearchFilters
  setFilters: (partial: Partial<SearchFilters>) => void
  clearAll: () => void
  activeCount: number
  freguesiaOptions: readonly string[]
  freguesiaDisabled: boolean
  /** Hard limits for the slider, in cents. */
  priceLimitMinCents: number
  priceLimitMaxCents: number
}

export function MoreFiltersPopover({
  filters,
  setFilters,
  clearAll,
  activeCount,
  freguesiaOptions,
  freguesiaDisabled,
  priceLimitMinCents,
  priceLimitMaxCents,
}: Props) {
  const [open, setOpen] = useState(false)
  const label = activeCount > 0 ? t.search.moreFiltersWithCount(activeCount) : t.search.moreFilters
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <SlidersHorizontal className="size-4" aria-hidden />
          {label}
          {activeCount > 0 ? <Badge className="ml-1 px-1.5 py-0">{activeCount}</Badge> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[22rem] max-w-[90vw] space-y-5 p-5" align="end">
        <div className="space-y-2">
          <div className="text-sm font-medium">{t.geo.freguesia}</div>
          <ComboBox
            label={t.geo.freguesia}
            placeholder={freguesiaDisabled ? t.geo.freguesiaNeedsConcelho : t.geo.pickFreguesia}
            emptyMessage="—"
            value={filters.freguesia}
            options={freguesiaOptions}
            disabled={freguesiaDisabled}
            onChange={(v) => setFilters({ freguesia: v })}
          />
        </div>

        <Separator />

        <PriceRangeSlider
          minCents={priceLimitMinCents}
          maxCents={priceLimitMaxCents}
          step={50}
          valueMin={filters.priceMinCents}
          valueMax={filters.priceMaxCents}
          onChange={(min, max) => setFilters({ priceMinCents: min, priceMaxCents: max })}
        />

        <Separator />

        <DurationFilter
          minMonths={filters.durationMinMonths}
          maxMonths={filters.durationMaxMonths}
          onChange={(min, max) => setFilters({ durationMinMonths: min, durationMaxMonths: max })}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={clearAll}>
            {t.search.clearAll}
          </Button>
          <Button type="button" onClick={() => setOpen(false)}>
            {t.search.applyFilters}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
