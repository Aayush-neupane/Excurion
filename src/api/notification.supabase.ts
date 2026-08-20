import type { AppNotification, NotificationPreferences } from '@/types/notification'
import { getSupabase } from '@/lib/supabase/client'

interface NotificationRow {
  id: string
  user_id: string
  kind: AppNotification['kind']
  title: string
  body: string
  read: boolean
  link: string | null
  created_at: string
}

function toAppNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
    link: row.link ?? undefined,
  }
}

function parsePreferences(raw: unknown): NotificationPreferences {
  return {
    email: {
      meetingReminders: true,
      recordings: true,
      weeklyDigest: false,
      account: true,
      ...((raw as Record<string, any>)?.email ?? {}),
    },
    push: {
      meetingReminders: true,
      chat: false,
      raisedHands: true,
      recordings: true,
      ...((raw as Record<string, any>)?.push ?? {}),
    },
    inApp: {
      meetings: true,
      chat: true,
      system: true,
      ...((raw as Record<string, any>)?.inApp ?? {}),
    },
  }
}

export const supabaseNotificationApi = {
  async list(): Promise<AppNotification[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, kind, title, body, read, link, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []).map(toAppNotification)
  },

  async getUnreadCount(): Promise<number> {
    const supabase = getSupabase()
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('read', false)
    if (error) throw new Error(error.message)
    return count ?? 0
  },

  async markRead(id: string): Promise<AppNotification> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select('id, user_id, kind, title, body, read, link, created_at')
      .single()
    if (error) throw new Error(error.message)
    return toAppNotification(data)
  },

  async markAllRead(): Promise<void> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    if (error) throw new Error(error.message)
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return parsePreferences(null)
    const { data, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single()
    if (error) throw new Error(error.message)
    return parsePreferences(data.notification_preferences)
  },

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in.')
    const current = await supabaseNotificationApi.getPreferences()
    const merged: NotificationPreferences = {
      email: { ...current.email, ...prefs.email },
      push: { ...current.push, ...prefs.push },
      inApp: { ...current.inApp, ...prefs.inApp },
    }
    const { data, error } = await supabase
      .from('profiles')
      .update({ notification_preferences: merged as never })
      .eq('id', user.id)
      .select('notification_preferences')
      .single()
    if (error) throw new Error(error.message)
    return parsePreferences(data.notification_preferences)
  },
}