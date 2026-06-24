import { Slider } from '@/shared/components/ui/slider'
import { formatEur } from '@/shared/i18n/format'
import { t } from '@/shared/i18n/strings'

interface Props {
  /** Hard limits in cents. Slider clamps within these. */
  minCents: number
  maxCents: number
  step?: number
  valueMin?: number
  valueMax?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}

export function PriceRangeSlider({ minCents, maxCents, step = 100, valueMin, valueMax, onChange }: Props) {
  const min = valueMin ?? minCents
  const max = valueMax ?? maxCents
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{t.search.price}</span>
        <span className="text-muted-foreground">
          {formatEur(min)} – {formatEur(max)}
        </span>
      </div>
      <Slider
        min={minCents}
        max={maxCents}
        step={step}
        value={[min, max]}
        onValueChange={([nextMin, nextMax]) => {
          onChange(
            nextMin === minCents ? undefined : nextMin,
            nextMax === maxCents ? undefined : nextMax
          )
        }}
      />
    </div>
  )
}
