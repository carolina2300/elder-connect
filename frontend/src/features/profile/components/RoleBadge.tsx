import { Badge } from '@/shared/components/ui/badge'
import type { Role } from '@/shared/types/domain'
import { t } from '@/shared/i18n/strings'

interface Props {
  role: Role
}

export function RoleBadge({ role }: Props) {
  if (role === 'CARE_GIVER') {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{t.roles.CARE_GIVER}</Badge>
  }
  return <Badge className="bg-sky-600 text-white hover:bg-sky-600">{t.roles.CARE_SEEKER}</Badge>
}
