import type { AuthCredentials, RegisterInput, Session, User } from '@/types/user'
import { currentUser, mockUsers } from '@/data/users'
import { mockError, mockResult } from './client'

export interface AuthApi {
  login(credentials: AuthCredentials): Promise<Session>
  register(input: RegisterInput): Promise<Session>
  forgotPassword(email: string): Promise<{ message: string; resetId: string }>
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

  async register({ name, email, role }) {
    if (!name.trim()) return mockError('Please enter your full name.')
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return mockError('An account with this email already exists.')
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      title: role === 'teacher' ? 'Instructor' : 'Student',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: new Date().toISOString(),
    }
    return mockResult(createSession(user), 900)
  },

  async forgotPassword(email) {
    if (!email.trim()) return mockError('Please enter your email address.')
    return mockResult(
      {
        message: `If an account exists for ${email.trim()}, a reset link has been sent.`,
        resetId: `reset-${Date.now()}`,
      },
      700,
    )
  },

  async getSession() {
    return mockResult(createSession(currentUser), 150)
  },

  async logout() {
    return mockResult(undefined, 200)
  },
}

export const authApi: AuthApi = mockAuthApi