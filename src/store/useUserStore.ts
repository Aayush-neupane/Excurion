import { create } from 'zustand'
import type { Role, User } from '@/types/user'
import { authApi } from '@/api/auth.api'
import { STORAGE_KEYS } from '@/constants'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface UserState {
  user: User | null
  sessionToken: string | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: {
    name: string
    email: string
    password: string
    role: Role
  }) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
  hydrate: () => Promise<void>
}

const loadStoredSession = (): { token: string | null; userId: string | null } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token: string; userId: string }
    return parsed
  } catch {
    return null
  }
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isHydrating: true,

  async login(email, password) {
    const session = await authApi.login({ email, password })
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ token: session.accessToken, userId: session.user.id }),
    )
    set({
      user: session.user,
      sessionToken: session.accessToken,
      isAuthenticated: true,
    })
    return session.user
  },

  async register(input) {
    const session = await authApi.register(input)
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ token: session.accessToken, userId: session.user.id }),
    )
    set({
      user: session.user,
      sessionToken: session.accessToken,
      isAuthenticated: true,
    })
    return session.user
  },

  async logout() {
    await authApi.logout()
    localStorage.removeItem(STORAGE_KEYS.session)
    set({ user: null, sessionToken: null, isAuthenticated: false })
  },

  setUser(user) {
    set({ user })
  },

  async hydrate() {
    if (isSupabaseConfigured()) {
      try {
        const session = await authApi.getSession()
        if (!session) {
          set({ isHydrating: false })
          return
        }
        set({
          user: session.user,
          sessionToken: session.accessToken,
          isAuthenticated: true,
          isHydrating: false,
        })
        return
      } catch {
        set({ isHydrating: false })
        return
      }
    }
    const stored = loadStoredSession()
    if (!stored) {
      set({ isHydrating: false })
      return
    }
    try {
      const session = await authApi.getSession()
      if (!session) {
        localStorage.removeItem(STORAGE_KEYS.session)
        set({ isHydrating: false })
        return
      }
      set({
        user: session.user,
        sessionToken: stored.token,
        isAuthenticated: true,
        isHydrating: false,
      })
    } catch {
      set({ isHydrating: false })
    }
  },
}))

export function useIsHydrated(): boolean {
  return useUserStore((s) => !s.isHydrating)
}

export function useCurrentUser(): User | null {
  return useUserStore((s) => s.user)
}