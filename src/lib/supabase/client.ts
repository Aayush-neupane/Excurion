import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/supabase/database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = (): boolean =>
  Boolean(url && anonKey && url.startsWith('http'))

function createSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    )
  }
  return createClient<Database>(url as string, anonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  })
}

let client: SupabaseClient<Database> | null = null

/** Lazily-created singleton. Throws when Supabase is not configured. */
export function getSupabase(): SupabaseClient<Database> {
  if (!client) client = createSupabaseClient()
  return client
}

export { url as supabaseUrl, anonKey as supabaseAnonKey }