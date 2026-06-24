import { http, HttpResponse, delay } from 'msw'
import type { Message } from '@/shared/types/domain'
import {
  conversations,
  messages,
  users,
  userIdFromAuthHeader,
  publicUser,
  messagesForConversation,
  conversationsForUser,
  findConversationByParticipants,
} from '../db'
import { t } from '@/shared/i18n/strings'
import type { SeedConversation } from '../seed/conversations'

const LATENCY = 100

function problem(status: number, title: string, detail?: string) {
  return HttpResponse.json({ type: 'about:blank', title, status, detail }, { status })
}

function buildSummary(conv: SeedConversation, viewerId: string) {
  const otherId = conv.participantIds[0] === viewerId ? conv.participantIds[1] : conv.participantIds[0]
  const otherUser = users.get(otherId)
  if (!otherUser) return null
  const msgs = messagesForConversation(conv.id)
  const lastMessage = msgs[msgs.length - 1]
  const unreadCount = msgs.filter((m) => m.senderId !== viewerId && m.readAt === null).length
  return {
    id: conv.id,
    otherUser: publicUser(otherUser),
    lastMessage,
    unreadCount,
    createdAt: conv.createdAt,
  }
}

export const messagesHandlers = [
  http.get('/api/conversations', async ({ request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)
    if (!users.get(userId)) return problem(401, t.errors.notAuthenticated)

    const result = conversationsForUser(userId)
      .map((conv) => buildSummary(conv, userId))
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a!.lastMessage?.sentAt ?? a!.createdAt
        const bTime = b!.lastMessage?.sentAt ?? b!.createdAt
        return bTime.localeCompare(aTime)
      })

    return HttpResponse.json(result)
  }),

  http.get('/api/conversations/:id/messages', async ({ params, request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)

    const conv = conversations.get(params.id as string)
    if (!conv) return problem(404, t.errors.conversationNotFound)
    if (!conv.participantIds.includes(userId)) return problem(403, t.errors.notAuthenticated)

    return HttpResponse.json(messagesForConversation(conv.id))
  }),

  http.post('/api/conversations', async ({ request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)

    const viewer = users.get(userId)
    if (!viewer) return problem(401, t.errors.notAuthenticated)

    const url = new URL(request.url)
    const participantId = url.searchParams.get('with') ?? ''
    const other = users.get(participantId)
    if (!other) return problem(404, t.errors.userNotFound)
    if (viewer.role === other.role) return problem(400, t.errors.cannotMessageSameRole)

    let conv = findConversationByParticipants(userId, participantId)
    if (!conv) {
      conv = {
        id: crypto.randomUUID(),
        participantIds: [userId, participantId] as [string, string],
        createdAt: new Date().toISOString(),
      }
      conversations.set(conv.id, conv)
    }

    return HttpResponse.json(buildSummary(conv, userId), { status: 201 })
  }),

  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)

    const conv = conversations.get(params.id as string)
    if (!conv) return problem(404, t.errors.conversationNotFound)
    if (!conv.participantIds.includes(userId)) return problem(403, t.errors.notAuthenticated)

    const body = (await request.json()) as { body: string }
    if (!body.body?.trim()) return problem(400, 'Mensagem vazia')

    const msg: Message = {
      id: crypto.randomUUID(),
      conversationId: conv.id,
      senderId: userId,
      body: body.body.trim(),
      sentAt: new Date().toISOString(),
      readAt: null,
    }
    messages.set(msg.id, msg)

    return HttpResponse.json(msg, { status: 201 })
  }),

  http.patch('/api/conversations/:id/messages/:msgId/read', async ({ params, request }) => {
    await delay(LATENCY)
    const userId = userIdFromAuthHeader(request.headers.get('authorization'))
    if (!userId) return problem(401, t.errors.notAuthenticated)

    const conv = conversations.get(params.id as string)
    if (!conv) return problem(404, t.errors.conversationNotFound)
    if (!conv.participantIds.includes(userId)) return problem(403, t.errors.notAuthenticated)

    const msg = messages.get(params.msgId as string)
    if (!msg || msg.conversationId !== conv.id) return problem(404, t.errors.conversationNotFound)

    const updated = { ...msg, readAt: msg.readAt ?? new Date().toISOString() }
    messages.set(msg.id, updated)

    return HttpResponse.json(updated)
  }),
]
