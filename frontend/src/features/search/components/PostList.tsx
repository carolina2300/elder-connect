import { useQueries } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { Post, User } from '@/shared/types/domain'
import { apiFetch } from '@/shared/lib/api-client'
import { PostCardRow, PostCardRowSkeleton } from './PostCardRow'
import { t } from '@/shared/i18n/strings'
import { useSearchFilters } from '../hooks/useSearchFilters'

interface Props {
  posts: Post[] | undefined
  isLoading: boolean
  isError: boolean
  totalElements: number | undefined
  loadingMore: boolean
}

export function PostList({ posts, isLoading, isError, totalElements, loadingMore }: Props) {
  const { filters, setFilters, clearAll } = useSearchFilters()

  // Fetch each unique author. Reuses TanStack cache keyed by ['users', id].
  const authorIds = Array.from(new Set((posts ?? []).map((p) => p.authorId)))
  const authorQueries = useQueries({
    queries: authorIds.map((id) => ({
      queryKey: ['users', id],
      queryFn: () => apiFetch<User>(`/users/${id}`),
      staleTime: 5 * 60 * 1000,
    })),
  })
  const authorMap = new Map<string, User>()
  authorQueries.forEach((q, i) => {
    if (q.data) authorMap.set(authorIds[i], q.data)
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-destructive">{t.search.noResults}</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Heart className="mx-auto mb-4 size-10 text-muted-foreground" aria-hidden />
        <p className="text-lg font-medium">{t.search.noResults}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.search.noResultsHint}</p>
        <Button type="button" variant="outline" className="mt-6" onClick={clearAll}>
          {t.search.clearFilters}
        </Button>
      </div>
    )
  }

  const hasMore = totalElements !== undefined && posts.length < totalElements

  return (
    <div className="space-y-3">
      {totalElements !== undefined ? (
        <p className="text-sm text-muted-foreground">{t.search.resultsCount(totalElements)}</p>
      ) : null}
      {posts.map((p) => (
        <PostCardRow key={p.id} post={p} author={authorMap.get(p.authorId)} />
      ))}
      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setFilters({ page: filters.page + 1 })}
            disabled={loadingMore}
          >
            {loadingMore ? t.search.loading : t.search.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
