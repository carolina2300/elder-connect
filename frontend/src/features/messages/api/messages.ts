import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/api-client'
import { useSessionStore } from '@/features/auth/session.store'
import type { Message, User } from '@/shared/types/domain'

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_MESSAGES_POLL_INTERVAL_MS ?? 5000)

export interface ConversationSummary {
  id: string
  otherUser: User
  lastMessage?: Message
  unreadCount: number
  createdAt: string
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiFetch<ConversationSummary[]>('/conversations'),
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => apiFetch<Message[]>(`/conversations/${conversationId}/messages`),
    enabled: Boolean(conversationId),
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useMarkRead(conversationId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    // Backend marks read per-message (PATCH .../messages/{msgId}/read), not per-conversation.
    // Mark every inbound unread message in the cached thread.
    mutationFn: async () => {
      if (!conversationId) return
      const currentUserId = useSessionStore.getState().currentUser?.id
      const messages = qc.getQueryData<Message[]>(['messages', conversationId]) ?? []
      const unread = messages.filter((m) => m.readAt === null && m.senderId !== currentUserId)
      await Promise.all(
        unread.map((m) =>
          apiFetch<Message>(`/conversations/${conversationId}/messages/${m.id}/read`, {
            method: 'PATCH',
          })
        )
      )
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['conversations'] })
      void qc.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: { body },
      }),
    onMutate: async (body: string) => {
      await qc.cancelQueries({ queryKey: ['messages', conversationId] })
      const prev = qc.getQueryData<Message[]>(['messages', conversationId])
      const currentUser = useSessionStore.getState().currentUser
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        senderId: currentUser?.id ?? '',
        body,
        sentAt: new Date().toISOString(),
        readAt: null,
      }
      qc.setQueryData<Message[]>(['messages', conversationId], (old) => [...(old ?? []), optimistic])
      return { prev }
    },
    onError: (_err, _body, ctx) => {
      qc.setQueryData(['messages', conversationId], ctx?.prev)
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      void qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useCreateOrGetConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) =>
      // Backend reads the target via the `with` query param, not a JSON body.
      apiFetch<ConversationSummary>(
        `/conversations?with=${encodeURIComponent(participantId)}`,
        { method: 'POST' }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
