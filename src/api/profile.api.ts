import type { ProfileUpdate, User } from '@/types/user'
import { currentUser } from '@/data/users'
import { mockResult } from './client'

export interface ProfileApi {
  getProfile(): Promise<User>
  updateProfile(input: ProfileUpdate): Promise<User>
  uploadAvatar(file: File): Promise<{ avatarUrl: string }>
}

export const mockProfileApi: ProfileApi = {
  async getProfile() {
    return mockResult(currentUser, 400)
  },

  async updateProfile(input) {
    const updated: User = { ...currentUser, ...input }
    return mockResult(updated, 600)
  },

  async uploadAvatar() {
    return mockResult({ avatarUrl: '/avatars/uploaded.png' }, 900)
  },
}

export const profileApi: ProfileApi = mockProfileApi