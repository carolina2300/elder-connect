import { ArrowDownUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { t } from '@/shared/i18n/strings'
import type { SortKey } from '../hooks/useSearchFilters'

interface Props {
  value: SortKey
  onChange: (next: SortKey) => void
}

const LABELS: Record<SortKey, string> = {
  recent: t.search.sortRecent,
  price_asc: t.search.sortPriceAsc,
  price_desc: t.search.sortPriceDesc,
}

export function SortDropdown({ value, onChange }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <ArrowDownUp className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t.search.sortLabel}:</span> {LABELS[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(['recent', 'price_asc', 'price_desc'] as const).map((k) => (
          <DropdownMenuCheckboxItem key={k} checked={value === k} onCheckedChange={() => onChange(k)}>
            {LABELS[k]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
