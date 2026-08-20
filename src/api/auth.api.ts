import type { AuthCredentials, Role, Session, User } from '@/types/user'
import { currentUser, mockUsers } from '@/data/users'
import { mockError, mockResult } from './client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { supabaseAuthApi } from './auth.supabase'

export interface AuthApi {
  login(credentials: AuthCredentials): Promise<Session>
  sendRegisterOtp(input: { name: string; email: string; role: Role }): Promise<{ devCode?: string }>
  verifyRegisterOtp(input: { email: string; code: string; password: string; name: string; role: Role }): Promise<Session>
  sendForgotPasswordOtp(email: string): Promise<{ devCode?: string }>
  resetPasswordWithOtp(input: { email: string; code: string; newPassword: string }): Promise<Session>
  getSession(): Promise<Session | null>
  logout(): Promise<void>
}

export function createSession(user: User): Session {
  return {
    accessToken: `mock.jwt.${btoa(JSON.stringify({ sub: user.id, role: user.role }))}`,
    refreshToken: `mock.refresh.${btoa(String(Date.now()))}`,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8,
    user,
  }
}

export const mockAuthApi: AuthApi = {
  async login({ email, password }) {
    if (!email || !password) {
      return mockError('Please enter your email and password.')
    }
    const normalized = email.trim().toLowerCase()
    const existing = mockUsers.find((u) => u.email.toLowerCase() === normalized)
    if (!existing) {
      return mockError('No account found with this email address.')
    }
    if (password.length < 6) {
      return mockError('Incorrect password. Please try again.')
    }
    return mockResult(createSession(existing), 800)
  },

  async sendRegisterOtp({ name, email }) {
    if (!name.trim()) return mockError('Please enter your full name.')
    if (!email.trim()) return mockError('Please enter your email address.')
    return mockResult({}, 500)
  },

  async verifyRegisterOtp({ email, password, name }) {
    if (password.length < 6) return mockError('Password must be at least 6 characters.')
    const normalized = email.trim().toLowerCase()
    const existing = mockUsers.find((u) => u.email.toLowerCase() === normalized)
    if (existing) return mockResult(createSession(existing), 800)
    const user: User = {
      id: `u-${Date.now()}`,
      name: name,
      email: normalized,
      role: 'student',
      title: 'Student',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: new Date().toISOString(),
    }
    return mockResult(createSession(user), 900)
  },

  async sendForgotPasswordOtp(email) {
    if (!email.trim()) return mockError('Please enter your email address.')
    return mockResult({}, 500)
  },

  async resetPasswordWithOtp({ email }) {
    const normalized = email.trim().toLowerCase()
    const existing = mockUsers.find((u) => u.email.toLowerCase() === normalized)
    if (existing) return mockResult(createSession(existing), 700)
    return mockResult(createSession(currentUser), 700)
  },

  async getSession() {
    return mockResult(createSession(currentUser), 150)
  },

  async logout() {
    return mockResult(undefined, 200)
  },
}

export const authApi: AuthApi = isSupabaseConfigured() ? supabaseAuthApi : mockAuthApi