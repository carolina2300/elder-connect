import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { QUALIFICATIONS, QUALIFICATION_LABELS } from '@/shared/constants/qualifications'
import type { Qualification } from '@/shared/types/domain'
import { cn } from '@/shared/lib/cn'
import { t } from '@/shared/i18n/strings'

interface Props {
  selected: Qualification[]
  onToggle: (q: Qualification) => void
}

export function QualificationsFilter({ selected, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const count = selected.length
  const triggerLabel = count === 0 ? t.search.pickQualifications : t.search.qualificationsSelected(count)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t.search.qualifications}
          className={cn('w-full justify-between font-normal', count === 0 && 'text-muted-foreground')}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t.search.pickQualifications} />
          <CommandList>
            <CommandEmpty>—</CommandEmpty>
            <CommandGroup>
              {QUALIFICATIONS.map((q) => {
                const checked = selected.includes(q)
                return (
                  <CommandItem key={q} value={QUALIFICATION_LABELS[q]} onSelect={() => onToggle(q)}>
                    <Check className={cn('size-4', checked ? 'opacity-100' : 'opacity-0')} />
                    {QUALIFICATION_LABELS[q]}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
