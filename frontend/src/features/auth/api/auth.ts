import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/api-client'
import type { AuthResponse, User } from '@/shared/types/domain'
import { useSessionStore } from '../session.store'
import type { LoginInput, RegisterInput } from '../schemas'

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input }),
    onSuccess: (data) => {
      setSession(data.token, data.user)
      qc.setQueryData(['auth', 'me'], data.user)
    },
  })
}

export function useRegister() {
  const setSession = useSessionStore((s) => s.setSession)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input }),
    onSuccess: (data) => {
      setSession(data.token, data.user)
      qc.setQueryData(['auth', 'me'], data.user)
    },
  })
}

export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      clearSession()
      qc.clear()
    },
  })
}

export function useMe(enabled = true) {
  // Backend has no /auth/me. login/register already return the User and it's
  // persisted in the session store, so hydrate from there instead of fetching.
  const currentUser = useSessionStore((s) => s.currentUser)
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => currentUser as User,
    enabled: enabled && Boolean(currentUser),
    initialData: currentUser ?? undefined,
    staleTime: Infinity,
    retry: false,
  })
}
