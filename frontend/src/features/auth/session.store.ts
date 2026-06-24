import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/shared/types/domain'

interface SessionState {
  token: string | null
  currentUser: User | null
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      setSession: (token, currentUser) => set({ token, currentUser }),
      setUser: (currentUser) => set({ currentUser }),
      clearSession: () => set({ token: null, currentUser: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'care.session',
      partialize: (state) => ({ token: state.token, currentUser: state.currentUser }),
    }
  )
)
