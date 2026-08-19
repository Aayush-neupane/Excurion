export type ID = string

export type Role = 'teacher' | 'student'

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor'

export type DeviceState = 'on' | 'off' | 'unavailable'

export interface User {
  id: ID
  name: string
  email: string
  role: Role
  avatarUrl?: string
  title?: string
  timezone: string
  bio?: string
  company?: string
  createdAt: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterInput extends AuthCredentials {
  name: string
  role: Role
}

export interface ProfileUpdate {
  name?: string
  title?: string
  bio?: string
  timezone?: string
  avatarUrl?: string
  notificationEmail?: boolean
  notificationPush?: boolean
}