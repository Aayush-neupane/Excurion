import type { ProfileUpdate, User } from '@/types/user'
import { getSupabase } from '@/lib/supabase/client'

interface ProfileRow {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar_url: string | null
  title: string | null
  timezone: string
  bio: string | null
  company: string | null
  created_at: string
}

export function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === 'admin' ? 'teacher' : row.role,
    avatarUrl: row.avatar_url ?? undefined,
    title: row.title ?? undefined,
    timezone: row.timezone,
    bio: row.bio ?? undefined,
    company: row.company ?? undefined,
    createdAt: row.created_at,
  }
}

const PROFILE_COLUMNS =
  'id, name, email, role, avatar_url, title, timezone, bio, company, created_at'

export const supabaseProfileApi = {
  async getProfile(): Promise<User> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in.')
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .single()
    if (error) throw new Error(error.message)
    return profileToUser(data)
  },

  async updateProfile(input: ProfileUpdate): Promise<User> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in.')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.title !== undefined ? { title: input.title ?? null } : {}),
        ...(input.bio !== undefined ? { bio: input.bio ?? null } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
      })
      .eq('id', user.id)
      .select(PROFILE_COLUMNS)
      .single()
    if (error) throw new Error(error.message)
    return profileToUser(data)
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in.')

    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${user.id}/avatar-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) throw new Error(error.message)

    const { data: url } = supabase.storage.from('avatars').getPublicUrl(path)
    return { avatarUrl: url.publicUrl }
  },
}