import { Link } from 'react-router'
import { PlusCircle } from 'lucide-react'
import { useSessionStore } from '@/features/auth/session.store'
import { ProfileCard } from '../components/ProfileCard'
import { ProfileEditDialog } from '../components/ProfileEditDialog'
import { Button } from '@/shared/components/ui/button'
import { t } from '@/shared/i18n/strings'

export function MyProfilePage() {
  const user = useSessionStore((s) => s.currentUser)
  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.profile.myProfileTitle}</h1>
          <p className="mt-2 text-muted-foreground">{t.profile.myProfileSubtitle}</p>
        </div>
        <Button asChild>
          <Link to="/posts/new">
            <PlusCircle className="mr-2 size-4" />
            {t.newPost.createPost}
          </Link>
        </Button>
      </div>
      <ProfileCard user={user} actions={<ProfileEditDialog user={user} />} />
    </div>
  )
}
