import type { Session, User } from '@/types/user'
import type { Session as SupabaseSession } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'
import type { AuthApi } from './auth.api'

const emailSchema = (value: string) => value.trim().toLowerCase()

async function profileToUser(profile: {
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
}): Promise<User> {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role === 'admin' ? 'teacher' : profile.role,
    avatarUrl: profile.avatar_url ?? undefined,
    title: profile.title ?? undefined,
    timezone: profile.timezone,
    bio: profile.bio ?? undefined,
    company: profile.company ?? undefined,
    createdAt: profile.created_at,
  }
}

async function sessionFromAuth(
  authSession: Pick<SupabaseSession, 'access_token' | 'refresh_token' | 'expires_at' | 'user'> | null,
): Promise<Session | null> {
  if (!authSession?.user) return null
  const supabase = getSupabase()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, avatar_url, title, timezone, bio, company, created_at')
    .eq('id', authSession.user.id)
    .maybeSingle()

  if (error || !profile) return null
  return {
    accessToken: authSession.access_token,
    refreshToken: authSession.refresh_token,
    expiresAt: (authSession.expires_at ?? 0) * 1000,
    user: await profileToUser(profile),
  }
}

/** Real Supabase Auth implementation behind the existing AuthApi contract. */
export const supabaseAuthApi: AuthApi = {
  async login({ email, password }) {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailSchema(email),
      password,
    })
    if (error) throw new Error(error.message)
    const session = await sessionFromAuth(data.session)
    if (!session) throw new Error('Account profile could not be loaded.')
    return session
  },

  async register({ name, email, password, role }) {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: emailSchema(email),
      password,
      options: { data: { name: name.trim(), role } },
    })
    if (error) throw new Error(error.message)
    if (!data.session) {
      throw new Error('Check your email to confirm your account, then sign in.')
    }
    const session = await sessionFromAuth(data.session)
    if (!session) throw new Error('Account profile could not be loaded.')
    return session
  },

  async forgotPassword(email) {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(emailSchema(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
    return {
      message: `If an account exists for ${emailSchema(email)}, a reset link has been sent.`,
      resetId: 'sent',
    }
  },

  async getSession() {
    const supabase = getSupabase()
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return null
    }
    const refreshed = await supabase.auth.refreshSession()
    return sessionFromAuth(refreshed.data.session ?? data.session)
  },

  async logout() {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },
}