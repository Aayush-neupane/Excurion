import type { ID } from './user'

export type NotificationKind =
  | 'meeting'
  | 'reminder'
  | 'chat'
  | 'recording'
  | 'system'
  | 'warning'

export interface AppNotification {
  id: ID
  kind: NotificationKind
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}

export interface NotificationPreferences {
  email: {
    meetingReminders: boolean
    recordings: boolean
    weeklyDigest: boolean
    account: boolean
  }
  push: {
    meetingReminders: boolean
    chat: boolean
    raisedHands: boolean
    recordings: boolean
  }
  inApp: {
    meetings: boolean
    chat: boolean
    system: boolean
  }
}