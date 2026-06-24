import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/api-client'
import type { User } from '@/shared/types/domain'
import { useSessionStore } from '@/features/auth/session.store'

export interface UpdateMeInput {
  name?: string
  description?: string
  photo?: string | null
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiFetch<User>(`/users/${id}`),
    enabled: Boolean(id),
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  const setUser = useSessionStore((s) => s.setUser)
  return useMutation({
    // Backend has no /users/me alias — target the authenticated user's id.
    mutationFn: (input: UpdateMeInput) => {
      const id = useSessionStore.getState().currentUser?.id
      if (!id) throw new Error('No authenticated user')
      return apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: input })
    },
    onSuccess: (user) => {
      setUser(user)
      qc.setQueryData(['auth', 'me'], user)
      qc.invalidateQueries({ queryKey: ['users', user.id] })
    },
  })
}
