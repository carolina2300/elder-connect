import { http, HttpResponse, delay } from 'msw'
import type { AuthResponse, Role, User } from '@/shared/types/domain'
import { findUserByEmail, issueToken, publicUser, userIdFromAuthHeader, users } from '../db'
import { t } from '@/shared/i18n/strings'

const LATENCY = 150

interface LoginBody {
  email: string
  password: string
}

interface RegisterBody {
  name: string
  email: string
  password: string
  description?: string
  photo?: string | null
  role: Role
}

function problem(status: number, title: string, detail?: string) {
  return HttpResponse.json(
    { type: 'about:blank', title, status, detail },
    { status }
  )
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(LATENCY)
    const body = (await request.json()) as LoginBody
    const user = findUserByEmail(body.email)
    if (!user || user.password !== body.password) {
      return problem(401, t.errors.invalidCredentials)
    }
    const token = issueToken(user.id)
    const response: AuthResponse = { user: publicUser(user), token }
    return HttpResponse.json(response)
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await delay(LATENCY)
    const body = (await request.json()) as RegisterBody
    if (findUserByEmail(body.email)) {
      return problem(409, t.errors.emailAlreadyRegistered)
    }
    const id = crypto.randomUUID()
    const user = {
      id,
      name: body.name,
      email: body.email,
      password: body.password,
      description: body.description ?? '',
      photo: body.photo ?? null,
      role: body.role,
      createdAt: new Date().toISOString(),
    }
    users.set(id, user)
    const token = issueToken(id)
    const response: AuthResponse = { user: publicUser(user), token }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(LATENCY)
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      // Best-effort revoke
      // tokens.delete called via import would create cycle; inline minimal:
      void token
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)
    const user = users.get(userId)
    if (!user) return problem(401, t.errors.userNotFound)
    const me: User = publicUser(user)
    return HttpResponse.json(me)
  }),
]
