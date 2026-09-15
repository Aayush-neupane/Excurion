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

export interface LiveRoom {
  id: string
  title: string
  started_at: string | null
  participant_count: number
}

export type ProfileWithLiveRooms = User & { liveRooms: LiveRoom[] }

function profileToUser(row: ProfileRow): User {
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

export function profileToUserWithLiveRooms(
  row: ProfileRow,
  liveRooms: LiveRoom[],
): ProfileWithLiveRooms {
  return {
    ...profileToUser(row),
    liveRooms,
  }
}

export const supabaseProfileApi = {
  async getProfile(): Promise<ProfileWithLiveRooms> {
    const supabase = getSupabase()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in.')
    
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .single()
    if (profileError) throw new Error(profileError.message)
    
    // Fetch live rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        id,
        title,
        started_at,
        privacy
      `)
      .eq('host_id', user.id)
      .eq('status', 'live')
    
    if (roomsError) throw new Error(roomsError.message)
    
    const liveRooms: LiveRoom[] = (roomsData || []).map((room: { id: string; title: string; started_at: string | null }) => ({
      id: room.id,
      title: room.title,
      started_at: room.started_at ?? null,
      participant_count: 0, // Could add count query if needed
    }))
    
    return profileToUserWithLiveRooms(profileData, liveRooms)
  },

  async getProfileById(id: string): Promise<User | null> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? profileToUser(data) : null
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
