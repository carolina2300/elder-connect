import { useParams, useNavigate } from 'react-router'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useUser } from '../api/profile'
import { ProfileCard } from '../components/ProfileCard'
import { useSessionStore } from '@/features/auth/session.store'
import { useCreateOrGetConversation } from '@/features/messages/api/messages'
import { t } from '@/shared/i18n/strings'
import { toast } from 'sonner'

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useUser(id)
  const currentUser = useSessionStore((s) => s.currentUser)
  const createConv = useCreateOrGetConversation()
  const navigate = useNavigate()

  const canMessage =
    data && currentUser && data.id !== currentUser.id && data.role !== currentUser.role

  function handleSendMessage() {
    if (!data) return
    createConv.mutate(data.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
      onError: () => toast.error(t.messages.messageFailed),
    })
  }

  const actions = canMessage ? (
    <Button size="sm" onClick={handleSendMessage} disabled={createConv.isPending}>
      <MessageSquare className="mr-2 size-4" />
      {t.messages.sendMessage}
    </Button>
  ) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !data ? (
        <p className="text-destructive">{t.profile.userNotFound}</p>
      ) : (
        <ProfileCard user={data} actions={actions} />
      )}
    </div>
  )
}
