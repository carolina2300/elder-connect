import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { formatDateShort } from '@/shared/i18n/format'
import { cn } from '@/shared/lib/cn'
import { t } from '@/shared/i18n/strings'

interface Props {
  label: string
  value?: string
  onChange: (iso: string | undefined) => void
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DateFilter({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value) : undefined
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={label}
          className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground')}
        >
          <CalendarIcon className="size-4" aria-hidden />
          <span className="truncate">{value ? formatDateShort(value) : t.search.pickDate}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onChange(d ? toIsoDate(d) : undefined)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
