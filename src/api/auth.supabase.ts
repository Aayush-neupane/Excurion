import type { Session, User } from '@/types/user'
import type { Session as SupabaseSession } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'
import type { AuthApi } from './auth.api'

const emailSchema = (value: string) => value.trim().toLowerCase()

const functionsBaseUrl: string =
  import.meta.env.VITE_NETLIFY_FUNCTIONS_URL ?? `${window.location.origin}/.netlify/functions`

function otpErrorMessage(message: string): string {
  const m = message.toUpperCase()
  if (m.includes('OTP_NOT_FOUND')) return 'No code found for that email. Request a new one.'
  if (m.includes('OTP_EXPIRED')) return 'That code has expired. Request a new one.'
  if (m.includes('OTP_TOO_MANY_ATTEMPTS')) return 'Too many wrong attempts. Request a new code.'
  if (m.includes('OTP_INVALID')) return 'That code is incorrect. Check the email we sent and try again.'
  if (m.includes('EMAIL_TAKEN')) return 'An account with this email already exists.'
  if (m.includes('NO_ACCOUNT')) return 'No account found with this email address.'
  if (m.includes('TOO_MANY_OTP')) return 'Too many codes requested. Try again in about an hour.'
  if (m.includes('PASSWORD_WEAK')) return 'Password must be between 6 and 72 characters.'
  if (m.includes('RATE_LIMIT')) return 'Too many requests. Wait a moment and try again.'
  return message
}

/** Ask the Netlify function to create + email a 6-digit code. */
async function sendEmailOtp(
  email: string,
  purpose: 'register' | 'reset-password',
): Promise<{ devCode?: string }> {
  const res = await fetch(`${functionsBaseUrl}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, purpose }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(otpErrorMessage(body?.error ?? 'Could not send the code.'))
  }
  const body = (await res.json().catch(() => null)) as { devCode?: string } | null
  return { devCode: body?.devCode }
}

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

  async sendRegisterOtp({ email }) {
    return sendEmailOtp(email, 'register')
  },

  async verifyRegisterOtp({ email, code, password, name, role }) {
    const supabase = getSupabase()
    const { error: rpcError } = await supabase.rpc('otp_register', {
      p_email: emailSchema(email),
      p_code: code.trim(),
      p_password: password,
      p_name: name.trim(),
      p_role: role,
    })
    if (rpcError) throw new Error(otpErrorMessage(rpcError.message))

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailSchema(email),
      password,
    })
    if (error) throw new Error(error.message)
    const session = await sessionFromAuth(data.session)
    if (!session) throw new Error('Account profile could not be loaded.')
    return session
  },

  async sendForgotPasswordOtp(email) {
    return sendEmailOtp(email, 'reset-password')
  },

  async resetPasswordWithOtp({ email, code, newPassword }) {
    const supabase = getSupabase()
    const { error: rpcError } = await supabase.rpc('otp_reset', {
      p_email: emailSchema(email),
      p_code: code.trim(),
      p_new_password: newPassword,
    })
    if (rpcError) throw new Error(otpErrorMessage(rpcError.message))

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailSchema(email),
      password: newPassword,
    })
    if (error) throw new Error(error.message)
    const session = await sessionFromAuth(data.session)
    if (!session) throw new Error('Account profile could not be loaded.')
    return session
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