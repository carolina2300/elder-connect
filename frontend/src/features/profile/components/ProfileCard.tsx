import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import type { User } from '@/shared/types/domain'
import { RoleBadge } from './RoleBadge'
import { t } from '@/shared/i18n/strings'

interface Props {
  user: User
  actions?: React.ReactNode
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProfileCard({ user, actions }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {user.photo ? <AvatarImage src={user.photo} alt={user.name} /> : null}
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold leading-tight">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>
        {actions ? <div>{actions}</div> : null}
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.profile.about}
        </h3>
        <p className="whitespace-pre-line text-base leading-relaxed">
          {user.description?.trim() ? user.description : <span className="text-muted-foreground">{t.profile.noDescription}</span>}
        </p>
      </CardContent>
    </Card>
  )
}
