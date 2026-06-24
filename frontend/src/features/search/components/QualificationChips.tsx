import { Badge } from '@/shared/components/ui/badge'
import { QUALIFICATION_LABELS } from '@/shared/constants/qualifications'
import type { Qualification } from '@/shared/types/domain'
import { t } from '@/shared/i18n/strings'

interface Props {
  qualifications: readonly Qualification[]
  limit?: number
}

export function QualificationChips({ qualifications, limit = 3 }: Props) {
  const visible = qualifications.slice(0, limit)
  const overflow = qualifications.length - visible.length
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((q) => (
        <Badge key={q} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium">
          {QUALIFICATION_LABELS[q]}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium">
          {t.search.moreQuals(overflow)}
        </Badge>
      ) : null}
    </div>
  )
}
