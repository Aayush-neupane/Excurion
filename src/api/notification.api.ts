import type { AppNotification, NotificationPreferences } from '@/types/notification'
import { mockNotifications } from '@/data/notifications'
import { mockResult, randomId } from './client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { supabaseNotificationApi } from './notification.supabase'

export interface NotificationApi {
  list(): Promise<AppNotification[]>
  getUnreadCount(): Promise<number>
  markRead(id: string): Promise<AppNotification>
  markAllRead(): Promise<void>
  getPreferences(): Promise<NotificationPreferences>
  updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences>
}

export const defaultPreferences: NotificationPreferences = {
  email: { meetingReminders: true, recordings: true, weeklyDigest: false, account: true },
  push: { meetingReminders: true, chat: false, raisedHands: true, recordings: true },
  inApp: { meetings: true, chat: true, system: true },
}

export const mockNotificationApi: NotificationApi = {
  async list() {
    return mockResult(mockNotifications, 450)
  },

  async getUnreadCount() {
    return mockResult(mockNotifications.filter((n) => !n.read).length)
  },

  async markRead(id) {
    const notification = mockNotifications.find((n) => n.id === id)
    if (!notification) throw new Error('Notification not found.')
    return mockResult({ ...notification, read: true }, 120)
  },

  async markAllRead() {
    mockNotifications.forEach((n) => {
      n.read = true
    })
    return mockResult(undefined, 200)
  },

  async getPreferences() {
    return mockResult(defaultPreferences)
  },

  async updatePreferences(prefs) {
    const merged = mergePreferences(defaultPreferences, prefs)
    return mockResult(merged)
  },
}

function mergePreferences(
  base: NotificationPreferences,
  patch: Partial<NotificationPreferences>,
): NotificationPreferences {
  return {
    email: { ...base.email, ...patch.email },
    push: { ...base.push, ...patch.push },
    inApp: { ...base.inApp, ...patch.inApp },
  }
}

export const notificationApi: NotificationApi = isSupabaseConfigured()
  ? supabaseNotificationApi
  : mockNotificationApi

export function notificationKindToId(): string {
  return randomId('notif')
}