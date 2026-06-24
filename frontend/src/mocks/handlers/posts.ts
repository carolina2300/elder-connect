import { http, HttpResponse, delay } from 'msw'
import type { PageResponse } from '@/shared/types/api'
import type { Post, Qualification } from '@/shared/types/domain'
import { findPosts, posts, userIdFromAuthHeader, users } from '../db'
import { t } from '@/shared/i18n/strings'
import type { PostsFilter, SortKey } from '../db'

const LATENCY = 180

function problem(status: number, title: string, detail?: string) {
  return HttpResponse.json({ type: 'about:blank', title, status, detail }, { status })
}

function parseSort(value: string | null): SortKey {
  if (value === 'price_asc' || value === 'price_desc') return value
  return 'recent'
}

function parseQualifications(value: string | null): Qualification[] | undefined {
  if (!value) return undefined
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Qualification[]
}

function parseIntOrUndefined(value: string | null): number | undefined {
  if (value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export const postsHandlers = [
  http.get('/api/posts', async ({ request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)
    const caller = users.get(userId)
    if (!caller) return problem(401, t.errors.notAuthenticated)

    const url = new URL(request.url)
    const sp = url.searchParams

    // Role-driven visibility: caregivers see CARETAKER posts; caretakers see CAREGIVER posts.
    const kind = caller.role === 'CARE_GIVER' ? 'CARETAKER' : 'CAREGIVER'

    const filter: PostsFilter = {
      kind,
      distrito: sp.get('distrito') ?? undefined,
      concelho: sp.get('concelho') ?? undefined,
      freguesia: sp.get('freguesia') ?? undefined,
      qualifications: parseQualifications(sp.get('qualifications')),
      availableOn: sp.get('availableOn') ?? undefined,
      priceMinCents: parseIntOrUndefined(sp.get('priceMinCents')),
      priceMaxCents: parseIntOrUndefined(sp.get('priceMaxCents')),
      durationMinMonths: parseIntOrUndefined(sp.get('durationMinMonths')),
      durationMaxMonths: parseIntOrUndefined(sp.get('durationMaxMonths')),
      sort: parseSort(sp.get('sort')),
    }

    const page = Math.max(1, parseIntOrUndefined(sp.get('page')) ?? 1)
    const size = Math.max(1, Math.min(50, parseIntOrUndefined(sp.get('size')) ?? 10))

    const all = findPosts(filter)
    const totalElements = all.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const start = (page - 1) * size
    const content = all.slice(start, start + size)

    const response: PageResponse<Post> = {
      content,
      page,
      size,
      totalElements,
      totalPages,
    }
    return HttpResponse.json(response)
  }),

  http.get('/api/posts/:id', async ({ params, request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)
    const post = posts.get(params.id as string)
    if (!post) return problem(404, t.errors.postNotFound)
    return HttpResponse.json(post)
  }),

  http.post('/api/posts', async ({ request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)

    const body = (await request.json()) as Omit<Post, 'id' | 'authorId' | 'createdAt' | 'status'>
    const id = crypto.randomUUID()
    const post: Post = {
      ...body,
      id,
      authorId: userId,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    } as Post

    posts.set(id, post)
    return HttpResponse.json(post, { status: 201 })
  }),
]
