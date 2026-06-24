import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { useAuthor, usePost } from '../api/posts'
import { AuthorHeader } from '../components/AuthorHeader'
import { PostMetaList } from '../components/PostMetaList'
import { WeeklyAvailabilityView } from '../components/WeeklyAvailabilityView'
import { QUALIFICATION_LABELS } from '@/shared/constants/qualifications'
import { useSessionStore } from '@/features/auth/session.store'
import { useCreateOrGetConversation } from '@/features/messages/api/messages'
import { t } from '@/shared/i18n/strings'
import { toast } from 'sonner'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const post = usePost(id)
  const author = useAuthor(post.data?.authorId)
  const currentUser = useSessionStore((s) => s.currentUser)
  const createConv = useCreateOrGetConversation()

  const canMessage =
    author.data && currentUser && author.data.id !== currentUser.id && author.data.role !== currentUser.role

  function handleSendMessage() {
    if (!author.data) return
    createConv.mutate(author.data.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
      onError: () => toast.error(t.messages.messageFailed),
    })
  }

  if (post.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-4 h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (post.isError || !post.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg text-destructive">{t.errors.postNotFound}</p>
        <Button asChild className="mt-6">
          <Link to="/">{t.notFound.goHome}</Link>
        </Button>
      </div>
    )
  }

  const p = post.data
  const qualifications = p.kind === 'CAREGIVER' ? p.offeredQualifications : p.requiredQualifications
  const qualHeading = p.kind === 'CAREGIVER' ? t.post.qualificationsHeadingOffered : t.post.qualificationsHeadingRequired

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> {t.post.backToResults}
      </button>

      <Card>
        <CardContent className="space-y-8 p-6 sm:p-8">
          {author.data ? (
            <AuthorHeader user={author.data} size="lg" linkToProfile />
          ) : author.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : null}

          {author.data?.description ? (
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {author.data.description}
            </p>
          ) : null}

          <Separator />

          <section>
            <h2 className="mb-4 text-lg font-semibold">{t.post.detailsHeading}</h2>
            <PostMetaList post={p} />
          </section>

          {p.kind === 'CAREGIVER' ? (
            <section>
              <h2 className="mb-4 text-lg font-semibold">{t.post.availabilityHeading}</h2>
              <WeeklyAvailabilityView availability={p.weeklyAvailability} />
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 text-lg font-semibold">{qualHeading}</h2>
            <div className="flex flex-wrap gap-2">
              {qualifications.map((q) => (
                <Badge key={q} variant="secondary" className="px-3 py-1 text-sm">
                  {QUALIFICATION_LABELS[q]}
                </Badge>
              ))}
            </div>
          </section>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row">
            {canMessage ? (
              <Button size="lg" onClick={handleSendMessage} disabled={createConv.isPending}>
                {t.post.sendMessage}
              </Button>
            ) : null}
            {author.data ? (
              <Button asChild size="lg" variant="outline">
                <Link to={`/users/${author.data.id}`}>{t.post.viewFullProfile}</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
