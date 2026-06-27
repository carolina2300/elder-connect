import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/api-client'
import type { PageResponse } from '@/shared/types/api'
import type {
  DayOfWeek,
  Duration,
  GeoLocation,
  Post,
  PriceRange,
  Qualification,
  User,
} from '@/shared/types/domain'

export type PostsSortKey = 'recent' | 'price_asc' | 'price_desc'

// Backend (PostDto) sends CARETAKER daily window as two flat fields
// (dailyStartTime/dailyEndTime) instead of the nested dailyTimeWindow the
// domain type expects. Normalize on the way in so components get the contract.
type RawPost = Post & {
  dailyStartTime?: string | null
  dailyEndTime?: string | null
}

function normalizePost(raw: RawPost): Post {
  if (raw.kind === 'CARETAKER' && !raw.dailyTimeWindow && raw.dailyStartTime && raw.dailyEndTime) {
    const { dailyStartTime, dailyEndTime, ...rest } = raw
    return { ...rest, dailyTimeWindow: { startTime: dailyStartTime, endTime: dailyEndTime } }
  }
  return raw
}

// Mirrors backend CreatePostRequest: flat daily times (CARETAKER) and a flat
// availabilitySlots array (CAREGIVER) instead of the nested domain shapes.
interface CreatePostBase {
  description?: string
  location: GeoLocation
  priceRange: PriceRange
  duration: Duration
}
export interface CreateCaregiverPostInput extends CreatePostBase {
  kind: 'CAREGIVER'
  earliestStartDate: string
  offeredQualifications: Qualification[]
  availabilitySlots: { day: DayOfWeek; startTime: string; endTime: string }[]
}
export interface CreateCaretakerPostInput extends CreatePostBase {
  kind: 'CARETAKER'
  startDate: string
  endDate?: string
  dailyStartTime: string
  dailyEndTime: string
  requiredQualifications: Qualification[]
}
export type CreatePostInput = CreateCaregiverPostInput | CreateCaretakerPostInput

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
    queryFn: async () => {
      const res = await apiFetch<PageResponse<RawPost>>(`/posts${buildQuery(params)}`)
      return { ...res, content: res.content.map(normalizePost) }
    },
  })
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => normalizePost(await apiFetch<RawPost>(`/posts/${id}`)),
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
    mutationFn: async (body: CreatePostInput) =>
      normalizePost(await apiFetch<RawPost>('/posts', { method: 'POST', body })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
