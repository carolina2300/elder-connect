import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { t } from '@/shared/i18n/strings'

interface Props {
  minMonths?: number
  maxMonths?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}

function parse(value: string): number | undefined {
  if (value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export function DurationFilter({ minMonths, maxMonths, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{t.search.duration} ({t.search.months})</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="duration-min" className="text-xs text-muted-foreground">
            {t.search.durationMin}
          </Label>
          <Input
            id="duration-min"
            type="number"
            inputMode="numeric"
            min={1}
            value={minMonths ?? ''}
            onChange={(e) => onChange(parse(e.target.value), maxMonths)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="duration-max" className="text-xs text-muted-foreground">
            {t.search.durationMax}
          </Label>
          <Input
            id="duration-max"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxMonths ?? ''}
            onChange={(e) => onChange(minMonths, parse(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
