import { Link } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { RoleBadge } from '@/features/profile/components/RoleBadge'
import type { User } from '@/shared/types/domain'

interface Props {
  user: User
  size?: 'md' | 'lg'
  linkToProfile?: boolean
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

export function AuthorHeader({ user, size = 'md', linkToProfile = false }: Props) {
  const avatarSize = size === 'lg' ? 'size-20' : 'size-14'
  const nameSize = size === 'lg' ? 'text-2xl' : 'text-lg'

  const block = (
    <div className="flex items-center gap-4">
      <Avatar className={avatarSize}>
        {user.photo ? <AvatarImage src={user.photo} alt={user.name} /> : null}
        <AvatarFallback className="text-base">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className={`font-semibold leading-tight ${nameSize}`}>{user.name}</div>
        <RoleBadge role={user.role} />
      </div>
    </div>
  )

  if (linkToProfile) {
    return (
      <Link to={`/users/${user.id}`} className="block hover:opacity-90">
        {block}
      </Link>
    )
  }
  return block
}
