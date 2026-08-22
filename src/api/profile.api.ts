import type { ProfileUpdate, User } from '@/types/user'
import { currentUser } from '@/data/users'
import { mockResult } from './client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { supabaseProfileApi } from './profile.supabase'

import { getUserById } from '@/data/users'

export interface ProfileApi {
  getProfile(): Promise<User>
  getProfileById(id: string): Promise<User | null>
  updateProfile(input: ProfileUpdate): Promise<User>
  uploadAvatar(file: File): Promise<{ avatarUrl: string }>
}

export const mockProfileApi: ProfileApi = {
  async getProfile() {
    return mockResult(currentUser, 400)
  },

  async getProfileById(id) {
    return mockResult(getUserById(id) ?? null, 300)
  },

  async updateProfile(input) {
    const updated: User = { ...currentUser, ...input }
    return mockResult(updated, 600)
  },

  async uploadAvatar() {
    return mockResult({ avatarUrl: '/avatars/uploaded.png' }, 900)
  },
}

export const profileApi: ProfileApi = isSupabaseConfigured()
  ? supabaseProfileApi
  : mockProfileApi