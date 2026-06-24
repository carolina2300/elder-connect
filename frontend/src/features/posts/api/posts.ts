import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/api-client'
import type { PageResponse } from '@/shared/types/api'
import type { Post, Qualification, User } from '@/shared/types/domain'

export type PostsSortKey = 'recent' | 'price_asc' | 'price_desc'

// Distributes over the Post union so each variant keeps its own fields
// (plain Omit<Post, ...> collapses to keys common to both variants).
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
export type CreatePostInput = DistributiveOmit<Post, 'id' | 'authorId' | 'createdAt' | 'status'>

export interface ListPostsParams {
  distrito?: string
  concelho?: string
  freguesia?: string
  qualifications?: Qualification[]
  availableOn?: string
  priceMinCents?: number
  priceMaxCents?: number
  durationMinMonths?: number
  durationMaxMonths?: number
  sort: PostsSortKey
  page: number
  size?: number
}

function buildQuery(params: ListPostsParams): string {
  const sp = new URLSearchParams()
  if (params.distrito) sp.set('distrito', params.distrito)
  if (params.concelho) sp.set('concelho', params.concelho)
  if (params.freguesia) sp.set('freguesia', params.freguesia)
  if (params.qualifications && params.qualifications.length > 0) {
    sp.set('qualifications', params.qualifications.join(','))
  }
  if (params.availableOn) sp.set('availableOn', params.availableOn)
  if (params.priceMinCents !== undefined) sp.set('priceMinCents', String(params.priceMinCents))
  if (params.priceMaxCents !== undefined) sp.set('priceMaxCents', String(params.priceMaxCents))
  if (params.durationMinMonths !== undefined) sp.set('durationMinMonths', String(params.durationMinMonths))
  if (params.durationMaxMonths !== undefined) sp.set('durationMaxMonths', String(params.durationMaxMonths))
  sp.set('sort', params.sort)
  sp.set('page', String(params.page))
  sp.set('size', String(params.size ?? 10))
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export function useListPosts(params: ListPostsParams) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => apiFetch<PageResponse<Post>>(`/posts${buildQuery(params)}`),
  })
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch<Post>(`/posts/${id}`),
    enabled: Boolean(id),
  })
}

export function useAuthor(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiFetch<User>(`/users/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePostInput) =>
      apiFetch<Post>('/posts', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
