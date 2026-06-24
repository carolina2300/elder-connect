import { http, HttpResponse, delay } from 'msw'
import type { User } from '@/shared/types/domain'
import { publicUser, userIdFromAuthHeader, users } from '../db'
import { t } from '@/shared/i18n/strings'

const LATENCY = 120

function problem(status: number, title: string, detail?: string) {
  return HttpResponse.json(
    { type: 'about:blank', title, status, detail },
    { status }
  )
}

interface UpdateMeBody {
  name?: string
  description?: string
  photo?: string | null
}

export const userHandlers = [
  http.get('/api/users/:id', async ({ params, request }) => {
    await delay(LATENCY)
    if (!userIdFromAuthHeader(request.headers.get('authorization'))) {
      return problem(401, t.errors.notAuthenticated)
    }
    const u = users.get(params.id as string)
    if (!u) return problem(404, t.errors.userNotFound)
    const out: User = publicUser(u)
    return HttpResponse.json(out)
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)
    if (userId !== (params.id as string)) return problem(403, t.errors.notAuthenticated)
    const u = users.get(userId)
    if (!u) return problem(401, t.errors.userNotFound)
    const body = (await request.json()) as UpdateMeBody
    if (body.name !== undefined) u.name = body.name
    if (body.description !== undefined) u.description = body.description
    if (body.photo !== undefined) u.photo = body.photo
    users.set(userId, u)
    const out: User = publicUser(u)
    return HttpResponse.json(out)
  }),
]
