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
import { cn } from '@/shared/lib/cn'
import { useState } from 'react'

interface Props {
  label: string
  placeholder: string
  emptyMessage?: string
  value?: string
  options: readonly string[]
  disabled?: boolean
  onChange: (value: string | undefined) => void
}

export function ComboBox({ label, placeholder, emptyMessage = '—', value, options, disabled, onChange }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-w-0">
      <span className="sr-only">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            disabled={disabled}
            className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground')}
          >
            <span className="truncate">{value ?? placeholder}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => {
                      onChange(opt === value ? undefined : opt)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('size-4', value === opt ? 'opacity-100' : 'opacity-0')} />
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
